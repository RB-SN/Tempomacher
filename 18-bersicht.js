/* ---- Übersicht ---- */
const FICON={
  cal:'<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  fire:'<svg viewBox="0 0 24 24"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.4 2-4.5.3 1.5 1 2.5 2 2.5 0-3 0-5.5 1-8z"/></svg>',
  wall:'<svg viewBox="0 0 24 24"><path d="M3.5 6h17v13h-17zM3.5 10.5h17M3.5 15h17M9 6v4.5M15 6v4.5M6 10.5V15M12 10.5V15M18 10.5V15M9 15v4M15 15v4"/></svg>',
  flag:'<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  trophy:'<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 20h8"/></svg>',
  trend:'<svg viewBox="0 0 24 24"><path d="M3 18l5-6 4 3 7-9"/><path d="M15 6h4v4"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>',
  gauge:'<svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/></svg>',
  list:'<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/></svg>',
  cog:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'};
const CHEV='<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
let FOLD=null;
function foldState(){if(!FOLD){try{FOLD=JSON.parse(lsGet('tempomacher.fold')||'{}')||{}}catch(e){FOLD={}}}return FOLD}
function fold(key,icon,col,title,sub,body){if(!body)return'';
  return`<details class="fold" data-fold="${key}" ${foldState()[key]?'open':''}><summary><span class="fi" style="--fc:${col}">${FICON[icon]}</span><span class="ft"><b>${title}</b>${sub?`<span>${sub}</span>`:''}</span><span class="chev">${CHEV}</span></summary><div class="fb">${body}</div></details>`}
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.dataset||!d.dataset.fold)return;const f=foldState();if(d.open)f[d.dataset.fold]=1;else delete f[d.dataset.fold];lsSet('tempomacher.fold',JSON.stringify(f))},true);
const zcol=s=>s&&s.type!=='rest'?`var(--${s.type==='race'?'hot':s.type==='alt'?'z1':s.zone.toLowerCase()})`:'var(--z1)';
function sessAmt(s,l){return s.type==='alt'?`${s.dur||45}<small>min</small>`:`${fk(l&&l.done&&l.km?l.km:s.km)}<small>km</small>`}
function nextSess(){const t=today();for(let i=1;i<=14;i++){const d=addD(t,i),x=planSession(d);if(x&&x.type!=='rest')return[d,x]}return null}
function tmwLine(){const n=nextSess();if(!n)return'';const[d,x]=n,t=today(),lab=d===addD(t,1)?T('Morgen','Tomorrow'):DOWS[dow(d)]+' '+pd(d).getDate()+'.';
  return`<span class="tmw" style="--mz:${zcol(x)}"><i></i><span>${lab}: <b>${esc(x.title)}</b> · ${x.type==='alt'?(x.dur||45)+' min':fk(x.km)+' km'}</span></span>`}
// today's session as a bar: easy parts grey, the hard part coral (warm-up · work · rest · cool-down, or a fast finish at the end)
function segBar(s){if(!s||s.type==='alt'||!s.km)return'';const st=(s.structure||[]).map(x=>String(x).replace(/<[^>]+>/g,''));let warm=0,cool=0,work=0,fin=false;const n=x=>+String(x).replace(',','.');
  st.forEach(x=>{let m;if((m=x.match(/^(\d+(?:[.,]\d+)?)\s*km\s+(einlaufen|warm)/i)))warm=n(m[1]);if((m=x.match(/^(\d+(?:[.,]\d+)?)\s*km\s+(auslaufen|cool)/i)))cool=n(m[1]);if(!work&&(m=x.match(/(?:letzten?|last)\s+(\d+(?:[.,]\d+)?)\s*km/i))){work=n(m[1]);fin=true}});
  if(s.quality&&!work&&typeof planShape==='function'){const sh=planShape(s);if(sh){const T0=ctxFor(S).pc.T||300;work=sh.reps.reduce((a,r)=>a+(r.d?r.d/1000:r.t/T0),0)}}
  const tot=s.km;if(!(work>0)||work>=tot)return'';const rest=Math.max(0,tot-warm-cool-work),seg=(f,c)=>f>0?`<i style="flex:${f.toFixed(2)};background:${c}"></i>`:'';
  return`<span class="segbar" aria-hidden="true">${fin?seg(tot-work,'var(--band-2)')+seg(work,'var(--hot)'):seg(warm,'var(--band-2)')+seg(work,'var(--hot)')+seg(rest,'var(--band-2)')+seg(cool,'var(--band-2)')}</span>`}
