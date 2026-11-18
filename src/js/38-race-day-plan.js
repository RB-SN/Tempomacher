/* ---- race-day plan ----
   Pacing: even pace, the first kilometres a few seconds slower (marathon 5 km, half 3 km); a goal far above current form is not
   chased from the start. Fuelling (Jeukendrup 2014; ACSM/IOC consensus): under ~75 min nothing needed; half marathon 30–60 g
   carbohydrate per hour, marathon 60–90 g/h (start at 60 if not trained), 400–800 ml fluid per hour. Carbohydrate loading for
   races over 90 min: 8–10 g/kg body weight per day for the last 36–48 h; breakfast 2–4 h before with 1–4 g/kg. */
function raceDay(r){const c=ctxFor(S),d=r.dist,pred=showPred(d)?Math.round(predict(c.vd,d)):null,tests=lastTests(r),te=tests.length?tests[tests.length-1].e:null;
  const wl=Math.max(0,daysBetween(today(),r.date)/7),G=r.goal&&pred?goalReal(pred,r.goal,wl):null;
  let tgt=r.goal||pred,src='goal';
  if(G&&(G.st==='far'||G.st==='off')){tgt=Math.max(r.goal,G.best);src='form'}
  if(te&&te.st==='off'&&te.sug&&te.sug>tgt){tgt=te.sug;src='test'}
  if(!tgt)return{d,tgt:null,tests};
  const P=tgt/d,sk=d>25?5:d>12?3:d>6?1:0,ss=d>25?5:d>12?3:2,rest=sk?(tgt-sk*(P+ss))/(d-sk):P,at=x=>Math.round(x<=sk?x*(P+ss):sk*(P+ss)+(x-sk)*rest);
  const cps=d>25?[5,10,15,20,21.0975,25,30,35,40,d]:d>12?[5,10,15,20,d]:d>=4&&d<=12?[...Array(Math.floor(d))].map((_,i)=>i+1).concat(d%1>.05?[d]:[]):[...Array(Math.floor(d/5))].map((_,i)=>(i+1)*5).concat(d%5?[d]:[]);
  // with a course profile: same effort on climbs and descents, the time per section follows the energy cost of the grade
  const co=r.course,Dq=co?courseEq(co,d):0,cf=x=>co&&Dq&&x>0?(courseEq(co,x)/x)/(Dq/d):1;
  const splits=[...new Set(cps)].filter(x=>x<=d).map(x=>({km:x,t:Math.round(at(x)*cf(x))}));
  const min=tgt/60,gph=min<75?0:d>25?60:min>=90?45:30,step=gph?Math.round(25*60/gph):0,first=d>25?35:40;
  const gels=[];if(gph)for(let m=first;m<=min-12;m+=step)gels.push({m,km:Math.round(m*60/P*10)/10});
  return{d,tgt,src,pred,P,sk,ss,rest,splits,gph,gels,tests,te,wl,best:G?G.best:null,co}}
function raceDayHTML(r){const R=raceDay(r),c=ctxFor(S),w=+S.profile.weight||0,d=r.dist,hm=c.hm,mar=d>25,half=d>12&&d<=25;
  const sec=(t,b)=>`<div class="rd"><h3>${t}</h3>${b}</div>`,li=a=>`<ul class="notes">${a.filter(Boolean).map(x=>`<li>${x}</li>`).join('')}</ul>`,g=(lo,hi)=>w?` = <b>${Math.round(lo*w)}–${Math.round(hi*w)} g</b>`:'';
  if(!R.tgt)return`<p class="muted">${T('Für diese Distanz gibt es keinen Pace-Plan. Lauf nach Gefühl und verpflege dich ab der ersten Stunde regelmässig (60–90 g Kohlenhydrate pro Stunde).','No pace plan for this distance. Run by feel and fuel regularly from the first hour (60–90 g carbohydrate per hour).')}</p>`;
  const why=R.src==='goal'?T(`Dein Ziel ${fmtTime(R.tgt)}.`,`Your goal ${fmtTime(R.tgt)}.`):R.src==='form'?T(`Dein Ziel ${fmtTime(r.goal)} liegt deutlich über dem, was bis zum Renntag realistisch ist (heute ${fmtTime(R.pred)}). Darum startest du auf <b>${fmtTime(R.tgt)}</b>; fühlt sich ${mar?'km 30':half?'km 15':'die Hälfte'} gut an, darfst du zulegen. So riskierst du keinen Einbruch.`,`Your goal ${fmtTime(r.goal)} is well beyond what is realistic by race day (today ${fmtTime(R.pred)}). So you start at <b>${fmtTime(R.tgt)}</b>; if ${mar?'km 30':half?'km 15':'halfway'} feels good, you may push. That avoids a collapse.`):T(`Der letzte Renntempo-Test zeigt: Realistisch ist aktuell <b>${fmtTime(R.tgt)}</b>. Mit diesem Tempo startest du; fühlt es sich ab ${mar?'km 30':'der Hälfte'} gut an, darfst du zulegen.`,`The last race-pace test shows <b>${fmtTime(R.tgt)}</b> is realistic now. Start at that pace; if it feels good from ${mar?'km 30':'halfway'}, you may push.`);
  const conf=R.tests.length?R.tests.map(({l,e},i)=>`${T('Test','Test')} ${i+1} (${fdate(l.date)}, ${fk(l.s&&l.s.test?l.s.test.km:logKm(l))} km): ${e.st==='ok'?T('Zieltempo sitzt ✓','goal pace there ✓'):e.st==='tight'?T('knapp','tight'):T('noch nicht','not yet')}${e.dec!=null?' · Decoupling '+fk(e.dec)+' %':''}`)
    :[T('Noch kein Renntempo-Test erfasst. Der Plan enthält welche; sie zeigen, ob dein Tempo sitzt.','No race-pace test logged yet. The plan contains some; they show whether your pace is there.')];
  const pacing=li([T(`Ziel-Pace <b>${pace(R.P)}</b>${R.sk?`; die ersten ${R.sk} km bewusst ${R.ss} s/km langsamer (${pace(R.P+R.ss)}), danach ${pace(R.rest)}`:', von Anfang an gleichmässig'}.`,`Goal pace <b>${pace(R.P)}</b>${R.sk?`; the first ${R.sk} km deliberately ${R.ss} s/km slower (${pace(R.P+R.ss)}), then ${pace(R.rest)}`:', even from the start'}.`),
    mar?T(`Puls bis km 30 möglichst unter <b>${Math.round(.88*hm)}</b>. Liegt er früh darüber: Tempo leicht rausnehmen, das zahlt sich ab km 32 aus.`,`Keep heart rate below <b>${Math.round(.88*hm)}</b> until km 30. If it is above early on, ease off slightly; it pays off from km 32.`):half?T(`Puls bis km 15 möglichst unter <b>${Math.round(.91*hm)}</b>, danach freigeben.`,`Keep heart rate below <b>${Math.round(.91*hm)}</b> until km 15, then let go.`):T('Puls nicht beachten, nach Pace und Gefühl laufen; die letzten 20 % alles geben.','Ignore heart rate; run by pace and feel; give everything in the last 20 %.'),
    T('An Steigungen nach Anstrengung laufen, nicht nach Pace; bergab locker laufen lassen.','On climbs run by effort, not pace; let it roll downhill.')]);
  const tab=`<div class="scroll-x"><table class="t rdt"><thead><tr><th>km</th><th>${T('Zeit','Time')}</th></tr></thead><tbody>${R.splits.map(s=>`<tr><td>${s.km===21.0975?T('Halbmarathon','Half'):fk(Math.round(s.km*10)/10)}</td><td class="n">${fmtTime(s.t)}</td></tr>`).join('')}</tbody></table></div>`;
  const fuel=R.gph?li([T(`<b>${R.gph} g Kohlenhydrate pro Stunde</b>${mar?' (bis 90 g, wenn im Training geübt)':''}: ${R.gels.length} Gels à ca. 25 g.`,`<b>${R.gph} g carbohydrate per hour</b>${mar?' (up to 90 g if practised)':''}: ${R.gels.length} gels of about 25 g.`),
      T(`Gels bei: ${R.gels.map(x=>`km ${fk(x.km)} (${fmtTime(x.m*60)})`).join(', ')}.`,`Gels at: ${R.gels.map(x=>`km ${fk(x.km)} (${fmtTime(x.m*60)})`).join(', ')}.`),
      T('Gels immer mit Wasser nehmen. Trinken: 400–800 ml pro Stunde, an jeder Verpflegungsstelle ein paar Schlucke; bei Hitze mehr.','Always take gels with water. Drink 400–800 ml per hour, a few sips at every aid station; more in the heat.'),
      T('Nur Produkte, die du in langen Läufen getestet hast.','Only products you have tested in long runs.')])
    :li([T('Keine Verpflegung nötig. Bei Wärme an einer Station ein paar Schlucke Wasser.','No fuelling needed. In warm weather a few sips of water at a station.')]);
  const load=R.tgt>=90*60?T(`<b>36–48 h vorher Kohlenhydrate laden</b>: 8–10 g pro kg Körpergewicht und Tag${g(8,10)}. Pasta, Reis, Brot, Kartoffeln, Saft; wenig Fett und Nahrungsfasern. Die Waage zeigt danach 1–2 kg mehr (Wasser), das ist gewollt.`,`<b>Carbohydrate loading 36–48 h before</b>: 8–10 g per kg body weight per day${g(8,10)}. Pasta, rice, bread, potatoes, juice; little fat and fibre. The scales show 1–2 kg more afterwards (water); that is intended.`)
    :R.tgt>=60*60?T(`<b>Am Vortag kohlenhydratreich essen</b>: rund 7 g pro kg${g(7,7)}.`,`<b>Carbohydrate-rich day before</b>: about 7 g per kg${g(7,7)}.`):T('Am Vorabend normal, kohlenhydratreich und leicht verdaulich essen.','The evening before: a normal, carbohydrate-rich and easily digestible meal.');
  const warm=mar?T('10 min sehr locker traben, 2–3 kurze Steigerungen','10 min very easy jogging, 2–3 short strides'):half?T('10–15 min locker, 3 Steigerungen','10–15 min easy, 3 strides'):T('15–20 min locker, 4 Steigerungen, 2 × 1 min im Renntempo','15–20 min easy, 4 strides, 2 × 1 min at race pace');
  const morning=li([T(`<b>−3 h</b> Frühstück: 1–4 g Kohlenhydrate pro kg${w?` (z. B. ${Math.round(2*w)} g)`:''}, wenig Fett und Fasern; Weissbrot mit Honig, Banane. Kaffee nur, wenn du ihn gewohnt bist.`,`<b>−3 h</b> breakfast: 1–4 g carbohydrate per kg${w?` (e.g. ${Math.round(2*w)} g)`:''}, little fat and fibre; white bread with honey, banana. Coffee only if you are used to it.`),
    T('<b>−90 min</b> am Start, Startnummer, Kleider abgeben, Toilette.','<b>−90 min</b> at the start: bib, bag drop, toilet.'),T(`<b>−30 min</b> Einlaufen: ${warm}.`,`<b>−30 min</b> warm-up: ${warm}.`),
    R.gph?T('<b>−15 min</b> ein Gel mit ein paar Schlucken Wasser.','<b>−15 min</b> one gel with a few sips of water.'):'',T('<b>−10 min</b> in den Startblock, ruhig atmen, Plan im Kopf: die ersten Kilometer kontrolliert.','<b>−10 min</b> into the start pen, breathe calmly, plan in mind: controlled first kilometres.')]);
  const week=li([T('Tapering: weniger Umfang, kurze Renntempo-Abschnitte bleiben. Müde Beine in dieser Woche sind normal.','Taper: less volume, short race-pace bits stay. Heavy legs this week are normal.'),
    T('Nichts Neues am Renntag: Schuhe, Kleidung, Frühstück und Gels im Training getestet.','Nothing new on race day: shoes, clothes, breakfast and gels tested in training.'),
    T('Der Schlaf zwei Nächte vorher zählt am meisten; die letzte Nacht ist oft unruhig, das ist normal.','Sleep two nights before matters most; the last night is often restless, that is normal.'),
    T('Am Vorabend alles bereitlegen: Startnummer, Sicherheitsnadeln, Uhr geladen, Gels, Kleidung je nach Wetter.','Lay everything out the evening before: bib, pins, charged watch, gels, clothes for the weather.'),
    mar||half?T(`Wärme: Ab etwa 15 °C pro 5 °C rund ${mar?'2–3':'1.5–2'} % langsamer planen; über 25 °C nach Puls laufen.`,`Heat: from about 15 °C, plan roughly ${mar?'2–3':'1.5–2'} % slower per 5 °C; above 25 °C run by heart rate.`):'',
    T(`Danach: ${recText(d)}.`,`Afterwards: ${recText(d)}.`)]);
  const prov=R.wl>3?`<p class="hint" style="margin:0 0 10px">${T(`Vorläufig: Bis 3 Wochen vor dem Rennen rechnet der Plan mit deiner erwarteten Form; danach mit deiner aktuellen und den Renntempo-Tests.`,`Provisional: until 3 weeks before the race the plan uses your expected form; after that your current form and the race-pace tests.`)}</p>`:'';
  const cl=R.co?courseClimbs(R.co):[];
  const course=R.co?`${courseSVG(R.co)}<p style="margin:6px 0 0;font-size:15px">↑ ${R.co.gain} m · ↓ ${R.co.loss} m${cl.length?' · '+T('Anstiege','climbs')+': '+cl.map(x=>`km ${fk(Math.round(x.a*10)/10)}–${fk(Math.round(x.b*10)/10)} (+${x.m} m)`).join(', '):''}</p>
      <p class="hint" style="margin:6px 0 0">${T('Die Zwischenzeiten unten sind an die Strecke angepasst: bergauf langsamer, bergab schneller, bei gleicher Anstrengung.','The split times below are adjusted to the course: slower uphill, faster downhill, at equal effort.')} <button class="link" data-act="courseDel" data-v="${r.id}">${T('Strecke entfernen','Remove course')}</button></p>`
    :`<p class="hint" style="margin:0">${T('Lade die Strecke als GPX-Datei (von der Veranstalter-Webseite, Strava, Komoot …). Dann zeigt der Plan das Höhenprofil und passt die Zwischenzeiten an Anstiege und Gefälle an.','Load the course as a GPX file (from the race website, Strava, Komoot …). The plan then shows the elevation profile and adjusts split times to climbs and descents.')}</p><button class="btn small ghost" style="margin-top:8px" data-act="courseAdd" data-v="${r.id}">${T('Strecke (GPX) laden','Load course (GPX)')}</button>${ui.courseErr?`<div class="err" style="margin-top:8px">${esc(ui.courseErr)}</div>`:''}`;
  return`<p style="margin:0 0 12px">${why}</p>${prov}
    ${sec(T('Strecke','Course'),course)}
    ${sec(T('Pacing','Pacing'),pacing+tab)}
    ${sec(T('Verpflegung im Rennen','Fuelling in the race'),fuel)}
    ${sec(T('Essen davor','Eating before'),`<p style="margin:0 0 8px">${load}</p>${R.tgt>=60*60?`<div class="row" style="gap:8px;align-items:center"><label for="rdW" class="hint">${T('Dein Gewicht (optional, für Gramm-Angaben)','Your weight (optional, for grams)')}</label><input class="input" id="rdW" style="width:90px" inputmode="decimal" value="${w||''}" placeholder="kg"></div>`:''}`)}
    ${sec(T('Renntag-Morgen','Race morning'),morning)}
    ${sec(T('Letzte Woche','Final week'),week)}
    ${d>=9&&d<=43?sec(T('Vertrauen aus den Renntempo-Tests','Confidence from race-pace tests'),li(conf)):''}`}
