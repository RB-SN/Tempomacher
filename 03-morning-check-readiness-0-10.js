/* ---- morning check & readiness (0–100): sleep, legs, resting heart rate against your own baseline, and fatigue from the last days ---- */
const SLEEPL=()=>[T('Gut','Good'),T('Mittel','So-so'),T('Schlecht','Poor')],LEGSL=()=>[T('Frisch','Fresh'),T('Normal','Normal'),T('Schwer','Heavy')];
function hrvBase(date){const v=Object.keys(S.checkins).filter(d=>d<date&&d>=addD(date,-28)).map(d=>S.checkins[d].hrv).filter(Boolean).sort((a,b)=>a-b);return v.length>=4?v[Math.floor(v.length/2)]:null}
function rhrBase(date){const v=Object.keys(S.checkins).filter(d=>d<date&&d>=addD(date,-28)).map(d=>S.checkins[d].rhr).filter(Boolean).sort((a,b)=>a-b);
  return v.length>=4?v[Math.floor(v.length/2)]:null}
function readiness(ci,date){
  const lin=(x,P)=>{if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const[a,b]=P[i-1],[c2,d2]=P[i];return b+(d2-b)*(x-a)/(c2-a)}return P[P.length-1][1]};
  const parts=[];if(ci.sleep!=null)parts.push(['sl',[100,70,35][ci.sleep],.3]);if(ci.legs!=null)parts.push(['lg',[100,75,35][ci.legs],.3]);
  const base=rhrBase(date);let dr=null;if(ci.rhr&&base){dr=ci.rhr-base;parts.push(['hr',dr<=0?100:lin(dr,[[0,100],[3,75],[5,55],[8,25],[12,10]]),.2])}
  // HRV against your own 28-day median: a drop of more than ~10 % is an early fatigue signal (Plews et al.)
  const hb=hrvBase(date);let dv=null;if(ci.hrv&&hb){dv=(ci.hrv/hb-1)*100;parts.push(['hv',dv>=-3?100:lin(-dv,[[3,100],[8,75],[12,55],[20,25],[30,10]]),.2])}
  const F=fitSeries(),fp=F&&F.pts.find(p=>p.d===addD(date,-1));if(fp&&fp.ctl>5){const r=fp.tsb/fp.ctl;parts.push(['ld',lin(r,[[-.4,30],[-.25,55],[-.1,85],[0,100]]),.2])}
  if(!parts.length)return null;let v=parts.reduce((a,p)=>a+p[1]*p[2],0)/parts.reduce((a,p)=>a+p[2],0);
  if(ci.painLvl!=null){if(ci.painLvl>=7)v=Math.min(v,20);else if(ci.painLvl>=4)v=Math.min(v,55)}else{if(ci.pain===1)v=Math.min(v,55);if(ci.pain===2)v=Math.min(v,20)}
  const low=parts.filter(p=>p[1]<70).sort((a,b)=>a[1]-b[1]).map(p=>({sl:T('wenig Schlaf','little sleep'),lg:T('schwere Beine','heavy legs'),hr:T(`Ruhepuls ${dr>0?'+':''}${dr} über deinem Schnitt`,`resting HR ${dr>0?'+':''}${dr} above your average`),hv:T(`HRV ${Math.round(dv||0)} % unter deinem Schnitt`,`HRV ${Math.round(Math.abs(dv||0))} % below your average`),ld:T('Ermüdung der letzten Tage','fatigue from the last days')}[p[0]]));
  if(ci.painLvl!=null&&ci.painLvl>=1)low.unshift(T(`Beschwerden ${PAREA()[ci.painArea]||''} ${ci.painLvl}/10`,`pain ${PAREA()[ci.painArea]||''} ${ci.painLvl}/10`));else if(ci.pain)low.unshift(ci.pain===2?T('starke Schmerzen','strong pain'):T('leichte Schmerzen','slight pain'));
  return{v:Math.round(v),low,base}}
