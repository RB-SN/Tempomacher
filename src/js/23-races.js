/* ---- races ---- */
function activeMainExcept(id){const t=today();return S.races.filter(r=>prioOf(r)==='A'&&r.id!==id&&r.date>=t).sort((a,b)=>a.date<b.date?-1:1)[0]||null}
function planOptions(f){
  const m=activeMainExcept(f.id),d=pnum(f.dist)||10,goal=hms(f.gh,f.gm,f.gs)||null,pi=prepInfo(S.profile,{dist:d,goal},vdotOf(S));
  const wks=f.date?Math.floor(daysBetween(today(),f.date)/7):0;
  let ownD;
  if(!m)ownD=`Wird dein Hauptziel. Übliche Vorbereitung für ${fk(d)} km: ${pi.lo}–${pi.hi} Wochen, für dich ${pi.weeks}.`+(wks>pi.weeks?' Bis zum Start trainierst du locker und abwechslungsreich.':wks<pi.lo?` Achtung: nur ${wks} Wochen, kürzer als üblich.`:'');
  else if(f.date<m.date){const gap=Math.floor(daysBetween(f.date,m.date)/7);ownD=`Wird dein aktives Hauptziel vor «${m.name}». Danach folgt die Erholung, anschliessend der Plan für «${m.name}».`+(gap<prepInfo(S.profile,m,vdotOf(S)).lo?` Achtung: zwischen den beiden Rennen liegen nur ${gap} Wochen.`:'')}
  else ownD=`Wird ein weiteres Hauptziel nach «${m.name}». Der Plan dafür startet automatisch nach «${m.name}» und der Erholung.`;
  return[
    {k:'own',t:PLANO.own,d:ownD,dis:!f.date||f.date<=today()},
    {k:'taper',t:PLANO.taper,d:m&&f.date<m.date?'Kein eigener Plan, aber 2–3 Tage Tapering davor. Der Hauptplan läuft weiter.':'Nur möglich für Rennen vor deinem Hauptziel.',dis:!(m&&f.date&&f.date<m.date)},
    {k:'none',t:PLANO.none,d:'Kein Plan und kein Tapering. Das Rennen ersetzt eine Trainingseinheit.'}];
}
function defaultPlan(f){const m=activeMainExcept(f.id);
  if(f.rel==='low')return'none';
  if(f.rel==='mid')return m&&f.date<m.date?'taper':'none';
  return!m||f.date>m.date||!(f.date<m.date)?'own':'own'}
