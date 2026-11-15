/* ---- goals without a race: personal goal (distance / time / pace) or simply building and keeping running fitness ----
   Fitness: weekly running time oriented at the WHO recommendation (150–300 min moderate activity per week) and the chosen
   time budget; build-up by at most 6–8 % per week with a lighter week every 3rd/4th week; then maintenance: endurance is kept
   with somewhat less volume as long as intensity and frequency stay (Hickson et al.; Bosquet et al. 2013): 3-week cycles,
   one intense session per week, every 8 weeks a form check. 80 % of the running stays easy. */
const FITMIN=[[90,'ca. 1.5 h','3 × 30 min'],[150,'ca. 2.5 h','3 × 50 min'],[210,'ca. 3.5 h','4 × 50 min'],[300,'ca. 5 h','5 × 60 min']];
const fitMinDef=exp=>[120,150,210,300][exp]||150;
function fitInfo(p,hab){if(hab==null)hab=S&&p===S.profile?habKm(S).km:p.km;
  const vd=baseVdot(p),ep=paceAtPct(vd,.66),days=Math.max(2,trainDays(p).length||3);
  const want=p.fitMin||fitMinDef(p.exp),cap=days*[40,50,60,75][p.exp],min=Math.min(want,cap);
  let km=Math.max(8,Math.round(min*60/ep));const cur=Math.max(hab||0,p.exp===0?5:8),capKm=Math.round(cap*60/ep);
  // already running more than the chosen time budget: keep at least 80 % of it, otherwise fitness drops
  // already running more than the time budget: keep the maintenance share of it (coach style, age), otherwise fitness drops
  const MI=maintInfo(p,cur,null,days,ep),floored=MI.km>km;if(floored)km=Math.round(MI.km);
  const g=p.exp===0||p.age>=50?1.06:1.08,cyc=p.exp===0||p.age>=50?3:4;
  const n=cur>=km*.97?0:Math.ceil(Math.log(km/cur)/Math.log(g)),weeks=n?n+Math.floor(n/(cyc-1)):0;
  return{min:floored?Math.round(km*ep/60):min,want,km,cur,weeks,g,cyc,capped:cap<want,floored}}
function fitFreq(p){const rec=p.exp>=2?4:3;return{min:2,rec,amb:0,why:[]}}
function fitFreqText(fr,days){
  const base=T(`Empfehlung für dich: <b>${fr.rec} Läufe pro Woche</b> (mindestens ${fr.min}). Regelmässigkeit bringt mehr als einzelne lange Einheiten.`,`Recommendation for you: <b>${fr.rec} runs per week</b> (at least ${fr.min}). Regularity beats occasional long sessions.`);
  if(days<fr.min)return{ok:false,t:T('<b>Mit nur 1 Training pro Woche lässt sich die Ausdauer kaum aufbauen.</b> Wähle mindestens 2 Tage.','<b>With only 1 session per week, endurance can hardly be built.</b> Choose at least 2 days.')};
  return{ok:true,warn:days<fr.rec,t:base+(days<fr.rec?T(` Mit ${days} Tagen geht es auch, der Aufbau dauert etwas länger.`,` ${days} days work too; the build-up takes a little longer.`):'')}}
// personal goal: target time from time or pace input
function goalSec(o){const d=o.gDist==='x'?pnum(o.gCustom):+o.gDist;if(!d)return null;
  if(o.gType==='time'){const g=hms(o.gh,o.gm,o.gs);return g||null}
  if(o.gType==='pace'){const pp=parsePace(o.gp);return pp&&!Number.isNaN(pp)?Math.round(pp*d):null}
  return null}
function goalName(d,g){return g?T(`Ziel: ${fk(d)} km in ${fmtTime(g)}`,`Goal: ${fk(d)} km in ${fmtTime(g)}`):T(`Ziel: ${fk(d)} km am Stück`,`Goal: ${fk(d)} km non-stop`)}
// date of the goal test: chosen date, or the recommended preparation length (on the long-run day)
function goalDate(p,d,g,date){if(date&&date>today())return date;
  const pi=prepInfo(p,{dist:d,goal:g},baseVdot(p)),cur=monday(today()),start=dow(today())>=4?addD(cur,7):cur;
  return addD(start,7*(pi.weeks-1)+longDayOf(p))}