const readyCol=v=>v>=75?'var(--good)':v>=60?'var(--warn)':'var(--bad)';
const readyLbl=v=>v>=75?T('Bereit','Ready'):v>=60?T('Leicht angeschlagen','Slightly off'):v>=40?T('Müde','Tired'):T('Erholung nötig','Needs recovery');
const readyTxt=v=>v>=75?T('Einheit wie geplant.','Session as planned.'):v>=60?T('Intensive Einheiten leicht reduziert: eine Wiederholung weniger, Tempo am langsamen Ende.','Hard sessions slightly reduced: one rep fewer, pace at the slow end.'):v>=40?T('Heute locker statt intensiv, die Intensität holen wir später.','Easy instead of hard today; the intensity comes later.'):T('Sehr locker 20–30 min oder ganz frei.','Very easy 20–30 min or a day off.');
const feelOf=v=>v>=90?0:v>=75?1:v>=60?2:v>=40?3:4;
const PAREA=()=>[T('Knie','Knee'),T('Achillessehne','Achilles'),T('Wade','Calf'),T('Schienbein','Shin'),T('Fuss / Ferse','Foot / heel'),T('Hüfte / Leiste','Hip / groin'),T('Oberschenkel','Thigh'),T('Rücken','Back'),T('Anderes','Other')];
function ciForm(compact){const c=ui.ci,ok=c.sleep!=null&&c.legs!=null&&c.pain!=null&&(!c.pain||c.painArea!=null&&c.painLvl!=null);
  return`<div class="stack" style="gap:12px;margin-top:12px">
    <div class="field"><span class="flabel">${T('Schlaf','Sleep')}</span><div class="seg">${SLEEPL().map((l,i)=>opt('ci','sleep',i,l,c.sleep)).join('')}</div></div>
    <div class="field"><span class="flabel">${T('Beine','Legs')}</span><div class="seg">${LEGSL().map((l,i)=>opt('ci','legs',i,l,c.legs)).join('')}</div></div>
    <div class="field"><span class="flabel">${T('Beschwerden','Aches or pain')}</span><div class="seg">${opt('ci','pain',0,T('Keine','None'),c.pain)}${opt('ci','pain',1,T('Ja','Yes'),c.pain>0?1:c.pain)}</div></div>
    ${c.pain>0?`<div class="field"><span class="flabel">${T('Wo?','Where?')}</span><div class="chips">${PAREA().map((l,i)=>opt('ci','painArea',i,l,c.painArea,'chip')).join('')}</div></div>
    <div class="field"><span class="flabel">${T('Wie stark? 1 = spürbar, 10 = unerträglich','How strong? 1 = noticeable, 10 = unbearable')}</span><div class="seg pl10">${[1,2,3,4,5,6,7,8,9,10].map(n=>opt('ci','painLvl',n,n,c.painLvl,n>=7?'hi':n>=4?'mid':'')).join('')}</div></div>`:''}
    <div class="grid2"><div class="field"><label for="ciRhr">${T('Ruhepuls (optional)','Resting HR (optional)')}</label><input class="input" id="ciRhr" type="number" inputmode="numeric" placeholder="${T('morgens im Bett','in bed, morning')}" value="${esc(c.rhr||'')}" data-bind="ci.rhr"></div><div class="field"><label for="ciHrv">${T('HRV (optional, ms)','HRV (optional, ms)')}</label><input class="input" id="ciHrv" type="number" inputmode="numeric" placeholder="${T('von der Uhr','from your watch')}" value="${esc(c.hrv||'')}" data-bind="ci.hrv"></div></div>
    ${S.profile.sex==='w'?`<div class="field"><span class="flabel">${T('Zyklus (optional)','Cycle (optional)')}</span><div class="seg">${opt('ci','cyc',0,'–',c.cyc||0)}${opt('ci','cyc',1,T('Periode','Period'),c.cyc)}${opt('ci','cyc',2,T('Tage davor','Days before'),c.cyc)}</div></div>`:''}
    ${heatField()}
    <button class="btn blue" data-act="checkin" ${ok?'':'disabled'}>${T('Fertig','Done')}</button>
    <p class="hint" style="margin:0">${T('Krank, verletzt oder in den Ferien?','Ill, injured or on holiday?')} <button class="link" data-act="pauseAsk">${T('Pause eintragen','Enter a break')}</button></p></div>`}
