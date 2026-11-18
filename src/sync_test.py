# Sync test with a simulated cloud: phone uploads a run, laptop changed something locally in between -> nothing may be lost
exec(open('/tmp/claude-0/t/ocr/e2e.py').read().split("cases=")[0])
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(locale='de-CH');ctx.route('https://cdn.jsdelivr.net/**',handler)
    ctx.add_init_script("window.TM_CLOUD={url:'https://example.supabase.co',key:'test'}")
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/tempomacher.html');pg.wait_for_timeout(300);pg.click('[data-act=demo]');pg.wait_for_timeout(300)
    r=pg.evaluate("""async()=>{const out={};
      // fake cloud account + remote store
      const st=JSON.parse(JSON.stringify(S));delete st.demo;const acc=accounts();acc.users.lap={name:'Lap',user:'lap',cloud:true,synced:0};saveAccounts(acc);CU='lap';S=st;
      let REM=null;window.cPull=async()=>({data:REM?JSON.parse(JSON.stringify(REM)):null});window.cPush=async s=>{REM=JSON.parse(JSON.stringify(s))};
      out.isCloud=isCloud();
      S.updatedAt=1000;await cSync();out.first=REM&&REM.updatedAt;
      // phone: new run uploaded (remote newer)
      const d=addD(today(),-1);REM.logs[d]={done:true,km:9.9,sec:3300,rpe:4,at:5000,s:{type:'easy',title:'Handy-Lauf',km:10}};REM.updatedAt=5000;
      // laptop: changed something locally afterwards (e.g. weekly review), without knowing the phone run
      S.adapt.note='laptop';S.updatedAt=6000;
      await cSync();out.afterLaptop={localHas:!!(S.logs[d]&&S.logs[d].km===9.9),remoteHas:!!(REM.logs[d]&&REM.logs[d].km===9.9),remoteNote:REM.adapt.note};
      // phone uploads again, laptop untouched -> laptop takes it
      const d2=addD(today(),-2);REM.logs[d2]={done:true,km:7.7,sec:2600,rpe:4,at:7000,s:{type:'easy',title:'Handy 2',km:8}};REM.updatedAt=Date.now()+1000;
      await cSync();out.pullOnly=!!(S.logs[d2]&&S.logs[d2].km===7.7);
      // deletion on the other device stays deleted (base known)
      delete REM.logs[d2];REM.updatedAt=Date.now()+5000;await cSync();out.deleteKept=!S.logs[d2];
      // recovery: device without base (first sync after update) keeps runs the cloud lost
      const d3=addD(today(),-3);S.logs[d3]={done:true,km:5.5,sec:2000,rpe:4,at:9000,s:{type:'easy',title:'nur lokal',km:5}};
      const a2=accounts();delete a2.users.lap.bk;a2.users.lap.synced=S.updatedAt;saveAccounts(a2);REM.updatedAt=Date.now()+9000;await cSync();
      out.recover={local:!!S.logs[d3],remote:!!REM.logs[d3]};
      // a completed run without time stamp is not pushed out by a not-done marker of the other device
      const d4=addD(today(),-4);S.logs[d4]={done:true,km:8,sec:2800,rpe:4,s:{type:'easy',title:'ohne at',km:8}};S.updatedAt=Date.now()+20000;
      REM.logs[d4]={done:false,at:Date.now(),s:{type:'easy',title:'x',km:8}};REM.updatedAt=Date.now()+30000;await cSync();out.doneWins=!!(S.logs[d4]&&S.logs[d4].done);
      return out}""")
    print(r,errs)