function todayTile(){wxLoad();
  const t=today(),{s}=t>=S.plan.startMonday?effective(t):{s:null},log=S.logs[t];
  const doneToday=[...(log&&log.done?[{l:log,key:'d:'+t}]:[]),...(S.extra||[]).filter(x=>x.date===t&&x.done).sort((a,b)=>(a.at||0)-(b.at||0)).map(x=>({l:x,key:'x:'+x.id}))];
  if(doneToday.length)return`<div class="tday isdone"><div class="tl"><span>${T('Heute','Today')} · ${fdate(t)}</span><span style="color:var(--good)">${T('Erledigt ✓','Done ✓')}</span></div>
    ${doneToday.map(({l,key})=>{const fb=l.s?fbFull(l,t):null,alt=isAlt(l)&&!l.type,sec=logSec(l);
      return`<button class="todone" data-act="${key.startsWith('d:')?'openDay':'openXView'}" ${key.startsWith('d:')?`data-d="${t}"`:`data-v="${key.slice(2)}"`}>
        <span class="todone-t"><b>${esc(alt?altTitle(l):l.type?RTL[l.type]:l.s.title)}</b>
        <span class="todone-m">${alt?[l.dur?l.dur+' min':'',l.hr?T('Puls ','HR ')+l.hr:'','≈ '+fk(altEq(l).eqKm)+T(' km Lauf',' km run')].filter(Boolean).join(' · '):[logKm(l)?fk(logKm(l))+' km':null,sec?fmtTime(sec):null,l.pace?pace(l.pace):null,l.hr?T('Puls ','HR ')+l.hr:null].filter(Boolean).join(' · ')}</span></span>
        ${fb&&fb.score!=null?`<span class="fbs mini" style="--sc:${scoreCol(fb.score)}"><b>${fb.score}</b></span>`:''}</button>`}).join('')}
    ${s&&s.type!=='rest'&&!log&&t>=S.plan.startMonday?`<span class="hint">${T('Geplant war','Planned was')}: ${esc(s.title)} · <button class="link" data-act="tab" data-v="train">${T('offen','open')}</button></span>`:''}${tmwLine()}</div>`;
  const rest=!s||s.type==='rest',skipped=log&&!log.done;
  const hero=!rest&&!log;
  return`<button class="tday ${rest||skipped?'rest':''}${hero?' hero2':''}" style="--zc:${zcol(s)}" ${!rest&&!log?`data-act="openDay" data-d="${t}"`:'data-act="tab" data-v="train"'}>
    <span class="tl"><span>${T('Heute','Today')} · ${fdate(t)}</span>${!rest&&!log&&s.type!=='alt'?`<span>${ZONES[s.zone]?ZONES[s.zone].n:''}</span>`:''}</span>
    <span class="tm"><span class="tt">${skipped?T('Nicht durchgeführt','Skipped'):s&&s.pause?esc(s.title):rest?T('Ruhetag','Rest day'):esc(s.title)}</span>${!rest?`<span class="tk">${sessAmt(s,log)}</span>`:`<span class="restshoe">${ICONS.train}</span>`}</span>
    <span class="tp">${!rest&&!log&&s.type!=='alt'?zonePill(s.zone)+capPill(s):''}${rest?`<span class="hint">${s&&s.pause?T('Gute Besserung bzw. schöne Zeit. Der Plan wartet.','Get well soon or enjoy. The plan will wait.'):T('Erholung gehört zum Training.','Recovery is part of training.')}</span>`:''}</span>${hero?segBar(s):''}
    ${hero?`<span class="cta">${T('Los geht’s','Let’s go')}<small>${T('Details & erfassen','Details & log')}</small></span>`:''}
    ${!rest&&!log?wxLine(s):''}${tmwLine()}</button>`;
}
function ringSVG(p){const r=15,c=+(2*Math.PI*r).toFixed(1),o=+(c*(1-clamp(p,0,1))).toFixed(1);
  return`<svg class="ring" viewBox="0 0 38 38" aria-hidden="true"><circle class="rb" cx="19" cy="19" r="${r}"/><circle class="rf" cx="19" cy="19" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${o}" style="--rc:${c}"/></svg>`}
function avgScore(){const r=allRuns().filter(l=>l.done&&l.s&&l.s.type!=='alt').slice(-5).map(l=>{const f=fbFull(l,l.date);return f&&f.score!=null?f.score:null}).filter(x=>x!=null);
  return r.length?{v:r.reduce((a,b)=>a+b,0)/r.length,n:r.length}:null}