// habitual volume: average of the last up to 8 completed weeks you logged (recovery, taper and post-race weeks left out), blended with the profile value.
// More volume counts after a few weeks, less volume only gradually and partly: a run you forgot to log should not shrink the plan.
function habKm(st){const p=st.profile,pk=p.km||0,cur=monday(today());
  const runs=[...Object.entries(st.logs||{}).map(([d,l])=>({...l,date:d})),...(st.extra||[])].filter(l=>l.done).sort((a,b)=>a.date<b.date?-1:1);if(!runs.length)return{km:pk,n:0,avg:null,pk};
  const ts=monday(trackStart(runs)),ks=[];
  for(let m=addD(cur,-7);m>=ts&&ks.length<8;m=addD(m,-7)){const w=((st.plan&&st.plan.weeks)||[]).find(x=>x.monday===m);if(w&&(w.recovery||w.phase==='taper'||w.phase==='recover'))continue;
    ks.push(runs.filter(l=>monday(l.date)===m).reduce((a,l)=>a+logKm(l),0))}
  const n=ks.length;if(n<3)return{km:pk,n,avg:n?Math.round(avg(ks)):null,pk};const L=avg(ks);
  const km=L>=pk?pk+(L-pk)*Math.min(1,n/6):pk+(L-pk)*Math.min(1,n/8)*.75;return{km:Math.round(km),n,avg:Math.round(L),pk}}
// maintenance: a share of your habitual volume (Mujika & Padilla: with intensity kept, fitness holds on clearly less volume; over months the aerobic base needs about 60–75 %).
// Coach style and goal set the share, small volumes are kept almost fully, never above what you run, never beyond what your days allow. After a race or peak first a lighter transition.
function maintInfo(p,hab,d,days,ep){const st=p.coach||'bal',lift=f=>f+(1-f)*clamp((30-hab)/20,0,1);
  const f0={safe:.6,bal:.7,hard:.75}[st]+(d>25?.05:d&&d<=5?-.05:0)-(p.age>=50?.05:0),f=lift(f0),ft=lift(Math.max(.45,f0-.15));
  const cap=Math.round(days*[40,50,60,75][p.exp||0]*60/ep),mn=(p.exp||0)===0?8:12;
  return{km:Math.max(mn,Math.min(hab*f,cap)),trans:Math.max(mn,Math.min(hab*ft,cap)),f,ft,cap,limited:hab*f>cap}}
