/* ---- overview v2: today first, goal as a slim strip, a one-line form check, week, tiles, outlook ---- */
// today's session with the morning check attached at the bottom of the same card
function todayBlock(){const t=today(),P=S.pause,paused=P&&P.from<=t&&P.to>=t,tile=todayTile();if(!tile)return'';
  if(t<S.plan.startMonday||paused)return tile;const ci=S.checkins[t];
  const foot=ci?(ci.ready!=null?`<div class="tdci rdy" style="--rc:${readyCol(ci.ready)}"><span class="rdot">${ci.ready}</span><span><b>${readyLbl(ci.ready)}</b> · ${readyTxt(ci.ready)}${ci.low&&ci.low.length?' <span class="hint">'+T('Grund: ','Because of: ')+ci.low.slice(0,2).join(', ')+'</span>':''}</span><button class="link" data-act="redoCheckin">${T('Ändern','Change')}</button></div>`:`<div class="tdci">${ciDone(ci)}</div>`)
    :`<details class="tdci cid" ${ui.ciOpen?'open':''}><summary><span><b>${T('Wie bereit bist du heute?','How ready are you today?')}</b> <span class="hint">${T('Schlaf, Beine, Ruhepuls · 10 s','sleep, legs, resting HR · 10 s')}</span></span><span class="chev">${CHEV}</span></summary>${ciForm(true)}</details>`;
  return`<div class="tdw">${tile}${foot}</div>`}
// goal as one slim strip: days to go, race, prediction with traffic light, week of the preparation
function goalStrip(){const t=today(),race=mainRace(S);
  if(S.plan.mode==='fit'||!race||race.date<t||(race.virtual&&race.date<t))return heroHTML();
  const dd=daysBetween(t,race.date),w=planWeek(t),k=courseOf(race),c=ctxFor(S);
  const total=S.plan.weeks.length?daysBetween(S.plan.startMonday,race.date):1,done=clamp(daysBetween(S.plan.startMonday,t)/Math.max(1,total),0,1);
  const phase=w?(isSpec(w)?`${T('Woche','Week')} ${specNo(w)}/${specCount()} · ${PH[w.phase]}`:phaseLabel(w)):'';
  const pr=k?`${T('Prognose','Prediction')} <b>${fmtTime(k.pr)}</b> · ${T('Ziel','goal')} ${fmtTime(k.goal)} <em class="gs ${k.st}">${k.txt}</em>`:showPred(race.dist)?`${T('Prognose','Prediction')} <b>${fmtTime(predict(c.vd,race.dist))}</b>`:'';
  const r=15,cc=+(2*Math.PI*r).toFixed(1);
  return`<div class="gwrap"><button class="gstrip" data-act="tab" data-v="races"><span class="gd"><b>${dd}</b><small>${dd===1?T('Tag','day'):T('Tage','days')}</small></span>
    <span class="gm"><b>${esc(race.name)}</b><span>${fk(race.dist)} km · ${fdate(race.date)}${phase?' · '+phase:''}</span>${pr?`<span>${pr}</span>`:''}</span>
    <svg class="gring" viewBox="0 0 38 38" aria-label="${Math.round(done*100)} %"><circle cx="19" cy="19" r="${r}" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="19" cy="19" r="${r}" fill="none" stroke="var(--hot)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${cc}" stroke-dashoffset="${(cc*(1-done)).toFixed(1)}" transform="rotate(-90 19 19)"/></svg></button>
    ${heroLinks(race)}${heroNote()}</div>`}
