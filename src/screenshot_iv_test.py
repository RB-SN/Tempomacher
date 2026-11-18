from playwright.sync_api import sync_playwright
H='Abschnitttyp wählen\nInt. Runde Zeit Gesamtzeit Distanz Ø Pace Ø SAP Ø Herzfrequenz Max. Herzfrequenz\nkm min/km bpm bpm\n'
def ft(s):m=int(s//60);return f"{m}:{s-60*m:04.1f}"
cum=0;warm=[];run=[];rec=[];cool=[];lap=0
for t,d in[(300,1.0),(300,1.0)]:lap+=1;cum+=t;warm.append(f"{lap} {ft(t)} {ft(cum)} {d:.2f} 5:00 5:00 130 140")
for k in range(6):
    lap+=1;cum+=220;run.append(f"{k+1} {lap} {ft(220)} {ft(cum)} 1.00 3:40 3:41 172 178")
    if k<5:lap+=1;cum+=120;rec.append(f"{lap} {ft(120)} {ft(cum)} 0.33 6:04 6:00 145 160")
for t in[300,300]:lap+=1;cum+=t;cool.append(f"{lap} {ft(t)} {ft(cum)} 1.00 5:00 5:00 135 145")
tot=lambda rows,t,d:'\n'.join(rows)+f"\n{ft(t)} {ft(t)} {d:.2f} {int(t/d//60)}:{int(t/d%60):02d} 5:00 140 178"
T=[H+tot(warm,600,2),H+tot(run,1320,6),H+tot(rec,600,1.65),H+tot(cool,600,2),'Laufen\n18. Nov. @ 16:18\nIntervalle 6x1000\n13.65 km\nDistanz\n150 bpm\nØ Herzfrequenz\n1:09:00\nGesamtzeit']
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(locale='de-CH');pg.goto('file:///home/claude/out/tempomacher.html');pg.wait_for_timeout(1500)
    print(pg.evaluate('T=>{const m=mergeShots(T.map(t=>parseShot(t,"2026-11-18")));return JSON.stringify({km:m.km,mov:m.mov,hr:m.avgHr,iv:m.iv&&{n:m.iv.n,wt:m.iv.wt,pace:Math.round(m.iv.pace),hr:m.iv.hr,rep:m.iv.rep,rec:m.iv.rec},warn:m.warn})}',T))
    b.close()