// light weeks after a race including the recovery weeks: marathon 3, half 2, shorter races only the recovery week
const transWeeks=d=>d>25?3:d>11?2:d?1:0;
function buildFitPlan(st,from,keepOnly,after){
  const H=habKm(st),p={...st.profile,km:H.km},c=ctxFor(st),cur=monday(today()),fi=fitInfo(p,H.km),end=addD(cur,7*12),weeks=[];
  const gd=after?after.d:(curGoal()||{}).dist||null,days=Math.max(2,trainDays(p).length||3),MI=maintInfo(p,H.km,gd,days,mid2(c.pc.E));
  const keepKm=Math.max(MI.km,Math.min(fi.km,H.km>=20?H.km*.85:fi.km));let tl=after?Math.max(0,transWeeks(after.d)-Math.max(0,daysBetween(after.raceMon,from)/7-1)):0;
  c.curIdx=Math.max(0,daysBetween(st.plan.startMonday,cur)/7);
  let km=keepOnly?fi.km:fi.cur,reached=keepOnly||km>=fi.km*.97,i=0,kj=0;
  for(let mon=from;mon<=end;mon=addD(mon,7),i++){
    const idx=Math.round(daysBetween(st.plan.startMonday,mon)/7);let wk,mode,rec=false;
    if(!reached){if(i>0)km=Math.min(fi.km,km*fi.g);rec=i>0&&(i+1)%fi.cyc===0;wk=rec?km*.8:km;if(km>=fi.km*.97)reached=true;mode='build'}
    else{mode='keep';let tr=false;if(tl>0){tl--;tr=true;wk=Math.min(keepKm,MI.trans)}else{rec=kj%4===3;wk=keepKm*(rec?.75:1);kj++}c.trans=tr}
    if(mon>=cur)wk*=st.adapt.volFactor;
    const wo={monday:mon,phase:'gen',genMode:mode,recovery:rec,trans:!!c.trans,days:makeGenWeek(c,idx,mode==='keep'?kj:i,rec,wk,mode)};c.trans=false;
    if(mode==='keep')wo.why=maintWhy(wo,H,MI,p,gd,keepKm);weeks.push(wo);
  }
  // test runs: without a reference time after 4–6 weeks; during maintenance a form check every 8 weeks
  const pat=trainDays(p),ld=longDayOf(p),cand=qualityDays(pat,ld,1).concat(pat.filter(x=>x!==ld));
  const putTest=w=>{const di=cand.find(x=>w.days[x]&&w.days[x].type!=='race');if(di!=null)w.days[di]=W.test(c,p.exp===0||rwAt(c,Math.round(daysBetween(st.plan.startMonday,w.monday)/7))!=null?3:5)};
  if(!p.ref&&!p.lab&&!keepOnly){const tw=weeks.find((w,k)=>k>=(p.exp===0?5:3)&&w.monday>=cur&&!w.recovery);if(tw)putTest(tw)}
  let kc=0;weeks.forEach(w=>{if(w.genMode==='keep'&&!w.recovery){kc++;if(kc%8===4&&w.monday>=cur)putTest(w)}});addStrength(weeks,p);
  weeks.forEach(w=>w.km=r05(w.days.reduce((a,s)=>a+(s&&s.type!=='rest'&&s.type!=='race'&&!s.optional?s.km:0),0)));
  return weeks;
}
function maintWhy(w,H,MI,p,gd,keepKm){const base=H.n>=3?T(`deines Schnitts von ${H.avg} km (letzte ${H.n} Wochen)`,`of your average of ${H.avg} km (last ${H.n} weeks)`):T(`deiner ${H.pk} km pro Woche aus dem Profil`,`of your ${H.pk} km per week from your profile`);
  const sty={safe:T('vorsichtig','careful'),bal:T('ausgewogen','balanced'),hard:T('fordernd','demanding')}[p.coach||'bal'],dn=gd?(gd>40?'Marathon':gd>20?T('Halbmarathon','half marathon'):fk(gd)+' km'):'',goal=gd?T(` und deiner Zieldistanz ${dn}`,` and your goal distance ${dn}`):'';
  if(w.trans)return T(`<b>Übergang:</b> rund ${Math.round(MI.trans)} km, etwa ${Math.round(MI.ft*100)} % ${base}. Nach der Spitzenphase erholen sich Sehnen, Muskeln und Kopf. Tempo nur spielerisch, der lange Lauf bleibt. Danach geht es auf den Erhaltungsumfang (${Math.round(keepKm)} km).`,`<b>Transition:</b> about ${Math.round(MI.trans)} km, roughly ${Math.round(MI.ft*100)} % ${base}. After the peak phase tendons, muscles and mind recover. Speed only playful, the long run stays. Then volume moves to maintenance (${Math.round(keepKm)} km).`);
  return T(`<b>Erhaltung:</b> rund ${Math.round(keepKm)} km, etwa ${Math.round(Math.min(1,keepKm/Math.max(1,H.km))*100)} % ${base}, passend zu Coach-Stil «${sty}»${goal}${MI.limited?', begrenzt durch deine Trainingstage':''}. Bewusst weniger als in der Spitzenphase, damit du erholt in die nächste Vorbereitung startest. Was die Form hält: der lange Lauf (Grundlage), ein Tempo-Reiz pro Woche (Fahrtspiel, Hügel oder Schwelle im Wechsel), Steigerungen und Kraft. Jede 4. Woche ist leichter.`,`<b>Maintenance:</b> about ${Math.round(keepKm)} km, roughly ${Math.round(Math.min(1,keepKm/Math.max(1,H.km))*100)} % ${base}, matching coach style «${sty}»${goal}${MI.limited?', limited by your training days':''}. Deliberately less than in the peak phase so you start the next preparation fresh. What holds your form: the long run (base), one speed stimulus per week (fartlek, hills or threshold in turn), strides and strength. Every 4th week is lighter.`)}
