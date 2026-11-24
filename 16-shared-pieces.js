/* ---- shared pieces ---- */
const isSpec=w=>w.phase!=='gen'&&w.phase!=='recover';
const specCount=()=>S.plan.weeks.filter(isSpec).length;
const specNo=w=>S.plan.weeks.filter(x=>isSpec(x)&&x.monday<=w.monday).length;
function phaseLabel(w){return w.phase==='gen'?(w.genMode==='hold'||w.genMode==='keep'?'Fitnesserhaltung':'Fitnessaufbau'):PH[w.phase]}
const zonePill=z=>`<span class="pill zp ${z}">${z} ${ZONES[z].n}</span>`;
const noRef=()=>S&&S.profile&&!S.profile.ref&&!S.profile.lab;
const FEELT={easy:'Plaudertempo',long:'Plaudertempo',recovery:'sehr locker',fun:'nach Lust',shakeout:'locker'};
// heart-rate cap: upper limit of the target zone; useful for continuous runs and longer intervals, not for short VO2max reps, hills or fartlek (heart rate lags behind)
const CAPT=new Set(['easy','long','recovery','shakeout','fun','mpace','tempo','cruise','rp']);
const hrCapOf=s=>s&&s.hr&&CAPT.has(s.type)?capFrom(s.hr[1],hrMax(S.profile)):null;
const capPill=s=>{if(!s||!s.hr||['alt','rest','race','test'].includes(s.type))return'';const ez=['easy','long','recovery','shakeout','fun'].includes(s.type);
  const cp=hrCapOf(s);
  return ez?`<span class="pill hrcap" title="${T('Ø Puls bis … · Pulsdeckel (Maximalpuls)','Avg. HR up to … · heart-rate cap (max HR)')}">♥ Ø ≤ ${s.hr[1]}${cp?' · max '+cp:''}</span>`:`<span class="pill hrcap" title="${T('Bereich für den Ø Puls · Pulsdeckel (Maximalpuls)','Range for avg. HR · heart-rate cap (max HR)')}">♥ Ø ${s.hr[0]}–${s.hr[1]}${s.interval?T(' Belastung',' work'):''}${cp?' · max '+cp:''}</span>`};
function capHint(s){const c=hrCapOf(s);if(!c)return'';
  return['easy','long','recovery','shakeout','fun'].includes(s.type)
    ?T(`<b>Ø Puls bis ${s.hr[1]}, Pulsdeckel ${c}</b>: Der Durchschnitt soll im Grundlagenbereich bleiben, und auch kurz (am Berg, am Schluss) soll der Puls nie über ${c} steigen. Sonst Tempo rausnehmen, am Berg auch gehen.`,`<b>Avg. HR up to ${s.hr[1]}, cap ${c}</b>: the average should stay in the base zone, and even briefly (uphill, at the end) heart rate should never exceed ${c}. Otherwise slow down, walk uphill if needed.`)
    :T(`<b>Ø Puls ${s.hr[0]}–${s.hr[1]}, Pulsdeckel ${c}${s.interval?' in den Belastungen':''}</b>: Steigt der Puls über den Deckel, ist das Tempo zu hoch. Zu Beginn hinkt der Puls nach; richte dich anfangs nach der Pace und prüfe den Puls ab der Mitte${s.interval?' jeder Wiederholung':''}.`,`<b>Avg. HR ${s.hr[0]}–${s.hr[1]}, cap ${c}${s.interval?' during the work phases':''}</b>: if heart rate goes above the cap, the pace is too high. Heart rate lags at the start; follow the pace first and check heart rate from the middle${s.interval?' of each repetition':''} on.`)}
