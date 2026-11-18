from playwright.sync_api import sync_playwright
import json
T=json.load(open('/tmp/shots/texts.json'))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(locale='de-CH');pg.goto('file:///home/claude/out/tempomacher.html');pg.wait_for_timeout(300);pg.click('[data-act=demo]')
    for nm,ix in [('all',[0,1,2,3,4,5]),('no Alle',[0,2,3,4,5]),('filters only',[2,3,4,5]),('overview+Alle',[0,1]),('overview+Laufen',[0,3,4]),('Alle only',[1]),('overview only',[0])]:
        print(nm,pg.evaluate('T=>{const m=mergeShots(T.map(t=>parseShot(t,"2026-11-18")));return JSON.stringify({km:m.km,mov:m.mov,hr:m.avgHr,hrMax:m.hrMax,iv:m.iv&&{n:m.iv.n,wt:m.iv.wt,pace:Math.round(m.iv.pace),hr:m.iv.hr,rep:m.iv.rep},warn:m.warn})}',[T[i] for i in ix]))
    b.close()
