from playwright.sync_api import sync_playwright
F=open('/tmp/gpx/a.gpx').read()
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(locale='de-CH',viewport={'width':390,'height':900},device_scale_factor=2);e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file:///home/claude/out/tempomacher.html');pg.wait_for_timeout(300);pg.click('[data-act=demo]');pg.wait_for_timeout(300)
    print('groups',pg.evaluate("JSON.stringify(allRuns().filter(l=>l.done).slice(-12).map(l=>[logType(l),effGroup(l),effOf(l)&&+effOf(l).toFixed(1),effBlk(l)&&+effBlk(l).toFixed(1),!!blkData(l)]))"))
    # previous tempo as block (2 weeks ago) for comparison
    d0=pg.evaluate('''(()=>{const d=addD(today(),-9);S.extra.push({id:'t1',date:d,s:{type:'free',title:'Tempodauerlauf',km:8},done:true,type:'tempo',km:8.4,pace:242,sec:2500,hr:172,blk:true,rpe:7,at:1});return d})()''')
    d=pg.evaluate('''(()=>{for(let i=1;i<=6;i++){const d=addD(today(),-i),w=(S.plan.weeks||[]).find(w=>w.monday===monday(d));if(w&&w.days[dow(d)]&&d>=S.plan.startMonday){delete S.logs[d];w.days[dow(d)]={type:'tempo',title:'Tempodauerlauf',km:8.5,quality:true,zone:'Z4',pace:[230,240],hr:[165,175],structure:['2.5 km einlaufen','16 min am Stück im Schwellentempo 3:55','2 km auslaufen']};return d}}})()''')
    pg.evaluate('''async([t,d])=>{const a=await readActivity(new File([t],'x.gpx'));a.date=d;openImport(a)}''',[F,d]);pg.wait_for_timeout(400)
    print('form labels',pg.evaluate("[...document.querySelectorAll('.sheet label')].map(x=>x.innerText).join(' | ')"))
    print('vals',pg.evaluate("[ui.lf.pace,ui.lf.hr,ui.lf.wsec,ui.lf.sec]"))
    pg.click('.sheet [data-act=rpeSet][data-v="7"]');pg.click('.sheet [data-act=saveRun]');pg.wait_for_timeout(400)
    l=pg.evaluate(f"(l=>JSON.stringify({{blk:l.blk,wsec:l.wsec,pace:l.pace,hr:l.hr,sec:l.sec,g:effGroup(l),eo:effOf(l),eb:effBlk(l)&&+effBlk(l).toFixed(2)}}))(S.logs['{d}'])")
    print('saved',l)
    print('fb',pg.inner_text('#sheet')[:1400].replace('\n',' | '))
    pg.evaluate("ui.sheet=null;S.profile.view='detail';render()")
    pg.evaluate("ui.sheet={kind:'ins',k:'end'};renderSheet()");pg.wait_for_timeout(300)
    print('ins',pg.inner_text('#sheet')[:600].replace('\n',' | '))
    pg.screenshot(path='/tmp/ov/eff_ins.png')
    # manual tempo entry: pace not computed from total time
    pg.evaluate("ui.sheet=null;ACT.logExtra&&ACT.logExtra()")
    print('ERR',e);b.close()