function sessionChips(s){
  if(!s||s.type==='rest')return'';
  if(noRef()&&FEELT[s.type])return`<div class="chips">${zonePill(s.zone)}<span class="pill">Nach Gefühl: ${FEELT[s.type]}</span>${capPill(s)}${s.pace?`<span class="pill n" title="Grobe Schätzung">ca. ${fmtPace(s.pace[0])}–${fmtPace(s.pace[1])}</span>`:''}</div>`;
  return`<div class="chips">${s.type==='alt'?'<span class="pill">Freiwillig</span>':zonePill(s.zone)}${s.pace?`<span class="pill n">${fmtPace(s.pace[0])}–${fmtPace(s.pace[1])} /km</span>`:''}${s.type!=='alt'?capPill(s):''}${s.interval?'<span class="pill">Intervall</span>':''}</div>`;
}
// «Why today?»: what the session is for and why it sits on this day of the week
function whyToday(date,s){if(!s||s.type==='rest')return'';const w=planWeek(date),i=dow(date),prev=planSession(addD(date,-1)),next=planSession(addD(date,1)),hard=isHard,ty=s.type,title=s.title||'';
  const P={easy:T('Grundlage: Hier wächst die Ausdauer, und du erholst dich trotzdem für die nächste harte Einheit.','Base: endurance grows here, and you still recover for the next hard session.'),
    recovery:T('Erholung: lockere Bewegung fördert die Durchblutung nach einer harten Einheit.','Recovery: easy movement boosts blood flow after a hard session.'),
    long:/Endbeschleunigung|Renntempo|Marathontempo|fast finish|race pace|marathon pace/i.test(title)?T('Ausdauer für die Renndistanz und Renntempo auf müden Beinen, genau wie im Rennen.','Endurance for the race distance and race pace on tired legs, just like in the race.'):T('Ausdauer für die Renndistanz: Fettstoffwechsel, Muskeln, Sehnen und Kopf gewöhnen sich an die Dauer.','Endurance for the race distance: fat metabolism, muscles, tendons and mind adapt to the duration.'),
    cruise:T('Hebt deine Schwelle: das Tempo, das du lange halten kannst. Der wichtigste Reiz für 10 km bis Marathon.','Raises your threshold: the pace you can hold for long. The key stimulus for 10 km to marathon.'),
    tempo:T('Hebt deine Schwelle: zügig, aber kontrolliert. Du wirst bei gleichem Puls schneller.','Raises your threshold: comfortably hard. You get faster at the same heart rate.'),
    vo2:/Schnelligkeit|Speed/.test(title)?T('Grundschnelligkeit und Laufökonomie: schnell und locker, mit voller Erholung.','Basic speed and running economy: fast and relaxed, with full recovery.'):T('Vergrössert den «Motor» (maximale Sauerstoffaufnahme). Davon profitiert jedes Tempo darunter.','Enlarges your «engine» (maximal oxygen uptake). Every pace below it benefits.'),
    hills:T('Kraft und Laufstil: bergauf kräftigt die Beine, schonender als harte Intervalle im Flachen.','Strength and form: uphill strengthens the legs, gentler than hard intervals on the flat.'),
    fartlek:T('Spielerische Tempowechsel: setzen Reize, ohne dich zu stressen.','Playful pace changes: a stimulus without stress.'),
    rp:T('Renntempo verinnerlichen: Gefühl, Ökonomie und Selbstvertrauen für den Renntag.','Internalising race pace: feel, economy and confidence for race day.'),
    mpace:T('Marathontempo verinnerlichen: dein Körper lernt, dieses Tempo ökonomisch zu laufen.','Internalising marathon pace: your body learns to run it economically.'),
    mptest:T('Prüft, ob dein Zieltempo sitzt: Puls, Gefühl und Decoupling im Renntempo.','Checks whether your goal pace is there: heart rate, feel and decoupling at race pace.'),
    test:T('Misst deine aktuelle Form. Danach passen sich Paces und Pulszonen automatisch an.','Measures your current form. Paces and heart-rate zones then adapt automatically.'),
    race:T('Dein Rennen: Alles im Plan führt hierhin.','Your race: everything in the plan leads here.'),
    alt:T('Ausdauer ohne Laufbelastung: schont Gelenke und Sehnen.','Endurance without running impact: spares joints and tendons.'),
    shakeout:T('Lockert die Beine vor dem Rennen.','Loosens the legs before the race.'),fun:T('Freude am Laufen: ohne Vorgaben, genau das hält dich dran.','Joy of running: no targets, that is what keeps you going.')}[ty]||'';
  const ctx=[];const nm=x=>x&&x.type==='long'?T('der lange Lauf','the long run'):x&&x.type==='race'?T('das Rennen','the race'):x?T('eine harte Einheit','a hard session'):'';
  if(hard(s)&&ty!=='race'){if(!prev||prev.type==='rest')ctx.push(T('Gestern war Ruhetag: Du bist frisch.','Yesterday was a rest day: you are fresh.'));else if(!hard(prev))ctx.push(T('Gestern war locker: Du bist frisch genug.','Yesterday was easy: you are fresh enough.'));
    if(next&&!hard(next))ctx.push(T('Morgen ist locker oder frei, damit du dich erholst.','Tomorrow is easy or off so you recover.'))}
  else if(!hard(s)&&ty!=='alt'){if(next&&hard(next))ctx.push(T(`Morgen kommt ${nm(next)}, darum heute bewusst locker.`,`Tomorrow brings ${nm(next)}, so keep today deliberately easy.`));else if(prev&&hard(prev))ctx.push(T(`Gestern war ${nm(prev)}: Heute holst du dir die Erholung.`,`Yesterday was ${nm(prev)}: today you recover.`))}
  if(w&&w.recovery)ctx.push(T('Entlastungswoche: Jetzt passt sich der Körper an.','Recovery week: this is when your body adapts.'));
  {const c=ctxFor(S);if(c.amb&&c.d>=5&&['cruise','tempo','rp','mptest','vo2'].includes(ty)&&s.type)ctx.push(c.d<=12?T('Für dein ambitioniertes Ziel über '+fk(c.d)+' km zählen Schwelle und VO₂max gleich viel: Das Renntempo liegt knapp darüber. Deshalb mehr Minuten an der Schwelle und im Intervalltempo als in Hobbyplänen.','For your ambitious '+fk(c.d)+' km goal threshold and VO₂max count equally: race pace sits just above them. Hence more minutes at threshold and interval pace than in recreational plans.'):T('Für dein ambitioniertes Ziel ist die Schwelle der Engpass: Am Ende scheitert es selten an der Ausdauer, sondern an der Tempohärte. Deshalb mehr Minuten an der Schwelle als in Hobbyplänen.','For your ambitious goal the threshold is the bottleneck: races are rarely lost on endurance but on speed endurance at the end. Hence more minutes at threshold than in recreational plans.'))}
  if(w&&w.phase==='taper'&&ty!=='race')ctx.push(T('Tapering: Die Fitness bleibt, die Müdigkeit geht.','Taper: fitness stays, fatigue goes.'));
  void i;return P||ctx.length?`<div class="why"><b>${T('Warum heute?','Why today?')}</b> ${P}${ctx.length?' '+ctx.join(' '):''}</div>`:''}
