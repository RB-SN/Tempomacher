from playwright.sync_api import sync_playwright
import sys
URL=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/tempomacher.html'
with sync_playwright() as p:
    b=p.chromium.launch()
    for loc,dark in [('de-CH',False),('en-US',True)]:
        pg=b.new_page(locale=loc,viewport={'width':390,'height':844},device_scale_factor=2,color_scheme='dark' if dark else 'light');e=[];pg.on('pageerror',lambda x:e.append(str(x)))
        pg.goto(URL);pg.wait_for_timeout(1200);pg.click('[data-act=demo]');pg.wait_for_timeout(300)
        # two tempo blocks near threshold HR
        pg.evaluate('''(()=>{const th=thrHrOf(S.profile);[[-20,250,th+2],[-13,247,th],[-6,243,th+1]].forEach(([o,pc,hr],i)=>S.extra.push({id:'tt'+i,date:addD(today(),o),s:{type:'free',title:'Tempo',km:9},done:true,type:'tempo',km:9,pace:pc,sec:2700,hr,blk:true,wsec:1200,rpe:7,at:1}));save();render()})()''')
        pg.click('nav [data-v=form]');pg.wait_for_timeout(400)
        print(loc,'|',pg.evaluate("[...document.querySelectorAll('.ins')].map(x=>x.innerText.replace(/\\n/g,' / ')).join('  ##  ')"))
        pg.locator('.insg').scroll_into_view_if_needed();pg.screenshot(path=f'/tmp/ov/t3_{loc}.png')
        for k in ['goal','thr','load','end','fresh','cons']:
            pg.click(f'.ins[data-v={k}]');pg.wait_for_timeout(300)
            txt=pg.inner_text('#sheet')[:260].replace('\n',' / ')
            print(' ',k,':',txt)
            if k in('thr','cons','fresh'):pg.screenshot(path=f'/tmp/ov/t3_{loc}_{k}.png',full_page=True)
            pg.evaluate("ui.sheet=null;renderSheet()")
        print('step',pg.evaluate("thrVdotStep(addD(today(),1))"),'vd',pg.evaluate("vdotOf(S).toFixed(1)"),'thr',pg.evaluate("JSON.stringify((t=>({src:t.src,pace:t.pace,hr:t.hr,n:t.n,dT:t.dT}))(thrNow()))"))
        print('ERR',e);pg.close()
    b.close()