// several activities from one upload: one row each, effort tapped per row, saved together
function openBatch(list,lost){ui.bt={rows:list.map(a=>{const f=lfFromImport(a,null);f.dateAsk=null;return f}),lost:lost||0,err:{}};ui.sheet={kind:'batch'};renderSheet()}
function batchHTML(){const B=ui.bt;
  return`<div class="label">${B.rows.length} ${T('Aktivitäten erkannt','activities recognised')}</div><h2 class="d" style="font-size:26px;margin:4px 0 6px">${T('Mehrere Trainings nachtragen','Log several sessions')}</h2>
  <p class="hint" style="margin:0 0 12px">${T('Jede Aktivität wird ihrem Tag zugeordnet. Pro Training nur noch antippen, wie anstrengend es war.','Each activity is assigned to its day. For each one just tap how hard it was.')}${B.lost?' '+T(`${B.lost} Bild(er) ohne lesbares Datum wurden übersprungen.`,`${B.lost} image(s) without a legible date were skipped.`):''}</p>
  <div class="stack" style="gap:12px">${B.rows.map((f,i)=>{const a=f.imp,pl=f.mode==='plan'?plannedFor(f.date):null,alt=f.kind==='alt';
    return`<div class="card stack" style="gap:8px"><div class="spread"><b>${fdate(f.date)}</b><span class="hint">${pl?T('Plan: ','Plan: ')+esc(pl.title):T('zusätzlich','extra')}</span></div>
      <div class="hint" style="font-size:14px">${alt?esc(SP(f.sport).name)+' · ':''}${a.km?fk(a.km)+' km · ':''}${a.mov?fmtTime(a.mov):''}${!alt&&a.avgPace?' · '+pace(a.avgPace):''}${a.avgHr?' · ♥ '+a.avgHr:''}${a.gain!=null?' · ↗ '+a.gain+' hm':''}</div>
      ${alt?'':`<div class="seg">${[...new Set([f.type,'easy','long'])].map(k=>`<button type="button" class="opt" data-act="btType" data-k="${i}" data-v="${k}" aria-pressed="${f.type===k}">${RTL[k]}</button>`).join('')}</div>`}
      ${rpeField(f,alt?null:{type:f.type},'bt'+i)}${B.err[i]?`<div class="err">${esc(B.err[i])}</div>`:''}</div>`}).join('')}
  <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="btSave">${T('Alle speichern','Save all')}</button></div></div>`}
// validate and store one training entry; returns {err} or the stored entry
function saveLf(f){const t=today(),err=m=>({err:m});
    const pl=f.mode==='plan'?plannedFor(f.date):null;let toExtra=f.mode==='extra'||f.assign==='extra'||!pl;
    if(!f.date||f.date>t)return err('Bitte ein Datum bis heute wählen.');
    if(!f.rpe)return err(T('Bitte antippen, wie anstrengend es war (1–10).','Please tap how hard it was (1–10).'));
    const hr=checkHr(f.hr);if(Number.isNaN(hr))return err('Herzfrequenz zwischen 60 und 230 eingeben.');
    const hrMx=checkHr(f.hrMax);if(Number.isNaN(hrMx)||(hrMx&&hr&&hrMx<hr))return err(T('Max. Puls zwischen 60 und 230 und nicht tiefer als der Ø Puls.','Max heart rate between 60 and 230 and not below the average.'));
    let x;
    if(f.kind==='alt'||(!toExtra&&pl&&pl.type==='alt')){
      const dur=altDurMin(f.dur);
      if(!f.sport)return err(T('Bitte die Sportart wählen.','Please choose the sport.'));
      if(!dur||dur<5||dur>900)return err(T('Bitte die Dauer eingeben (Minuten oder h:mm).','Please enter the duration (minutes or h:mm).'));
      const AF=ALTF[f.sport]||ALTF.other,has=k=>AF.includes(k)&&f[k]!==''&&f[k]!=null;
      let dist=has('dist')?pnum(f.dist):null;
      if(has('distm')){const m=pnum(f.distm);if(Number.isNaN(m)||m<50||m>100000)return err(T('Distanz bitte in Metern (z. B. 1500).','Distance in metres, please (e.g. 1500).'));dist=m/1000}
      if(dist==null&&has('spd')){const v=pnum(f.spd);if(Number.isNaN(v)||v<2||v>80)return err(T('Geschwindigkeit bitte in km/h (2–80).','Speed in km/h, please (2–80).'));dist=v*dur/60}
      if(dist==null&&has('split')){const sp=parsePace(f.split);if(!sp||sp<70||sp>300)return err(T('Split bitte als min:sek pro 500 m (z. B. 2:05).','Split as min:sec per 500 m, please (e.g. 2:05).'));dist=dur*60/sp*500/1000}
      if(dist==null&&has('p100')){const sp=parsePace(f.p100);if(!sp||sp<50||sp>400)return err(T('Pace bitte als min:sek pro 100 m (z. B. 2:10).','Pace as min:sec per 100 m, please (e.g. 2:10).'));dist=dur*60/sp*100/1000}
      const watt=has('watt')?Math.round(pnum(f.watt)):null;if(watt!=null&&(Number.isNaN(watt)||watt<20||watt>1500))return err(T('Leistung bitte in Watt (20–1500).','Power in watts, please (20–1500).'));
      const gn=has('gain')?pnum(f.gain):null;
      if(dist!=null&&(Number.isNaN(dist)||dist<0||dist>500))return err(T('Distanz bitte in km (0–500).','Distance in km, please (0–500).'));
      if(gn!=null&&(Number.isNaN(gn)||gn<0||gn>10000))return err(T('Höhenmeter bitte als Zahl.','Climbing as a number, please.'));
      const sport=f.sport||'other',title=sport==='other'?(String(f.sportTxt||'').trim()||T('Alternativtraining','Cross-training')):SP(sport).name;
      const planAlt=!toExtra&&pl&&pl.type==='alt',replace=f.mode==='plan'&&pl&&pl.type!=='alt'&&f.assign==='replace';
      if(!planAlt)toExtra=true;
      x={s:planAlt?Object.assign(JSON.parse(JSON.stringify(pl)),{title}):{type:'alt',title,km:0,zone:'Z2'},done:true,km:0,dur,hr,rpe:+f.rpe,sport,dist:dist!=null?Math.round(dist*1000)/1000:null,gain:gn!=null?Math.round(gn):null,src:f.imp?f.imp.src:'manual',at:Date.now()};
      if(watt)x.watt=watt;if(sport==='swim'){x.env=f.env||'pool';if(x.env==='pool')x.pool=+f.pool||25}if(sport==='xcski'&&f.style)x.style=f.style;
      if(replace)x.replaces=f.date}
    else{
      if(!f.type)return err('Bitte die Art des Laufs wählen.');
      if(f.type==='mptest'&&!f.pace)return err(T('Bitte die Ø Pace des Testabschnitts eingeben (ohne Ein- und Auslaufen).','Please enter the average pace of the test section (without warm-up and cool-down).'));
      if(f.type==='test'&&(f.km===''||(!f.pace&&!f.sec)))return err('Für den Testlauf bitte die Distanz und die Zeit oder Pace des Testabschnitts eingeben (ohne Ein- und Auslaufen).');
      const iv=IVT.has(f.type);let km=f.km===''&&pl?pl.km:pnum(f.km);
      if(!(km>=.5&&km<=150))return err('Bitte die Distanz in km eingeben.');
      const p=parsePace(f.pace);if(Number.isNaN(p)||(p!==null&&(p<120||p>1200)))return err('Pace bitte als min:sek eingeben, z. B. 5:20.');
      let dec=null,hh=null;
      if(f.type==='long'&&f.imp&&f.imp.dec!=null&&km>15)dec=f.imp.dec;
      else if((f.type==='long'&&km>15||f.type==='mptest')&&f.keepDec!=null&&!(f.h1p||f.h2p))dec=f.keepDec;
      else if((f.type==='long'||f.type==='mptest')&&(f.h1p||f.h2p||f.h1h||f.h2h)){const a1=parsePace(f.h1p),a2=parsePace(f.h2p),b1=+f.h1h,b2=+f.h2h;
        if(!a1||!a2||Number.isNaN(a1)||Number.isNaN(a2)||!(b1>=60&&b1<=230)||!(b2>=60&&b2<=230))return err('Für das Decoupling bitte Pace und Puls beider Hälften eingeben, oder die Felder leer lassen.');
        hh=[a1,b1,a2,b2];if(km>15||f.type==='mptest'){const e1=(3600/a1)/b1,e2=(3600/a2)/b2;dec=Math.round((e1-e2)/e1*1000)/10}}
      const reps=f.imp&&f.imp.iv&&iv?f.imp.iv.n:(+f.reps||null);
      const bk=BLK.has(f.type),sec=parseDur(f.sec),wsec=iv||bk?parseDur(f.wsec):null;
      if(Number.isNaN(sec)||(sec!=null&&(sec<120||sec>86400)))return err('Dauer bitte als h:mm:ss oder mm:ss eingeben, z. B. 52:30.');
      if(Number.isNaN(wsec)||(wsec!=null&&sec&&wsec>sec))return err('Die Belastungszeit muss kürzer sein als die Gesamtdauer.');
      let pp=p;if(pp==null&&!iv&&!bk&&sec&&km)pp=Math.round(sec/km);
      const gz=iv||f.gain===''||f.gain==null?null:pnum(f.gain);if(gz!=null&&(Number.isNaN(gz)||gz<0||gz>6000))return err(T('Höhenmeter bitte als Zahl zwischen 0 und 6000 eingeben, oder das Feld leer lassen.','Please enter climbing as a number between 0 and 6000, or leave the field empty.'));
      const elv=iv?null:gz!=null?elevIdx(gz):f.elev;
      x={s:toExtra?{type:'free',title:RTL[f.type],km,zone:'Z2'}:JSON.parse(JSON.stringify(pl)),done:true,type:f.type,km,interval:iv,pace:pp,sec:sec||null,wsec:wsec||null,hr,hrMax:hrMx||null,shoe:f.shoe!=null?f.shoe:shoeDef(),elev:elv,gain:gz!=null?Math.round(gz):null,rpe:+f.rpe,
        reps:iv?reps:null,dec,h:hh,src:f.imp?f.imp.src:'manual',at:Date.now()};if(bk)x.blk=true;
      if(f.imp){x.dur=Math.round((sec||f.imp.mov||0)/60)||null;x.impSum=JSON.parse(JSON.stringify(f.imp))}
    }
    let keepId=null;
    if(f.editKey){if(f.editKey.startsWith('d:'))delete S.logs[f.editKey.slice(2)];else{keepId=f.editKey.slice(2);const old=S.extra.find(e=>e.id===keepId);if(old&&old.replaces&&S.logs[old.replaces]&&S.logs[old.replaces].reason==='alt')delete S.logs[old.replaces];S.extra=S.extra.filter(e=>e.id!==keepId)}}
    if(toExtra){x.id=keepId||uid();x.date=f.date;S.extra.push(x)}else S.logs[f.date]=x;
    if(x.replaces&&pl)S.logs[x.replaces]={s:JSON.parse(JSON.stringify(pl)),done:false,reason:'alt',altId:x.id,at:Date.now()};
    if(x.type==='test'&&+f.lthr>=120&&+f.lthr<=210){S.profile.lthr={hr:Math.round(+f.lthr),date:f.date}}
    if(x.type==='test'&&x.done&&x.km>=1&&(x.sec||x.pace)&&!S.profile.lab&&(!S.profile.ref||S.profile.ref.src==='test'||!S.profile.ref.date||daysBetween(S.profile.ref.date,f.date)>56)){
      const sec=x.sec||Math.round(x.pace*x.km);S.profile.ref={dist:x.km,sec,src:'test',date:f.date};S.adapt.vdotAdj=0;
      S.pbs=(S.pbs||[]).filter(b=>b.id!=='test-'+f.date);S.pbs.push({id:'test-'+f.date,dist:x.km,sec,date:f.date,name:'Testlauf'});
      x.refSet=true;setPrep(false);regenerate()}
    return{x,toExtra,f}}
