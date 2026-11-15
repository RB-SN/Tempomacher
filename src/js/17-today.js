/* ---- today ---- */
// "am I on track?": goal versus today's prediction; the longer until race day, the more improvement is still realistic
function courseOf(r){if(!r||!r.goal||!showPred(r.dist)||r.date<today())return null;const pr=predict(ctxFor(S).vd,r.dist),q=pr/r.goal-1,wk=Math.max(0,daysBetween(today(),r.date)/7),room=Math.min(.06,.01+wk*.0025);
  const st=q<=0?'ok':q<=room?'near':'far';
  return{st,pr,goal:r.goal,gap:Math.round(pr-r.goal),txt:st==='ok'?T('auf Kurs ✓','on track ✓'):st==='near'?T('in Reichweite','within reach'):T('ambitioniert','ambitious'),
    note:st==='ok'?T('Deine aktuelle Form reicht schon für das Ziel. Jetzt geht es ums Bestätigen und gesund ankommen.','Your current form already meets the goal. Now it is about confirming it and arriving healthy.'):st==='near'?T(`Noch ${fmtTime(Math.abs(pr-r.goal))} schneller nötig. Mit konsequentem Training bis zum Renntag realistisch.`,`Still ${fmtTime(Math.abs(pr-r.goal))} faster needed. Realistic with consistent training until race day.`):T(`Noch ${fmtTime(Math.abs(pr-r.goal))} schneller nötig. Bis zum Renntag sind realistisch etwa ${fmtTime(goalReal(pr,r.goal,wk).best)} möglich. Der Renntag-Plan startet darum mit einem realistischen Tempo; die Renntempo-Tests zeigen, ob mehr drin ist.`,`Still ${fmtTime(Math.abs(pr-r.goal))} faster needed. That is a lot for the remaining time; a slightly lower goal may make sense. The reviews show whether the gap closes.`)}}
function courseChip(r,dark){const k=courseOf(r);if(!k)return'';return`<div class="course ${k.st}${dark?' dk':''}"><span>${T('Ziel','Goal')} <b>${fmtTime(k.goal)}</b></span><span>${T('Prognose','Prediction')} <b>${fmtTime(k.pr)}</b></span><em>${k.txt}</em></div>`}
function heroHTML(){
  const t=today(),race=mainRace(S),c=ctxFor(S);
  if(S.plan.mode==='fit'||(race&&race.date<t&&S.plan.weeks.some(w=>w.genMode==='keep'&&w.monday<=t)&&!(S.races||[]).some(r=>r.date>=t&&prioOf(r)==='A')))return(race&&race.date<t&&daysBetween(race.date,t)<=21&&S.plan.mode!=='fit'?goalDoneHTML(race):'')+heroFit();
  if(!race)return`<div class="card"><h3>Kein Hauptrennen geplant</h3><p class="muted" style="margin:6px 0 12px">Trag ein Rennen ein und wähle «Eigener Vorbereitungsplan».</p><button class="btn primary" data-act="tab" data-v="races">Rennen eintragen</button></div>`;
  const dd=daysBetween(t,race.date),w=planWeek(t);
  if(dd<0&&race.virtual)return goalDoneHTML(race);
  if(dd<0)return`<div class="hero"><div class="race">${esc(race.name)} ist vorbei</div><div class="sub" style="margin:6px 0 12px">Jetzt zählt die Erholung. Bereit für das nächste Ziel?</div><button class="btn primary small" data-act="tab" data-v="races">Nächstes Rennen eintragen</button></div>`;
  const total=S.plan.weeks.length?daysBetween(S.plan.startMonday,race.date):1,done=clamp(daysBetween(S.plan.startMonday,t)/Math.max(1,total),0,1);
  const phase=w?(isSpec(w)?`Woche ${specNo(w)}/${specCount()} · ${PH[w.phase]}${w.recovery?' (Entlastung)':''}`:phaseLabel(w)+(w.recovery?' (Entlastung)':'')):'';
  return`<div class="hero">${TRACK}<div class="hero-grid"><div class="big">${dd}</div><div><div class="lbl">${dd===1?T('Tag bis','Day until'):T('Tage bis','Days until')}${race.virtual?T(' zum Zieltest',' the goal test'):''}</div><div class="race">${esc(race.name)}</div>
    <div class="sub">${fk(race.dist)} km · ${fdate(race.date)}${showPred(race.dist)&&!race.goal?` · Prognose ${fmtTime(predict(c.vd,race.dist))}`:''}</div></div></div>${courseChip(race,true)}
    <div class="progtrail">${trailSVG(10,Math.max(1,Math.round(done*10)),'var(--hot)','rgba(255,255,255,.22)')}${FLAG}</div><div class="prog-l"><span>${phase}</span><span>Ziel</span></div>${heroNote()}${heroLinks(race)}</div>`;
}
// race-day plan close to the race; the next other race in one line
function heroLinks(main){const t=today(),up=S.races.filter(r=>r.date>=t&&!r.virtual).sort((a,b)=>a.date<b.date?-1:1),o=up.find(r=>r.id!==main.id&&r.date<main.date),soon=up.find(r=>daysBetween(t,r.date)<=21);
  const a=[];if(soon)a.push(`<button class="herolink" data-act="raceDay" data-v="${soon.id}">${T('Renntag-Plan','Race-day plan')}${soon.id!==main.id?' · '+esc(soon.name):''} ›</button>`);
  if(o&&(!soon||soon.id!==o.id))a.push(`<button class="herolink" data-act="tab" data-v="races">${T('Davor','Before that')}: ${esc(o.name)} · ${T('in','in')} ${daysBetween(t,o.date)} ${T('T.','d')} ›</button>`);
  return a.length?`<div class="herolinks">${a.join('')}</div>`:''}