const isFit=()=>S&&S.plan&&(S.plan.mode==='fit'||!mainRace(S));
const curGoal=()=>(S.races||[]).find(r=>r.virtual&&r.date>=today())||null;
function heroFit(){
  const t=today(),fi=fitInfo(S.profile),w=planWeek(t)||S.plan.weeks.find(x=>x.monday>=monday(t));
  const wk=w?w.km:0,keep=w&&w.genMode==='keep',done=clamp(wk/fi.km,0,1);
  const reach=S.plan.weeks.find(x=>x.genMode==='keep');
  return`<div class="hero">${TRACK}<div class="hero-grid"><div class="big">${fk(Math.round(wk))}</div><div><div class="lbl">${T('km diese Woche','km this week')}</div><div class="race">${keep?T('Fitness erhalten','Keeping fitness'):T('Fitness aufbauen','Building fitness')}</div>
    <div class="sub">${T('Ziel-Umfang','Target volume')} ${fi.km} km ${T('pro Woche','per week')} (≈ ${fi.min} min)${keep?' · '+T('erreicht ✓','reached ✓'):reach?' · '+T('ab','from')+' '+fdate(reach.monday):''}</div></div></div>
    <div class="progtrail">${trailSVG(10,Math.max(1,Math.round(done*10)),'var(--hot)','rgba(255,255,255,.22)')}${FLAG}</div><div class="prog-l"><span>${w?(w.recovery?T('Leichtere Woche','Lighter week'):keep?T('Erhalt','Maintenance'):T('Aufbau','Build-up')):''}</span><span>${fi.km} km</span></div>
    <details class="herodet"><summary>${T('So funktioniert dein Plan','How your plan works')}</summary><p>${keep
      ?T('Deine Ausdauer bleibt erhalten, solange du regelmässig läufst und eine intensive Einheit pro Woche dabei ist; der Umfang darf etwas schwanken. Jede dritte Woche ist leichter. Alle 8 Wochen zeigt ein Formcheck, wo du stehst.','Your endurance is kept as long as you run regularly with one intense session per week; volume may vary a little. Every third week is lighter. Every 8 weeks a form check shows where you stand.')
      :T(`Der Umfang steigt pro Woche um höchstens ${Math.round((fi.g-1)*100)} %, jede ${fi.cyc}. Woche ist leichter. Rund 80 % läufst du locker im Plaudertempo, dazu kurze, spielerische Tempowechsel. Danach geht der Plan in den Erhalt über.`,`Volume rises by at most ${Math.round((fi.g-1)*100)} % per week, every ${fi.cyc}th week is lighter. About 80 % is easy running at chatting pace, plus short, playful pace changes. Then the plan moves into maintenance.`)}</p></details>
    <div class="row" style="margin-top:12px"><button class="btn small" style="background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.35)" data-act="goalOpen">${T('Ziel setzen oder ändern','Set or change a goal')}</button></div></div>`;
}
// goal form, shared by the setup and the profile
function goalFormHTML(o,root){
  const A=root==='ob'?'ob':'gfSet',B=k=>`data-bind="${root}.${k}"`,d=o.gDist==='x'?pnum(o.gCustom):+o.gDist;
  const modes=`<div class="seg">${[['race',T('Ein Rennen','A race'),T('Mit Datum und Distanz','With date and distance')],['goal',T('Persönliches Ziel','Personal goal'),T('Zeit, Pace oder Distanz, ohne Rennen','Time, pace or distance, no race')],['fit',T('Fit werden & bleiben','Get & stay fit'),T('Ausdauer aufbauen und halten','Build and keep endurance')]].map(([v,a,b])=>opt(A,'goalMode',v,`<b>${a}</b><small>${b}</small>`,o.goalMode,'tall')).join('')}</div>`;
  if(o.goalMode==='goal'){
    const g=goalSec(o);
    return modes+`<div class="field"><span class="flabel">${T('Distanz','Distance')}</span><div class="seg">${[[3,'3 km'],[5,'5 km'],[10,'10 km'],[21.1,T('Halbmarathon','Half marathon')],[42.2,'Marathon'],['x',T('Andere','Other')]].map(([v,l])=>opt(A,'gDist',v,l,o.gDist)).join('')}</div>
      ${o.gDist==='x'?`<input class="input" style="margin-top:8px" inputmode="decimal" placeholder="${T('Distanz in km, z. B. 8','Distance in km, e.g. 8')}" value="${esc(o.gCustom)}" ${B('gCustom')} data-rerender="1">`:''}</div>
      <div class="field"><span class="flabel">${T('Was willst du erreichen?','What do you want to achieve?')}</span><div class="seg">${opt(A,'gType','finish',T('Am Stück schaffen','Run it non-stop'),o.gType)}${opt(A,'gType','time',T('Zielzeit','Target time'),o.gType)}${opt(A,'gType','pace',T('Zielpace','Target pace'),o.gType)}</div></div>
      ${o.gType==='time'?`<div class="field"><span class="flabel">${T('Zielzeit','Target time')}</span><div class="tin"><input class="input" inputmode="numeric" placeholder="${T('Std','h')}" value="${esc(o.gh)}" ${B('gh')} aria-label="${T('Stunden','Hours')}">:<input class="input" inputmode="numeric" placeholder="min" value="${esc(o.gm)}" ${B('gm')} aria-label="${T('Minuten','Minutes')}">:<input class="input" inputmode="numeric" placeholder="${T('Sek','sec')}" value="${esc(o.gs)}" ${B('gs')} aria-label="${T('Sekunden','Seconds')}"></div></div>`:''}
      ${o.gType==='pace'?`<div class="field"><label>${T('Zielpace (min:sek pro km)','Target pace (min:sec per km)')}</label><input class="input" inputmode="numeric" placeholder="${T('z. B. 5:30','e.g. 5:30')}" value="${esc(o.gp)}" ${B('gp')}></div>`:''}
      <div class="field"><label>${T('Bis wann? (optional)','By when? (optional)')}</label><input class="input" type="date" min="${addD(today(),14)}" value="${esc(o.gDate)}" ${B('gDate')} data-rerender="1"><span class="hint">${T('Ohne Datum schlägt Tempomacher eine passende Vorbereitungszeit vor. Am Ende steht ein Zieltest über die Distanz.','Without a date, Pacemaker suggests a suitable preparation time. At the end there is a goal test over the distance.')}</span></div>
      ${d?`<div class="live">${esc(goalName(d,g))}</div>`:''}`;
  }
  if(o.goalMode==='fit'){
    return modes+`<div class="field"><span class="flabel">${T('Wie viel Zeit pro Woche möchtest du laufen?','How much time per week do you want to run?')}</span><div class="seg">${FITMIN.map(([m,a,b])=>opt(A,'fitMin',m,`<b>${T(a,a.replace('ca.','approx.'))}</b><small>${b}</small>`,o.fitMin,'tall')).join('')}</div>
      <span class="hint">${T('Die WHO empfiehlt 150–300 Minuten moderate Bewegung pro Woche. Der Plan baut schrittweise dorthin auf und hält das Niveau danach.','The WHO recommends 150–300 minutes of moderate activity per week. The plan builds up step by step and then keeps the level.')}</span></div>
      <div class="impbox"><div class="label">${T('So läuft dein Plan','How your plan works')}</div><span>${T('Aufbau: höchstens 6–8 % mehr pro Woche, jede 3. oder 4. Woche leichter, rund 80 % locker. Danach Erhalt: etwas weniger Umfang, aber eine intensive Einheit pro Woche, damit die Form bleibt. Alle 8 Wochen ein Formcheck.','Build-up: at most 6–8 % more per week, every 3rd or 4th week lighter, about 80 % easy. Then maintenance: a little less volume but one intense session per week to keep your form. A form check every 8 weeks.')}</span></div>`;
  }
  return modes;
}
