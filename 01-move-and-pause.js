/* ---- everyday life: move a session, take a break. Both are stored apart from the plan and re-applied after each rebuild ---- */
const isHard=x=>!!(x&&(x.quality||x.type==='long'||x.type==='race'||x.type==='test'));
const reKm=w=>{if(w)w.km=r05(w.days.reduce((a,s)=>a+(s&&s.type!=='rest'&&s.type!=='race'&&!s.optional?s.km:0),0))};
function swapDays(a,b){const wa=planWeek(a),wb=planWeek(b);if(!wa||!wb)return false;const x=wa.days[dow(a)];wa.days[dow(a)]=wb.days[dow(b)];wb.days[dow(b)]=x;reKm(wa);reKm(wb);return true}
function applySwaps(){const cur=monday(today());S.swaps=(S.swaps||[]).filter(x=>x.a>=cur&&x.b>=cur);S.swaps.forEach(x=>swapDays(x.a,x.b))}
// would moving the session from a to b put two hard days next to each other?
function moveConflict(a,b){const g=d=>d===a?planSession(b):d===b?planSession(a):planSession(d);
  for(const d of[a,b]){if(!isHard(g(d)))continue;for(const n of[addD(d,-1),addD(d,1)]){if(n===a||n===b){if(isHard(g(n)))return true;continue}const l=S.logs[n],x=l&&l.done?l.s:planSession(n);if(isHard(x))return true}}return false}
function moveTargets(a){const t=today(),out=[];for(let i=0;i<=7;i++){const d=addD(t,i);if(d===a||S.logs[d])continue;const x=planSession(d);if(!planWeek(d)||(x&&(x.type==='race'||x.type==='test')))continue;out.push({d,x,bad:moveConflict(a,d)})}return out}
const pauseL=()=>({sick:T('Krank','Ill'),injury:T('Verletzt','Injured'),away:T('Ferien / Reise','Holiday / travel'),other:T('Anderes','Other')});
function applyPause(){const P=S.pause;if(!P)return;const t=today(),cur=monday(t);
  if(P.to<addD(t,-21)){S.pause=null;return}
  const len=daysBetween(P.from,P.to)+1,c=ctxFor(S),ch=new Set();
  for(let d=P.from;d<=P.to;d=addD(d,1)){if(d<cur)continue;const w=planWeek(d);if(!w)continue;const x=w.days[dow(d)];
    if(x&&x.type!=='race'&&!S.logs[d]){w.days[dow(d)]={...restS(T('Pause','Break')+' · '+pauseL()[P.reason||'other'],x.type==='rest'?null:x.title),pause:true};ch.add(w)}}
  // gentle return: the longer the break, the longer without intensity and with less volume
  const n=len<=3?0:len<=7?4:len<=14?7:14;
  for(let i=1;i<=n;i++){const d=addD(P.to,i);if(d<cur)continue;const w=planWeek(d);if(!w)continue;const x=w.days[dow(d)];
    if(!x||['rest','race','alt','test'].includes(x.type)||S.logs[d])continue;
    const f=len>14?(i<=7?.6:.8):len>7?.7:.85;if(len>14&&i>7&&x.quality&&x.zone!=='Z5')continue;
    w.days[dow(d)]={...(x.type==='long'?W.long(c,Math.max(4,r05(x.km*f)),'plain'):W.easy(c,Math.max(3,r05(x.km*f)))),tag:T('Wiedereinstieg nach der Pause','Return after the break'),adjusted:true,orig:x.title};ch.add(w)}
  ch.forEach(reKm)}
const planSession=date=>{const w=(S.plan.weeks||[]).find(w=>w.monday===monday(date));return w?w.days[dow(date)]:null};
const planWeek=date=>(S.plan.weeks||[]).find(w=>w.monday===monday(date));