function sessCard(date,s,label){
  const big=!s||s.type==='rest'?'0':s.type==='alt'?(s.dur||45):fk(s.km),unit=s&&s.type==='alt'?'min':'km';
  const zc=s&&s.type!=='rest'?`--zc:var(--${s.zone.toLowerCase()})`:'--zc:var(--z1)';
  if(!s)return`<div class="sess"><div class="sess-top" style="${zc}"><div class="sess-k"><div class="label" style="color:var(--band-muted)">${label} · ${fdate(date)}</div><div class="sess-km">0<small>km</small></div><div class="sess-t">Ruhetag</div></div></div>
    <div class="sess-b"><p class="note" style="margin:0">Erholung ist Training: in den Pausen passt sich der Körper an. Gut schlafen, genug essen, eventuell 10 min Mobilisation.</p></div></div>`;
  return`<div class="sess"><div class="sess-top" style="${zc}">${s.type!=='rest'?trailSVG(5,5,'rgba(255,255,255,.13)','none').replace('class="trail"','class="sessprints"'):''}${s.type==='alt'||s.type==='race'?`<span class="sess-tag">${s.type==='alt'?'Alternativ':'Wettkampf'}</span>`:''}<div class="sess-k"><div class="label" style="color:var(--band-muted)">${label} · ${fdate(date)}</div>
    <div class="sess-km">${big}<small>${unit}</small></div><div class="sess-t">${esc(s.title)}</div></div></div>
    <div class="sess-b">${s.tag?`<div class="tagline" style="margin:0 0 8px">${esc(s.tag)}</div>`:''}${sessionChips(s)}${whyToday(date,s)}
    <ul class="struct">${s.structure.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${capHint(s)?`<p class="caphint">${capHint(s)}</p>`:''}${s.note?`<p class="note">${esc(s.note)}</p>`:''}${addonHTML(s,date)}</div></div>`;
}
function weekLane(mon,title){
  const t=today();
  return`<div><div class="lane-l">${title}</div><div class="lane">${[...Array(7)].map((_,i)=>{const d=addD(mon,i),s=d===t&&!S.logs[d]?effective(d).s:planSession(d),l=S.logs[d];
    const isRace=s&&s.type==='race',zc=s&&s.type!=='rest'?`--zc:var(--${s.type==='race'?'hot':s.type==='alt'?'z1':s.zone.toLowerCase()})`:'';
    const xs=(S.extra||[]).filter(x=>x.date===d&&x.done),xkm=xs.reduce((a,x)=>a+logKm(x),0);
    const kk=l&&l.done||xs.length?'<span class="ok">✓</span>':l?'–':isRace?'⚑':s&&s.type==='alt'?'alt':s&&s.type!=='rest'?fk(s.km):'';
    const zx=!zc&&xs.length?`--zc:var(--${(xs[0].s&&xs[0].s.zone||'Z2').toLowerCase()})`:zc;
    return`<button class="dchip ${d===t?'today':''} ${d<t?'past':''}${s&&s.optional&&!(l&&l.done)?' optl':''}${xs.length&&!(s&&s.type!=='rest')?' xtra':''}" style="${zx}" title="${xs.length?esc(xs.map(x=>(x.type?RTL[x.type]:x.s.title)+' '+fk(logKm(x))+' km').join(', ')):''}" data-act="openDay" data-d="${d}" aria-label="${fdate(d)}${s?': '+esc(s.title):': Ruhetag'}${xs.length?' · '+T('zusätzlich','extra')+' '+fk(Math.round(xkm*10)/10)+' km':''}">
      <span class="dn">${DOWS[i]}</span><span class="dd">${pd(d).getDate()}</span><span class="kk">${kk}</span></button>`}).join('')}</div></div>`;
}
function dayRow(d,s){
  const l=S.logs[d],t=today();
  const z=s.type==='rest'?'':`<span class="zbar" style="background:var(--${s.type==='race'?'hot':s.type==='alt'?'z1':s.zone.toLowerCase()})"></span>`;
  return`<button class="li ${d===t?'isToday':''}${s.optional&&!l?' optl':''}" data-act="openDay" data-d="${d}"><span class="dt">${DOWS[dow(d)]}<b>${pd(d).getDate()}</b></span>
    <span class="t">${z}${esc(s.title)}<small>${s.tag?esc(s.tag)+' · ':''}${s.type==='rest'?'':s.type==='alt'?'Alternativ, freiwillig':ZONES[s.zone].n}${l?(l.done?' · erledigt ✓':' · nicht durchgeführt'):''}</small></span>
    <span class="k">${s.type==='rest'?'':s.type==='alt'?(s.dur||45)+"'":fk(s.km)+' km'}</span></button>`;
}
function rwBanner(){const n=S.adapt.rwNote;if(!n||n.seen)return'';return`<div class="banner up"><div class="spread"><div class="verdict">Lauf-Geh-Training</div><button class="link" data-act="dismissRw">OK</button></div><p style="margin:6px 0 0;font-size:14.5px">${esc(n.text)}</p></div>`}
function adaptBanner(){
  const h=S.adapt.history[S.adapt.history.length-1];if(!h||h.seen)return'';
  const t={up:'Plan wird ambitionierter',down:'Plan wird zurückgenommen',hold:'Plan bleibt auf Kurs'}[h.verdict];
  return`<div class="banner ${h.verdict}"><div class="spread"><div class="verdict">${h.safety?'Zwischen-Check':'Auswertung der letzten 2 Wochen'} · ${t}</div><button class="link" data-act="dismissAdapt">OK</button></div>
    <ul class="notes">${h.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`;
}
const PEN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3"/></svg>';
const TRASH='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/></svg>';
// small trash button top right; a second tap confirms inside the card (no browser dialog)
function trashBtn(key){return`<button class="trash" data-act="trashAsk" data-v="${key}" aria-label="Eintrag löschen" title="Eintrag löschen">${TRASH}</button>`}
function trashConfirm(key){return ui.trash===key?`<div class="adj row" style="justify-content:space-between;gap:8px"><b>Diesen Eintrag löschen?</b><span class="row" style="gap:6px"><button class="btn small ghost" data-act="trashCancel">Abbrechen</button><button class="btn small danger" data-act="trashDo" data-v="${key}">Löschen</button></span></div>`:''}
function logCard(d,l,extraId){
  const a=analyze(l),key=extraId?'x:'+extraId:'d:'+d;
  if(!l.done&&l.reason==='alt'){const x=(S.extra||[]).find(e=>e.id===l.altId);return`<div class="card stack" style="gap:8px"><div class="spread"><h3>${T('Durch Alternativtraining ersetzt','Replaced by cross-training')}</h3>${trashBtn(key)}</div><p class="muted" style="margin:0">${x?T(`Statt «${esc(l.s.title)}»: ${esc(altTitle(x))}, ${x.dur} min. Die Bewertung steht beim Alternativtraining.`,`Instead of «${esc(l.s.title)}»: ${esc(altTitle(x))}, ${x.dur} min. The rating is shown with the cross-training.`):''}</p>${x?`<button class="link" style="align-self:flex-start" data-act="openXView" data-v="${x.id}">${T('Alternativtraining ansehen ›','View cross-training ›')}</button>`:''}${trashConfirm(key)}</div>`}
  if(!l.done)return`<div class="card stack" style="gap:8px"><div class="spread"><h3>Nicht durchgeführt${l.reason?' · '+SKIP[l.reason]:''}</h3>${trashBtn(key)}</div><p class="muted" style="margin:0">Kein Problem. Einzelne verpasste Läufe nicht nachholen, einfach mit dem Plan weitermachen.</p>${trashConfirm(key)}</div>`;
  const col=a.tone==='up'?'var(--good)':a.tone==='down'?'var(--warn)':'var(--blue)';
  return`<div class="card stack" style="gap:10px;border-left:6px solid ${col}"><div class="spread"><div class="verdict">${a.verdict}</div><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="trash pen" data-act="editEntry" data-v="${key}" aria-label="Training bearbeiten" title="Bearbeiten">${PEN}</button>${trashBtn(key)}</span></div>
    ${trashConfirm(key)}
    <div class="chips">${isAlt(l)?(()=>{const e=altEq(l);return`<span class="pill">${esc(altTitle(l))}</span>${l.dur?`<span class="pill n">⏱ ${fmtTime(l.dur*60)}</span>`:''}${altMetrics(l).map(m=>`<span class="pill n">${esc(m)}</span>`).join('')}${l.hr?`<span class="pill n">♥ ${l.hr}</span>`:''}<span class="pill n" style="background:var(--soft);color:var(--blue)">≈ ${e.eqMin} min ${T('Lauf','run')} · ${fk(e.eqKm)} km</span>`})():''}${l.type?`<span class="pill">${RTL[l.type]}</span>`:''}${l.km?`<span class="pill n">${fk(l.km)} km</span>`:''}${logSec(l)?`<span class="pill n">⏱ ${fmtTime(logSec(l))}</span>`:''}${logWork(l)?`<span class="pill n">Belastung ${fmtTime(logWork(l))}</span>`:''}${l.reps?`<span class="pill n">${l.reps} Belastungen</span>`:''}${partsPills(l)}${l.dec!=null?`<span class="pill n">Decoupling ${fk(l.dec)} %</span>`:''}${l.src&&l.src!=='manual'?`<span class="pill">${l.src.toUpperCase()}</span>`:''}${l.pace?`<span class="pill n">${l.interval?'Belastung ':''}${pace(l.pace)}</span>`:''}${l.hr?`<span class="pill n">♥ ${l.hr}</span>`:''}${l.elev!=null&&!l.interval?`<span class="pill n">↗ ${ELEV[l.elev].l} hm</span>`:''}<span class="pill n">RPE ${l.rpe}/10</span></div>
    ${(()=>{const fb=fbFull(l,extraId?l.date:d);return fb?fbHTML(fb)+`<details class="help"><summary>${T('Weitere Hinweise','More notes')}</summary><ul class="notes" style="margin:8px 0 0">${a.msgs.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></details>`:`<ul class="notes" style="margin:0">${a.msgs.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`})()}${l.s.type==='race'&&l.pace&&!extraId?`<button class="btn small blue" style="align-self:flex-start" data-act="pbFromRace" data-d="${d}">Als Bestleistung speichern</button>`:''}</div>`;
}