const fabHTML=()=>`<button class="fab" data-act="logHow" aria-label="${T('Training erfassen','Log training')}"><span aria-hidden="true">+</span>${T('Training','Training')}</button>`;
// short, expandable note about the current phase, shown inside the countdown block
function healthNote(){if(!S||S.demo||S.healthOk||allRuns().some(l=>l.done))return'';
  return`<div class="banner"><div class="verdict">Bevor du loslegst</div><p style="margin:6px 0 10px;font-size:14.5px">Hast du gesundheitliche Vorbelastungen (z. B. Herz, Blutdruck, Gelenke), bist du über 35 und lange keinen Sport mehr gelaufen, oder bist du schwanger: Lass dich vor dem Start ärztlich durchchecken. Bei Brustschmerzen, Schwindel oder Atemnot beim Laufen sofort aufhören.</p><button class="btn small ghost" data-act="healthOk">Verstanden</button></div>`}
function goalDoneHTML(r){const l=S.logs[r.date],sec=raceSec(r)||(l&&l.done?(l.sec||(l.pace?l.pace*logKm(l):null)):null),ok=sec&&r.goal?sec<=r.goal:l&&l.done&&!r.goal;
  return`<div class="card stack" style="gap:10px;border-left:6px solid ${ok?'var(--good)':'var(--blue)'}"><h3>${r.virtual?T('Zieltest vorbei','Goal test done'):esc(r.name)+T(' ist vorbei',' is over')}</h3>
    <p class="muted" style="margin:0">${sec?(r.goal?(ok?T(`Geschafft: ${fmtTime(sec)} (Ziel ${fmtTime(r.goal)}). Stark!`,`Done: ${fmtTime(sec)} (goal ${fmtTime(r.goal)}). Great!`):T(`${fmtTime(sec)} gegenüber Ziel ${fmtTime(r.goal)}. Mit einem neuen Anlauf rückt es näher.`,`${fmtTime(sec)} versus goal ${fmtTime(r.goal)}. Another block brings it closer.`)):T('Geschafft. Glückwunsch!','Done. Congratulations!')):T('Trag das Ergebnis ein, dann siehst du, ob du dein Ziel erreicht hast.','Log the result to see whether you reached your goal.')} ${T('Bis du ein neues Ziel setzt, hält der Plan deine Form.','Until you set a new goal, the plan keeps your form.')}</p>
    <div class="row"><button class="btn small primary" data-act="goalOpen">${T('Neues Ziel setzen','Set a new goal')}</button><button class="btn small ghost" data-act="goalFit">${T('Form halten','Keep my form')}</button></div></div>`}
function heroNote(){
  const t=today(),race=mainRace(S),tw=planWeek(t);
  if(tw&&tw.phase==='gen'&&race&&race.date>=t&&S.plan.specStart>t)return`<details class="herodet"><summary>${tw.genMode==='hold'?'Geniessen statt abarbeiten':'Fitness aufbauen'} · Zielvorbereitung ab ${fdate(S.plan.specStart)}</summary>
    <p>Für ${fk(race.dist)} km sind ${S.plan.prep.lo}–${S.plan.prep.hi} Wochen Vorbereitung üblich, für dich ${S.plan.prep.weeks}. Bis dahin sind die Einheiten Vorschläge: Tage tauschen, nach Gefühl laufen, Alternativtraining statt Laufen ist ausdrücklich erlaubt.</p></details>`;
  if(tw&&tw.phase==='recover')return`<details class="herodet"><summary>Erholungsphase nach dem Wettkampf</summary><p>Erholung hat Vorrang. Keine Intensität, bis der Plan sie wieder vorsieht.</p></details>`;
  return'';
}
function openSessions(){const t=today(),o=[];for(let i=1;i<=7;i++){const d=addD(t,-i),x=planSession(d);if(x&&x.type!=='rest'&&!x.optional&&!S.logs[d]&&d>=S.plan.startMonday)o.push([d,x])}return o}
function tomorrowCard(){const t=today(),tmw=addD(t,1),ts=planSession(tmw);if(new Date().getHours()<17)return'';
  return`<button class="tomorrow" data-act="openDay" data-d="${tmw}"><span class="ic">${ICONS.bell}</span><span><span class="label">Morgen · ${fdate(tmw)}</span><br><b>${ts?esc(ts.title):'Ruhetag'}</b>${ts&&ts.type!=='rest'?` <span class="muted">· ${ts.type==='alt'?(ts.dur||45)+' min':fk(ts.km)+' km'}</span>`:''}</span><span class="muted">›</span></button>`}