function ciDone(ci){if(ci.ready==null)return`<div class="spread"><div class="label">Check-in · ${T('Schmerzen','Pain')} ${PAIN[ci.pain].toLowerCase()} · ${T('Gefühl','Feeling')} ${FEEL[ci.feel].toLowerCase()}</div><button class="link" data-act="redoCheckin">${T('Ändern','Change')}</button></div>`;
  return`<div class="ready" style="--rc:${readyCol(ci.ready)}"><span class="rv">${ci.ready}</span><span class="rt"><b>${readyLbl(ci.ready)}</b><span>${readyTxt(ci.ready)}${ci.low&&ci.low.length?' '+T('Grund: ','Because of: ')+ci.low.slice(0,2).join(', ')+'.':''}</span></span><button class="link" data-act="redoCheckin">${T('Ändern','Change')}</button></div>`}
function morningCard(){const t=today();if(t<S.plan.startMonday||S.demo&&false)return'';const ci=S.checkins[t],P=S.pause;if(P&&P.from<=t&&P.to>=t)return'';
  if(ci)return`<div class="card mcheck">${ciDone(ci)}</div>`;
  return`<details class="card cid mcheck" ${ui.ciOpen?'open':''}><summary><span><b>${T('Morgen-Check','Morning check')}</b><span class="hint"> · ${T('10 Sekunden: Wie bereit bist du heute?','10 seconds: how ready are you today?')}</span></span><span class="chev">${CHEV}</span></summary>${ciForm(true)}</details>`}