function tilesHTML(){
  const cw=monday(today()),w=planWeek(cw),done=Math.round(weekDoneKm(cw)),plan=w?Math.round(w.km):0,st=streakStats(),sc=avgScore();
  const runs=allRuns().filter(l=>l.done),tot=Math.round(runs.reduce((a,l)=>a+logKm(l),0));
  const chev=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l6 6-6 6" opacity=".5"/><path d="M12 6l6 6-6 6"/></svg>`;
  return`<div class="tiles">
    <button class="tile" style="--tc:var(--blue)" data-act="goVol"><span class="ti">${ringSVG(plan?done/plan:0)}</span><span class="tv">${done}${plan?`<small>/${plan}</small>`:''}</span><span class="tlb">${T('km diese Woche','km this week')}</span></button>
    <button class="tile" style="--tc:var(--c4)" data-act="goPlan"><span class="ti">${chev}</span><span class="tv">${st.cur}</span><span class="tlb">${st.cur===1?T('Training in Folge','session in a row'):T('Trainings in Folge','sessions in a row')}</span></button>
    ${sc?`<button class="tile" style="--tc:${scoreCol(Math.round(sc.v))}" data-act="goList"><span class="ti">${ringSVG(sc.v/10)}</span><span class="tv">${fk(Math.round(sc.v*10)/10)}</span><span class="tlb">${T('Ø Note','Avg score')} (${sc.n} ${T('Läufe','runs')})</span></button>`
      :`<button class="tile" style="--tc:var(--z3)" data-act="tab" data-v="form"><span class="ti">${ringSVG(0)}</span><span class="tv">${tot}</span><span class="tlb">${T('km gesamt','km in total')}</span></button>`}</div>`;
}
function adaptMini(){
  const h=S.adapt.history[S.adapt.history.length-1];if(!h||h.seen)return'';
  const t={up:T('Paces werden schneller','Paces get faster'),down:h.vdotDelta<0&&h.volFactor>=1?T('Paces werden langsamer','Paces get slower'):T('Plan wird zurückgenommen','Plan is eased back'),hold:h.focus?T('Neuer Schwerpunkt','New focus'):loadBrake(today())?T('Umfang bleibt, heute aber locker','Volume stays, but easy today'):T('Plan bleibt auf Kurs','Plan stays on track')}[h.verdict];
  return`<details class="banner mini ${h.verdict}"><summary><span class="verdict">${t}</span><span class="row" style="gap:10px;flex-wrap:nowrap"><span class="hint">${T('Warum?','Why?')}</span><button class="link" data-act="dismissAdapt">OK</button></span></summary>
    <div class="hint" style="margin-top:6px">${h.safety?T('Zwischen-Check','Interim check'):T('Auswertung der letzten 2 Wochen','Review of the last 2 weeks')}</div><ul class="notes">${h.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></details>`;
}
// weekly review: Sunday for the running week, Monday/Tuesday for the week just finished
function weekReview(){
  const t=today(),d=dow(t);if(d>=2&&d<6)return'';const wm=d===6?monday(t):addD(monday(t),-7);
  if(wm<S.plan.startMonday||S.revSeen===wm)return'';const w=planWeek(wm);if(!w)return'';
  if(d===6){const q=planSession(t);if(q&&!['rest','alt'].includes(q.type)&&!S.logs[t])return''}
  const P=S.pause;if(P&&P.from<=addD(wm,6)&&P.to>=wm)return'';
  const days=[...Array(7)].map((_,i)=>addD(wm,i)),pl=days.filter(x=>{const q=planSession(x);return q&&!['rest','alt'].includes(q.type)});
  const done=pl.filter(x=>S.logs[x]&&S.logs[x].done).length,skip=pl.filter(x=>S.logs[x]&&!S.logs[x].done).length;
  const runs=allRuns().filter(l=>l.done&&l.date>=wm&&l.date<=addD(wm,6)&&l.s&&l.s.type!=='alt');if(!runs.length&&!skip)return'';
  const km=Math.round(weekDoneKm(wm)),pkm=Math.round(w.km);
  const fbs=runs.map(l=>({l,f:fbFull(l,l.date)})).filter(o=>o.f&&o.f.score!=null);
  const av=fbs.length?fbs.reduce((a,o)=>a+o.f.score,0)/fbs.length:null,best=fbs.slice().sort((a,b)=>b.f.score-a.f.score)[0];
  const fast=fbs.filter(o=>o.f.minus.some(m=>/^(Zu schnell|Too fast)/.test(m))).length,comp=pl.length?done/pl.length:1;
  let msg=comp>=.9&&(av==null||av>=7)?T('Starke Woche: alles erledigt und gut umgesetzt.','Strong week: everything done and well executed.')
    :comp>=.7?T('Solide Woche.','Solid week.'):T('Eine durchwachsene Woche. Kein Problem: Verpasstes nicht nachholen, einfach weitermachen.','A mixed week. No problem: do not make up what you missed, just carry on.');
  {const a=loadAcwr(addD(wm,7));if(a&&a>1.5&&d!==6)msg+=' '+T(`Aber: Die Belastung ist stark gestiegen (${fk(Math.round(a*10)/10)}× dein Schnitt). Darum startet diese Woche bis Mittwoch locker.`,`But: your load rose sharply (${fk(Math.round(a*10)/10)}× your average). So this week starts easy until Wednesday.`)}
  if(fast>=2)msg+=' '+T(`${fast}× zu schnell: Die Vorgaben einhalten bringt mehr als Tempo zu bolzen.`,`${fast}× too fast: sticking to the targets brings more than pushing the pace.`);
  else if(km>pkm*1.2&&pkm)msg+=' '+T('Deutlich mehr Umfang als geplant: Achte darauf, dass es nicht zur Gewohnheit wird.','Much more volume than planned: make sure it does not become a habit.');
  const nm=addD(wm,7),nw=planWeek(nm);let nxt='';
  if(nw){const key=[...Array(7)].map((_,i)=>{const x=addD(nm,i);return[x,x===t&&!S.logs[x]?effective(x).s:nw.days[i]]}).filter(([,q])=>q&&(q.quality||q.type==='long'||q.type==='race'||q.type==='mptest'));
    nxt=nw.recovery?T(`Entlastungswoche (${fk(nw.km)} km): weniger Umfang, damit der Körper das Training verarbeitet.`,`Recovery week (${fk(nw.km)} km): less volume so your body can absorb the training.`)
      :`${fk(nw.km)} km · ${esc(phaseLabel(nw))}${key.length?' · '+T('Schwerpunkte','Key sessions')+': '+key.map(([x,q])=>`${esc(q.title)} (${DOWS[dow(x)]})`).join(', '):''}`}
  const stat=(v,l)=>`<div><b>${v}</b><span>${l}</span></div>`;
  return`<div class="card stack wrev" style="gap:10px"><div class="spread"><h3>${d===6?T('Deine Woche','Your week'):T('Rückblick letzte Woche','Last week in review')}</h3><button class="link" data-act="revOk">OK</button></div>
    <div class="wrs">${stat(`${km}<small>/${pkm}</small>`,T('km','km'))}${stat(`${done}<small>/${pl.length}</small>`,T('Einheiten','sessions'))}${stat(av!=null?fk(Math.round(av*10)/10):'–',T('Ø Note','avg score'))}</div>
    <p style="margin:0;font-size:14.5px">${msg}${best&&best.f.score>=8?' '+T(`Beste Einheit: ${esc(best.l.s.title)} (${best.f.score}).`,`Best session: ${esc(best.l.s.title)} (${best.f.score}).`):''}</p>
    ${nxt?`<p class="hint" style="margin:0"><b>${d===6?T('Nächste Woche','Next week'):T('Diese Woche','This week')}:</b> ${nxt}</p>`:''}</div>`;
}
// profiles stored only on this device can be lost (e.g. Safari clears site data after ~7 days without use): remind every 2 weeks
function bakNudge(){if(!S||S.demo||isCloud())return'';const t=today(),runs=allRuns().filter(l=>l.done).length;if(runs<3)return'';
  if(S.lastBackup&&daysBetween(S.lastBackup,t)<14)return'';if(S.bakSnooze&&S.bakSnooze>t)return'';
  return`<div class="card stack bakn" style="gap:8px"><b>${T('Deine Daten sind nur auf diesem Gerät','Your data is only on this device')}</b><p class="hint" style="margin:0">${S.lastBackup?T(`Letzte Sicherung: ${fdate(S.lastBackup)}`,`Last backup: ${fdate(S.lastBackup)}`):T('Noch keine Sicherung.','No backup yet.')} ${T('Browser löschen Website-Daten manchmal (z. B. Safari nach rund 7 Tagen ohne Nutzung, wenn die App nicht auf dem Home-Bildschirm liegt). Eine Sicherung schützt Plan und Einträge.','Browsers sometimes delete website data (e.g. Safari after about 7 days without use if the app is not on the home screen). A backup protects your plan and entries.')}</p>
    <div class="row" style="gap:8px">${CLOUD?`<button class="btn small blue" data-act="bakCloud">${T('Auf allen Geräten nutzen','Use on all devices')}</button>`:''}<button class="btn small ${CLOUD?'ghost':'blue'}" data-act="bakSave">${T('Jetzt sichern','Back up now')}</button><button class="link" data-act="bakLater">${T('Später','Later')}</button></div></div>`}
