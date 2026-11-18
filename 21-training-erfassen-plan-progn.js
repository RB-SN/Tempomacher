/* ---- Training: erfassen, Plan (Prognose), Einträge ---- */
function renderTrain(){
  const v=ui.trainView||'log';
  const seg=`<div class="auth-tabs" style="grid-template-columns:repeat(3,1fr)"><button data-act="trainView" data-v="log" aria-pressed="${v==='log'}">Erfassen</button><button data-act="trainView" data-v="plan" aria-pressed="${v==='plan'}">Trainingsplan</button><button data-act="trainView" data-v="list" aria-pressed="${v==='list'}">Einträge</button></div>`;
  return`<div class="stack" style="gap:16px"><div class="sh"><h2>Training</h2></div>${seg}${v==='plan'?planHTML():v==='list'?entriesHTML():logHTML()}</div>`;
}
// how to log, right on the session: screenshot (fastest), file, by hand
function logChoice(d,s){const ds=d?` data-d="${d}"`:'';
  return`<div class="logc"><div class="label">${T('Erfassen','Log')}</div><div class="logb"><button class="btn primary" data-act="shotAct"${ds}>${HOWI.shot}<span>${T('Screenshot','Screenshot')}</span></button><button class="btn ghost" data-act="importAct"${ds}>${HOWI.file}<span>${T('Datei','File')}</span></button><button class="btn ghost" data-act="${d?'openLog':'openExtra'}"${ds}>${HOWI.hand}<span>${T('Von Hand','By hand')}</span></button></div>
    <button class="shneed" data-act="shotHelpShow"${ds}><span>${T('Nötig','Needed')}:</span>${(()=>{const L=SHOTL();return shotNeeds(s).n.map((k,i)=>`<b>${i+1} ${L[k]}</b>`).join('')})()}<em>${T('Beispiele ›','Examples ›')}</em></button><button class="link" style="font-size:13px;align-self:flex-start" data-act="fileHowShow"${ds}>${T('Datei vom Handy laden: so geht’s ›','Load a file from your phone: how ›')}</button></div>`}
function logHTML(){
  const t=today();
  if(t<S.plan.startMonday)return`<div class="card"><h3>${T('Dein Plan startet am','Your plan starts on')} ${fdate(S.plan.startMonday)}</h3><p class="muted" style="margin:6px 0 0">${T('Bis dahin: locker laufen wie gewohnt. Läufe kannst du trotzdem schon erfassen.','Until then: run easy as usual. You can already log runs.')}</p></div>
    <button class="btn primary" data-act="logHow">+ ${T('Training erfassen','Log training')}</button>`;
  const {s,notes}=effective(t),ci=S.checkins[t],log=S.logs[t];
  const hn=healthNote();
  let act='';const canLog=s&&s.type!=='rest'&&!log;
  if(canLog&&!ci)act=`<details class="card cid" ${ui.ciOpen?'open':''}><summary><span><b>${T('Morgen-Check','Morning check')}</b><span class="hint"> · ${T('10 Sekunden, passt die Einheit an deine Bereitschaft an','10 seconds, adapts the session to your readiness')}</span></span><span class="chev">${CHEV}</span></summary>${ciForm(true)}</details>`;
  else if(ci)act=ciDone(ci);
  const logBtn=canLog?`<div class="stack" style="gap:10px">${logChoice(t,s)}<div class="row" style="justify-content:center;gap:6px 18px"><button class="link" data-act="altHow" data-d="${t}">${T('Alternativtraining','Cross-training')}</button><button class="link" data-act="moveAsk" data-d="${t}">${T('Verschieben','Move')}</button><button class="link" data-act="skipLog" data-d="${t}">${T('Nicht durchgeführt','Not done')}</button></div></div>`:'';
  const adjBox=(notes.length||(s&&s.orig&&s.orig!==s.title))?`<div class="adj stack" style="gap:6px">${s&&s.orig&&s.orig!==s.title?`<strong>Angepasst · ursprünglich: ${esc(s.orig)}</strong>`:''}${notes.map(n=>`<div>${esc(n)}</div>`).join('')}</div>`:'';
  const open=openSessions();
  const openBox=open.length?`<div class="card stack" style="gap:8px"><h3>Noch nicht erfasst</h3><div class="list" style="border:0;box-shadow:none">${open.map(([d,x])=>`<div class="li" style="grid-template-columns:44px 1fr;row-gap:8px"><span class="dt">${DOWS[dow(d)]}<b>${pd(d).getDate()}</b></span><span class="t">${esc(x.title)}<small>${x.type==='alt'?'freiwillig':fk(x.km)+' km'}</small></span><span class="row" style="gap:14px;grid-column:2;align-items:center"><button class="btn small primary" data-act="logHow" data-d="${d}">${T('Erfassen','Log')}</button><button class="link" data-act="skipLog" data-d="${d}">${T('Nicht durchgeführt','Not done')}</button></span></div>`).join('')}</div></div>`:'';
  const extrasToday=(S.extra||[]).filter(x=>x.date===t);
  return`${hn}${sessCard(t,log?log.s:s,'Heute')}${adjBox}${act}${logBtn}${log?logCard(t,log):''}
    ${extrasToday.map(x=>logCard(t,x,x.id)).join('')}${openBox}
    <div class="row" style="justify-content:center;gap:6px 18px;font-size:14px"><button class="link" data-act="logHow">${T('Weiteres Training erfassen','Log another training')}</button>${S.pause&&S.pause.to>=today()?`<button class="link" data-act="pauseEnd">${T('Pause beenden','End break')}</button>`:`<button class="link" data-act="pauseAsk">${T('Pause einlegen','Take a break')}</button>`}</div>${fabHTML()}`;
}
function coachCard(){
  if(!sampleFn)return'';const c=ui.coach;
  return`<div class="card stack" style="gap:10px"><div><h3>Frag den Coach</h3><p class="hint" style="margin:2px 0 0">Persönliche Einschätzung zu deiner Woche, basierend auf Plan, Check-ins und Einträgen.</p></div>
    ${c.text?`<div class="coach-out" id="coachOut">${esc(c.text)}</div>`:'<div class="coach-out" id="coachOut" hidden></div>'}
    ${c.err?`<div class="err">${esc(c.err)}</div>`:''}
    <button class="btn blue small" data-act="askCoach" ${c.busy?'disabled':''}>${c.busy?'Coach schreibt …':c.text?'Neue Einschätzung':'Einschätzung holen'}</button></div>`;
}

