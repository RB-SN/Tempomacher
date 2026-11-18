from playwright.sync_api import sync_playwright
import json,sys
URL=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/tempomacher.html'
F={k:open(f'/tmp/gpx/{k}.gpx').read() for k in ['a','iv6','iv5','mp','easy']}
PL={'tempo16':{'quality':True,'type':'tempo','structure':['2.5 km einlaufen','16 min am Stück im Schwellentempo 3:55','Puls Z4; ab der Mitte prüfen','2 km auslaufen']},
 'iv6':{'quality':True,'type':'vo2','structure':['3 km einlaufen','6 × 1000 m im Intervalltempo 3:40','Trabpause 2 min','2 km auslaufen']},
 'two':{'quality':True,'type':'tempo','structure':['2.5 km einlaufen','2 × 8 min im Schwellentempo 3:55','Trabpause 2 min','2 km auslaufen']},
 'prog':{'quality':True,'type':'tempo','structure':['2.5 km einlaufen','8 min in 4:05, dann 8 min in 3:57','2 km auslaufen']},
 'mp':{'quality':True,'type':'mpace','structure':['3 km einlaufen','6 km im Marathontempo 4:05','2 km auslaufen']},
 'pyr':{'quality':True,'type':'cruise','structure':['2 km einlaufen','1-2-3-2-1 km im Schwellentempo 3:55','Trabpause 90 s','2 km auslaufen']},
 'nest':{'quality':True,'type':'vo2','structure':['2 km einlaufen','2 × (5 × 400 m) in 3:30','2 km auslaufen']},
}
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(locale='de-CH',viewport={'width':390,'height':900});e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto(URL);pg.wait_for_timeout(300);pg.click('[data-act=demo]');pg.wait_for_timeout(300)
    print('shapes',pg.evaluate('P=>Object.fromEntries(Object.entries(P).map(([k,v])=>[k,JSON.stringify(planShape(v))]))',PL))
    js='''async([txt,pl])=>{const a=await readActivity(new File([txt],'x.gpx'));const g=a.iv&&{n:a.iv.n,wt:a.iv.wt,pace:Math.round(a.iv.pace),hr:a.iv.hr,rep:a.iv.rep,how:a.iv.how};
      const f=pl?planFit(a,pl):null;return JSON.stringify({km:a.km,mov:a.mov,ser:!!a.ser,saved:JSON.stringify(a).includes('"ser"'),gen:g,plan:f&&{n:f.n,wt:f.wt,pace:Math.round(f.pace),hr:f.hr,rep:f.rep,planN:f.planN,s:f.reps.map(r=>r.s+'-'+r.e+'@'+r.p).join(' ')}})}'''
    for k,pl in [('a','tempo16'),('a','two'),('a','prog'),('a','iv6'),('iv6','iv6'),('iv5','iv6'),('mp','mp'),('easy','tempo16'),('easy',None),('a','pyr'),('iv6','nest')]:
        print(k,pl,pg.evaluate(js,[F[k],PL.get(pl)]))
    # manual mark on the real file
    print('mark', pg.evaluate('''async(t)=>{const a=await readActivity(new File([t],'x.gpx'));const v=markIv(a.ser,800,1800);return JSON.stringify({n:v.n,wt:v.wt,p:Math.round(v.pace),hr:v.hr})}''',F['a']))
    print('mark iv', pg.evaluate('''async(t)=>{const a=await readActivity(new File([t],'x.gpx'));const v=markIv(a.ser,590,2600);return JSON.stringify({n:v.n,wt:v.wt,p:Math.round(v.pace),hr:v.hr,rep:v.rep,rec:v.rec})}''',F['iv6']))
    # UI flow: import real file, open marking, apply
    pg.evaluate('''async(t)=>{const a=await readActivity(new File([t],'x.gpx'));a.date=addD(today(),-2);openImport(a)}''',F['a']);pg.wait_for_timeout(400)
    print('ui1',pg.inner_text('.impbox')[:400].replace('\n',' | '))
    pg.click('[data-act=mkOpen]');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/ov/mk1.png',full_page=False)
    pg.evaluate("(()=>{const r=document.querySelector('[data-mk=a]');r.value=900;r.dispatchEvent(new Event('input',{bubbles:true}))})()");pg.wait_for_timeout(100)
    print('info',pg.inner_text('#mkInfo'))
    pg.click('[data-act=mkApply]');pg.wait_for_timeout(200)
    print('ui2',pg.inner_text('.impbox')[:400].replace('\n',' | '),'| type',pg.evaluate('ui.lf.type'),pg.evaluate('ui.lf.pace'),pg.evaluate('ui.lf.wsec'))
    pg.click('[data-act=mkOpen]');pg.wait_for_timeout(200);pg.locator('.mk').scroll_into_view_if_needed();pg.screenshot(path='/tmp/ov/mk2.png')
    pg.click('[data-act=mkNone]');pg.wait_for_timeout(200);print('none',pg.evaluate('ui.lf.type'),pg.evaluate('ui.lf.pace'))
    print('ERR',e);b.close()
