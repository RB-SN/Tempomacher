from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(locale='de-CH');e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file:///home/claude/out/tempomacher.html');pg.wait_for_timeout(1200);pg.click('[data-act=demo]');pg.wait_for_timeout(300)
    pg.evaluate('''(()=>{const th=thrHrOf(S.profile);[[-20,250,th+2],[-13,247,th],[-6,243,th+1]].forEach(([o,pc,hr],i)=>S.extra.push({id:'tt'+i,date:addD(today(),o),s:{type:'free',title:'Tempo',km:9},done:true,type:'tempo',km:9,pace:pc,sec:2700,hr,blk:true,wsec:1200,rpe:7,at:1}))})()''')
    print('eval',pg.evaluate("(()=>{const r=evaluateWeek(addD(monday(today()),-7),2);return JSON.stringify({d:r.vdotDelta,n:r.notes.filter(x=>/Schwelle|Index|Paces/.test(x))})})()"))
    # lab fresh: no learning, thr from lab
    pg.evaluate("S.profile.lab={type:'laktat',date:addD(today(),-30),mode:'thr',lt1hr:150,lt1pace:290,lt2hr:170,lt2pace:250}")
    print('lab',pg.evaluate("JSON.stringify({step:thrVdotStep(addD(today(),1)),th:(t=>({src:t.src,pace:t.pace,hr:t.hr,train:t.train}))(thrNow()),vd:vdotOf(S).toFixed(1)})"))
    pg.evaluate("S.profile.lab.date=addD(today(),-150);S.adapt.vdotAdj=1")
    print('labOld',pg.evaluate("JSON.stringify({step:thrVdotStep(addD(today(),1)),src:thrNow().src,vd:vdotOf(S).toFixed(1),base:baseVdot(S.profile).toFixed(1)})"))
    print('ERR',e);b.close()