function adjustCI(c,s,ci){
  const notes=[];if(!s||s.type==='rest')return{s,notes};
  if(s.type==='race'){
    if(ci.pain===2)notes.push('Starke Schmerzen am Renntag: den Start ernsthaft überdenken. Nicht starten ist besser als eine wochenlange Verletzung.');
    else if(ci.pain===1||ci.feel>=3)notes.push('Konservativ starten: die ersten Kilometer 5–10 s/km langsamer als geplant.');
    return{s,notes};
  }
  const pa=ci.painLvl!=null?PAREA()[ci.painArea]||'':'';
  if(ci.cyc===1)notes.push(T('Periode: Bei Krämpfen oder starker Blutung ist ein lockerer Lauf oder Alternativtraining heute völlig in Ordnung. Eisenreich essen; bei anhaltender Müdigkeit den Eisenwert prüfen lassen.','Period: with cramps or heavy bleeding an easy run or cross-training is perfectly fine today. Eat iron-rich food; with lasting fatigue have your iron checked.'));
  if(ci.cyc===2)notes.push(T('Tage vor der Periode: Puls und Körpertemperatur liegen oft etwas höher, bei Wärme mehr trinken. Fühlt sich dieselbe Pace härter an, ist das normal und kein Formverlust.','Days before your period: heart rate and body temperature are often a little higher; drink more in the heat. If the same pace feels harder, that is normal and not lost fitness.'));
  if(ci.painLvl!=null&&ci.painLvl>=7||ci.painLvl==null&&ci.pain===2)return{s:restS(T('Pause wegen Beschwerden','Break because of pain'),s.title),notes:[T(`Starke Beschwerden${pa?' ('+pa+')':''}: heute nicht laufen.`,`Strong pain${pa?' ('+pa+')':''}: no running today.`),T('Wird es nach 2–3 Tagen nicht besser, hinkst du oder ist etwas geschwollen: ärztlich oder physiotherapeutisch abklären lassen.','If it does not improve within 2–3 days, you limp or something is swollen: have it checked by a doctor or physiotherapist.'),...notes]};
  if(ci.painLvl!=null&&ci.painLvl>=4&&s.type!=='alt'){const al=prefersAlt();const tg=o=>({...o,adjusted:true,orig:s.title});
    notes.unshift(T(`Beschwerden ${pa} ${ci.painLvl}/10: heute ohne Intensität${al?'; Alternativtraining schont die Stelle am meisten':', flach und auf weichem Untergrund'}. Abbrechen, wenn es beim Laufen stärker wird oder sich dein Laufbild verändert.`,`Pain ${pa} ${ci.painLvl}/10: no intensity today${al?'; cross-training spares the area most':', flat and on soft ground'}. Stop if it gets worse while running or your stride changes.`));
    return{s:al?tg({...W.alt(c,0),title:T('Alternativtraining locker','Easy cross-training'),dur:40}):tg(W.easy(c,Math.min(s.km,8)*.75)),notes}}
  if(ci.painLvl!=null&&ci.painLvl>=1)notes.push(T(`Leichte Beschwerden (${pa}, ${ci.painLvl}/10): normal trainieren und beobachten. Wird es beim Laufen stärker oder verändert sich dein Laufbild: abbrechen.`,`Slight pain (${pa}, ${ci.painLvl}/10): train as normal and keep an eye on it. If it gets worse while running or your stride changes: stop.`));
  if(s.type==='alt'){if(ci.feel===4)notes.push('Gefühl «schlecht»: heute lieber ganz frei nehmen.');return{s,notes}}
  let f=1,easy=false,rec=false;
  if(ci.painLvl==null&&ci.pain===1){easy=true;f=.75;notes.push('Leichte Schmerzen: Intensität raus, flach und auf weichem Untergrund laufen. Abbrechen, wenn der Schmerz beim Laufen zunimmt oder dein Laufbild sich verändert.')}
  if(ci.feel===2&&s.quality&&!easy){f=Math.min(f,.9);notes.push((ci.ready!=null?T(`Bereitschaft ${ci.ready}`,`Readiness ${ci.ready}`):'Gefühl «ok»')+T(': eine Wiederholung weniger und Tempo am langsameren Ende der Vorgabe.',': one rep fewer and pace at the slower end of the target.'))}
  if(ci.feel===3){easy=true;f=Math.min(f,.8);notes.push((ci.ready!=null?T(`Bereitschaft ${ci.ready}`,`Readiness ${ci.ready}`):'Gefühl «naja»')+T(': heute ohne Intensität. Ein lockerer Lauf bringt mehr als ein erzwungenes Intervalltraining.',': no intensity today. An easy run does more than a forced interval session.'))}
  if(ci.feel===4){rec=true;notes.push((ci.ready!=null?T(`Bereitschaft ${ci.ready}`,`Readiness ${ci.ready}`):'Gefühl «schlecht»')+T(': höchstens 20–30 min sehr locker oder ganz frei. Bei Fieber oder Krankheitsgefühl im ganzen Körper: nicht laufen.',': at most 20–30 min very easy or a day off. With fever or feeling ill all over: do not run.'))}
  if(ci.feel===0&&s.quality&&!easy&&!rec)notes.push((ci.ready!=null?T('Top bereit. ','Fully ready. '):'')+'Du fühlst dich sehr gut. Halte trotzdem die Vorgabe ein: zusätzliches Tempo heute kostet dich morgen Erholung.');
  const tag=o=>({...o,adjusted:true,orig:s.title});
  if(ci.heat&&!rec){notes.push(T('Hitze: nach Puls statt Pace laufen und mit 10–30 s/km langsamer rechnen. Vorher und unterwegs trinken, die kühlste Tageszeit wählen.','Heat: run by heart rate rather than pace and expect 10–30 s/km slower. Drink before and during, choose the coolest time of day.'));
    if(s.quality&&!easy){f=Math.min(f,.9)}if(!easy&&f>=1){return{s:tag({...s,pace:s.pace?s.pace.map(x=>Math.round(x*1.05)):s.pace}),notes}}}
  if(rec)return{s:tag(W.recovery(c,Math.min(4,s.km))),notes};
  if(easy&&s.type!=='easy'&&s.type!=='recovery')return{s:tag(s.type==='long'?W.long(c,s.km*f):W.easy(c,s.km*f)),notes};
  if(easy)return{s:tag(W.easy(c,s.km*f)),notes};
  if(f<1)return{s:tag({...s,km:r05(s.km*f),pace:ci.heat&&s.pace?s.pace.map(x=>Math.round(x*1.05)):s.pace,structure:[...s.structure,'Heute: eine Wiederholung weniger als angegeben']}),notes};
  return{s,notes};
}
// load of the last completed week relative to the 4 weeks before (acute:chronic); same numbers as the Form tab
function loadAcwr(mon){const ws=weeklyStats(),i=ws.findIndex(w=>w.m===mon);if(i<1)return null;const pv=ws[i-1],ch=ws.slice(Math.max(0,i-5),i-1).filter(x=>x.load);if(!pv.load||!ch.length)return null;return pv.load/avg(ch.map(x=>x.load))}
// load guard: rest or cross-training is never fixed in the plan; it comes as a reaction when the load gets too high.
// Signals: fatigue well above fitness (form < −28 % / −40 % of fitness), last week's load ≥ 1.5× the average, two sessions in
// 7 days clearly harder than planned, two low morning checks in a row, pain (diary). Level 1: the next easy run (today to
// +2 days) becomes cross-training or a rest day. Level 2: the next session of any kind does.
// pain diary: the same area at ≥ 4/10 on three days in a row is a red flag (pause and have it checked)
function painGuard(t){const ds=[t,addD(t,-1),addD(t,-2)].map(d=>S.checkins[d]);const c0=ds[0];if(!c0||c0.painLvl==null||c0.painLvl<1)return null;const pa=PAREA()[c0.painArea]||'';
  if(ds.every(x=>x&&x.painLvl>=4&&x.painArea===c0.painArea))return{lvl:3,area:pa,why:T(`Beschwerden ${pa} seit 3 Tagen`,`pain ${pa} for 3 days`)};
  return c0.painLvl>=7?{lvl:3,area:pa,why:T(`starke Beschwerden ${pa}`,`strong pain ${pa}`)}:c0.painLvl>=4?{lvl:2,area:pa,why:T(`Beschwerden ${pa} ${c0.painLvl}/10`,`pain ${pa} ${c0.painLvl}/10`)}:null}