// one line: readiness today, form, efficiency trend
function formStrip(){const t=today(),ci=S.checkins[t],F=fitSeries(),fp=F&&F.pts.find(p=>p.d===t);
  const eff=(()=>{const pts=allRuns().filter(l=>l.done&&!isIv(l)&&l.date>=addD(t,-56)).map(l=>({d:l.date,v:effOf(l)})).filter(p=>p.v);if(pts.length<6)return null;const d0=pts[0].d,tr=linTrend(pts,d0);if(!tr||tr.x1-tr.x0<21)return null;return(tr.at(tr.x1)/tr.at(tr.x0)-1)*100})();
  if(!fp&&eff==null)return'';void ci;
  const cell=(v,l,col,act)=>`<button class="fsc" data-act="${act}" ${act==='tab'?'data-v="form"':''}><b style="color:${col}">${v}</b><span>${l}</span></button>`;
  const fs=fp&&F.pts.indexOf(fp)>=14?formState(fp.ctl,fp.tsb):null;
  const ago=fp?F.pts[Math.max(0,F.pts.indexOf(fp)-28)]:null,dC=fp&&ago?fp.ctl-ago.ctl:0;
  return`<div class="fstrip">${fp?cell(Math.round(fp.ctl),T('Fitness','Fitness')+(Math.abs(dC)>=1?` <em class="${dC>0?'up':'dn'}">${dC>0?'+':'−'}${Math.round(Math.abs(dC))}</em>`:''),'var(--blue)','tab'):''}
    ${fs?cell(`${Math.round(fp.tsb)===0?'0':(fp.tsb>0?'+':'−')+Math.round(Math.abs(fp.tsb))}`,T('Form','Form')+' · '+fs[1],fs[0],'tab'):''}
    ${eff!=null?cell(`${eff>=0?'+':'−'}${fk(Math.round(Math.abs(eff)*10)/10)} %`,T('Effizienz 8 Wo.','Efficiency 8 wk'),eff>=0?'var(--good)':'var(--bad)','tab'):''}</div>`}
function tilesHTML2(){const st=streakStats(),sc=avgScore(),t=today(),cy=pd(t).getFullYear(),k=ytdKm(cy,t.slice(5)),pk=ytdKm(cy-1,t.slice(5)),hasP=yearStats(cy-1).n>0;
  const chev=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l6 6-6 6" opacity=".5"/><path d="M12 6l6 6-6 6"/></svg>`;
  return`<div class="tiles">
    <button class="tile" style="--tc:var(--c4)" data-act="goPlan"><span class="ti">${chev}</span><span class="tv">${st.cur}</span><span class="tlb">${st.cur===1?T('Training in Folge','session in a row'):T('Trainings in Folge','sessions in a row')}</span></button>
    ${sc?`<button class="tile" style="--tc:${scoreCol(Math.round(sc.v))}" data-act="goList"><span class="ti">${ringSVG(sc.v/10)}</span><span class="tv">${fk(Math.round(sc.v*10)/10)}</span><span class="tlb">${T('Ø Note','Avg score')} (${sc.n} ${T('Läufe','runs')})</span></button>`:`<button class="tile" style="--tc:var(--z3)" data-act="goList"><span class="ti">${ringSVG(0)}</span><span class="tv">–</span><span class="tlb">${T('Ø Note','Avg score')}</span></button>`}
    <button class="tile" style="--tc:var(--c6)" data-act="yearOpen"><span class="ti">${hasP?ringSVG(Math.min(1,k/Math.max(1,yearStats(cy-1).km))):`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`}</span><span class="tv">${thou(k)}</span><span class="tlb">km ${cy}${hasP?` · <em class="${k>=pk?'up':'dn'}">${k>=pk?'+':'−'}${thou(Math.abs(Math.round(k-pk)))}</em>`:''}</span></button></div>`}