function renderSheet(){
  const sh=$('#sheet'),sc=$('#scrim');
  if(!ui.sheet||!S){sh.hidden=true;sc.hidden=true;sh.innerHTML='';return}
  sh.hidden=false;sc.hidden=false;
  const{kind,date}=ui.sheet,t=today();let h='';
  if(kind==='day'){
    const log=S.logs[date],e=date===t?effective(date):{s:planSession(date)},s=log?log.s:e.s;
    const xsD=(S.extra||[]).filter(x=>x.date===date);
    h=`${xsD.length&&(!s||s.type==='rest')&&!log?`<div class="label">${fdate(date)}</div>`:sessCard(date,s,date===t?'Heute':date<t?'Vergangen':'Geplant')}
    ${s&&s.orig&&s.orig!==s.title?`<div class="adj" style="margin-top:12px"><strong>Angepasst · ursprünglich: ${esc(s.orig)}</strong>${date===t?effective(t).notes.map(n=>`<div>${esc(n)}</div>`).join(''):''}</div>`:''}
    ${s&&s.type==='race'&&s.raceId&&date>=t?`<button class="btn blue" style="margin-top:12px;width:100%" data-act="raceDay" data-v="${s.raceId}">${T('Renntag-Plan ansehen','View race-day plan')}</button>`:''}
    ${log?`<div style="margin-top:12px">${logCard(date,log)}</div>`:''}${(S.extra||[]).filter(x=>x.date===date).map(x=>`<div style="margin-top:12px"><div class="label" style="margin-bottom:6px">${T('Zusätzliches Training','Extra training')}</div>${logCard(date,x,x.id)}</div>`).join('')}
    ${!log&&s&&s.type!=='rest'&&date<=t?`<div class="stack" style="gap:8px;margin-top:14px">
      ${date===t&&!S.checkins[t]&&s.type!=='alt'?`<button class="link" style="align-self:flex-start" data-act="tab" data-v="train">${T('Vorher Morgen-Check (Schlaf, Beine, Ruhepuls) ›','Morning check first (sleep, legs, resting HR) ›')}</button>`:''}
      ${logChoice(date,s)}
      <div class="row" style="justify-content:space-between;align-items:center;gap:12px;margin-top:4px"><span class="row" style="gap:6px 16px"><button class="link" data-act="altHow" data-d="${date}">${T('Alternativtraining','Cross-training')}</button>${date===t?`<button class="link" data-act="moveAsk" data-d="${date}">${T('Verschieben','Move')}</button>`:''}<button class="link" data-act="skipLog" data-d="${date}">${T('Nicht durchgeführt','Not done')}</button></span></div></div>`
    :!log&&s&&s.type!=='rest'&&date>t&&date<=addD(t,13)?`<div class="row" style="margin-top:14px;justify-content:space-between;align-items:center"><button class="link" data-act="moveAsk" data-d="${date}">${T('Verschieben','Move')}</button><button class="btn ghost" data-act="closeSheet">${T('Schliessen','Close')}</button></div>`
    :`<div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn ghost" data-act="closeSheet">${T('Schliessen','Close')}</button></div>`}`;
  }
  if(kind==='move'){const a=date,x=planSession(a),opts=moveTargets(a);
    h=`<div class="label">${fdate(a)} · ${esc(x?x.title:'')}</div><h2 class="d" style="font-size:26px;margin:4px 0 6px">${T('Verschieben auf …','Move to …')}</h2>
    <p class="hint" style="margin:0 0 12px">${T('Liegt an dem Tag schon eine Einheit, werden die beiden getauscht. Zwei harte Tage hintereinander (Intervalle, Schwelle, langer Lauf) sind gesperrt, damit du dich erholen kannst.','If there is already a session on that day, the two are swapped. Two hard days in a row (intervals, threshold, long run) are blocked so you can recover.')}</p>
    <div class="list">${opts.map(o=>`<button class="li" style="grid-template-columns:44px 1fr auto${o.bad?';opacity:.5':''}" ${o.bad?'disabled':`data-act="moveDo" data-d="${o.d}"`}><span class="dt">${DOWS[dow(o.d)]}<b>${pd(o.d).getDate()}</b></span>
      <span class="t">${!o.x||o.x.type==='rest'?T('Ruhetag','Rest day'):T('Tauschen mit ','Swap with ')+esc(o.x.title)}<small>${o.bad?T('Zwei harte Tage hintereinander','Two hard days in a row'):o.d===today()?T('Heute','Today'):''}</small></span><span class="k">${o.bad?'':'›'}</span></button>`).join('')}</div>
    <p class="hint" style="margin:12px 0 0">${T('Klappt es diese Woche gar nicht?','No chance this week?')} <button class="link" data-act="pauseAsk">${T('Pause einlegen','Take a break')}</button> ${T('oder die Einheit als «nicht durchgeführt» markieren. Verpasste Einheiten nicht nachholen.','or mark the session as «not done». Do not make up missed sessions.')}</p>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button></div>`}
  if(kind==='pause'){const z=ui.pz,len=z.from&&z.to&&z.to>=z.from?daysBetween(z.from,z.to)+1:0;
    h=`<h2 class="d" style="font-size:26px;margin:4px 0 6px">${T('Pause einlegen','Take a break')}</h2><p class="hint" style="margin:0 0 12px">${T('Während der Pause ist der Plan leer, nichts gilt als verpasst. Danach steigst du sanft wieder ein.','During the break the plan is empty and nothing counts as missed. Afterwards you return gently.')}</p>
    <div class="stack" style="gap:14px"><div class="field"><span class="flabel">${T('Grund','Reason')}</span><div class="seg">${Object.entries(pauseL()).map(([k,l])=>`<button type="button" class="opt" data-act="pzSet" data-k="reason" data-v="${k}" aria-pressed="${z.reason===k}">${l}</button>`).join('')}</div></div>
    <div class="grid2"><div class="field"><label for="pzFrom">${T('Von','From')}</label><input class="input" id="pzFrom" type="date" min="${monday(today())}" value="${z.from}" data-bind="pz.from" data-rerender="1"></div><div class="field"><label for="pzTo">${T('Bis','Until')}</label><input class="input" id="pzTo" type="date" min="${monday(today())}" value="${z.to}" data-bind="pz.to" data-rerender="1"></div></div>
    <div class="adj" style="margin:0">${len<=3?T('Kurze Pause: danach geht der Plan normal weiter.','Short break: afterwards the plan continues as normal.'):len<=7?T('Danach 4 Tage locker ohne Intensität, mit etwas weniger Umfang.','Afterwards 4 easy days without intensity and slightly less volume.'):len<=14?T('Danach eine Woche locker mit rund 70 % Umfang.','Afterwards one easy week at about 70 % volume.'):T('Danach eine Woche locker mit rund 60 % Umfang, dann eine Woche mit 80 % und nur moderater Intensität. Die nächste Auswertung passt den Plan weiter an.','Afterwards one easy week at about 60 % volume, then a week at 80 % with only moderate intensity. The next review adapts the plan further.')}${z.reason==='sick'?'<br>'+T('Nach Fieber erst 1–2 Tage nach dem Abklingen wieder beginnen.','After a fever, wait 1–2 days after it has gone before starting again.'):z.reason==='injury'?'<br>'+T('Bei Verletzungen vor dem Wiedereinstieg ärztlich oder physiotherapeutisch abklären lassen.','With an injury, get it checked by a doctor or physio before returning.'):''}</div>
    ${z.err?`<div class="err">${esc(z.err)}</div>`:''}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="pauseSave">${T('Pause starten','Start break')}</button></div></div>`}
  if(kind==='altHow'){const A=ui.altSel,d=A.date,pl=d&&planSession(d),runPl=pl&&!['rest','alt','race'].includes(pl.type)&&!S.logs[d],ds=` data-d="${d||''}" data-alt="1"`;
    h=`<div class="label">${d?fdate(d):T('Zusätzliches Training','Extra training')}${pl&&pl.type!=='rest'?' · '+T('Plan: ','Plan: ')+esc(pl.title):''}</div><h2 class="d" style="font-size:26px;margin:4px 0 14px">${T('Alternativtraining','Cross-training')}</h2>
    <div class="stack" style="gap:14px"><div class="field"><span class="flabel">${T('Was hast du gemacht?','What did you do?')}</span><div class="seg">${['bike','mtb','indoor','xcski','skitour','swim','aqua','elliptical','row','hike','hyrox','other'].map(k=>`<button type="button" class="opt" data-act="altSport" data-v="${k}" aria-pressed="${A.sport===k}">${SP(k).name}</button>`).join('')}</div></div>
    ${runPl?`<div class="field"><span class="flabel">${T('Statt des geplanten Laufs?','Instead of the planned run?')}</span><div class="seg"><button type="button" class="opt" data-act="altAssign" data-v="replace" aria-pressed="${A.assign==='replace'}">${T(`Statt «${esc(pl.title)}»`,`Instead of «${esc(pl.title)}»`)}</button><button type="button" class="opt" data-act="altAssign" data-v="extra" aria-pressed="${A.assign!=='replace'}">${T('Zusätzlich','In addition')}</button></div></div>`:''}
    <div class="how">
      <button class="howo" data-act="shotAct"${ds}><span class="howi" style="--hc:var(--blue)">${HOWI.shot}</span><span><b>${T('Screenshot','Screenshot')}</b><small>${T('Aus Strava, Garmin & Co.: Dauer, Distanz, Puls, Höhenmeter werden gelesen.','From Strava, Garmin & co.: duration, distance, heart rate and climbing are read.')}</small></span><em>${T('Am schnellsten','Fastest')}</em></button>
      <button class="howo" data-act="importAct"${ds}><span class="howi" style="--hc:var(--c4)">${HOWI.file}</span><span><b>${T('Datei','File')}</b><small>${T('.fit, .gpx oder .tcx','.fit, .gpx or .tcx')}</small></span></button>
      <button class="howo" data-act="altHand"><span class="howi" style="--hc:var(--hot)">${HOWI.hand}</span><span><b>${T('Von Hand','Manually')}</b><small>${T('Dauer, Puls, Distanz und Höhenmeter eintragen.','Enter duration, heart rate, distance and climbing.')}</small></span></button>
    </div>${A.sport?'':`<p class="hint" style="margin:0">${T('Ohne Auswahl erkennt die App die Sportart aus dem Screenshot bzw. der Datei.','Without a choice the app detects the sport from the screenshot or file.')}</p>`}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button></div></div>`}
  if(kind==='raceRes'){const f=ui.rr,r=S.races.find(x=>x.id===f.id);
    h=`<div class="label">${fdate(r.date)} ${pd(r.date).getFullYear()} · ${fk(r.dist)} km${r.goal?' · '+T('Ziel ','goal ')+fmtTime(r.goal):''}</div><h2 class="d" style="font-size:26px;margin:4px 0 14px">${esc(r.name)}</h2>
    <div class="stack" style="gap:14px"><div class="field"><span class="flabel">${T('Endzeit','Finish time')}</span><div class="tin"><input class="input" inputmode="numeric" placeholder="${T('Std','h')}" value="${esc(f.h)}" data-bind="rr.h" aria-label="${T('Stunden','Hours')}">:<input class="input" inputmode="numeric" placeholder="Min" value="${esc(f.m)}" data-bind="rr.m" aria-label="${T('Minuten','Minutes')}">:<input class="input" inputmode="numeric" placeholder="${T('Sek','s')}" value="${esc(f.s)}" data-bind="rr.s" aria-label="${T('Sekunden','Seconds')}"></div></div>
    <div class="grid2"><div class="field"><label for="rrHr">${T('Ø Puls (optional)','Avg. heart rate (optional)')}</label><input class="input" id="rrHr" inputmode="numeric" value="${esc(f.hr||'')}" data-bind="rr.hr"></div>
      <div class="field"><label for="rrH1">${T('Zeit 1. Hälfte (optional)','Time first half (optional)')}</label><input class="input" id="rrH1" inputmode="decimal" data-fmt="dur" placeholder="${T('z. B. 43:50','e.g. 43:50')}" value="${esc(f.h1||'')}" data-bind="rr.h1"></div></div>
    <div class="grid2"><div class="field"><label for="rrGain">${T('Höhenmeter (optional)','Climbing (optional)')}</label><input class="input" id="rrGain" inputmode="numeric" value="${esc(f.gain||'')}" data-bind="rr.gain"></div><div></div></div>
    <div class="field"><span class="flabel">${T('Bedingungen','Conditions')}</span><div class="seg">${[['heat',T('Heiss','Hot')],['cold',T('Kalt','Cold')],['wind',T('Wind','Wind')],['rain',T('Regen','Rain')]].map(([k,l])=>`<button type="button" class="opt" data-act="rrCond" data-v="${k}" aria-pressed="${(f.cond||[]).includes(k)}">${l}</button>`).join('')}</div></div>
    ${rpeField(f,null,'rr')}
    <p class="hint" style="margin:0">${T('Puls und 1. Hälfte findest du in der Uhr-App (Runden oder Splits). Je mehr Angaben, desto genauer die Auswertung.','Find heart rate and the first-half time in your watch app (laps or splits). The more you enter, the more precise the review.')}</p>
    ${ui.rrErr?`<div class="err">${esc(ui.rrErr)}</div>`:''}
    <div class="row" style="justify-content:space-between">${r.res?`<button class="btn ghost small" data-act="raceResDel">${T('Resultat löschen','Delete result')}</button>`:'<span></span>'}<span class="row"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="raceResSave">${T('Auswerten','Review')}</button></span></div></div>`}
  if(kind==='raceFb'){const r=S.races.find(x=>x.id===ui.sheet.id),f=r&&raceReview(r);
    h=r&&f?`<div class="label">${fdate(r.date)} ${pd(r.date).getFullYear()} · ${fk(r.dist)} km</div><h2 class="d" style="font-size:26px;margin:4px 0 12px">${esc(r.name)}</h2>${fbHTML(Object.assign({},f,{tips:[]}))}
      ${f.tips.length?`<div class="fbk">${T('Schlüsse für dein Training','Conclusions for your training')}</div><ul class="fbl tp">${f.tips.map(x=>`<li><span aria-hidden="true">→</span>${esc(x)}</li>`).join('')}</ul>`:''}
      ${f.fast||f.isPB||f.first?`<div class="adj" style="margin-top:12px"><b>${f.isPB?T('Neue Bestzeit.','New personal best.'):f.first?T('Erste Zeit auf dieser Distanz.','First time at this distance.'):''}</b> ${T('Als Referenz übernehmen? Dann rechnet die App Leistungsindex, Paces und Prognosen aus diesem Resultat.','Use it as your reference? The app then calculates performance index, paces and predictions from this result.')}<div class="row" style="margin-top:8px"><button class="btn small primary" data-act="raceRef" data-v="${r.id}">${T('Als Bestzeit & Referenz übernehmen','Use as best time & reference')}</button></div></div>`:''}
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" data-act="closeSheet">${T('Verstanden','Got it')}</button></div>`:''}
  if(kind==='how'){const d=ui.sheet.date,s=d&&(planSession(d)||{}),ds=d?` data-d="${d}"`:'';const iv=s&&s.interval;
    h=`<div class="label">${d?fdate(d)+(s&&s.title?' · '+esc(s.title):''):T('Zusätzliches Training','Extra training')}</div><h2 class="d" style="font-size:26px;margin:4px 0 14px">${T('Wie möchtest du erfassen?','How do you want to log?')}</h2>
    <div class="how">
      <button class="howo" data-act="shotAct"${ds}><span class="howi" style="--hc:var(--blue)">${HOWI.shot}</span><span><b>${T('Screenshot','Screenshot')}</b><small>${T('Aus der Uhren-App (Garmin, Strava, Apple, Coros …). Mehrere Bilder oder Tage auf einmal möglich.','From your watch app (Garmin, Strava, Apple, Coros …). Several images or days at once.')} ${iv?T('Für Intervalle auch die Runden.','For intervals also the laps.'):s&&s.type==='mptest'?T('Dazu die Kilometer-Splits.','Plus the kilometre splits.'):''}</small></span><em>${T('Am schnellsten','Fastest')}</em></button>
      <button class="howo" data-act="importAct"${ds}><span class="howi" style="--hc:var(--c4)">${HOWI.file}</span><span><b>${T('Datei','File')}</b><small>${T('.fit, .gpx oder .tcx','.fit, .gpx or .tcx')}</small></span><em>${T('Am genausten','Most precise')}</em></button>
      <button class="howo" data-act="${d?'openLog':'openExtra'}"${ds}><span class="howi" style="--hc:var(--hot)">${HOWI.hand}</span><span><b>${T('Von Hand','Manually')}</b><small>${T('Distanz, Zeit, Puls und Gefühl eintragen.','Enter distance, time, heart rate and feeling.')}</small></span></button>
    </div><p class="hint" style="margin:0 0 6px"><button class="link" data-act="shotHelpShow"${ds}>${T('Welche Screenshots braucht es?','Which screenshots are needed?')}</button>${T(' · Tipp: Screenshot auch einfügen (Ctrl/Cmd+V) oder hierher ziehen.',' · Tip: you can also paste (Ctrl/Cmd+V) or drop a screenshot here.')}</p>${IMPORT_HELP}<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button></div>`}
  if(kind==='run')h=runForm();
  if(kind==='batch')h=batchHTML();
  if(kind==='year')h=yearHTML();
  if(kind==='tools')h=toolsHTML();
  if(kind==='fileHow')h=fileHowHTML();
  if(kind==='ins'){const I=INS()[INS_ALIAS[ui.sheet.k]||ui.sheet.k]||['','',''];h=`<h2 style="margin:0 44px 12px 0;display:flex;gap:10px;align-items:center"><span class="fi" style="--fc:${I[2]}">${FICON[I[1]]||""}</span>${I[0]}</h2>${insBody(ui.sheet.k)}`}
  if(kind==='raceDay'){const r=S.races.find(x=>x.id===ui.sheet.id);h=r?`<div class="label">${fdate(r.date)} ${pd(r.date).getFullYear()} · ${fk(r.dist)} km${r.goal?' · '+T('Ziel ','goal ')+fmtTime(r.goal):''}</div><h2 class="d" style="font-size:26px;margin:4px 0 10px">${T('Renntag-Plan','Race-day plan')} · ${esc(r.name)}</h2>${raceDayHTML(r)}
    <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" data-act="rdPrint">${T('Drucken','Print')}</button><button class="btn primary" data-act="closeSheet">${T('Schliessen','Close')}</button></div>`:''}
  if(kind==='xview'){const x=(S.extra||[]).find(e=>e.id===ui.sheet.id);h=x?`<div class="label">${fdate(x.date)} · zusätzliches Training</div><h2 class="d" style="font-size:24px;margin:6px 0 12px">${esc(x.s.title)}</h2>${logCard(x.date,x,x.id)}<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-act="closeSheet">Schliessen</button></div>`:''}
  if(kind==='fb'){const k=ui.sheet.key,l=k.startsWith('d:')?S.logs[k.slice(2)]:(S.extra||[]).find(x=>x.id===k.slice(2)),d=k.startsWith('d:')?k.slice(2):l&&l.date;
    h=l?`<div class="label">${fdate(d)} · ${esc(isAlt(l)?altTitle(l):RTL[logType(l)]||'')}${isAlt(l)?' · '+l.dur+' min':logKm(l)?' · '+fk(logKm(l))+' km':''}</div><h2 class="d" style="font-size:26px;margin:4px 0 12px">${T('Trainingsfeedback','Training feedback')}</h2>${fbHTML(fbFull(l,d))}
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" data-act="fbDone">${T('Verstanden','Got it')}</button></div>`:''}
  if(kind==='shotHelp')h=shotHelpHTML();
  if(kind==='info'){const I=INFO[ui.sheet.k]||['',''];h=`<h2 class="d" style="font-size:24px;margin:4px 0 10px">${I[0]}</h2><p style="margin:0;font-size:15.5px;line-height:1.55">${I[1]}</p><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn primary" data-act="closeSheet">${T('Verstanden','Got it')}</button></div>`}
  if(kind==='busy')h=`<div class="stack" style="gap:10px;padding:10px 0 20px"><h2 class="d" style="font-size:24px">Datei wird gelesen …</h2><p class="muted" style="margin:0" id="busyTxt">Distanz, Pace, Puls und Intervalle werden ausgewertet.</p></div>`;
  if(kind==='impErr')h=`<h2 class="d" style="font-size:24px;margin:4px 0 12px">Import nicht möglich</h2><div class="stack" style="gap:12px"><div class="adj">${esc(ui.impErr)}</div>${IMPORT_HELP}<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="closeSheet">Schliessen</button><button class="btn primary" data-act="${ui.impShot?'shotAct':'importAct'}">Andere Datei wählen</button></div></div>`;
  if(kind==='pb')h=pbSheet();
  if(kind==='pbd')h=pbDistSheet(ui.sheet.k);
  if(kind==='skip'){
    const s=planSession(date)||(S.logs[date]&&S.logs[date].s);
    h=`<div class="label">${fdate(date)}${s?' · '+esc(s.title):''}</div><h2 class="d" style="font-size:38px;margin:6px 0 10px">Nicht durchgeführt</h2>
    <div class="stack" style="gap:14px"><div class="field"><span class="flabel">Warum? (optional)</span><div class="seg">${Object.entries(SKIP).map(([k,l])=>opt('skipSet','reason',k,l,ui.skip.reason)).join('')}</div></div>
    <p class="hint" style="margin:0">Ausgelassene Einheiten nicht nachholen. Krankheit oder Schmerzen fliessen in die Auswertung ein, der Plan wird dann vorsichtiger.${ui.skip.reason==='sick'?' Nach einer Krankheit mit Fieber erst 1–2 Tage nach dem Abklingen wieder locker beginnen.':''}${ui.skip.reason==='sick'||ui.skip.reason==='pain'?` <button class="link" data-act="pauseAsk">${T('Länger ausser Gefecht? Pause einlegen','Out for longer? Take a break')}</button>`:''}</p>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="closeSheet">Abbrechen</button><button class="btn primary" data-act="skipSave" data-d="${date}">Bestätigen</button></div></div>`;
  }
  sh.innerHTML=`<div class="sheet-in"><div class="shtop"><div class="grab"></div><button class="shx" data-act="closeSheet" aria-label="${T('Schliessen','Close')}">✕</button></div>${h}</div>`;
}