function painFlag(){const g=painGuard(today());if(!g||g.lvl<3)return'';
  return`<div class="banner down"><div class="verdict">${T('Bitte Pause und abklären','Please pause and get it checked')}</div><p style="margin:4px 0 0">${T(`${g.why}: Lauf-Pause, bis die Stelle im Alltag schmerzfrei ist. Ärztlich oder physiotherapeutisch abklären lassen; Alternativtraining nur, wenn es dort nicht wehtut.`,`${g.why}: pause running until the area is pain-free in daily life. Have it checked by a doctor or physiotherapist; cross-training only if it does not hurt there.`)}</p></div>`}
let LGC=null;
function loadGuard(date){const t=today();if(date<t||date>addD(t,2)||!S)return null;
  const key=t+'|'+Object.keys(S.logs).length+'|'+Object.keys(S.checkins).length+'|'+(S.extra||[]).length+'|'+(S.pains||[]).length;
  if(!LGC||LGC.k!==key){LGC={k:key,v:loadGuardCalc(t)}}const g=LGC.v;return g&&g.day===date?g:null}
function loadGuardCalc(t){const sig=[];let lvl=0;const up=(l,s)=>{lvl=Math.max(lvl,l);sig.push(s)};
  const F=fitSeries(),fp=F&&F.pts.find(p=>p.d===addD(t,-1));
  if(fp&&fp.ctl>=10&&F.pts.indexOf(fp)>=14){const r=fp.tsb/fp.ctl;if(r<-.4)up(2,T(`Ermüdung deutlich über deiner Fitness (Form ${sgnR(fp.tsb)})`,`fatigue well above your fitness (form ${sgnR(fp.tsb)})`));else if(r<-.28)up(1,T(`Ermüdung über deiner Fitness (Form ${sgnR(fp.tsb)})`,`fatigue above your fitness (form ${sgnR(fp.tsb)})`))}
  const a=loadAcwr(monday(t));if(a&&a>1.5)up(1,T(`Wochenbelastung ${fk(Math.round(a*10)/10)}× dein Schnitt`,`weekly load ${fk(Math.round(a*10)/10)}× your average`));
  const R=allRuns().filter(l=>l.done&&l.date<=t&&l.date>=addD(t,-7)&&!isAlt(l)).map(l=>{try{return analyze(l)}catch(e){return null}}).filter(x=>x&&x.strain!=null);
  if(R.filter(x=>x.strain>=1).length>=2)up(1,T('zwei Einheiten in 7 Tagen deutlich härter als geplant','two sessions in 7 days clearly harder than planned'));
  const rv=d=>{const ci=S.checkins[d];const r=ci?readiness(ci,d):null;return r?r.v:null},r0=rv(t),r1=rv(addD(t,-1));
  if(r0!=null&&r1!=null&&r0<60&&r1<60)up(1,T('Morgen-Check zwei Tage in Folge tief','morning check low two days in a row'));
  const pg=typeof painGuard==='function'?painGuard(t):null;if(pg&&pg.lvl>=2)up(pg.lvl>=3?2:1,pg.why);
  if(!lvl)return null;
  for(let i=0;i<=2;i++){const d=addD(t,i);if(S.logs[d])continue;const s=planSession(d);if(!s||['rest','race','alt'].includes(s.type)||s.optional)continue;
    if(lvl<2&&(s.quality||['long','test','mptest'].includes(s.type)))continue;return{lvl,sig,day:d}}
  // no easy run in reach: the next hard session becomes easy instead (tests and races stay)
  for(let i=0;i<=2;i++){const d=addD(t,i);if(S.logs[d])continue;const s=planSession(d);if(s&&s.quality&&!['race','test','mptest'].includes(s.type))return{lvl,sig,day:d,soft:true}}
  return{lvl,sig,day:null}}