function renderRaces(){
  const t=today(),race=mainRace(S),c=ctxFor(S),f=ui.rf;
  const list=S.races.filter(r=>!r.virtual).sort((a,b)=>a.date<b.date?-1:1);
  let form='';
  if(f){const d=pnum(f.dist)||0,os=planOptions(f);
    form=`<div class="card stack" style="gap:14px"><h3>${f.id?'Rennen bearbeiten':'Neues Rennen'}</h3>
    <div class="field"><label for="rfName">Name</label><input class="input" id="rfName" value="${esc(f.name)}" placeholder="z. B. Silvesterlauf" data-bind="rf.name"></div>
    <div class="grid2"><div class="field"><label for="rfDate">Datum</label><input class="input" id="rfDate" type="date" value="${esc(f.date)}" data-bind="rf.date" data-rerender="1"></div>
    <div class="field"><label for="rfDist">Distanz in km (jede Distanz bis 100)</label><input class="input" id="rfDist" inputmode="decimal" value="${esc(f.dist)}" data-bind="rf.dist" placeholder="z. B. 15"></div></div>
    <div class="field"><span class="hint">Schnellwahl, oder oben eine beliebige Distanz eintippen (z. B. 15, 25 oder 64.5):</span><div class="seg">${[[5,'5 km'],[10,'10 km'],[21.1,'Halbmarathon'],[42.2,'Marathon'],[50,'50 km'],[100,'100 km']].map(([v,l])=>opt('rfSet','dist',v,l,f.dist)).join('')}</div></div>
    <div class="field"><span class="flabel">Zielzeit (optional)</span><div class="tin"><input class="input" id="rfGh" inputmode="numeric" placeholder="Std" value="${esc(f.gh)}" data-bind="rf.gh" aria-label="Stunden">:<input class="input" id="rfGm" inputmode="numeric" placeholder="Min" value="${esc(f.gm)}" data-bind="rf.gm" aria-label="Minuten">:<input class="input" id="rfGs" inputmode="numeric" placeholder="Sek" value="${esc(f.gs)}" data-bind="rf.gs" aria-label="Sekunden"></div></div>
    <div class="field"><span class="flabel">Wie wichtig ist dir dieses Rennen?</span><div class="seg">${Object.entries(REL).map(([k,[a,b]])=>opt('rfRel','rel',k,`<b>${a}</b><small>${b}</small>`,f.rel,'tall')).join('')}</div></div>
    <div class="field"><span class="flabel">Soll dafür ein Plan erstellt werden?</span><div class="stack" style="gap:8px">${os.map(o=>opt('rfSet','plan',o.k,`<b>${o.t}</b><small>${esc(o.d)}</small>`,f.plan,'tall wide',o.dis)).join('')}</div></div>
    ${d&&f.plan==='own'?(()=>{const g=hms(f.gh,f.gm,f.gs);const fr=freqInfo(S.profile,{dist:d,goal:g||null},vdotOf(S)),x=freqText(fr,trainDays(S.profile).length,d);return`<div class="${x.ok&&!x.warn?'live':'adj'}" style="${x.ok?'':'border:2px solid var(--bad)'}">${x.t}</div>`})():''}
    ${d?`<div class="adj">In jedem Fall folgt nach dem Rennen eine Pause: ${recText(d)}.</div>`:''}
    ${ui.rfErr?`<div class="err">${esc(ui.rfErr)}</div>`:''}
    <div class="row" style="justify-content:space-between">${f.id?(f.confirmDel?`<button class="btn small danger" data-act="raceDel">Wirklich löschen</button>`:`<button class="btn ghost small" data-act="raceDelAsk">Löschen</button>`):'<span></span>'}
    <div class="row"><button class="btn ghost" data-act="raceCancel">Abbrechen</button><button class="btn primary" data-act="raceSave">Speichern</button></div></div></div>`}
  return`<div class="stack"><div class="sh"><h2>${T('Ziele','Goals')}</h2></div>${goalCard()}<div class="sh" style="margin-top:6px"><h2 style="font-size:20px">${T('Rennen','Races')}</h2>${f?'':'<button class="btn small primary" data-act="raceNew">+ Rennen</button>'}</div>
  ${form}
  <div class="stack" style="gap:10px">${list.some(r=>r.date>=t)?'':`<p class="muted" style="margin:0">${T('Keine kommenden Rennen.','No upcoming races.')}</p>`}${list.filter(r=>r.date>=t).map(r=>{const past=r.date<t,main=race&&r.id===race.id,pred=showPred(r.dist)?predict(c.vd,r.dist):null;
    return`<div class="card" style="${main?'border:2px solid var(--hot)':''}"><div class="racestrip ${main?'main':''}"></div><div class="spread" style="align-items:flex-start;flex-wrap:nowrap"><div style="min-width:0">
      <h3 style="font-size:22px">${esc(r.name)}</h3><div class="muted" style="font-size:14px">${fdate(r.date)} ${pd(r.date).getFullYear()} · ${fk(r.dist)} km · ${T('in','in')} ${daysBetween(t,r.date)} ${T('Tagen','days')}</div></div>
      <button class="trash pen" data-act="raceEdit" data-v="${r.id}" aria-label="${T('Rennen bearbeiten','Edit race')}" title="${T('Bearbeiten','Edit')}">${PEN}</button></div>
      <div class="row" style="gap:6px;margin-top:8px"><span class="ph ${main?'ph-peak':'ph-rec'}">${main?'Hauptziel':REL[r.rel||'mid'][0]}</span><span class="ph ph-rec">${PLANO[r.plan||'none']}</span></div>
      <div class="row" style="margin-top:10px;gap:22px">${pred?`<div><div class="label">Prognose</div><div class="num" style="font-size:20px">${fmtTime(pred)} · ${pace(pred/r.dist)}</div></div>`:''}
      ${r.goal?`<div><div class="label">Ziel</div><div class="num" style="font-size:20px">${fmtTime(r.goal)} · ${pace(r.goal/r.dist)}</div></div>`:''}</div>
      ${main&&S.plan.prep&&!past?`<p class="hint" style="margin:8px 0 0">Zielvorbereitung: ${specCount()} Wochen ab ${fdate(S.plan.specStart)}${specCount()<S.plan.prep.weeks?`, kürzer als die für dich empfohlenen ${S.plan.prep.weeks}`:''} (üblich ${S.plan.prep.lo}–${S.plan.prep.hi}).</p>`:''}
      ${pred&&r.goal&&r.goal<pred*.96?(()=>{const G=goalReal(pred,r.goal,daysBetween(t,r.date)/7);return`<p class="hint" style="margin:8px 0 0">${T(`Die Zielzeit verlangt rund ${Math.round((1-r.goal/pred)*100)} % mehr Tempo als deine aktuelle Form; realistisch bis zum Renntag: etwa ${fmtTime(G.best)}. Der Renntag-Plan rechnet mit einem Tempo, das du halten kannst.`,`The goal requires about ${Math.round((1-r.goal/pred)*100)} % more speed than your current form; realistic by race day: about ${fmtTime(G.best)}. The race-day plan uses a pace you can hold.`)}</p>`})():''}
      <button class="btn small blue" style="margin-top:12px" data-act="raceDay" data-v="${r.id}">${T('Renntag-Plan','Race-day plan')} ›</button></div>`}).join('')}</div>
  ${(()=>{const past=list.filter(r=>r.date<t).reverse();if(!past.length)return'';
    const withRes=past.filter(r=>raceSec(r)),open=past.filter(r=>!raceSec(r)).length;
    return`<div style="margin-top:10px">${fold('pastRaces','flag','var(--z3)',T('Vergangene Rennen','Past races'),`${past.length} ${past.length===1?T('Rennen','race'):T('Rennen','races')}${withRes.length?' · '+T('zuletzt ','latest ')+esc(withRes[0].name)+' '+fmtTime(raceSec(withRes[0])):''}${open?' · '+open+T(' ohne Resultat',' without result'):''}`,`<div class="list">${past.map(r=>{const sec=raceSec(r),q=sec&&r.goal?sec/r.goal-1:null;
      return`<div class="li" style="grid-template-columns:52px 1fr auto;align-items:start"><span class="dt">${DOWS[dow(r.date)]}<b>${pd(r.date).getDate()}.${pd(r.date).getMonth()+1}.</b><small style="display:block;font-weight:600">${pd(r.date).getFullYear()}</small></span>
        <span class="t">${esc(r.name)}<small>${fk(r.dist)} km${r.goal?' · '+T('Ziel ','goal ')+fmtTime(r.goal):''}</small>
          ${sec?`<span class="row" style="gap:6px;margin-top:6px;align-items:center"><span class="num" style="font-size:17px">${fmtTime(sec)}</span><span class="muted" style="font-size:13px">${pace(sec/r.dist)}</span>${q!=null?`<span class="pill" style="background:${q<=0?'var(--good)':q<=.02?'var(--warn)':'var(--bad)'};color:#fff">${q<=0?'✓ '+fmtTime(r.goal-sec)+T(' unter Ziel',' under goal'):'+'+fmtTime(sec-r.goal)+T(' über Ziel',' over goal')}</span>`:''}</span>`:''}
          <span class="row" style="gap:4px 14px;margin-top:6px;font-size:14px">${sec?`<button class="link" data-act="raceFbOpen" data-v="${r.id}">${T('Auswertung','Review')}</button><button class="link" data-act="raceResOpen" data-v="${r.id}">${T('Resultat ändern','Edit result')}</button>`:`<button class="btn small primary" data-act="raceResOpen" data-v="${r.id}">${T('Resultat eintragen','Enter result')}</button>`}<button class="link" data-act="raceEdit" data-v="${r.id}">${T('Rennen bearbeiten','Edit race')}</button></span></span>
        ${sec?(()=>{const f=raceReview(r);return f?`<span class="fbs mini" style="--sc:${scoreCol(f.score)}"><b>${f.score}</b></span>`:''})():'<span></span>'}</div>`}).join('')}</div>`)}</div>`})()}</div>`;
}