function renderHome(){
  const t=today(),cw=monday(t),nw=addD(cw,7);
  const op=openSessions().length,runs=allRuns().filter(l=>l.done);
  const up=S.races.filter(r=>r.date>=t&&!r.virtual).sort((a,b)=>a.date<b.date?-1:1).slice(0,4),m=mainRace(S);
  const racesBody=up.length?`<div class="list">${up.map(r=>`<div class="li" style="grid-template-columns:48px 1fr auto"><span class="dt">${DOWS[dow(r.date)]}<b>${pd(r.date).getDate()}.${pd(r.date).getMonth()+1}.</b></span>
      <span class="t">${esc(r.name)}<small>${fk(r.dist)} km · ${m&&r.id===m.id?T('Hauptziel','Main goal'):REL[r.rel||'mid'][0]}</small></span><span class="k">${daysBetween(t,r.date)} ${T('T.','d')}</span></div>`).join('')}</div><button class="link" data-act="tab" data-v="races">${T('Alle Ziele & Rennen ›','All goals & races ›')}</button>`:'';
  const next=[];for(let i=1;i<=14;i++){const d=addD(t,i),x=planSession(d);if(x&&x.type!=='rest')next.push([d,x])}
  const ns=nextSess();
  const nextBody=`${weekLane(nw,T('Nächste Woche','Next week'))}${next.length?`<div class="list" style="margin-top:12px">${next.map(([d,x])=>dayRow(d,x)).join('')}</div>`:''}<button class="link" data-act="goPlan">${T('Ganzer Trainingsplan ›','Full training plan ›')}</button>`;
  const vn=volWeeks(),vol=[...Array(vn)].map((_,k)=>weekDoneKm(addD(cw,-7*k))),anyKm=vol.some(x=>x>0);
  void nextBody;void racesBody;void anyKm;
  const nwk=planWeek(nw),nkey=nwk?[...Array(7)].map((_,i)=>[addD(nw,i),nwk.days[i]]).filter(([,q])=>q&&(q.quality||q.type==='long'||q.type==='race'||q.type==='mptest')):[];
  const nextLine=nwk?`<button class="nextw" data-act="goPlan"><span><b>${T('Nächste Woche','Next week')}</b> · ${fk(nwk.km)} km${nwk.recovery?T(' · Entlastung',' · recovery'):''}${nkey.length?' · '+nkey.map(([x,q])=>`${esc(q.title)} (${DOWS[dow(x)]})`).join(', '):''}</span><span>›</span></button>`:'';
  const foldsHTML=sampleFn?fold('coach','chat','var(--c4)',T('Frag den Coach','Ask the coach'),T('Persönliche Einschätzung zu deiner Woche','Personal take on your week'),coachCard()):'';
  const reauth=sync==='auth'?`<button class="nudge" data-act="logout"><b>${T('Bitte neu anmelden','Please sign in again')}</b>${T('Passwort geändert oder Anmeldung abgelaufen','Password changed or sign-in expired')}<span>›</span></button>`:'';
  const P=S.pause,pz=P&&P.to>=addD(t,-1)&&P.from<=addD(t,13)?`<div class="nudge" style="background:color-mix(in srgb,var(--z1) 18%,var(--surface))"><b>${P.from>t?T('Pause ab ','Break from ')+fdate(P.from):T('Pause','Break')} · ${pauseL()[P.reason||'other']}</b>${P.to>=t?T(' bis ',' until ')+fdate(P.to):T(' · Wiedereinstieg läuft',' · returning')}<span>${P.to>=t?`<button class="link" data-act="pauseEnd">${T('Früher zurück','Back earlier')}</button>`:''}</span></div>`:'';
  const wkP=planWeek(cw),wDone=Math.round(weekDoneKm(cw)),wPlan=wkP?Math.round(wkP.km):0;
  return`<div class="hm">${reauth}${pz}${healthNote()}${introCard()}
    ${painFlag()}${todayBlock()}
    ${goalStrip()}
    ${adaptMini()}${rwBanner()}${weekReview()}
    ${bakNudge()}${blockNudge()}${shoeNudge()}
    ${op?`<button class="nudge" data-act="tab" data-v="train"><b>${op} ${op===1?T('Einheit','session'):T('Einheiten','sessions')} ${T('noch nicht erfasst','not logged yet')}</b><span>${T('nachtragen ›','log now ›')}</span></button>`:''}
    ${detailOn()?formStrip():''}
    <div>${weekLane(cw,`<button class="lane-km lane-mon" data-act="goMonth">${T('Diese Woche','This week')} · ${T('Monat ›','Month ›')}</button><button class="lane-km" data-act="goVol"><b>${wDone}</b>${wPlan?` / ${wPlan}`:''} km</button>`)}${wPlan?`<div class="wbar"><i style="width:${Math.min(100,wDone/wPlan*100).toFixed(0)}%"></i></div>`:''}</div>
    ${runs.length?tilesHTML2():''}
    ${outlookHTML()||nextLine}
    ${S.profile.home?'':`<button class="link" style="align-self:flex-start" data-act="yearOpen">${T('Wohnort eintragen für den Städtevergleich ›','Add your home town for the city comparison ›')}</button>`}
    ${foldsHTML}</div>${fabHTML()}`;
}