const prefersAlt=()=>(S.extra||[]).some(x=>isAlt(x)&&x.date>=addD(today(),-90));
const loadBrake=date=>{if(dow(date)>2)return null;const a=loadAcwr(monday(date));return a&&a>1.5?a:null};
function effective(date){
  let s=planSession(date);const notes=[];if(!s)return{s:null,base:null,notes};
  const base=s,c=ctxFor(S),y=S.logs[addD(date,-1)];
  if(date===today()&&s.quality&&!['race','test','mptest'].includes(s.type)&&!S.logs[date]){const a=loadBrake(date);if(a){s={...W.easy(c,s.km*.8),adjusted:true,orig:s.title};notes.push(T(`Deine Belastung ist letzte Woche stark gestiegen (${fk(Math.round(a*10)/10)}× dein Schnitt). Darum heute locker statt «${base.title}»: Das senkt das Verletzungsrisiko. Ab Donnerstag gilt wieder der normale Plan.`,`Your load rose sharply last week (${fk(Math.round(a*10)/10)}× your average). So today is easy instead of «${base.title}»: that lowers the injury risk. From Thursday the normal plan applies again.`))}}
  if(y&&y.done&&s.quality&&s.type!=='race'){const a=analyze(y);if(a.strain>=1.5){s={...W.easy(c,s.km*.85),adjusted:true,orig:s.title};notes.push('Gestern war deutlich härter als geplant. Heute darum locker, die Intensität holen wir später.')}}
  {const g=loadGuard(date);if(g&&g.soft&&!S.logs[date]&&s.quality){s={...W.easy(c,s.km*.8),adjusted:true,orig:base.title};const wd=date===today()?T('heute','today'):T('am '+DOWL[dow(date)],'on '+DOWE[dow(date)]);notes.push(T(`Belastung hoch: ${g.sig.join(', ')}. Darum ${wd} locker statt ${base.title}; die Intensität holen wir später.`,`High load: ${g.sig.join(', ')}. So easy ${wd} instead of ${base.title}; the intensity comes later.`))}
  else if(g&&!g.soft&&!S.logs[date]&&s.type!=='rest'){const al=prefersAlt();
    s=al?{...W.alt(c,0),title:T('Alternativtraining locker','Easy cross-training'),dur:40,adjusted:true,orig:base.title}:{...restS(T('Ruhetag','Rest day'),base.title)};
    notes.push(T(`Belastung hoch: ${g.sig.join(', ')}. Darum ${al?'locker Alternativtraining':'ein Ruhetag'} statt ${base.title}. Die Fitness bleibt, die Ermüdung sinkt; danach geht der Plan normal weiter.`,`High load: ${g.sig.join(', ')}. So ${al?'easy cross-training':'a rest day'} instead of ${base.title}. Fitness stays, fatigue drops; then the plan continues as normal.`))}}
  const ci=S.checkins[date];
  if(ci){const r=adjustCI(c,s,ci);if(r.s!==s&&!r.s.orig)r.s.orig=base.title;s=r.s;notes.push(...r.notes)}
  return{s,base,notes};
}