// appearance: automatic (follows the phone), always light or always dark; stored per device, applied before the first paint by the loader
function themeGet(){const v=lsGet('tempomacher.theme');return v==='dark'||v==='light'?v:'auto'}
function themeSet(v){lsSet('tempomacher.theme',v==='auto'?null:v);const r=document.documentElement;if(v==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',v);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{if(v==='auto'){m.content=m.getAttribute('data-c')||m.content}else{if(!m.getAttribute('data-c'))m.setAttribute('data-c',m.content);m.content=v==='dark'?'#0B1212':'#0E4F54'}})}
function toast(m){let e=document.getElementById('toast');if(!e){e=document.createElement('div');e.id='toast';e.setAttribute('role','status');document.body.appendChild(e)}e.textContent=m;e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>{e.className=''},2600)}
const HOWI={shot:'<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M9 7h6M9 11h6M9 15h3"/></svg>',
  file:'<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  hand:'<svg viewBox="0 0 24 24"><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3"/></svg>'};
/* ============ actions ============ */
function checkHr(v){return v===''||v==null?null:(+v>=60&&+v<=230?+v:NaN)}
const ACT={
  menu(){ui.menu=!ui.menu;renderHdr();if(ui.menu){const b=document.querySelector('.umenu button');if(b)b.focus()}},
  tab(el){ui.menu=false;if(el.dataset.v==='train'&&el.closest('#app'))ui.trainView='log';ui.tab=el.dataset.v;ui.sheet=null;render();window.scrollTo(0,0)},
  ob(el){let v=el.dataset.v;v=v==='true'?true:v==='false'?false:(v!==''&&!isNaN(+v)?+v:v);ui.ob[el.dataset.k]=v;ui.obErr='';render()},
  obNext(){const e=obValidate();ui.obErr=e;if(e){render();return}if(ui.ob.step<5){ui.ob.step++;render();window.scrollTo(0,0)}else obFinish()},
  obDay(el){const i=+el.dataset.v,o=ui.ob;o.daysSel=o.daysSel.includes(i)?o.daysSel.filter(x=>x!==i):[...o.daysSel,i];if(!o.daysSel.includes(o.longDay))o.longDay=null;ui.obErr='';render()},
  pfDay(el){const i=+el.dataset.v,f=ui.pf;f.daysSel=f.daysSel.includes(i)?f.daysSel.filter(x=>x!==i):[...f.daysSel,i];if(!f.daysSel.includes(f.longDay))f.longDay=null;ui.pfErr='';render()},
  obBack(){ui.obErr='';ui.ob.step--;render()},
  demo(){ui.icsMsg='';S=makeDemo();weeklyCheck();ui.tab='home';ui.sheet=null;render()},
  leaveDemo(){S=null;ui.ob=freshOb();ui.sheet=null;if(CU)S=loadLocal();render()},
  logout(){logout()},
  lang(el){const l=el.dataset.v;if(l===LANG)return;if(S&&!S.demo&&CU)saveLocal();setLang(l)},
  introDone(){S.introDone=true;save();render()},
  info(el){ui.sheet={kind:'info',k:el.dataset.v};renderSheet()},
  strength(el){S.profile.strength=el.dataset.v==='1';regenerate();save();render()},
  async bakSave(){const name=String((accounts().users[CU]||{}).name||'profil').replace(/[^\w-]+/g,'_');
    try{await downloadText(`tempomacher-${name}-${today()}.json`,JSON.stringify({app:'tempomacher',v:1,exported:Date.now(),state:S}),'application/json');S.lastBackup=today();save();ui.bakMsg=T('Sicherung erstellt.','Backup created.')}catch(e){ui.bakMsg=T('Die Datei konnte nicht gespeichert werden.','The file could not be saved.')}render()},
  bakOpen(){const fi=$('#bakIn');fi.value='';fi.click()},
  bakCancel(){ui.bak=null;render()},
  bakDo(){const b=ui.bak;if(!b)return;S=b.state;S.demo=false;S.updatedAt=Date.now();ui.bak=null;ui.bakMsg=T('Daten wiederhergestellt.','Data restored.');weeklyCheck();regenerate();save();render()},
  zfOpen(){const c=ctxFor(S),f={};['Z1','Z2','Z3','Z4','Z5'].forEach(z=>{const Z=c.zones[z];f[z+'h0']=Z.hr[0];f[z+'h1']=Z.hr[1];f[z+'p0']=Z.pace?fmtPace(Z.pace[1]):'';f[z+'p1']=Z.pace?fmtPace(Z.pace[0]):''});ui.zf=f;ui.zfErr='';render();setTimeout(()=>{const e=$('#zoneCard');if(e)e.scrollIntoView({block:'start'})},30)},
  zfCancel(){ui.zf=null;render()},
  zfReset(){delete S.profile.zonesManual;regenerate();save();render()},
  zfSave(){const f=ui.zf,err=m=>{ui.zfErr=m;render()},c=ctxFor(S),M={};let prev=0;
    for(const z of['Z1','Z2','Z3','Z4','Z5']){const a=+f[z+'h0'],b=+f[z+'h1'];
      if(!(a>=60&&a<=230&&b>=60&&b<=230&&a<b))return err(T(`${z}: Puls von–bis zwischen 60 und 230 eingeben (von kleiner als bis).`,`${z}: enter heart rate from–to between 60 and 230 (from lower than to).`));
      if(b<prev)return err(T(`${z}: Die Zonen müssen von Z1 bis Z5 ansteigen.`,`${z}: zones must rise from Z1 to Z5.`));prev=b;
      const p0=f[z+'p0']?parsePace(f[z+'p0']):null,p1=f[z+'p1']?parsePace(f[z+'p1']):null;
      if(Number.isNaN(p0)||Number.isNaN(p1)||(p0&&(p0<120||p0>1200))||(p1&&(p1<120||p1>1200)))return err(T(`${z}: Pace als min:sek eingeben, z. B. 5:10.`,`${z}: enter pace as min:sec, e.g. 5:10.`));
      const Z=c.zones[z],hrCh=a!==Z.hr[0]||b!==Z.hr[1],pc=p0&&p1?[Math.min(p0,p1),Math.max(p0,p1)]:null,paCh=pc&&(!Z.pace||Math.abs(pc[0]-Z.pace[0])>2||Math.abs(pc[1]-Z.pace[1])>2);
      if(hrCh||paCh)M[z]={hr:hrCh?[a,b]:null,pace:paCh?pc.map(Math.round):null}}
    S.profile.zonesManual=Object.keys(M).length?M:undefined;if(!S.profile.zonesManual)delete S.profile.zonesManual;
    ui.zf=null;regenerate();save();render()},
  goalOpen(){const p=S.profile,g=curGoal();ui.gf={goalMode:S.plan.mode==='fit'?'fit':g?'goal':'goal',gDist:g?([3,5,10,21.1,42.2].includes(g.dist)?g.dist:'x'):10,gCustom:g?String(g.dist):'',gType:g&&g.goal?'time':'finish',gh:g&&g.goal?Math.floor(g.goal/3600)||'':'',gm:g&&g.goal?Math.floor(g.goal%3600/60):'',gs:g&&g.goal?g.goal%60:'',gp:'',gDate:g?g.date:'',fitMin:p.fitMin||fitMinDef(p.exp)};ui.gfErr='';ui.tab='races';render();setTimeout(()=>{const e=$('#goalCard');if(e)e.scrollIntoView({block:'start'})},30)},
  gfSet(el){let v=el.dataset.v;v=v!==''&&!isNaN(+v)?+v:v;ui.gf[el.dataset.k]=v;ui.gfErr='';render()},
  gfCancel(){ui.gf=null;render()},
  goalFit(){setGoalMode('fit');render()},
  gfSave(){const f=ui.gf;
    if(f.goalMode==='race'){ui.gf=null;ui.tab='races';render();return}
    if(f.goalMode==='fit'){if(!f.fitMin){ui.gfErr=T('Bitte ein Zeitbudget wählen.','Please choose a time budget.');render();return}
      if(S.races.some(r=>!r.virtual&&r.date>=today()&&prioOf(r)==='A')){ui.gfErr=T('Du hast ein Rennen mit eigenem Vorbereitungsplan eingetragen. Ändere dort die Planwahl, wenn du stattdessen einfach fit bleiben willst.','You have a race with a dedicated training plan. Change its plan choice if you would rather just stay fit.');render();return}
      S.profile.fitMin=f.fitMin;ui.gf=null;setGoalMode('fit');render();return}
    const d=f.gDist==='x'?pnum(f.gCustom):+f.gDist,g=goalSec(f);
    if(!d||d<1||d>100){ui.gfErr=T('Die Distanz muss zwischen 1 und 100 km liegen.','The distance must be between 1 and 100 km.');render();return}
    if(f.gType!=='finish'&&!g){ui.gfErr=T('Bitte Zielzeit bzw. Zielpace eingeben.','Please enter the target time or pace.');render();return}
    if(g&&(g/d<150||g/d>1500)){ui.gfErr=T('Die Zielzeit passt nicht zur Distanz.','The target time does not fit the distance.');render();return}
    if(f.gDate&&f.gDate<addD(today(),14)){ui.gfErr=T('Das Datum sollte mindestens 2 Wochen in der Zukunft liegen.','The date should be at least 2 weeks ahead.');render();return}
    if(S.races.some(r=>!r.virtual&&r.date>=today()&&prioOf(r)==='A')){ui.gfErr=T('Du hast ein Rennen mit eigenem Vorbereitungsplan eingetragen; es bleibt dein Hauptziel. Ändere dort die Planwahl, wenn du stattdessen ein persönliches Ziel verfolgen willst.','You have a race with a dedicated training plan; it stays your main goal. Change its plan choice if you would rather pursue a personal goal.');render();return}
    S.races=S.races.filter(r=>!(r.virtual&&r.date>=today()));
    S.races.push({id:uid(),name:goalName(d,g),date:goalDate(S.profile,d,g,f.gDate),dist:d,goal:g||null,rel:'high',plan:'own',prio:'A',adapt:true,virtual:true});
    ui.gf=null;setGoalMode('goal');render()},
  syncNow(){cSync()},
  // rescue: join this device and the account without treating anything as deleted, then upload
  async mergeNow(){if(!isCloud()||!S)return;setSync('busy');try{const{data:R}=await cPull(CU);if(R){S=mergeState(S,R,null);saveLocal()}await cPush(S,CU);const acc=accounts(),u=acc.users[CU];u.synced=S.updatedAt||0;u.bk=syncKeys(S);saveAccounts(acc);setSync('ok');ui.mergeMsg=T('Zusammengeführt: Alles von diesem Gerät ist jetzt im Konto.','Merged: everything from this device is now in your account.');render()}catch(e){setSync(e&&e.auth?'auth':'off')}},
  cuOpen(){const u=accounts().users[CU]||{};ui.cu={user:String(u.name||'').replace(/\s+/g,''),pw:'',pw2:'',err:''};render()},
  cuCancel(){ui.cu=null;render()},
  cuSave(){cloudUpgrade()},
  pwOpen(){ui.pwc={old:'',n1:'',n2:'',err:''};render();setTimeout(()=>{const x=$('#pwOld');if(x)x.focus()},50)},
  pwCancel(){ui.pwc=null;render()},
  goPlan(){ui.tab='train';ui.trainView='plan';render();const w=document.querySelector('.wk.cur');if(w)w.scrollIntoView({block:'start'});else scrollTo(0,0)},
  goList(){ui.tab='train';ui.trainView='list';render();scrollTo(0,0)},
  goVol(){ui.tab='form';render();ui.wallAnim=true;ui.sheet={kind:'ins',k:'load'};renderSheet()},
  ins(el){ui.wallAnim=true;ui.wallSel=null;ui.sheet={kind:'ins',k:el.dataset.v};renderSheet()},
  wallSel(el){ui.wallSel=ui.wallSel===el.dataset.v?null:el.dataset.v;renderSheet()},
  foldOpen(el){const f=foldState();f[el.dataset.v]=1;lsSet('tempomacher.fold',JSON.stringify(f));render();const d=document.querySelector(`[data-fold="${el.dataset.v}"]`);if(d)d.scrollIntoView({behavior:'smooth',block:'start'})},
  pwSave(){pwChange()},
  cuPick(el){ui.cu.user=el.dataset.v;ui.cu.sugg=null;ui.cu.err='';render()},
  authSugg(el){ui.auth.name=el.dataset.v;ui.auth.sugg=null;ui.auth.err='';render();const p=$('#authPw');if(p)p.focus()},
  authMode(el){ui.auth.mode=el.dataset.v;ui.auth.err='';render()},
  authPick(el){ui.auth.name=el.dataset.v;ui.auth.err='';render();const p=$('#authPw');if(p)p.focus()},
  authForgot(){ui.auth.forgot=true;ui.auth.delAsk=false;render()},
  authBack(){ui.auth.forgot=false;render()},
  authDelAsk(){ui.auth.delAsk=true;render()},
  authDel(){const slug=slugOf(ui.auth.name),a=accounts();delete a.users[slug];if(a.last===slug)a.last=null;saveAccounts(a);lsSet('startlinie.u.'+slug,null);
ui.auth={mode:Object.keys(a.users).length?'login':'create',name:'',pw:'',pw2:'',keep:false,err:''};render()},
  accDelAsk(){ui.accDelAsk=true;render()},
  accDel(){const slug=CU,a=accounts();if(isCloud()){const sl=slug;cDelete(sl).catch(()=>{}).finally(()=>ckSet(sl,null))}delete a.users[slug];if(a.last===slug)a.last=null;saveAccounts(a);lsSet(userKey(),null);ui.accDelAsk=false;CU=null;S=null;docRef=null;ssSet(SESS,null);lsSet(SESS,null);ui.auth=null;render()},
  ci(el){ui.ci[el.dataset.k]=+el.dataset.v;if(el.dataset.k==='pain'&&!ui.ci.pain){ui.ci.painLvl=null;ui.ci.painArea=null}ui.ciOpen=true;render()},
  shoeAdd(){const f=ui.shoeF||{},n=String(f.name||'').trim();if(!n)return;S.shoes=S.shoes||[];const id='sh'+Date.now().toString(36);S.shoes.push({id,name:n.slice(0,40),km0:Math.max(0,Math.round(pnum(f.km0)||0)),lim:clamp(Math.round(pnum(f.lim)||700),100,3000),at:Date.now()});if(!S.shoeDef)S.shoeDef=id;ui.shoeF={name:'',km0:'',lim:'700'};save();render()},
  shoeRet(el){const x=(S.shoes||[]).find(z=>z.id===el.dataset.v);if(x){x.ret=!x.ret;if(x.ret&&S.shoeDef===x.id)S.shoeDef=null}save();render()},
  shoeDefSet(el){S.shoeDef=el.dataset.v;save();render()},
  shoeSeen(el){S.shoeWarned=S.shoeWarned||{};S.shoeWarned[el.dataset.v]=1;save();render()},
  openBlock(){const L=lastBlock();if(L)S.blockSeen=L.b.to;save();ui.tab='form';render();ui.wallAnim=true;ui.sheet={kind:'ins',k:'load'};renderSheet()},
  goPb(){const f=foldState();f['p-pb']=1;lsSet('tempomacher.fold',JSON.stringify(f));ui.sheet=null;renderSheet();ui.tab='me';render();const d=document.querySelector('[data-fold="p-pb"]');if(d)d.scrollIntoView({block:'start'})},
  checkin(){const t=today(),c=ui.ci,rhr=+c.rhr>=30&&+c.rhr<=120?Math.round(+c.rhr):null,hrv=+c.hrv>=5&&+c.hrv<=250?Math.round(+c.hrv):null;const pl=c.pain>0?c.painLvl:null;const ci={pain:pl==null?0:pl>=7?2:1,painLvl:pl,painArea:pl!=null?c.painArea:null,sleep:c.sleep,legs:c.legs,rhr,hrv,cyc:c.cyc||0,heat:!!c.heat,at:Date.now()};if(ci.painLvl==null){delete ci.painLvl;delete ci.painArea}const r=readiness(ci,t);if(r){ci.ready=r.v;ci.low=r.low;ci.feel=feelOf(r.v)}else ci.feel=1;S.checkins[t]=ci;ui.ci={pain:null,sleep:null,legs:null,rhr:'',hrv:'',heat:false};ui.ciOpen=false;save();render()},
  ciHeat(el){ui.ci.heat=el.dataset.v==='1';render()},
  redoCheckin(){const c=S.checkins[today()];ui.ci=c?{pain:c.pain?1:0,painLvl:c.painLvl??null,painArea:c.painArea??null,sleep:c.sleep??null,legs:c.legs??null,rhr:c.rhr||'',hrv:c.hrv||'',cyc:c.cyc||0,heat:!!c.heat}:{pain:null,sleep:null,legs:null,rhr:'',hrv:''};ui.ciOpen=true;delete S.checkins[today()];save();render()},
  openDay(el){ui.sheet={kind:'day',date:el.dataset.d};renderSheet()},
  closeSheet(){ui.sheet=null;renderSheet()},
  openLog(el){const d=el.dataset.d,l=S.logs[d],pl=plannedFor(d);
    ui.lf=l&&l.done?editForm(l,{mode:'plan',date:d,kind:pl.type==='alt'?'alt':'run',editKey:'d:'+d})
      :{mode:'plan',date:d,kind:pl.type==='alt'?'alt':'run',type:rtOfPlan(pl.type),km:'',pace:'',hr:'',elev:0,rpe:null,dur:'',reps:'',h1p:'',h1h:'',h2p:'',h2h:''};
    ui.lfErr='';ui.sheet={kind:'run'};renderSheet()},
  editEntry(el){const k=el.dataset.v;
    if(k.startsWith('d:')){ACT.openLog({dataset:{d:k.slice(2)}});return}
    const x=(S.extra||[]).find(e=>e.id===k.slice(2));if(!x)return;
    ui.lf=editForm(x,{mode:x.replaces?'plan':'extra',assign:x.replaces?'replace':'extra',date:x.date,kind:isAlt(x)?'alt':'run',editKey:k});ui.lfErr='';ui.sheet={kind:'run'};renderSheet()},
  moveAsk(el){ui.sheet={kind:'move',date:el.dataset.d};renderSheet()},
  moveDo(el){const a=ui.sheet.date,b=el.dataset.d;if(!swapDays(a,b))return;(S.swaps=S.swaps||[]).push({a,b});save();ui.sheet=null;render();toast(T(`Verschoben: ${fdate(b)}`,`Moved: ${fdate(b)}`))},
  bakLater(){S.bakSnooze=addD(today(),7);save();render()},
  bakCloud(){const f=foldState();f['p-acc']=1;lsSet('tempomacher.fold',JSON.stringify(f));ui.tab='me';ACT.cuOpen();scrollTo(0,0)},
  gainFix(el){const k=el.dataset.v,inp=document.getElementById('gf-'+k.replace(':','_')),g=pnum(inp&&inp.value);
    if(Number.isNaN(g)||g<0||g>6000){if(inp)inp.focus();return}
    const l=k.startsWith('d:')?S.logs[k.slice(2)]:(S.extra||[]).find(x=>x.id===k.slice(2));if(!l)return;
    l.gain=Math.round(g);l.elev=elevIdx(g);ui.gfOpen=true;save();render();toast(T(`Gespeichert: ${Math.round(g)} hm`,`Saved: ${Math.round(g)} m`))},
  gfAll(){ui.gfAll=true;ui.gfOpen=true;render()},
  theme(el){themeSet(el.dataset.v);render()},
  raceResOpen(el){const r=S.races.find(x=>x.id===el.dataset.v);if(!r)return;const R=r.res||{},lg=S.logs[r.date],sec=R.sec||(lg&&lg.done&&(lg.sec||(lg.pace?Math.round(lg.pace*logKm(lg)):null)))||null;
    ui.rr={id:r.id,h:sec?Math.floor(sec/3600)||'':'',m:sec?Math.floor(sec%3600/60):'',s:sec?sec%60:'',hr:R.hr||(lg&&lg.hr)||'',h1:R.h1?fmtTime(R.h1):'',gain:R.gain!=null?R.gain:'',cond:[...(R.cond||[])],rpe:R.rpe||(lg&&lg.rpe)||null};ui.rrErr='';ui.sheet={kind:'raceRes'};renderSheet()},
  rrCond(el){const c=ui.rr.cond,k=el.dataset.v;ui.rr.cond=c.includes(k)?c.filter(x=>x!==k):[...c,k];renderSheet()},
  raceResSave(){const f=ui.rr,r=S.races.find(x=>x.id===f.id);if(!r)return;const err=m=>{ui.rrErr=m;renderSheet()};
    const sec=hms(f.h,f.m,f.s);if(!sec||sec<r.dist*120||sec>r.dist*1200)return err(T('Bitte eine gültige Endzeit eingeben.','Please enter a valid finish time.'));
    const hr=f.hr===''?null:+f.hr;if(hr!=null&&!(hr>=80&&hr<=230))return err(T('Puls zwischen 80 und 230.','Heart rate between 80 and 230.'));
    let h1=null;if(String(f.h1||'').trim()){h1=parseDur(String(f.h1).trim());if(!h1||Number.isNaN(h1)||h1<sec*.35||h1>sec*.65)return err(T('Die Zeit der 1. Hälfte passt nicht zur Endzeit.','The first-half time does not fit the finish time.'))}
    const gain=f.gain===''||f.gain==null?null:Math.round(pnum(f.gain));if(!f.rpe)return err(T('Bitte antippen, wie anstrengend das Rennen war (1–10).','Please tap how hard the race was (1–10).'));const rpe=+f.rpe;
    const pred=r.res&&r.res.pred?r.res.pred:showPred(r.dist)?Math.round(predict(vdotOf(S),r.dist)):null;
    r.res={sec,hr,h1,gain:Number.isNaN(gain)?null:gain,cond:f.cond,rpe,pred,at:Date.now()};
    // also as a training entry (load, entries, milestones)
    const ps=planSession(r.date),x={s:ps&&ps.type==='race'?ps:{type:'race',title:r.name,km:r.dist,zone:'Z5'},done:true,type:'race',km:r.dist,sec,pace:Math.round(sec/r.dist),hr,rpe,gain:r.res.gain,elev:r.res.gain!=null?elevIdx(r.res.gain):0,src:'race',raceId:r.id,at:Date.now()};
    if(ps&&ps.type==='race'&&(!S.logs[r.date]||S.logs[r.date].raceId===r.id||S.logs[r.date].type==='race'))S.logs[r.date]=x;
    else{S.extra=(S.extra||[]).filter(e=>e.raceId!==r.id);x.id='race-'+r.id;x.date=r.date;S.extra.push(x)}
    save();ui.sheet={kind:'raceFb',id:r.id};render()},
  raceResDel(){const r=S.races.find(x=>x.id===ui.rr.id);if(!r)return;delete r.res;if(S.logs[r.date]&&S.logs[r.date].raceId===r.id)delete S.logs[r.date];S.extra=(S.extra||[]).filter(e=>e.raceId!==r.id);save();ui.sheet=null;render()},
  raceFbOpen(el){ui.sheet={kind:'raceFb',id:el.dataset.v};renderSheet()},
  raceRef(el){const r=S.races.find(x=>x.id===el.dataset.v);if(!r||!raceSec(r))return;const id='race-'+r.id;
    S.pbs=(S.pbs||[]).filter(b=>b.id!==id);S.pbs.push({id,dist:r.dist,sec:r.res.sec,date:r.date,name:r.name});
    S.profile.ref={dist:r.dist,sec:r.res.sec,pb:id};S.adapt.vdotAdj=0;setPrep(false);regenerate();save();ui.sheet=null;render();toast(T('Als Bestzeit und Referenz übernommen.','Saved as best time and reference.'))},
  togglePast(){ui.showPast=!ui.showPast;render()},
  revOk(){const t=today();S.revSeen=dow(t)===6?monday(t):addD(monday(t),-7);save();render()},
  pauseAsk(){const t=today();ui.pz={reason:null,from:t,to:addD(t,6),err:''};ui.sheet={kind:'pause'};renderSheet()},
  pzSet(el){ui.pz[el.dataset.k]=el.dataset.v;renderSheet()},
  pauseSave(){const z=ui.pz,t=today();if(!z.reason){z.err=T('Bitte einen Grund wählen.','Please choose a reason.');renderSheet();return}
    if(!z.from||!z.to||z.to<z.from||z.from<monday(t)||daysBetween(z.from,z.to)>60){z.err=T('Bitte gültige Daten wählen (Beginn frühestens am Montag dieser Woche, höchstens 60 Tage).','Please choose valid dates (start no earlier than this Monday, at most 60 days).');renderSheet();return}
    S.pause={from:z.from,to:z.to,reason:z.reason,at:Date.now()};regenerate();save();ui.sheet=null;render()},
  pauseEnd(){if(!S.pause)return;const y=addD(today(),-1);if(y<S.pause.from)S.pause=null;else S.pause.to=y;regenerate();save();render()},
  logHow(el){ui.altPick=null;ui.sheet={kind:'how',date:el&&el.dataset&&el.dataset.d||null};renderSheet()},
  altHow(el){const d=el&&el.dataset&&el.dataset.d||null,pl=d&&planSession(d);ui.altSel={date:d,sport:null,assign:pl&&!['rest','alt','race'].includes(pl.type)&&!S.logs[d]?'replace':'extra'};ui.sheet={kind:'altHow'};renderSheet()},
  altSport(el){ui.altSel.sport=ui.altSel.sport===el.dataset.v?null:el.dataset.v;renderSheet()},
  altAssign(el){ui.altSel.assign=el.dataset.v;renderSheet()},
  altHand(){ui.lfSportAll=false;const A=ui.altSel,d=A.date||today(),pl=planSession(d),runPl=pl&&!['rest','alt','race'].includes(pl.type)&&!S.logs[d],planAlt=pl&&pl.type==='alt'&&!S.logs[d];
    ui.lf={mode:runPl||planAlt?'plan':'extra',assign:runPl?A.assign:planAlt?'plan':'extra',date:d,kind:'alt',sport:A.sport||'',sportTxt:'',dur:'',dist:'',gain:'',hr:'',rpe:null,type:'easy',km:'',pace:'',elev:null,reps:'',h1p:'',h1h:'',h2p:'',h2h:''};ui.lfErr='';ui.sheet={kind:'run'};renderSheet()},
  openExtra(){ui.lf={mode:'extra',kind:'run',date:today(),type:'easy',km:'',pace:'',hr:'',elev:0,rpe:null,dur:'',sport:'',reps:'',h1p:'',h1h:'',h2p:'',h2h:''};ui.lfErr='';ui.sheet={kind:'run'};renderSheet()},
  lfSet(el){const v=el.dataset.v,k=el.dataset.k,f=ui.lf;f[k]=isNaN(+v)?v:+v;if(k==='elev'&&f.gain!==''&&f.gain!=null&&elevIdx(+f.gain)!==+v)f.gain='';
    if(k==='type'&&f.imp)lfPrefill(f);if(k==='sport')ui.lfSportAll=false;
    ui.lfErr='';renderSheet()},
  raceDay(el){ui.sheet={kind:'raceDay',id:el.dataset.v};renderSheet();const sh=$('#sheet');if(sh)sh.scrollTop=0},
  rdPrint(){document.body.classList.add('printing');setTimeout(()=>{window.print();document.body.classList.remove('printing')},50)},
  obGoalSet(el){const v=+el.dataset.v,o=ui.ob;o.gh=String(Math.floor(v/3600));o.gm=String(Math.floor(v%3600/60));o.gs=String(v%60);render()},
  pbRef(el){const p=(S.pbs||[]).find(x=>x.id===el.dataset.v);if(!p)return;S.profile.ref={dist:p.dist,sec:p.sec,pb:p.id};S.adapt.vdotAdj=0;setPrep(false);regenerate();save();render();toast(T('Als Referenz übernommen: Paces und Prognosen sind neu berechnet.','Used as reference: paces and predictions recalculated.'))},
  yearOpen(){ui.year=pd(today()).getFullYear();ui.homeEdit=false;ui.homeErr='';ui.sheet={kind:'year'};renderSheet()},
  yearSet(el){ui.year=+el.dataset.v;renderSheet()},
  homeEdit(){ui.homeEdit=true;renderSheet()},
  homeSave(){const v=($('#homeIn')||{}).value||'',g=placeFind(v),geo=ui.homeGeo;
    if(!v.trim()){ui.homeErr=T('Bitte einen Ort eingeben.','Please enter a place.');renderSheet();return}
    if(!g&&!geo){ui.homeErr=T('Diesen Ort kenne ich nicht. Wähle den nächsten grösseren Ort aus der Liste oder «Standort verwenden».','I do not know this place. Choose the nearest larger town from the list or «Use my location».');renderSheet();return}
    S.profile.home=geo?{name:v.trim(),lat:geo.lat,lon:geo.lon}:{name:gName(g),lat:g.lat,lon:g.lon};ui.homeGeo=null;ui.homeEdit=false;ui.homeErr='';save();renderSheet();render()},
  homeGeo(){if(!navigator.geolocation){ui.homeErr=T('Standort ist auf diesem Gerät nicht verfügbar.','Location is not available on this device.');renderSheet();return}
    navigator.geolocation.getCurrentPosition(p=>{ui.homeGeo={lat:Math.round(p.coords.latitude*100)/100,lon:Math.round(p.coords.longitude*100)/100};const near=GAZ().map(g=>({g,d:gcKm(ui.homeGeo,g)})).sort((a,b)=>a.d-b.d)[0];
      const i=$('#homeIn');if(i&&!i.value.trim()&&near)i.value=near.d<8?gName(near.g):'';ui.homeErr=i&&!i.value.trim()?T('Standort übernommen. Bitte noch den Namen deines Wohnorts eintragen.','Location taken. Please enter the name of your home town.'):'';if(ui.homeErr)renderSheet();else ACT.homeSave()},
      ()=>{ui.homeErr=T('Standort nicht freigegeben. Bitte den Ort eintippen.','Location not allowed. Please type the place.');renderSheet()},{timeout:10000,maximumAge:600000})},
  btType(el){const f=ui.bt.rows[+el.dataset.k];f.type=el.dataset.v;lfPrefill(f);renderSheet()},
  btSave(){const B=ui.bt;B.err={};B.rows.forEach((f,i)=>{if(!f.rpe)B.err[i]=T('Bitte antippen, wie anstrengend es war.','Please tap how hard it was.')});
    if(Object.keys(B.err).length){renderSheet();return}
    let n=0;B.rows.forEach((f,i)=>{const r=saveLf(f);if(r.err)B.err[i]=r.err;else n++});
    B.rows=B.rows.filter((f,i)=>B.err[i]);const e2={};B.rows.forEach((f,k)=>{e2[k]=Object.values(B.err)[k]});B.err=e2;save();
    if(B.rows.length){renderSheet();render();return}ui.sheet=null;ui.thumbs=null;render();toast(T(`${n} Trainings gespeichert.`,`${n} sessions saved.`))},
  rpeSet(el){const k=el.dataset.k,o=/^bt\d+$/.test(k)?ui.bt.rows[+k.slice(2)]:ui[k];if(!o)return;o.rpe=+el.dataset.v;if(el.dataset.k==='lf')ui.lfErr='';else if(el.dataset.k==='rr')ui.rrErr='';renderSheet()},
  lfAll(){ui.lfAll=true;renderSheet()},
  lfSportAll(){ui.lfSportAll=true;renderSheet()},
  lfDate(el){const f=ui.lf,d=el.dataset.v;f.date=d;const pl=planSession(d),logged=S.logs[d];
    if(f.kind==='alt'){const can=pl&&!['rest','race'].includes(pl.type)&&!logged&&d>=S.plan.startMonday;f.mode=can?'plan':'extra';f.assign=can&&pl.type==='alt'?'plan':'extra'}
    else{const toPlan=pl&&pl.type!=='rest'&&pl.type!=='alt'&&!logged&&d>=S.plan.startMonday;f.mode=toPlan?'plan':'extra';f.assign='plan';if(f.imp){if(f.imp.ser){applyPlanFit(f.imp,toPlan?plannedFor(d)||pl:null);const v=f.imp.iv;f.wsec=v&&v.wt?fmtTime(v.wt):'';f.reps=v&&v.n>1?String(v.n):''}f.type=guessType(f.imp,toPlan?pl:null);lfPrefill(f)}}
    ui.lfErr='';renderSheet()},
  importAct(el){ui.altPick=el&&el.dataset&&el.dataset.alt?Object.assign({},ui.altSel):null;ui.impFor=el&&el.dataset&&el.dataset.d||null;
    // first time: a short guide how the file gets onto the phone; afterwards straight to the file picker
    if(!lsGet('tempomacher.fileHow')&&!(el&&el.dataset&&el.dataset.go)){ui.sheet={kind:'fileHow'};renderSheet();return}
    const fi=$('#fileIn');fi.value='';fi.click()},
  fileHowShow(el){ui.impFor=el&&el.dataset&&el.dataset.d||ui.impFor||null;ui.sheet={kind:'fileHow'};renderSheet()},
  fileGo(){lsSet('tempomacher.fileHow','1');ui.sheet=null;renderSheet();const fi=$('#fileIn');fi.value='';fi.click()},
  shotAct(el){if(!(el&&el.dataset&&el.dataset.sh))ui.altPick=el&&el.dataset&&el.dataset.alt?Object.assign({},ui.altSel):null;ui.impFor=el&&el.dataset&&el.dataset.d||null;const fi=$('#shotIn');fi.value='';fi.click()},
  shotGo(){ui.sheet=null;renderSheet();const fi=$('#shotIn');fi.value='';fi.click()},
  shotHelpShow(el){const d=el&&el.dataset&&el.dataset.d;ui.impFor=d||(ui.lf&&ui.lf.mode==='plan'?ui.lf.date:ui.impFor)||null;ui.sheet={kind:'shotHelp'};renderSheet()},
  shotHelpOff(){if(S){S.shotHelpOff=true;save()}ACT.shotGo()},
  saveRun(){const r=saveLf(ui.lf);if(r.err){ui.lfErr=r.err;renderSheet();return}save();const{x,toExtra,f}=r,t=today();
    ui.thumbs=null;ui.sheet=x.done&&(x.type||isAlt(x))?{kind:'fb',key:toExtra?'x:'+x.id:'d:'+f.date,back:f.date===t||toExtra?null:f.date}:f.date===t||toExtra?null:{kind:'day',date:f.date};render()},
  fbDone(){const b=ui.sheet&&ui.sheet.back;ui.sheet=b?{kind:'day',date:b}:null;render()},
  delExtra(el){S.extra=S.extra.filter(x=>x.id!==el.dataset.v);save();render()},
  trashAsk(el){ui.trash=el.dataset.v;render()},
  trashCancel(){ui.trash=null;render()},
  trashDo(el){const k=el.dataset.v;if(k.startsWith('d:')){const o=S.logs[k.slice(2)];if(o&&o.reason==='alt'&&o.altId)S.extra=S.extra.filter(x=>x.id!==o.altId);delete S.logs[k.slice(2)]}else{const x=S.extra.find(e=>e.id===k.slice(2));if(x&&x.replaces&&S.logs[x.replaces]&&S.logs[x.replaces].reason==='alt')delete S.logs[x.replaces];S.extra=S.extra.filter(x=>x.id!==k.slice(2))}
    ui.trash=null;if(ui.sheet&&ui.sheet.kind==='xview')ui.sheet=null;save();render()},
  openXView(el){ui.sheet={kind:'xview',id:el.dataset.v};renderSheet()},
  skipLog(el){ui.skip={reason:null};ui.sheet={kind:'skip',date:el.dataset.d};renderSheet()},
  skipSet(el){ui.skip.reason=el.dataset.v;renderSheet()},
  skipSave(el){const d=el.dataset.d,s=(d===today()?effective(d).s:planSession(d))||(S.logs[d]&&S.logs[d].s);S.logs[d]={s,done:false,reason:ui.skip.reason,at:Date.now()};save();ui.sheet=null;render()},
  delLog(el){delete S.logs[el.dataset.d];save();render()},
  dismissAdapt(){const h=S.adapt.history[S.adapt.history.length-1];if(h)h.seen=true;save();render()},
  toggleW(el){const k=el.dataset.v,cur=monday(today());ui.openW[k]=!(ui.openW[k]??(k>=cur&&k<=addD(cur,7)));render()},
  raceNew(){ui.rf={id:null,name:'',date:addD(today(),56),dist:10,gh:'',gm:'',gs:'',rel:'mid',plan:null,touched:false};ui.rf.plan=defaultPlan(ui.rf);ui.rfErr='';render()},
  raceEdit(el){const r=S.races.find(r=>r.id===el.dataset.v);const g=r.goal||0;
    ui.rf={id:r.id,name:r.name,date:r.date,dist:r.dist,gh:g?Math.floor(g/3600):'',gm:g?Math.floor(g%3600/60):'',gs:g?g%60:'',rel:r.rel||'mid',plan:r.plan||'none',touched:true};ui.rfErr='';render();window.scrollTo(0,0)},
  rfSet(el){let v=el.dataset.v;const k=el.dataset.k;ui.rf[k]=k==='dist'?+v:v;if(k==='plan')ui.rf.touched=true;ui.rfErr='';render()},
  rfRel(el){ui.rf.rel=el.dataset.v;if(!ui.rf.touched)ui.rf.plan=defaultPlan(ui.rf);ui.rfErr='';render()},
  raceCancel(){ui.rf=null;render()},
  raceDelAsk(){ui.rf.confirmDel=true;render()},
  raceDel(){S.races=S.races.filter(r=>r.id!==ui.rf.id);ui.rf=null;racesChanged()},
  raceSave(){const f=ui.rf,dist=pnum(f.dist);
    if(!f.date){ui.rfErr='Bitte ein Datum wählen.';render();return}
    if(!dist||dist<1||dist>100){ui.rfErr='Distanz zwischen 1 und 100 km eingeben.';render();return}
    const g=hms(f.gh,f.gm,f.gs);if(g&&(g/dist<150||g/dist>1500)){ui.rfErr='Die Zielzeit passt nicht zur Distanz.';render();return}
    const o=planOptions(f).find(x=>x.k===f.plan);if(!o||o.dis){ui.rfErr='Bitte wähle, ob ein Plan erstellt werden soll.';render();return}
    if(f.plan==='own'){const fr=freqInfo(S.profile,{dist,goal:g||null},vdotOf(S)),nd=trainDays(S.profile).length;if(nd<fr.min){ui.rfErr=`Mit ${nd} Trainingstagen pro Woche lässt sich ${fk(dist)} km nicht seriös vorbereiten. Nötig sind mindestens ${fr.min} (empfohlen ${fr.rec}). Erweitere deine Trainingstage im Profil oder wähle «Aus dem Training heraus laufen».`;render();return}}
    const r={id:f.id||uid(),name:String(f.name).trim()||`${fk(dist)}-km-Lauf`,date:f.date,dist,goal:g||null,rel:f.rel,plan:f.plan,adapt:true};r.prio=prioOf(r);
    const i=S.races.findIndex(x=>x.id===r.id);if(i>=0)S.races[i]=r;else S.races.push(r);
    if(r.prio==='A'&&r.date>=today()&&S.plan.mode!=='race'){S.races=S.races.filter(x=>!(x.virtual&&x.date>=today()));ui.rf=null;setGoalMode('race');render();return}
    ui.rf=null;racesChanged()},
  pfEdit(){const p=S.profile;ui.pf={home:p.home?p.home.name:'',km:p.km||'',runs:p.runs||'',age:p.age,birth:p.birth||'',sex:p.sex,exp:p.exp,hrMax:p.hrMax||'',hrRest:p.hrRest||'',daysSel:trainDays(p),longDay:longDayOf(p),rd:p.ref?p.ref.dist:'',rh:p.ref?Math.floor(p.ref.sec/3600)||'':'',rm:p.ref?Math.floor(p.ref.sec%3600/60):'',rs:p.ref?p.ref.sec%60:''};ui.pfErr='';render()},
  pfSet(el){const v=el.dataset.v;ui.pf[el.dataset.k]=isNaN(+v)?v:+v;render()},
  pfCancel(){ui.pf=null;render()},
  pfSave(){const f=ui.pf,p=S.profile;if(String(f.home||'').trim()&&(!p.home||f.home.trim()!==p.home.name)){const g=placeFind(f.home);if(!g){ui.pfErr=T('Diesen Wohnort kenne ich nicht. Bitte den nächsten grösseren Ort aus der Liste wählen.','I do not know this home town. Please choose the nearest larger town from the list.');render();return}p.home={name:gName(g),lat:g.lat,lon:g.lon}}else if(!String(f.home||'').trim())p.home=null;const age=f.birth?ageFrom(f.birth):null;if(!age||age<10||age>95){ui.pfErr=f.birth?T('Bitte ein gültiges Geburtsdatum eingeben (Alter zwischen 10 und 95).','Please enter a valid date of birth (age between 10 and 95).'):T('Bitte dein Geburtsdatum eingeben.','Please enter your date of birth.');render();return}
    const hr=f.hrMax===''?null:+f.hrMax;if(hr!==null&&(hr<120||hr>230)){ui.pfErr='Maximalpuls zwischen 120 und 230.';render();return}
    const hrr=f.hrRest===''?null:+f.hrRest;if(hrr!==null&&(hrr<30||hrr>100)){ui.pfErr='Ruhepuls zwischen 30 und 100.';render();return}
    if(f.daysSel.length<2){ui.pfErr='Bitte mindestens 2 Trainingstage wählen.';render();return}
    {const m=mainRace(S);if(m&&m.date>=today()){const fr=freqInfo({...p,exp:+f.exp},m,vdotOf(S));if(f.daysSel.length<fr.min){ui.pfErr=`Für «${m.name}» (${fk(m.dist)} km) braucht es mindestens ${fr.min} Trainingstage pro Woche (empfohlen ${fr.rec}). Mit ${f.daysSel.length} Tagen ist das Ziel nicht seriös vorzubereiten.`;render();return}}}
    if(f.longDay===null||!f.daysSel.includes(+f.longDay)){ui.pfErr='Bitte den Tag für den langen Lauf wählen.';render();return}
    const rd=pnum(f.rd),rs=hms(f.rh,f.rm,f.rs);let ref=null;
    if(rd||rs){if(!rd||rd<1||rd>100||!rs||rs/rd<150||rs/rd>1200){ui.pfErr='Referenzzeit prüfen: Distanz 1–100 km und eine passende Zeit.';render();return}ref={dist:rd,sec:rs}}
    const refChanged=JSON.stringify(ref)!==JSON.stringify(p.ref);
    const kmN=Math.round(pnum(f.km)),runsN=Math.round(pnum(f.runs));if(!(kmN>=0&&kmN<=300)){ui.pfErr=T('Wochenumfang bitte als Zahl zwischen 0 und 300 km.','Weekly volume as a number between 0 and 300 km, please.');render();return}
    const kmChanged=kmN!==(p.km||0);Object.assign(p,{km:kmN,runs:runsN>=0&&runsN<=14?runsN:p.runs,age,birth:f.birth||p.birth||null,sex:f.sex,exp:+f.exp,hrMax:hr,hrRest:hrr,daysSel:[...f.daysSel].sort((a,b)=>a-b),days:f.daysSel.length,longDay:+f.longDay,ref});
    if(refChanged)S.adapt.vdotAdj=0;if(kmChanged)S.adapt.volFactor=1;
    setPrep(false);ui.pf=null;regenerate();save();render()},
  labEdit(){const L=S.profile.lab;const fp=x=>x?fmtPace(x):'';
    ui.lab={type:L?L.type:'laktat',date:L?L.date:today(),mode:L?L.mode:'thr',hrMax:S.profile.hrMax||'',lt1hr:L&&L.lt1hr||'',lt1pace:fp(L&&L.lt1pace),lt2hr:L&&L.lt2hr||'',lt2pace:fp(L&&L.lt2pace)};
    ['Z1','Z2','Z3','Z4','Z5'].forEach(z=>{const zz=L&&L.mode==='zones'?L.zones[z]:null;ui.lab[z+'h0']=zz?zz.hr[0]:'';ui.lab[z+'h1']=zz?zz.hr[1]:'';ui.lab[z+'p0']=zz&&zz.pace?fmtPace(zz.pace[0]):'';ui.lab[z+'p1']=zz&&zz.pace?fmtPace(zz.pace[1]):''});
    ui.labErr='';render()},
  labSet(el){ui.lab[el.dataset.k]=el.dataset.v;ui.labErr='';render()},
  labCancel(){ui.lab=null;render()},
  labDelAsk(){ui.labDelAsk=true;render()},
  labDel(){delete S.profile.lab;ui.labDelAsk=false;setPrep(false);regenerate();save();render()},
  labSave(){const L=ui.lab,err=m=>{ui.labErr=m;render()};
    if(!L.date||L.date>today())return err('Bitte das Testdatum angeben.');
    const hm=L.hrMax===''?null:+L.hrMax;if(hm!==null&&(hm<120||hm>230))return err('Max. Herzfrequenz zwischen 120 und 230.');
    const okHr=v=>v>=80&&v<=230;let lab={type:L.type,date:L.date,mode:L.mode};
    if(L.mode==='thr'){const h1=+L.lt1hr,h2=+L.lt2hr,p1=parseLabPace(L.lt1pace),p2=parseLabPace(L.lt2pace);
      if(!okHr(h1)||!okHr(h2))return err('Bitte den Puls an beiden Schwellen eingeben (80–230).');
      if(h1>=h2)return err('Der Puls an der aeroben Schwelle (LT1) muss tiefer sein als an der anaeroben Schwelle (LT2).');
      if(Number.isNaN(p1)||Number.isNaN(p2))return err('Tempo als Pace (z. B. 5:10) oder km/h (z. B. 11.6) eingeben.');
      if(p1&&p2&&p1<=p2)return err('Das Tempo an LT1 muss langsamer sein als an LT2.');
      Object.assign(lab,{lt1hr:h1,lt2hr:h2,lt1pace:p1?Math.round(p1):null,lt2pace:p2?Math.round(p2):null});
    }else{const zones={};
      for(const z of ['Z1','Z2','Z3','Z4','Z5']){const a=+L[z+'h0'],b=+L[z+'h1'];
        if(!okHr(a)||!okHr(b)||a>=b)return err(`${z}: bitte Puls von–bis eingeben (von kleiner als bis).`);
        const p0=parseLabPace(L[z+'p0']),p1=parseLabPace(L[z+'p1']);
        if(Number.isNaN(p0)||Number.isNaN(p1))return err(`${z}: Tempo als Pace oder km/h eingeben.`);
        zones[z]={hr:[a,b],pace:p0&&p1?[Math.round(Math.min(p0,p1)),Math.round(Math.max(p0,p1))]:null}}
      lab.zones=zones}
    S.profile.lab=lab;if(hm)S.profile.hrMax=hm;S.adapt.vdotAdj=0;ui.lab=null;setPrep(false);regenerate();save();render()},
  resetAsk(){ui.resetAsk=true;render()},resetCancel(){ui.resetAsk=false;render()},
  resetDo(){ui.resetAsk=false;S=null;saveLocal();ui.ob=freshOb();render()},
  allLogs(){ui.allLogs=true;render()},
  healthOk(){S.healthOk=true;save();render()},
  dismissRw(){if(S.adapt.rwNote)S.adapt.rwNote.seen=true;save();render()},
  trainView(el){ui.trainView=el.dataset.v;render()},
  monGo(el){ui.mon=el.dataset.v;render()},
  viewSet(el){S.profile.view=el.dataset.v;save();render()},
  goView(){const f=foldState();f['p-view']=1;lsSet('tempomacher.fold',JSON.stringify(f));ui.tab='me';render();const d=document.querySelector('[data-fold="p-view"]');if(d)d.scrollIntoView({block:'start'});else scrollTo(0,0)},
  kpi(el){const v=el.dataset.v;if(v==='prog'){const e=document.getElementById('progCard');if(e)scrollTo({top:e.getBoundingClientRect().top+scrollY-84,behavior:'smooth'});return}const f=foldState();f[v]=1;lsSet('tempomacher.fold',JSON.stringify(f));const d=document.querySelector(`[data-fold="${v}"]`);if(d){d.open=true;scrollTo({top:d.getBoundingClientRect().top+scrollY-84,behavior:'smooth'})}},
  coachSet(el){S.profile.coach=el.dataset.v;setPrep(false);regenerate();save();render()},
  goMonth(){ui.mon=null;ui.tab='form';render();const m=document.querySelector('.monv');if(m)scrollTo(0,m.getBoundingClientRect().top+scrollY-84);else scrollTo(0,0)},
  tools(el){ui.menu=false;ui.tool=el&&el.dataset.v||ui.tool||'calc';ui.sheet={kind:'tools'};render()},
  toolView(el){ui.tool=el.dataset.v;render()},
  calcSet(el){ui.calc[el.dataset.k]=el.dataset.v;render()},
  calcRun(el){calcRun(el.dataset.v);render()},
  courseAdd(el){ui.courseFor=el.dataset.v;const fi=$('#gpxIn');fi.value='';fi.click()},
  courseDel(el){const r=S.races.find(x=>x.id===el.dataset.v);if(r){delete r.course;save();render()}},
  pbDist(el){ui.sheet={kind:'pbd',k:+el.dataset.v};renderSheet()},
  pbNewDist(el){ui.pbf={id:null,dist:+el.dataset.v,h:'',m:'',s:'',date:today(),name:'',ref:false};ui.pbErr='';ui.sheet={kind:'pb'};renderSheet()},
  pbNew(){ui.pbf={id:null,dist:10,h:'',m:'',s:'',date:today(),name:'',ref:false};ui.pbErr='';ui.sheet={kind:'pb'};renderSheet()},
  pbEdit(el){const p=S.pbs.find(x=>x.id===el.dataset.v);if(!p)return;const r=S.profile.ref;
    ui.pbf={id:p.id,dist:p.dist,h:Math.floor(p.sec/3600)||'',m:Math.floor(p.sec%3600/60),s:Math.round(p.sec%60),date:p.date,name:p.name||'',ref:!!(r&&r.pb===p.id)};ui.pbErr='';ui.sheet={kind:'pb'};renderSheet()},
  pbFromRace(el){const d=el.dataset.d,l=S.logs[d],km=l.s.km,sec=Math.round(l.pace*km);
    ui.pbf={id:null,dist:km,h:Math.floor(sec/3600)||'',m:Math.floor(sec%3600/60),s:sec%60,date:d,name:l.s.title,ref:false};ui.pbErr='';ui.sheet={kind:'pb'};renderSheet()},
  pbSet(el){ui.pbf[el.dataset.k]=+el.dataset.v;renderSheet()},
  pbDelAsk(){ui.pbf.del=true;renderSheet()},
  pbDel(){const id=ui.pbf.id;S.pbs=S.pbs.filter(p=>p.id!==id);if(S.profile.ref&&S.profile.ref.pb===id){S.profile.ref=null;S.adapt.vdotAdj=0;setPrep(false);regenerate()}save();ui.sheet=null;render()},
  pbSave(){const f=ui.pbf,d=pnum(f.dist),sec=hms(f.h,f.m,f.s),err=m=>{ui.pbErr=m;renderSheet()};
    if(!(d>=.4&&d<=100))return err('Bitte eine Distanz zwischen 0.4 und 100 km eingeben.');
    if(!sec||sec/d<120||sec/d>1500)return err('Die Zeit passt nicht zur Distanz. Format: Std : Min : Sek.');
    if(!f.date||f.date>today())return err('Bitte ein Datum bis heute wählen.');
    const p={id:f.id||uid(),dist:d,sec,date:f.date,name:String(f.name).trim()};
    const i=S.pbs.findIndex(x=>x.id===p.id);if(i>=0)S.pbs[i]=p;else S.pbs.push(p);
    const r=S.profile.ref;
    if(f.ref){S.profile.ref={dist:d,sec,pb:p.id};S.adapt.vdotAdj=0;setPrep(false);regenerate()}
    else if(r&&r.pb===p.id){S.profile.ref={dist:d,sec,pb:p.id};setPrep(false);regenerate()}
    save();ui.sheet=null;render()},
  async ics(el){if(!S.plan.weeks.length)return;const{text,n}=buildICS(el.dataset.v);
    const res=await downloadText(`tempomacher-erinnerungen-${today()}.ics`,text,'text/calendar');
    if(res==='ok'){S.reminder={at:today()};save();ui.icsMsg=`${n} Erinnerungen erstellt. Öffne die Datei, um sie in deinen Kalender zu übernehmen.`}
    else if(res==='declined')ui.icsMsg='Download abgebrochen.';
    else ui.icsMsg='Die Datei konnte hier nicht gespeichert werden. Öffne Tempomacher in einem Browser und versuche es dort nochmals.';
    render()},
  askCoach(){askCoach()}
};
function setGoalMode(mode){
  const cur=monday(today());S.plan.mode=mode;
  if(mode==='fit'){S.races=S.races.filter(r=>!(r.virtual&&r.date>=today()));S.plan.mainId=null;S.plan.specStart=null;S.plan.peak=null}
  else{const m=mainRace(S);S.plan.mainId=m?m.id:null}
  S.plan.startMonday=cur;const rk=recentWeeklyKm();if(rk!=null)S.profile.km=Math.round(Math.max(rk,(S.profile.km||0)*.7));
  S.adapt.volFactor=1;S.plan.weeks=[];setPrep(true);regenerate();save();ui.tab='home';
}
function racesChanged(){
  if(!switchMain(S.plan.mainId))setPrep(false);
  regenerate();save();render();
}
async function askCoach(){
  if(!sampleFn||ui.coach.busy)return;
  ui.coach={text:'',busy:true,err:''};render();
  const t=today(),mon=monday(t),race=mainRace(S),c=ctxFor(S);
  const wk=[...Array(7)].map((_,i)=>{const d=addD(mon,i),s=planSession(d),l=S.logs[d],ci=S.checkins[d];
    return{tag:DOWS[i]+' '+d,plan:s?`${s.title}${s.km?' '+s.km+' km':''}`:'Ruhetag',eintrag:l?(l.done?{pace:l.pace?fmtPace(l.pace):null,puls:l.hr,rpe:l.rpe,hm:l.elev!=null?ELEV[l.elev].l:null,effizienz:effAny(l)?+effAny(l).toFixed(1):null}:'ausgelassen'):null,checkin:ci?{schmerz:PAIN[ci.pain],gefuehl:FEEL[ci.feel]}:null}});
  const last=S.adapt.history[S.adapt.history.length-1],w=planWeek(t);
  const data={heute:t,profil:{alter:S.profile.age,geschlecht:S.profile.sex,erfahrung:EXPL[S.profile.exp][0],trainingstage:trainDays(S.profile).map(i=>DOWS[i]).join(", "),langer_lauf:DOWL[longDayOf(S.profile)]},
    vdot:+c.vd.toFixed(1),paces:{locker:`${fmtPace(c.pc.E[0])}-${fmtPace(c.pc.E[1])}`,schwelle:fmtPace(c.pc.T),intervall:fmtPace(c.pc.I)},
    zielrennen:race?{name:race.name,distanz_km:race.dist,datum:race.date,tage_bis:daysBetween(t,race.date),zielzeit:race.goal?fmtTime(race.goal):null}:null,
    phase:w?phaseLabel(w):null,diese_woche:wk,letzte_auswertung:last?{urteil:last.verdict,notizen:last.notes}:null};
  const prompt=`Du bist ein erfahrener, sportwissenschaftlich fundierter Laufcoach. Schreibe eine kurze persönliche Einschätzung zur aktuellen Trainingswoche: Was läuft gut, worauf in den nächsten Tagen achten, und ein konkreter Tipp passend zur Phase (in Phasen «Fitnesserhaltung» stehen Freude und Abwechslung im Vordergrund). Stütze dich nur auf die Daten unten, erfinde nichts. Bei Schmerzmeldungen vorsichtig sein und bei anhaltenden Beschwerden eine ärztliche Abklärung empfehlen. Deutsch in Schweizer Rechtschreibung (ss statt ß), per Du, 4 bis 6 Sätze, ohne Überschrift, ohne Aufzählung, ohne Emojis.\n\nDaten:\n${JSON.stringify(data)}`;
  try{const r=await sampleFn(prompt,{modelTier:'quick',cache:false,onText:({text})=>{ui.coach.text=text;const el=$('#coachOut');if(el){el.hidden=false;el.textContent=text}}});
    ui.coach.text=r.text||ui.coach.text}
  catch(e){const code=e&&e.code;if(code==='not_granted'){sampleFn=null}else ui.coach.err=code==='rate_limited'?'Der Coach ist gerade ausgelastet. Versuch es in ein paar Minuten nochmals.':'Die Einschätzung konnte nicht geladen werden. Versuch es später nochmals.'}
  ui.coach.busy=false;render();
}

