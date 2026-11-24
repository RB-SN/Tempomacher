/* ---- interval / lap tables (Garmin, Polar, Suunto, Apple Watch, Coros …) ----
   A header line names the columns (Zeit, Gesamtzeit, Distanz, Pace, SAP/GAP, HF, Max. HF, Anstieg …); the rows below are read by
   column order. Section words mark the type of a row: warm-up, work, recovery, cool-down. Filtered views (only «Laufen» etc.) and
   summary rows are recognised, several screenshots are merged by their cumulative time. */
const LAP_TY=[['warm',/warm\s*-?\s*up|aufw[äa]rm\w*|einlaufen|échauffement/i],['cool',/cool\s*-?\s*down|abk[üu]hl\w*|auslaufen|abw[äa]rm\w*|retour\s+au\s+calme/i],
  ['rec',/erholung|recovery|\brest\b|\bruhe\b|\bpause\b|trabpause|\bjog\b|récup\w*|\boff\b/i],['work',/\blaufen\b|\brun(?:ning)?\b|\bwork\b|arbeit|belastung|intervall?\b|\binterval\b|\baktiv\b|\bactive\b|\bon\b|effort/i]];
const LAP_TOT=/\b(gesamt|total|summe|insgesamt|summary)\b/i;
const LAP_COL=[['hrMax',/max\.?\s*(?:herz\w*|hf|hr|heart\s*rate|puls)/i,'i'],['cum',/\S?esamtzeit|kumul\w*|cumulative|elapsed|verstrichen\w*/i,'t'],['gap',/\bsap\b|\bgap\b|\bngp\b|steigung\s*angepasst|grade\s*adj\w*/i,'t'],
  ['time',/\bzeit\b|\btime\b|\bdauer\b|duration/i,'t'],['dist',/distanz|distance|strecke/i,'d'],['pace',/pace|\btempo\b/i,'t'],['hr',/herzfrequenz|\bhf\b|heart\s*rate|\bpuls\b|\bhr\b/i,'i'],
  ['gain',/anstieg|ascent|aufstieg|\bans\b/i,'i'],['desc',/abstieg|descent/i,'i'],['cad',/kadenz|cadence/i,'i'],['pow',/leistung|power|watt/i,'i']];
function lapHeader(ln){let s=ln;const cols=[];
  for(const[k,re,kind]of LAP_COL){const m=s.match(re);if(m){cols.push({k,kind,i:m.index});s=s.slice(0,m.index)+' '.repeat(m[0].length)+s.slice(m.index+m[0].length)}}
  const ks=cols.map(c=>c.k);if(!(ks.includes('time')||ks.includes('cum'))||!(ks.includes('dist')||ks.includes('pace')))return null;
  return cols.sort((a,b)=>a.i-b.i)}
// row values: times (m:ss, m:ss.d, h:mm:ss), decimals, integers; «5114.4» is OCR for «5:14.4»
// «1711.7» is OCR for «17:11.7» (colon lost); only with a 4-digit whole part, seconds below 60
function lapToks(s){const out=[],re=/(\d{1,2}:\d{2}:\d{2}(?:[.,]\d)?)|(\d{1,3}:\d{2}(?:[.,]\d)?)|\b(\d)[1lI|](\d{2})[.,](\d)\b|\b(\d{1,3})['’′](\d{2})(?!\d)(?:["”″]|'')?|\b(\d{2})([0-5]\d)[.,](\d)\b|((?:\d{1,3}(?:['’]\d{3})+|\d+)(?:[.,]\d+)?)/g;let m;
  while((m=re.exec(s))){if(m[6]){out.push({k:'t',v:+m[6]*60+ +m[7]});continue}if(m[8]){out.push({k:'t',v:+m[8]*60+ +m[9]+ +m[10]/10});continue}if(m[1]||m[2])out.push({k:'t',v:parseDur((m[1]||m[2]).replace(/[.,]\d$/,''))+(/[.,](\d)$/.test(m[1]||m[2])?+(m[1]||m[2]).slice(-1)/10:0)});
    else if(m[3])out.push({k:'t',v:+m[3]*60+ +m[4]+ +m[5]/10});
    else{const raw=m[11];out.push({k:/[.,]\d/.test(raw)?'d':'i',v:shotNum(raw),raw})}}
  return out}
function shotLaps(lines){const laps=[];let H=null,miss=0;
  lines.forEach(ln=>{const h=lapHeader(ln);if(h){H=h;miss=0;return}if(!H)return;
    // OCR slips in Garmin tables: «1:23:021» (dot lost), «58069 100» (58:06.9 1.00)
    ln=ln.replace(/(\d{1,2}:\d{2}:\d{2})(\d)\b/g,'$1.$2').replace(/\b(\d{1,2})([0-5]\d)(\d)\s+100\b/g,'$1:$2.$3 1.00');
    const tk=lapToks(ln);if(tk.filter(t=>t.k==='t').length<1||tk.length<2){if(++miss>2)H=null;return}miss=0;
    let ty=null;for(const[k,re]of LAP_TY)if(re.test(ln)){ty=k;break}
    const total=LAP_TOT.test(ln),o={type:ty,total};let q=0;
    while(q<tk.length&&tk[q].k==='i'&&tk[q].v<100){o.num=tk[q].v;q++} // lap / interval number
    for(const c of H){if(q>=tk.length)break;const t=tk[q];
      if(c.kind==='t'){if(t.k==='i'&&t.v>=100&&t.v<=5959&&t.v%100<60&&tk[q+1]&&tk[q+1].k!=='i'){o[c.k]=Math.floor(t.v/100)*60+t.v%100;q++;continue} // «100» is OCR for «1'00»
        if(t.k!=='t')continue;o[c.k]=t.v;q++}
      else if(c.kind==='d'){if(t.k==='d'||(t.k==='i'&&t.v>=50)){o[c.k]=t.k==='i'?t.v/1000:t.v;q++}}
      else{if(t.k==='i'){o[c.k]=t.v;q++}}}
    if(!o.time&&o.cum&&!laps.length)o.time=o.cum;
    if(!o.pace&&o.time&&o.dist)o.pace=o.time/o.dist;
    if(!o.time&&o.pace&&o.dist&&!o.total)o.time=Math.round(o.pace*o.dist);
    if(o.time&&o.dist&&o.pace&&Math.abs(o.time/o.dist-o.pace)>o.pace*.15&&!o.total)o.time=Math.round(o.pace*o.dist); // OCR slip in the time column
    if(o.time&&(o.dist||o.pace))laps.push(o)});
  // summary row of a filtered view: last row whose time is the sum of the others (Garmin: time = cumulative time)
  if(laps.length>=3){const L=laps[laps.length-1],rest=laps.slice(0,-1),sum=rest.reduce((a,r)=>a+(r.time||0),0);if(!L.total&&Math.abs(L.time-sum)<=1.5&&(L.cum==null||Math.abs(L.cum-L.time)<1))L.total=true}
  // scrolled filter view: last row without a number, total time = its own cumulative time and longer than every lap shown
  if(laps.length>=2){const L=laps[laps.length-1];if(!L.total&&L.num==null&&L.cum!=null&&Math.abs(L.cum-L.time)<1&&laps.slice(0,-1).every(r=>r.num!=null&&r.time<L.time))L.total=true}
  // Garmin interval row above its laps («1 16:00.0 29:13.7 4.03 …» then «4 3:58.0 17:11.7 1.00 …»): same start, longer → the interval itself
  laps.forEach((r,i)=>{const n=laps[i+1];if(n&&!r.total&&!n.total&&r.cum!=null&&n.cum!=null&&Math.abs((r.cum-r.time)-(n.cum-n.time))<1.5&&r.time>n.time+2)r.grp=true});
  return laps}
// aerobic decoupling (Friel): speed per heart beat, first against second half, after a 10-minute warm-up.
// Rows {t s, d km, hr, g = grade-adjusted pace s/km (Garmin SAP/GAP) or null}. Hills: with g it is grade-adjusted; without g and more than
// 12 m climb per km it is not rated. A clearly faster second half (progression, fast finish) is not rated either: the ratio would flatter it.
function decFrom(R,gainKm){R=R.filter(r=>r.hr&&r.t>0&&r.d>0);let acc=0;const U=R.filter(r=>{acc+=r.t;return acc>600});if(U.length<6)return null;
  const useG=U.every(r=>r.g>120&&r.g<900);if(!useG&&gainKm!=null&&gainKm>12)return{dec:null,why:'hilly'};
  const tot=U.reduce((x,r)=>x+r.t,0);let run=0;const H1=[],H2=[];U.forEach(r=>{(run+r.t/2<tot/2?H1:H2).push(r);run+=r.t});if(H1.length<3||H2.length<3)return null;
  const sp=a=>a.reduce((x,r)=>x+r.d,0)*1000/a.reduce((x,r)=>x+(useG?r.g*r.d:r.t),0),hr=a=>a.reduce((x,r)=>x+r.hr*r.t,0)/a.reduce((x,r)=>x+r.t,0);
  const s1=sp(H1),s2=sp(H2),ch=s2/s1-1;
  if(ch>.04){// progression: rate the longest steady part instead (≥ 30 min, every piece within ±3 % of its median pace; ±6 % for 1-minute pieces)
    const pc=r=>useG&&r.g?r.g:r.t/r.d,tol=R.reduce((x,r)=>x+r.t,0)/R.length<90?.06:.03;let best=null;
    for(let i=0;i<R.length;i++)for(let j=i+5;j<R.length;j++){const S2=R.slice(i,j+1),ps=S2.map(pc).sort((a,b)=>a-b),md=ps[Math.floor(ps.length/2)];if(S2.some(r=>Math.abs(pc(r)/md-1)>tol))break;
      const tt=S2.reduce((x,r)=>x+r.t,0);if(tt>=1800&&(!best||tt>best.tt))best={i,j,tt}}
    if(best){const S2=R.slice(best.i+1,best.j+1),T2=S2.reduce((x,r)=>x+r.t,0);let q=0;const A1=[],A2=[];S2.forEach(r=>{(q+r.t/2<T2/2?A1:A2).push(r);q+=r.t});
      if(A1.length>=2&&A2.length>=2){const e1=sp(A1)/hr(A1),e2=sp(A2)/hr(A2);const k0=R.indexOf(R[best.i]);return{dec:Math.round((e1-e2)/e1*1000)/10,why:'seg',seg:[best.i,best.j],ch:Math.round(ch*100)}}}
    return{dec:null,why:'prog',ch:Math.round(ch*100)}}
  const e1=s1/hr(H1),e2=s2/hr(H2);return{dec:Math.round((e1-e2)/e1*1000)/10,why:useG?'gap':'raw'}}
// elevation per split (Strava «Anstieg»): grade-adjusted pace per row when the signs can be trusted. OCR often drops the minus sign,
// so the climb of the splits must agree with the total ascent of an overview screenshot; otherwise only the hilliness (|m| per km) is used.
function elGap(R,ovGain){const E=R.filter(r=>r.el!=null);R.gainKm=null;if(E.length<R.length-1||R.some(r=>r.g))return R;
  const km=R.reduce((x,r)=>x+r.d,0),pos=E.reduce((x,r)=>x+Math.max(0,r.el),0),abs=E.reduce((x,r)=>x+Math.abs(r.el),0);
  if(ovGain!=null&&Math.abs(pos-ovGain)<=Math.max(5,ovGain*.08)){R.forEach(r=>{if(r.el!=null&&r.d>0)r.g=r.t/r.d/gapF(r.el/(r.d*10))});return R}
  R.gainKm=km?abs/2/km:null;return R}
// all lap rows of all screenshots → one sequence with types; returns intervals, recoveries and (if complete) the whole activity
function ivSummary(v){const r=v.rec;
  return T(`${v.n===1?'Tempoabschnitt':'Intervalle'} erkannt: <b>${v.n===1?v.rep:v.n+' × '+v.rep}</b> · Belastung Ø ${pace(v.pace)}${v.gap&&Math.abs(v.gap-v.pace)>=2?` (an Steigung angepasst ${pace(v.gap)})`:''}${v.hr?' · Ø HF '+v.hr:''}${v.hrMax?' (max '+v.hrMax+')':''}${v.gain!=null?' · ↗ '+v.gain+' hm in den Belastungen':''}${r?`<br>Erholung ${r.n} × ${fmtTime(r.t)}${r.hr?' · Ø HF '+r.hr:''}`:''}${v.warm||v.cool?`<br>${[v.warm&&'Einlaufen',v.cool&&'Auslaufen'].filter(Boolean).join(' und ')} erkannt`:''}`,
    `${v.n===1?'Tempo section':'Intervals'} recognised: <b>${v.n===1?v.rep:v.n+' × '+v.rep}</b> · work avg. ${pace(v.pace)}${v.gap&&Math.abs(v.gap-v.pace)>=2?` (grade-adjusted ${pace(v.gap)})`:''}${v.hr?' · avg. HR '+v.hr:''}${v.hrMax?' (max '+v.hrMax+')':''}${v.gain!=null?' · ↗ '+v.gain+' m in the reps':''}${r?`<br>Recovery ${r.n} × ${fmtTime(r.t)}${r.hr?' · avg. HR '+r.hr:''}`:''}${v.warm||v.cool?`<br>${[v.warm&&'warm-up',v.cool&&'cool-down'].filter(Boolean).join(' and ')} recognised`:''}`)}
function lapAnalysis(lists){
  const A=[],B=[],G=[];lists.forEach(ls=>{const rows=ls.filter(r=>!r.total);if(rows.some(r=>r.cum!=null))rows.forEach(r=>{if(r.cum==null)return;const P=r.grp?G:A;if(!P.some(a=>Math.abs(a.cum-r.cum)<1))P.push({...r})});else B.push(rows)});
  if(G.length){G.forEach(g=>{const s=g.cum-g.time;for(let k=A.length-1;k>=0;k--){const a=A[k];if(a.cum-a.time>=s-1.5&&a.cum<=g.cum+1.5)A.splice(k,1)}g.grp=true;A.push(g)})}
  A.sort((a,b)=>a.cum-b.cum);
  const same=(a,b)=>Math.abs(a.time-b.time)<1.2&&(a.dist==null||b.dist==null||Math.abs(a.dist-b.dist)<=.015)&&(!a.pace||!b.pace||Math.abs(a.pace-b.pace)<=2);
  let L;
  if(A.length){L=A;B.flat().forEach(r=>{if(!r.type)return;const m=L.find(a=>!a.type&&same(a,r));if(m)m.type=r.type});
    // a filtered list (only one type) without labels: if its rows match, the whole list gets that type
    lists.forEach(ls=>{const ty=[...new Set(ls.filter(r=>!r.total).map(r=>r.type))];if(ty.length===1&&ty[0])ls.forEach(r=>{const m=L.find(a=>!a.type&&r.cum!=null&&Math.abs(a.cum-r.cum)<1);if(m)m.type=ty[0]})})}
  else{L=[];B.forEach((rows,bi)=>{const base=L.length;rows.forEach(r=>{if(!(bi>0&&L.slice(0,base).some(a=>a.type===r.type&&same(a,r))))L.push({...r})})})}
  if(L.length<2&&!(L.length===1&&L[0].grp&&L[0].time>=480))return null;
  // fill in missing types: between work rows = recovery, before = warm-up, after = cool-down
  let wi=L.map((r,i)=>r.type==='work'?i:-1).filter(i=>i>=0);
  if(wi.length<2){// no labels: the repeated, clearly harder rows are the work rows
    // 1-km rows may be auto-laps: as reps only if something else lies between them (1000-m intervals with recoveries)
    const km1=i=>L[i].dist&&Math.abs(L[i].dist-1)<.005,bins={};L.forEach((r,i)=>{const k=Math.round(r.time/5);(bins[k]=bins[k]||[]).push(i)});
    const allKm=L.filter((r,i)=>km1(i)).length>=L.length-1,cand=allKm?null:Object.values(bins).filter(g=>g.length>=3&&!(g.every(km1)&&g.some((x,j)=>j&&x===g[j-1]+1))).map(g=>({g,sc:avg(g.map(i=>L[i].hr||0))*2-avg(g.map(i=>L[i].pace||600))/10})).sort((a,b)=>b.sc-a.sc)[0];
    if(cand){const others=L.filter((r,i)=>!cand.g.includes(i)),fast=avg(cand.g.map(i=>L[i].pace||0))<avg(others.map(r=>r.pace||0))*.97||avg(cand.g.map(i=>L[i].hr||0))>avg(others.map(r=>r.hr||0))+8;
      if(fast)cand.g.forEach(i=>L[i].type='work')}
    wi=L.map((r,i)=>r.type==='work'?i:-1).filter(i=>i>=0)}
  if(!wi.length){const g=L.filter(r=>r.grp&&r.pace),o=L.filter(r=>!r.grp&&r.pace);if(g.length&&!o.length&&g.every(r=>r.time>=480)){g.forEach(r=>r.type='work');wi=L.map((r,i)=>r.type==='work'?i:-1).filter(i=>i>=0)}else if(g.length&&o.length&&avg(g.map(r=>r.pace))<avg(o.map(r=>r.pace))*.95){g.forEach(r=>r.type='work');wi=L.map((r,i)=>r.type==='work'?i:-1).filter(i=>i>=0)}}
  if(wi.length<2&&!(wi.length===1&&L[wi[0]].time>=480&&(L.some(r=>r.type==='warm'||r.type==='cool')||wi[0]>0||wi[0]<L.length-1||L[wi[0]].grp)))return null;
  L.forEach((r,i)=>{if(r.type)return;r.type=i<wi[0]?'warm':i>wi[wi.length-1]?'cool':'rec'});
  const W=L.filter(r=>r.type==='work'),R=L.filter(r=>r.type==='rec'),wt=W.reduce((a,r)=>a+r.time,0),wd=W.every(r=>r.dist)?W.reduce((a,r)=>a+r.dist,0):null;
  const wavg=(rs,k)=>{const h=rs.filter(r=>r[k]);return h.length?Math.round(h.reduce((a,r)=>a+r[k]*r.time,0)/h.reduce((a,r)=>a+r.time,0)):null};
  const tv=W.map(r=>r.time),tSame=Math.max(...tv)-Math.min(...tv)<=Math.max(3,avg(tv)*.04),md=wd?wd/W.length*1000:null;
  const rep=tSame?fmtTime(Math.round(avg(tv))):md?(md>=950?`~${fk(Math.round(md/100)/10)} km`:`~${Math.round(md/50)*50} m`):'?';
  const gw=W.every(r=>r.gain!=null)?W.reduce((a,r)=>a+r.gain,0):null,gp=W.every(r=>r.gap)?wt/W.reduce((a,r)=>a+r.time/r.gap,0):null;
  const iv={n:W.length,wt:Math.round(wt),pace:wd?wt/wd:avg(W.map(r=>r.pace)),gap:gp,hr:wavg(W,'hr'),hrMax:W.some(r=>r.hrMax)?Math.max(...W.map(r=>r.hrMax||0)):null,rep,how:T('Intervalle','intervals'),gain:gw,
    rec:R.length?{n:R.length,t:Math.round(avg(R.map(r=>r.time))),hr:wavg(R,'hr'),pace:R.every(r=>r.dist)?R.reduce((a,r)=>a+r.time,0)/R.reduce((a,r)=>a+r.dist,0):null}:null,
    warm:L.some(r=>r.type==='warm'),cool:L.some(r=>r.type==='cool'),
    reps:W.map(r=>({t:Math.round(r.time),d:r.dist||null,p:r.pace?Math.round(r.pace):null,hr:r.hr||null,g:r.gain??null}))};
  // complete activity? (contiguous cumulative times from the start, or a labelled list from warm-up to cool-down)
  let tot=null;
  if(L[0].cum!=null){const ok=L.every((r,i)=>i===0?Math.abs(r.cum-r.time)<2:Math.abs(r.cum-r.time-L[i-1].cum)<2);if(ok&&L.every(r=>r.dist))tot={mov:Math.round(L[L.length-1].cum),km:Math.round(L.reduce((a,r)=>a+r.dist,0)*100)/100}}
  if(!tot&&L[0].cum==null&&L[0].type==='warm'&&L[L.length-1].type==='cool'&&L.every(r=>r.dist&&r.time))tot={mov:Math.round(L.reduce((a,r)=>a+r.time,0)),km:Math.round(L.reduce((a,r)=>a+r.dist,0)*100)/100};
  if(tot){const hs=L.filter(r=>r.hr);if(hs.length===L.length)tot.hr=wavg(L,'hr');if(L.every(r=>r.hrMax)||L.filter(r=>r.type==='work').length&&L.filter(r=>r.type==='work').every(r=>r.hrMax))tot.hrMax=Math.max(...L.map(r=>r.hrMax||0))}
  return{iv,tot,laps:L}}
function parseShot(text,ref){
  // «8. 54 km»: OCR space after the decimal point of a big number
  const lines=text.replace(/[|¦]/g,' ').replace(/(\d)[.,] (\d{2})(?= ?(?:km|mi)\b)/g,'$1.$2').split(/\n/).map(l=>l.replace(/\s+/g,' ').trim()).filter(Boolean);
  const F={},hdrI=shotLaps(lines).length>=2?lines.findIndex(l=>lapHeader(l)):-1;
  // label lines: pair labels with values in the same line or a neighbouring line (two-column layouts pair by order)
  lines.forEach((ln,i)=>{
    if(hdrI>=0&&i>=hdrI)return; // inside a lap table: column labels and lap values are not totals of the run
    let rest=ln;const labs=[];
    for(const[k,re]of SHOT_LAB){const m=rest.match(re);if(m){labs.push({k,i:m.index});rest=rest.slice(0,m.index)+' '.repeat(m[0].length)+rest.slice(m.index+m[0].length)}}
    if(!labs.length)return;labs.sort((a,b)=>a.i-b.i);
    const skip=SHOT_SKIP.test(ln)&&labs.length===1&&labs[0].k!=='hrMax';if(skip||lapHeader(ln))return;
    // table header (e.g. «Runde Distanz Zeit Pace HF») or a zone list: the values below belong to single laps, not to the whole run
    if(SHOT_NOTOT.test(ln)||(labs.length>=2&&/^\d{1,2}\b/.test(lines[i+1]||'')&&/^\d{1,2}\b/.test(lines[i+2]||'')))return;
    const same=shotTokens(rest);
    const cands=[same,shotTokens(lines[i-1]||''),shotTokens(lines[i+1]||'')];
    labs.forEach((lb,li)=>{if(F[lb.k]!=null)return;
      for(const toks of cands){if(!toks.length)continue;
        const byUnit={gain:'m',hr:'bpm',hrMax:'bpm',dist:'km',speed:'kmh'}[lb.k],pick=toks.length===labs.length?[toks[li]]:labs.length===1?toks:byUnit?toks.filter(t=>t.k===byUnit):[];
        for(const tk of pick){const v=shotFit(lb.k,tk);if(v!=null){F[lb.k]=v;return}}}});
  });
  const LAPS=shotLaps(lines),lapTot=LAPS.find(r=>r.total),lapTy=new Set(LAPS.filter(r=>!r.total).map(r=>r.type).filter(Boolean));
  // a labelled «all sections» list with a total row: that total is the whole activity
  const allTot=lapTot&&(lapTy.has('warm')||lapTy.has('cool'))&&lapTy.size>=2;
  if(allTot){if(F.dist==null&&lapTot.dist)F.dist=lapTot.dist;if(F.time==null&&F.mov==null)F.time=lapTot.time;if(F.hr==null&&lapTot.hr)F.hr=lapTot.hr}
  const LA=LAPS.length>=2?lapAnalysis([LAPS]):null;
  // splits / laps: rows starting with a lap number and containing a pace (not when the lap table already gave the intervals)
  const rows=[];let want=1;if(LA)want=1e9;const kmRows=lines.some(l=>/^\s*km\s+(tempo|pace|zeit|time)\b/i.test(l)),elCol=lines.some(l=>/\b(anstieg|h[öo]he\w*|elev\w*|aufstieg|gain)\b/i.test(l)&&/\b(hf|puls|bpm|herz\w*|hr|heart)\b/i.test(l));
  lines.forEach(ln=>{const m=ln.match(/^(\d{1,2})\b\s*(.*)$/);if(!m)return;const n=+m[1];if(n!==want&&!(n===want+1&&rows.length))return;
    const tx=kmRows&&/^\d[0-5]\d\b/.test(m[2])?m[2].replace(/^(\d)([0-5]\d)\b/,'$1:$2'):m[2]; // «459» = 4:59 when the colon was lost
    const tk=shotTokens(tx);const tms=tk.filter(t=>t.k==='t'||t.k==='ms'||t.k==='p');if(!tms.length)return;
    const kmT=tk.find(t=>(t.k==='km'||(t.k==='n'&&/[.,]\d/.test(t.raw)))&&t.v>0&&t.v<=50);const hrT=tk.filter(t=>t.k==='bpm'||(t.k==='n'&&!/[.,]/.test(t.raw)&&t.v>=60&&t.v<=220)).pop();
    let p=tk.find(t=>t.k==='p'),tt=null;
    if(p&&tms.length>1)tt=tms.find(t=>t!==p&&t.i<p.i)||null;
    if(!p){if(tms.length>=2){tt=tms[0];p=tms[1]}else if(kmT&&tms[0].v>kmT.v*240*1.5){tt=tms[0]}else p=tms[0]}
    let pace=p?p.v:null,dist=kmT?kmT.v:kmRows?1:null,time=tt?tt.v:null;
    if(!pace&&time&&dist)pace=time/dist;if(!time&&pace&&dist)time=pace*dist;
    if(pace&&time&&dist&&Math.abs(time/dist-pace)>pace*.12)time=Math.round(pace*dist); // OCR slip in one column: trust pace × distance
    if(!(pace>=120&&pace<=900))return;
    const em=elCol&&hrT?tx.match(/(?:^|\s)([-−–]?\d{1,3})\s+\d{2,3}\s*(?:bpm)?\s*$/i):null;
    rows.push({n,pace,dist,time,hr:hrT?hrT.v:null,el:em?+em[1].replace(/[−–]/,'-'):null});want=n+1});
  let iv=null;if(LA){iv=LA.iv;if(LA.tot){if(F.dist==null)F.dist=LA.tot.km;if(F.time==null&&F.mov==null)F.time=LA.tot.mov;if(F.hr==null&&LA.tot.hr)F.hr=LA.tot.hr}}
  if(!iv&&rows.length>=6){const vs=rows.map(r=>1000/r.pace).sort((a,b)=>a-b),med=vs[Math.floor(vs.length/2)];
    const w=rows.filter(r=>1000/r.pace>med*1.12),slow=rows.filter(r=>!w.includes(r));
    const altOk=w.filter(r=>{const k=rows.indexOf(r);return!(rows[k+1]&&w.includes(rows[k+1]))}).length>=w.length-1;
    if(w.length>=3&&slow.length&&altOk&&avg(w.map(r=>1000/r.pace))>avg(slow.map(r=>1000/r.pace))*1.18){
      const tw=r=>r.time||r.pace;const wt=w.reduce((x,r)=>x+tw(r),0),pace=wt/w.reduce((x,r)=>x+tw(r)/r.pace,0);
      const hs=w.filter(r=>r.hr),hr=hs.length?Math.round(hs.reduce((x,r)=>x+r.hr*tw(r),0)/hs.reduce((x,r)=>x+tw(r),0)):null;
      const md=w.every(r=>r.dist)?avg(w.map(r=>r.dist))*1000:null,haveT=w.every(r=>r.time);
      iv={n:w.length,wt:haveT?Math.round(wt):null,pace,hr,rep:md?(md>=950?`~${fk(Math.round(md/100)/10)} km`.replace('~1 km','~1000 m'):`~${Math.round(md/50)*50} m`):haveT?`~${Math.round(wt/w.length)} s`:'?',how:'Splits'}}}
  // aerobic decoupling from splits of a continuous run: after a 10-minute warm-up, first versus second half (speed per heart beat)
  let dec=null;
  let decNote=null;
  if(!iv&&rows.length>=8&&rows.filter(r=>r.hr).length>=rows.length-1){const D0=decFrom(rows.map(r=>({t:r.time||r.pace*(r.dist||1),d:r.dist||(r.time?r.time/r.pace:1),hr:r.hr,g:null})),F.gain!=null&&F.dist?F.gain/F.dist:null);if(D0){dec=D0.dec;decNote=D0.why}}
  // fallbacks without labels
  const all=lines.flatMap(shotTokens);
  if(F.gain==null){const hm=all.find(t=>t.u==='hm'&&t.v>=0&&t.v<=6000);if(hm)F.gain=hm.v;
    else{const ar=text.match(/[↗⬈▲△⇗]\s*((?:\d{1,3}(?:['’]\d{3})+|\d{1,5}))\s*(?:m|hm)\b/i);if(ar)F.gain=shotNum(ar[1])}}
  if(F.dist==null&&rows.length>=2&&rows.every(r=>r.dist))F.dist=Math.round(rows.reduce((x,r)=>x+r.dist,0)*100)/100;
  if(F.mov==null&&F.time==null&&rows.length>=2&&rows.every(r=>r.time))F.time=Math.round(rows.reduce((x,r)=>x+r.time,0));
  if(F.dist==null&&!rows.length){const k=all.filter(t=>t.k==='km'&&t.v>=.3&&t.v<=150);if(k.length)F.dist=k[0].v}
  if(F.pace==null){const p=all.find(t=>t.k==='p'&&t.v>=120&&t.v<=900);if(p&&!rows.length)F.pace=p.v}
  if(F.mov==null&&F.time==null){const t=all.filter(t=>t.k==='t'&&t.v>=600).sort((a,b)=>b.v-a.v)[0];if(t)F.time=t.v}
  if(F.hr==null&&rows.length&&rows.every(r=>r.hr)){const tw=r=>r.time||r.pace;F.hr=Math.round(rows.reduce((x,r)=>x+r.hr*tw(r),0)/rows.reduce((x,r)=>x+tw(r),0))}
  // Garmin filter view («Abschnitttyp wählen» → Warm up / Laufen / Erholung / Cool Down): its rows are one part of the run, never the whole
  if(!allTot&&LAPS.length>=2&&/abschnit+\s*typ|step\s*type|segment\s*type/i.test(text)){F.dist=F.time=F.mov=F.hr=F.pace=null}
  if(F.gain!=null&&!/anstieg|ascent|aufstieg|h[öo]henmeter|elevation\s*gain|total\s*ascent|h[öo]hengewinn/i.test(text)&&lines.filter(l=>/^\d{2,4}$/.test(l)).length>=3)F.gain=null;
  let mov=F.mov||F.time||null,km=F.dist!=null?Math.round(F.dist*100)/100:null,pace=F.pace||null;
  let sport=sportOfText(text);if(!sport&&(F.speed>24||(mov&&km&&mov/km<150&&mov/km>=40)))sport='bike';const altS=sport&&sport!=='run';
  if(!altS&&mov&&km&&(mov/km<150||mov/km>1200))mov=null; // e.g. a lap or zone time read as total time
  if(!mov&&pace&&km)mov=Math.round(pace*km);
  if(mov&&km&&(!pace||Math.abs(pace-mov/km)>mov/km*.15))pace=mov/km;
  const lapKm=rows.length>=2&&rows.every(r=>r.dist)?Math.round(rows.reduce((x,r)=>x+r.dist,0)*100)/100:null;
  return{sport,speed:F.speed||null,date:shotDate(text,ref),km,mov,avgPace:pace,avgHr:F.hr||null,hrMax:F.hrMax&&(!F.hr||F.hrMax>=F.hr)?F.hrMax:LA&&LA.tot&&LA.tot.hrMax||null,gain:F.gain!=null?Math.round(F.gain):null,iv,dec,decNote,splits:rows.length>=3?rows.map(r=>({n:r.n,pace:r.pace,dist:r.dist||null,time:r.time||null,hr:r.hr||null,el:r.el})):null,lapKm,laps:LAPS.length>=2&&(LA||LAPS.some(r=>r.cum!=null||r.type))?LAPS:null,src:'screenshot',kw:shotKw(lines.slice(0,40).join('\n')),rows:Math.max(rows.length,LAPS.filter(r=>!r.total).length),lab:['dist','mov','time','pace','hr','gain'].filter(k=>F[k]!=null).length};
}

const isImg=f=>/^image\//.test(f.type||'')||/\.(png|jpe?g|heic|heif|webp)$/i.test(f.name||'');
// Text recognition (Tesseract.js, open source) is loaded only when a screenshot is imported; the image itself stays on the device
const TESS_MODE='cdn'; // the GitHub build switches this to 'local' (files in vendor/, no third-party server)
const absU=p=>new URL(p,location.href).href;
let TESS=TESS_MODE==='local'?absU('vendor/tesseract/'):'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/';
let TESS_CORE=TESS_MODE==='local'?absU('vendor/tesseract'):'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1';
let TESS_LANG=TESS_MODE==='local'?absU('vendor/tessdata'):null;
// the files may also have landed elsewhere when uploading (e.g. all in the main folder): look for them
let tessFound=false;
async function tessLocate(){
  if(TESS_MODE!=='local'||tessFound)return;
  const has=async f=>{try{const r=await fetch(absU(f),{method:'HEAD',cache:'no-store'});return r.ok}catch(e){return false}};
  for(const d of['vendor/tesseract/','vendor/','tesseract/','']){if(await has(d+'tesseract.min.js')){TESS=absU(d||'./');TESS_CORE=absU(d||'./').replace(/\/$/,'');break}}
  for(const d of['vendor/tessdata/','vendor/','tessdata/','']){if(await has(d+'deu.traineddata.gz')){TESS_LANG=absU(d||'./').replace(/\/$/,'');break}}
  tessFound=true;
}
let tessP=null;
function loadTess(){if(window.Tesseract)return Promise.resolve(window.Tesseract);
  if(!tessP)tessP=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src=TESS+'tesseract.min.js';sc.onload=()=>window.Tesseract?res(window.Tesseract):rej(new Error('x'));sc.onerror=()=>rej(new Error('x'));document.head.appendChild(sc)})
    .catch(()=>{tessP=null;throw new Error('Skript tesseract.min.js nicht geladen')});
  return tessP}
async function prepImg(file){
  const url=URL.createObjectURL(file);
  try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Das Bild konnte nicht geöffnet werden. Möglich sind PNG und JPG.'));i.src=url});
    let w=img.naturalWidth,h=img.naturalHeight;const sc=w<1100?Math.min(3,1400/w):w>2200?2200/w:1;w=Math.round(w*sc);h=Math.round(h*sc);
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(img,0,0,w,h);
    const d=x.getImageData(0,0,w,h),p=d.data;let sum=0;
    {let ls=0,ln=0;for(let i=0;i<p.length;i+=16){const a=Math.max(p[i],p[i+1],p[i+2]),b=Math.min(p[i],p[i+1],p[i+2]);if(a-b<40){ls+=a;ln++}}const bg=ln&&ls/ln<128?0:255,minRun=Math.round(30*Math.max(1,w/1170));
      for(let y=0;y<h;y++){let run=0;for(let xx=0;xx<=w;xx++){const i=(y*w+xx)*4,sat=xx<w&&Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2])>60;
        if(sat)run++;else{if(run>=minRun)for(let k=xx-run;k<xx;k++){const j=(y*w+k)*4;p[j]=p[j+1]=p[j+2]=bg}run=0}}}}
    for(let i=0;i<p.length;i+=4){const g=.299*p[i]+.587*p[i+1]+.114*p[i+2];p[i]=p[i+1]=p[i+2]=g;sum+=g}
    if(sum/(p.length/4)<128)for(let i=0;i<p.length;i+=4)p[i]=p[i+1]=p[i+2]=255-p[i]; // dark mode screenshots: invert
    x.putImageData(d,0,0);return cv}
  finally{URL.revokeObjectURL(url)}}
function busyTxt(t){const el=$('#busyTxt');if(el)el.textContent=t}

// how the watch file gets onto the phone: iPhone has no «Share → web app», so the file goes via «Files»; Android can share directly
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
function fileHowHTML(){const ios=isIOS(),and=/Android/i.test(navigator.userAgent);
  const src=(n,steps,open)=>`<details class="help fsrc"${open?' open':''}><summary>${n}</summary><ol class="fsteps">${steps.map(x=>`<li>${x}</li>`).join('')}</ol></details>`;
  const pick=T('Hier auf <b>«Datei»</b> tippen → <b>Durchsuchen → Downloads</b> → Datei wählen. ZIP geht auch, die App entpackt sie selbst.','Tap <b>«File»</b> here → <b>Browse → Downloads</b> → choose the file. ZIP works too, the app unpacks it.');
  const iosL=[src('Garmin',[T('In Safari <b>connect.garmin.com</b> öffnen und anmelden (nicht in der Garmin-App).','Open <b>connect.garmin.com</b> in Safari and sign in (not in the Garmin app).'),T('Aktivität öffnen → Zahnrad oben rechts → <b>«Original exportieren»</b>.','Open the activity → gear icon top right → <b>«Export Original»</b>.'),T('Die ZIP-Datei landet in <b>Dateien → Downloads</b>.','The ZIP file lands in <b>Files → Downloads</b>.'),pick],true),
    src('Strava',[T('In Safari <b>strava.com</b> öffnen; falls die App aufgeht: «aA» → <b>Desktop-Website anfordern</b>.','Open <b>strava.com</b> in Safari; if the app opens: «aA» → <b>Request desktop website</b>.'),T('Aktivität öffnen → <b>«…»</b> → <b>«Original exportieren»</b> (oder «GPX exportieren»).','Open the activity → <b>«…»</b> → <b>«Export Original»</b> (or «Export GPX»).'),pick]),
    src('Polar',[T('In Safari <b>flow.polar.com</b> öffnen, Training wählen.','Open <b>flow.polar.com</b> in Safari, choose the session.'),T('Zahnrad bzw. <b>«Exportieren»</b> → FIT, TCX oder GPX.','Gear icon or <b>«Export»</b> → FIT, TCX or GPX.'),pick]),
    src('Coros, Suunto & Co.',[T('In der App beim Training <b>«Teilen»</b> bzw. <b>«Exportieren»</b> wählen (FIT, falls möglich).','In the app choose <b>«Share»</b> or <b>«Export»</b> on the workout (FIT if available).'),T('Im Teilen-Menü <b>«In Dateien sichern»</b> → Downloads.','In the share sheet <b>«Save to Files»</b> → Downloads.'),pick]),
    src('Apple Watch',[T('Apple Fitness kann keine Datei exportieren. Am einfachsten: <b>Screenshot</b> der Übersicht und der Runden.','Apple Fitness cannot export a file. Easiest: a <b>screenshot</b> of the summary and laps.'),T('Wer es genau will: Drittanbieter-Apps wie HealthFit exportieren das Training als FIT-Datei «In Dateien».','For full detail: third-party apps such as HealthFit export the workout as a FIT file to «Files».')])];
  const andL=[src(T('Direkt teilen','Share directly'),[T('Tempomacher einmal auf den Startbildschirm legen (Browser-Menü → «App installieren»).','Add Tempomacher to the home screen once (browser menu → «Install app»).'),T('In Garmin Connect, Strava, Polar, Coros usw. beim Training <b>«Teilen»</b> bzw. <b>«Exportieren»</b> → <b>Tempomacher</b>.','In Garmin Connect, Strava, Polar, Coros etc. choose <b>«Share»</b> or <b>«Export»</b> on the workout → <b>Tempomacher</b>.'),T('Die App öffnet sich und übernimmt die Datei.','The app opens and takes the file.')],true),
    src(T('Ohne Teilen','Without sharing'),[T('Datei exportieren (Garmin: connect.garmin.com → Zahnrad → «Original exportieren»).','Export the file (Garmin: connect.garmin.com → gear → «Export Original»).'),T('Hier auf «Datei» tippen → Downloads → Datei wählen.','Tap «File» here → Downloads → choose the file.')])];
  return`<div class="label">${T('Datei importieren','Import file')}</div><h2 class="d" style="font-size:22px;margin:4px 0 6px">${ios?T('So kommt die Datei aufs iPhone','How the file gets onto your iPhone'):and?T('So kommt die Datei in die App','How the file gets into the app'):T('So kommt die Datei in die App','How the file gets into the app')}</h2>
    <p class="muted" style="margin:0 0 12px;font-size:14px">${T('Eine FIT-Datei enthält alles auf einmal: Runden, Kilometer-Splits, Puls und Höhenmeter. Möglich sind FIT, GPX, TCX und ZIP.','A FIT file contains everything at once: laps, km splits, heart rate and climbing. FIT, GPX, TCX and ZIP work.')}</p>
    <div class="stack" style="gap:8px">${(ios?iosL:and?andL:iosL).join('')}</div>
    ${ios?`<p class="hint" style="margin:10px 0 0">${T('Das Teilen-Menü direkt in eine Web-App unterstützt das iPhone leider nicht; der Umweg über «Dateien» ist einmal eingerichtet in einer halben Minute gemacht.','Unfortunately the iPhone does not support sharing straight into a web app; the detour via «Files» takes half a minute once you know it.')}</p>`:''}
    <div class="row" style="justify-content:flex-end;margin-top:14px;gap:8px"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="fileGo">${T('Datei auswählen','Choose file')}</button></div>`}
// which screenshots a session needs: a short checklist per session type with a schematic example of each screen,
// the fields that must be visible are marked (no real app screenshots, generic layout of every watch app)
function shotNeeds(pl){const ty=pl&&pl.type!=='rest'&&pl.type!=='alt'?rtOfPlan(pl.type):null,n=['sum'];
  if(ty==='hills')n.push('lapsG');else if(ty&&IVT.has(ty)||pl&&pl.interval)n.push('laps');
  if(ty==='mptest'||ty==='long'&&(pl.km||0)>15)n.push('splits');return{ty,n}}
const SHOTL=()=>({sum:T('Übersicht','Summary'),laps:T('Runden','Laps'),lapsG:T('Runden mit Anstieg','Laps with ascent'),splits:T('Kilometer-Splits','Km splits')});
function shotEx(k){const W=150,hl='var(--hot)',row=(y,l,v,h)=>`<g>${h?`<rect x="10" y="${y-13}" width="${W-20}" height="19" rx="5" fill="none" stroke="${hl}" stroke-width="2"/>`:''}<text x="16" y="${y}" font-size="9.5" fill="var(--muted)">${l}</text><text x="${W-16}" y="${y}" font-size="10" font-weight="700" fill="var(--ink)" text-anchor="end">${v}</text></g>`;
  const frame=(h,body)=>`<svg class="shex" viewBox="0 0 ${W} ${h}" role="img" aria-label="${T('Beispiel','Example')}"><rect x="1" y="1" width="${W-2}" height="${h-2}" rx="14" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/><rect x="${W/2-18}" y="7" width="36" height="4" rx="2" fill="var(--line)"/>${body}</svg>`;
  if(k==='sum')return frame(168,`<text x="16" y="32" font-size="10.5" font-weight="800" fill="var(--ink)">${T('Lauf · 14. Nov.','Run · 14 Nov')}</text>`+[[T('Distanz','Distance'),'10.02 km'],[T('Zeit','Time'),'58:41'],[T('Ø Pace','Avg pace'),'5:51 /km'],[T('Ø Herzfreq.','Avg HR'),'148'],[T('Max. Herzfreq.','Max HR'),'163'],[T('Anstieg','Ascent'),'86 m']].map((r,i)=>row(54+i*19,r[0],r[1],true)).join(''));
  const tab=(cols,rows,hlc)=>{const cw=(W-24)/cols.length;return cols.map((c,i)=>`<text x="${12+cw*i+cw/2}" y="34" font-size="8.5" font-weight="700" fill="var(--muted)" text-anchor="middle">${c}</text>`).join('')+rows.map((r,j)=>r.map((v,i)=>`<text x="${12+cw*i+cw/2}" y="${52+j*16}" font-size="8.2" fill="var(--ink)" text-anchor="middle" ${j%2?'':'font-weight="600"'}>${v}</text>`).join('')).join('')+hlc.map(i=>`<rect x="${12+cw*i+1}" y="22" width="${cw-2}" height="${18+rows.length*16}" rx="5" fill="none" stroke="${hl}" stroke-width="2"/>`).join('')};
  if(k==='laps')return frame(140,tab(['#',T('Zeit','Time'),'km','Pace','Ø HF'],[[1,'10:00','1.70','5:53','138'],[2,'4:00','1.00','4:00','171'],[3,'2:00','0.30','6:40','150'],[4,'4:00','1.01','3:58','174'],[5,'2:00','0.29','6:52','152']],[1,2,3,4]));
  if(k==='lapsG')return frame(140,tab(['#',T('Zeit','Time'),'km','Ø HF',T('Anst.','Asc.')],[[1,'10:00','1.70','138','12'],[2,'1:00','0.22','168','18'],[3,'1:30','0.20','146','0'],[4,'1:00','0.21','172','17'],[5,'1:30','0.19','148','0']],[1,2,3,4]));
  if(k==='splits')return frame(140,tab(['km','Pace','Ø HF'],[[1,'6:02','139'],[2,'5:58','141'],[3,'5:57','143'],['…','…','…'],[18,'5:55','152']],[1,2]));
  return''}
function shotHelpHTML(){
  const d=ui.impFor,pl=d?planSession(d):null,{ty,n}=shotNeeds(pl),L=SHOTL();
  const info={sum:[T('Immer nötig: daraus kommen Distanz, Zeit, Pace, Puls und Höhenmeter.','Always needed: distance, time, pace, heart rate and climbing come from it.'),[T('Distanz und Zeit','Distance and time'),T('Ø Pace','Avg. pace'),T('Ø und max. Puls','Avg. and max heart rate'),T('Anstieg (Höhenmeter)','Ascent')]],
    laps:[T('Für Intervalle: Ich werte nur die Belastungen aus, die Pausen erkenne ich selbst.','For intervals: I rate only the work reps and detect the recoveries myself.'),[T('Alle Runden, auch Einlaufen und Pausen','All laps, including warm-up and recoveries'),T('Zeit und Distanz je Runde','Time and distance per lap'),T('Pace und Ø Puls je Runde','Pace and avg. heart rate per lap')]],
    lapsG:[T('Für Bergläufe: Die Spalte «Anstieg» zeigt, ob die Steigung gereicht hat.','For hill reps: the «Ascent» column shows whether the climb was steep enough.'),[T('Alle Runden mit Zeit und Distanz','All laps with time and distance'),T('Ø Puls je Runde','Avg. heart rate per lap'),T('Spalte «Anstieg» (in Garmin nach rechts wischen)','The «Ascent» column (swipe right in Garmin)')]],
    splits:[T('Für lange Läufe und Renntempo-Tests: daraus berechne ich, ob der Puls in der zweiten Hälfte stabil bleibt.','For long runs and race-pace tests: shows whether heart rate stays stable in the second half.'),[T('Pace und Ø Puls jedes Kilometers','Pace and avg. heart rate of every km'),T('Bis zum letzten Kilometer, ggf. mehrere Bilder','Down to the last km, several images if needed')]]};
  const step=(k,i)=>`<div class="shs2"><div class="shs2-t"><span class="shs-n">${i+1}</span><b>${L[k]}</b></div><div class="shs2-b">${shotEx(k)}<div><p>${info[k][0]}</p><ul class="chk">${info[k][1].map(x=>`<li>${x}</li>`).join('')}</ul></div></div></div>`;
  const other=['sum','laps','lapsG','splits'].filter(k=>!n.includes(k)&&!(k==='lapsG'&&n.includes('laps'))&&!(k==='laps'&&n.includes('lapsG')));
  return`<div class="label">${pl&&ty?esc(pl.title)+' · '+fdate(d):T('Screenshot hochladen','Upload screenshot')}</div><h2 class="d" style="font-size:22px;margin:4px 0 6px">${n.length===1?T('Dafür brauche ich 1 Screenshot','I need 1 screenshot for this'):T(`Dafür brauche ich ${n.length} Screenshots`,`I need ${n.length} screenshots for this`)}</h2>
    <p class="muted" style="margin:0 0 12px;font-size:14px">${T('Rot markiert ist, was im Bild zu sehen sein muss. Alle Bilder einer Aktivität auf einmal auswählen.','Marked in red is what must be visible. Select all images of one activity at once.')}</p>
    <div class="stack" style="gap:10px">${n.map(step).join('')}</div>
    ${other.length?`<details class="help" style="margin-top:10px"><summary>${T('Andere Einheiten','Other sessions')}</summary><div class="stack" style="gap:10px;margin-top:8px">${other.map((k,i)=>step(k,n.length+i)).join('')}</div></details>`:''}
    <ul class="notes" style="margin:12px 0 0;font-size:13.5px"><li>${T('Hell oder dunkel ist egal; Karten und Diagramme braucht es nicht.','Light or dark does not matter; maps and charts are not needed.')}</li><li>${T('Noch einfacher: Die FIT-Datei der Uhr (Knopf «Datei») enthält alles auf einmal.','Even easier: the FIT file from your watch (button «File») contains everything at once.')}</li></ul>
    <details class="help" style="margin-top:10px"><summary>${T('Wo finde ich das?','Where do I find this?')}</summary><ul class="notes"><li><b>Garmin Connect</b>: ${T('Aktivität → Übersicht bzw. «Statistiken»; Reiter «Runden» oder «Splits»','activity → overview or «Stats»; tab «Laps» or «Splits»')}</li><li><b>Strava</b>: ${T('Aktivität → nach unten zu «Splits» bzw. «Runden»','activity → scroll down to «Splits» or «Laps»')}</li><li><b>Apple Fitness</b>: ${T('Training öffnen → «Segmente» bzw. bei Trainings mit Ablauf «Intervalle»','open the workout → «Segments» or, for custom workouts, «Intervals»')}</li><li><b>Polar Flow</b>: ${T('Training → «Phasen» bzw. «Runden»','session → «Phases» or «Laps»')}</li><li><b>Suunto</b>: ${T('Aktivität → «Runden» bzw. «Intervalle»','activity → «Laps» or «Intervals»')}</li><li><b>Coros</b>: ${T('Aktivität → «Runden»','activity → «Laps»')}</li></ul></details>
    <div class="row" style="justify-content:flex-end;margin-top:14px;align-items:center"><span class="row" style="gap:8px"><button class="btn ghost" data-act="closeSheet">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="shotGo">${T('Screenshots auswählen','Choose screenshots')}</button></span></div>`;
}
// find out why text recognition could not start, so the message says what to fix
async function tessDiag(e){
  if(TESS_MODE==='local'){
    const files=['vendor/tesseract/tesseract.min.js','vendor/tesseract/worker.min.js','vendor/tesseract/tesseract-core-simd-lstm.wasm.js','vendor/tesseract/tesseract-core-lstm.wasm.js','vendor/tessdata/deu.traineddata.gz','vendor/tessdata/eng.traineddata.gz'];
    const miss=[];let net=false;
    const loc=f=>(/traineddata/.test(f)?TESS_LANG+'/':TESS)+f.split('/').pop();
    for(const f of files){try{const r=await fetch(loc(f),{method:'HEAD',cache:'no-store'});if(!r.ok)miss.push(f.split('/').pop()+' ('+r.status+')')}catch(x){net=true}}
    if(net&&!navigator.onLine)return T('Keine Internetverbindung. Beim ersten Screenshot-Import muss die Texterkennung einmal geladen werden.','No internet connection. Text recognition has to be loaded once for the first screenshot import.');
    if(miss.length)return T(`Auf der Webseite fehlen Dateien der Texterkennung: ${miss.join(', ')}. Bitte auf GitHub den Ordner «vendor» mit den Unterordnern «tesseract» und «tessdata» hochladen (im Hauptordner, neben index.html).`,`Text recognition files are missing on the website: ${miss.join(', ')}. Please upload the folder «vendor» with the subfolders «tesseract» and «tessdata» to GitHub (in the main folder, next to index.html).`);
  }
  const m=String((e&&(e.message||e))||'').slice(0,160);
  return T('Die Texterkennung konnte auf diesem Gerät nicht gestartet werden. Bitte den Browser aktualisieren oder die Werte von Hand eintragen.','Text recognition could not be started on this device. Please update the browser or enter the values manually.')+(m?T(' Technische Meldung: ',' Technical message: ')+m:'');
}
async function readShots(files){
  busyTxt('Texterkennung wird geladen …');
  await tessLocate();let Tz;try{Tz=await loadTess()}catch(e){throw new Error(await tessDiag(e))}let w,cur=0;
  const within=(pr,ms)=>Promise.race([pr,new Promise((_,rej)=>setTimeout(()=>rej(new Error('Zeitüberschreitung beim Laden')),ms))]);
  try{w=await within(Tz.createWorker(['deu','eng'],1,{workerPath:TESS+'worker.min.js',corePath:TESS_CORE,...(TESS_LANG?{langPath:TESS_LANG,workerBlobURL:false}:{}),
    logger:m=>{if(m.status==='recognizing text')busyTxt(`Screenshot ${cur+1} von ${files.length} wird gelesen … ${Math.round(m.progress*100)} %`);else if(/load|initializ/.test(m.status||''))busyTxt('Texterkennung wird vorbereitet …')},errorHandler:()=>{}}),120000)}
  catch(e){throw new Error(await tessDiag(e))}
  const texts=[];
  try{for(cur=0;cur<files.length;cur++){const cv=await prepImg(files[cur]);const r=await w.recognize(cv);texts.push(r.data.text)}}
  finally{w.terminate()}
  const rs=texts.map(t=>parseShot(t,today()));
  if(rs.length>=2&&!ui.altPick){const sums=rs.filter(r=>r.date&&r.km&&(r.mov||r.avgPace)&&r.rows<3),dates=[...new Set(sums.map(r=>r.date))].sort();
    if(dates.length>=2){const out=dates.map(d=>{const g=rs.filter(r=>r.date===d),m=mergeShots(g);m.dateFound=true;m.shots=g.length;m.miss=[!m.avgHr&&'Puls',m.gain==null&&'Anstieg'].filter(Boolean);return m});
      return{batch:out,lost:rs.filter(r=>!r.date).length}}}
  const a=mergeShots(rs);
  if((a.sport&&a.sport!=='run')||ui.altPick){if(!a.mov&&a.km&&a.speed)a.mov=Math.round(a.km/a.speed*3600);if(!a.mov&&!a.km)throw new Error(T('Im Screenshot wurden weder Dauer noch Distanz erkannt. Am besten die Übersicht der Aktivität verwenden oder die Werte von Hand eintragen.','Neither duration nor distance was found in the screenshot. Use the activity summary or enter the values manually.'))}
  else if((!a.km||!(a.mov||a.avgPace))&&a.iv)throw new Error(T(`Die Intervalle wurden erkannt (${a.iv.n} × ${a.iv.rep}), aber nicht der ganze Lauf. Bitte zusätzlich die Übersicht der Aktivität (Distanz, Zeit, Ø Puls) hochladen, oder alle Abschnitte: «Alle» bzw. Warm up, Laufen, Erholung und Cool Down.`,`The intervals were recognised (${a.iv.n} × ${a.iv.rep}), but not the whole run. Please also upload the activity summary (distance, time, avg. heart rate), or all sections: «All» or warm-up, run, recovery and cool-down.`));
  else if(!a.km||!(a.mov||a.avgPace))throw new Error('In den Screenshots wurden keine vollständigen Laufdaten erkannt. Nötig sind mindestens Distanz und Zeit oder Pace. Am besten die Übersicht der Aktivität mit gut lesbaren Zahlen verwenden, oder die Werte von Hand eintragen.');
  a.dateFound=!!a.date;if(!a.date)a.date=ui.impFor&&ui.impFor<=today()?ui.impFor:today();
  a.shots=files.length;a.miss=[!a.avgHr&&'Puls',a.gain==null&&'Anstieg'].filter(Boolean);
  return a}
async function readActivity(file){
  let name=file.name||'',buf=await file.arrayBuffer();
  if(/\.zip$/i.test(name)||new Uint8Array(buf.slice(0,2))[0]===0x50&&new Uint8Array(buf.slice(0,2))[1]===0x4b){const z=await unzipFirst(buf);name=z.name;buf=z.buf}
  let raw,src;
  if(/\.fit$/i.test(name)||String.fromCharCode(...new Uint8Array(buf.slice(8,12)))==='.FIT'){raw=parseFIT(buf);src='fit'}
  else{const text=new TextDecoder().decode(buf);if(/<gpx[\s>]/i.test(text)){raw=parseGPX(text);src='gpx'}else if(/TrainingCenterDatabase/i.test(text)){raw=parseTCX(text);src='tcx'}
    else throw new Error('Dieses Dateiformat wird nicht erkannt. Möglich sind FIT, GPX, TCX oder die ZIP-Datei von Garmin.')}
  if(raw.sport&&raw.sport!=='run'){const a=altSummary(raw);a.src=src;return a}
  const a=analyzeActivity(raw);a.src=src;Object.defineProperty(a,'raw',{value:raw,enumerable:false});return a;
}
// other sports: totals only (date, distance, moving time, avg heart rate, climbing)
function altSummary(raw){const R=raw.recs.filter(r=>isFinite(r.t)).sort((a,b)=>a.t-b.t),tt=raw.total;
  const t0=R.length?R[0].t:tt.start;if(!t0)throw new Error(T('Die Datei enthält kein Datum.','The file contains no date.'));
  const T1=R.length?R[R.length-1].t-t0:null,mov=Math.round(tt.tt||T1||0);
  let dist=tt.dist;if(dist==null&&R.length){const ds=R.map(r=>r.d).filter(x=>x!=null);if(ds.length)dist=ds[ds.length-1]-ds[0]}
  const hs=R.map(r=>r.hr).filter(Boolean),hr=tt.hr||(hs.length?Math.round(hs.reduce((a,b)=>a+b,0)/hs.length):null);
  let gain=tt.asc;if(gain==null){gain=0;let an=null;R.forEach(r=>{if(r.alt==null)return;if(an==null){an=r.alt;return}if(r.alt-an>3){gain+=r.alt-an;an=r.alt}else if(an-r.alt>3)an=r.alt})}
  return{sport:raw.sport,date:iso(new Date(t0*1000)),km:dist?Math.round(dist/10)/100:null,mov,avgHr:hr,gain:Math.round(gain||0),speed:dist&&mov?Math.round(dist/mov*36)/10:null}}
// Turn raw samples into totals, detect interval structure and compute decoupling
function analyzeActivity(raw){
  let R=raw.recs.filter(r=>isFinite(r.t)).sort((a,b)=>a.t-b.t);
  if(R.length<10)throw new Error('Die Datei enthält zu wenige Messpunkte.');
  let last=0;R.forEach(r=>{if(r.d==null||r.d<last)r.d=last;last=r.d});
  const t0=R[0].t,T=Math.floor(R[R.length-1].t-t0);if(T<120)throw new Error('Die Aktivität ist kürzer als 2 Minuten.');
  const D=new Float64Array(T+1),HR=new Float32Array(T+1),ALT=new Float32Array(T+1);let j=0,lastHr=0,lastAlt=NaN;
  for(let s=0;s<=T;s++){const ts=t0+s;while(j<R.length-2&&R[j+1].t<=ts)j++;const a=R[j],b=R[Math.min(j+1,R.length-1)],f=b.t>a.t?clamp((ts-a.t)/(b.t-a.t),0,1):0;
    D[s]=a.d+(b.d-a.d)*f;if(a.hr)lastHr=a.hr;HR[s]=lastHr;if(a.alt!=null)lastAlt=a.alt;ALT[s]=lastAlt}
  const V=new Float32Array(T+1);for(let s=0;s<=T;s++){const a=Math.max(0,s-10),b=Math.min(T,s+10);V[s]=b>a?(D[b]-D[a])/(b-a):0}
  const moving=s=>s<T&&D[s+1]-D[s]>0.8;
  let mov=0,hrS=0,hrN=0;for(let s=0;s<T;s++)if(moving(s)){mov++;if(HR[s]){hrS+=HR[s];hrN++}}
  const dist=raw.total.dist||D[T]-D[0];if(dist<300)throw new Error('In der Datei ist keine Distanz gespeichert. Ist das ein Lauf auf dem Laufband ohne Fusssensor?');
  let gain=raw.total.asc;
  if(gain==null){gain=0;let anchor=null;for(let s=0;s<=T;s+=5){const al=ALT[s];if(isNaN(al))continue;if(anchor==null){anchor=al;continue}if(al-anchor>3){gain+=al-anchor;anchor=al}else if(anchor-al>3)anchor=al}}
  const hasHr=hrN>mov*.5;
  const segHr=(a,b)=>{const lag=Math.min(30,Math.round((b-a)*.4));let s1=0,n=0;for(let s=a+lag;s<b;s++)if(HR[s]){s1+=HR[s];n++}return n?s1/n:null};
  // 1) laps flagged as work/rest by the watch (structured workouts)
  let work=null,how='';
  const L=(raw.laps||[]).filter(l=>l.start&&l.tt>0&&l.dist>0).map(l=>({a:Math.max(0,Math.round(l.start-t0)),b:Math.min(T,Math.round(l.start-t0+l.tt)),v:l.dist/l.tt,int:l.int,dist:l.dist,tt:l.tt}));
  const rest=L.filter(l=>l.int===1||l.int===4),act=L.filter(l=>l.int===0||l.int===5);
  if(rest.length>=2&&act.length>=3){const rv=avg(rest.map(l=>l.v)),w=act.filter(l=>l.v>rv*1.15);if(w.length>=3){work=w;how='Runden der Uhr'}}
  // 2) manual laps that alternate fast and slow
  if(!work&&L.length>=6){const vs=L.map(l=>l.v).sort((a,b)=>a-b),med=vs[Math.floor(vs.length/2)],w=L.filter(l=>l.v>med*1.12&&l.tt>=30&&l.tt<=1200);
    const alt=w.filter((l,i)=>{const k=L.indexOf(l);return!(L[k+1]&&w.includes(L[k+1]))}).length;
    if(w.length>=3&&alt>=w.length-1){const slow=L.filter(l=>!w.includes(l));if(avg(w.map(l=>l.v))>avg(slow.map(l=>l.v))*1.18){work=w;how='Runden'}}}
  // 3) pace pattern in the samples
  if(!work){const mv=[];for(let s=0;s<=T;s++)if(V[s]>0.5)mv.push(V[s]);mv.sort((a,b)=>a-b);
    let lo=mv[Math.floor(mv.length*.25)],hi=mv[Math.floor(mv.length*.9)];
    for(let it=0;it<12;it++){const th=(lo+hi)/2;let a=0,na=0,b=0,nb=0;for(const v of mv){if(v<th){a+=v;na++}else{b+=v;nb++}}if(na)lo=a/na;if(nb)hi=b/nb}
    if(hi/lo>=1.2){const th=(lo+hi)/2,segs=[];let st=-1,gap=0;
      for(let s=0;s<=T;s++){const on=V[s]>th;if(on){if(st<0)st=s;gap=0}else if(st>=0){gap++;if(gap>12){segs.push([st,s-gap+1]);st=-1;gap=0}}}
      if(st>=0)segs.push([st,T]);
      const w=segs.filter(([a,b])=>b-a>=40).map(([a,b])=>({a,b,dist:D[b]-D[a],tt:b-a}));
      const wt=w.reduce((x,l)=>x+l.tt,0);
      if(w.length>=3&&wt>=240&&wt<mov*.75&&Math.max(...w.map(l=>l.tt))<mov*.45){
        const gaps=w.slice(1).map((l,i)=>{const a=w[i].b,b=l.a;return b>a?(D[b]-D[a])/(b-a):0}),wv=wt?w.reduce((x,l)=>x+l.dist,0)/wt:0;
        if(avg(gaps)<wv*.9){work=w;how='Tempowechsel'}}
      if(!work){const B=longBlocks(segs,D,ALT,T,moving,mov);if(B){work=B;how='Tempoblock'}}}}
  let iv=null;
  if(work){const wd=work.reduce((x,l)=>x+(l.dist!=null?l.dist:D[l.b]-D[l.a]),0),wt=work.reduce((x,l)=>x+(l.tt||l.b-l.a),0);
    let hs=0,ht=0;work.forEach(l=>{const h1=segHr(l.a,l.b);if(h1){hs+=h1*(l.b-l.a);ht+=l.b-l.a}});
    const md=wd/work.length,mt=wt/work.length;
    iv={n:work.length,wt:Math.round(wt),pace:wt/wd*1000,hr:ht?Math.round(hs/ht):null,reps:work.map(l=>{const d=l.dist!=null?l.dist:D[l.b]-D[l.a],t=l.tt||l.b-l.a,h=segHr(l.a,l.b);return{t:Math.round(t),d:Math.round(d)/1000,p:d>0?Math.round(t/d*1000):null,hr:h?Math.round(h):null,s:l.a,e:l.b}}),rep:md>=350?`~${fk(Math.round(md/100)/10)} km`.replace('~1 km','~1000 m').replace(/~0[.,](\d) km/,'~$100 m'):`~${Math.round(mt)} s`,how}}
  // decoupling: continuous runs of 45 minutes or more, in 1-minute pieces of moving time, grade-adjusted from the elevation (see decFrom)
  let dec=null,decNote=null,decSeg=null,decCh=null;
  if(!iv&&hasHr&&mov>=2700){const hasAlt=ALT.some(a=>!isNaN(a)),R=[];let cur={t:0,d:0,h:0,g:0,gn:0};
    for(let s=0;s<T;s++){if(!moving(s)||!HR[s])continue;const dd=D[s+1]-D[s];cur.t++;cur.d+=dd;cur.h+=HR[s];
      if(hasAlt){const a=Math.max(0,s-15),b=Math.min(T,s+15),run=D[b]-D[a];if(run>20&&!isNaN(ALT[a])&&!isNaN(ALT[b])){cur.g+=dd*gapF((ALT[b]-ALT[a])/run*100);cur.gn+=dd}}
      if(cur.t>=60){const km=cur.d/1000;if(km>0)R.push({t:cur.t,d:km,hr:cur.h/cur.t,g:hasAlt&&cur.gn>cur.d*.8?cur.t/km/(cur.g/cur.gn):null});cur={t:0,d:0,h:0,g:0,gn:0}}}
    const D0=decFrom(R,null);if(D0){dec=D0.dec;decNote=D0.why;if(D0.seg){const t0=R.slice(0,D0.seg[0]).reduce((x,r)=>x+r.t,0),t1=R.slice(0,D0.seg[1]+1).reduce((x,r)=>x+r.t,0);decSeg=[Math.round(t0/60),Math.round(t1/60),'min']}decCh=D0.ch||null}}
  // kilometre splits (time and heart rate per km), e.g. to find a race-pace section
  const splits=[];{let s0=0;for(let k=1;k*1000<=D[T]-D[0];k++){let s=s0;while(s<T&&D[s]-D[0]<k*1000)s++;let h=0,n=0;for(let q=s0;q<s;q++)if(HR[q]){h+=HR[q];n++}splits.push({dist:1,time:s-s0,pace:s-s0,hr:n?Math.round(h/n):null});s0=s}}
  const out={date:iso(new Date(t0*1000)),km:Math.round(dist/100)/10,mov,avgPace:mov?mov/(D[T]-D[0])*1000:null,avgHr:hasHr?Math.round(raw.total.hr||hrS/hrN):null,hrMax:hasHr?(()=>{const h=R.map(r=>r.hr).filter(x=>x>40&&x<235);let mx=0;for(let i=4;i<h.length;i++){const a=(h[i]+h[i-1]+h[i-2]+h[i-3]+h[i-4])/5;if(a>mx)mx=a}return mx?Math.round(mx):null})():null,gain:Math.round(gain||0),iv,dec,decNote,decSeg,decCh,splits:splits.length>=3?splits:null};
  // per-second samples for plan-guided detection and manual marking; not enumerable, so they are never saved or synced
  Object.defineProperty(out,'ser',{value:{D,HR,ALT,V,T,mov:Uint8Array.from({length:T},(_,s)=>moving(s)?1:0),laps:L.length>=2?L.map(l=>({a:l.a,b:l.b,d:l.dist})):null},enumerable:false});
  return out
}
// longest stretch of splits close to the target pace (race-pace test section): distance, pace, heart rate and both halves
function testSeg(sp,tp){if(!sp||sp.length<3||!tp)return null;let best=null;
  for(let i=0;i<sp.length;i++){let j=i;while(j<sp.length&&sp[j].pace<=tp*1.05&&sp[j].pace>=tp*.88)j++;
    if(j>i){const seg=sp.slice(i,j),km=seg.reduce((a,r)=>a+(r.dist||1),0);if(!best||km>best.km)best={seg,km}}i=Math.max(i,j-1)}
  if(!best||best.km<2.5)return null;const S2=best.seg,tw=r=>r.time||r.pace*(r.dist||1),tt=S2.reduce((a,r)=>a+tw(r),0);
  const hrA=a=>{const hs=a.filter(r=>r.hr);return hs.length?Math.round(hs.reduce((x,r)=>x+r.hr*tw(r),0)/hs.reduce((x,r)=>x+tw(r),0)):null};
  const pc=a=>a.reduce((x,r)=>x+tw(r),0)/a.reduce((x,r)=>x+(r.dist||1),0),hh=Math.floor(S2.length/2),A=S2.slice(0,hh),B=S2.slice(S2.length-hh);
  return{km:Math.round(best.km*100)/100,pace:tt/best.km,hr:hrA(S2),h:A.length&&hrA(A)&&hrA(B)?[pc(A),hrA(A),pc(B),hrA(B)]:null}}
const MPB=d=>d>25?{hr:[.78,.88],rpe:6}:d>12?{hr:[.84,.91],rpe:7}:{hr:[.88,.95],rpe:8};
// verdict of a race-pace test: target pace hit? heart rate at the expected level? stable (decoupling)? controlled effort?
function mpEval(l){if(!l||!l.done||logType(l)!=='mptest'||!l.pace)return null;
  const c=ctxFor(S),r=mainRace(S),d=r?r.dist:c.d,s=l.s||{},B=MPB(d),tp=s.pace&&s.type==='mptest'?mid2(s.pace):c.pc.RP,gp=r&&r.goal?r.goal/r.dist:null,sp=l.pace;
  const dev=sp/tp-1,hp=l.hr?l.hr/c.hm:null,dec=l.dec!=null?l.dec:null,flags=[],good=[];
  if(dev>.02)flags.push(T(`Pace ${pace(sp)}, langsamer als das Zieltempo ${pace(tp)}.`,`Pace ${pace(sp)}, slower than the target ${pace(tp)}.`));
  else if(dev<-.03)flags.push(T(`Deutlich schneller als das Zieltempo (${pace(sp)} statt ${pace(tp)}). Im Rennen kostet so ein Start hinten raus.`,`Much faster than the target (${pace(sp)} instead of ${pace(tp)}). In a race such a start costs you at the end.`));
  else good.push(T(`Zieltempo getroffen (${pace(sp)}, Ziel ${pace(tp)}).`,`Target pace hit (${pace(sp)}, target ${pace(tp)}).`));
  if(hp!=null){if(hp>B.hr[1]+.01)flags.push(T(`Puls ${l.hr} ist für dieses Tempo hoch (erwartet bis etwa ${Math.round(B.hr[1]*c.hm)}).`,`Heart rate ${l.hr} is high for this pace (expected up to about ${Math.round(B.hr[1]*c.hm)}).`));
    else good.push(T(`Puls ${l.hr} im erwarteten Bereich (${Math.round(B.hr[0]*c.hm)}–${Math.round(B.hr[1]*c.hm)}).`,`Heart rate ${l.hr} in the expected range (${Math.round(B.hr[0]*c.hm)}–${Math.round(B.hr[1]*c.hm)}).`))}
  if(dec!=null){if(dec>5)flags.push(T(`Decoupling ${fk(dec)} %: Der Puls stieg in der 2. Hälfte deutlich, das Tempo ist noch nicht ökonomisch.`,`Decoupling ${fk(dec)} %: heart rate rose clearly in the second half; the pace is not yet economical.`));
    else good.push(dec<=3?T(`Decoupling ${fk(dec)} %: Puls stabil, das Tempo läuft ökonomisch.`,`Decoupling ${fk(dec)} %: heart rate stable, the pace runs economically.`):T(`Decoupling ${fk(dec)} %: noch im Rahmen.`,`Decoupling ${fk(dec)} %: still fine.`))}
  if(l.rpe){if(l.rpe>B.rpe)flags.push(T(`Anstrengung ${l.rpe}/10: für einen Renntempo-Test zu hart (gut wäre höchstens ${B.rpe}).`,`Effort ${l.rpe}/10: too hard for a race-pace test (at most ${B.rpe} would be good).`));else good.push(T(`Anstrengung ${l.rpe}/10: kontrolliert.`,`Effort ${l.rpe}/10: controlled.`))}
  const st=!flags.length?'ok':flags.length===1&&!(dec>6)&&!(dev>.04)?'tight':'off';
  let sug=null;if(st!=='ok'&&r){const add=Math.max(0,dev)+(dec!=null?Math.max(0,dec-3)*.004:0)+(hp!=null?Math.max(0,hp-B.hr[1])*.5:0)+(l.rpe?Math.max(0,l.rpe-B.rpe)*.008:0);sug=Math.round((gp||tp)*(1+Math.max(add,st==='tight'?.005:.015))*r.dist)}
  return{st,flags,good,tp,gp,sp,dec,hp,sug,miss:[!l.hr&&T('Puls','heart rate'),dec==null&&T('beide Hälften','both halves')].filter(Boolean)}}
function lastTests(r){if(!r)return[];return allRuns().filter(l=>l.done&&logType(l)==='mptest'&&l.date<=r.date&&daysBetween(l.date,r.date)<=84).map(l=>({l,e:mpEval(l)})).filter(o=>o.e)}
const elevIdx=g=>[50,100,150,200,300,500].findIndex(b=>g<b)<0?6:[50,100,150,200,300,500].findIndex(b=>g<b);
// session name in the screenshot (e.g. «Zug – Hill sprints 4x2:00», «Schwelle 3×10'») → kind of workout
const SHOT_KW=[['hills',/\b(hill\w*|hügel\w*|uphill|bergauf|bergsprint\w*|bergintervall\w*|berg-?läufe|côtes?)\b/i],['fartlek',/\b(fartlek|fahrt(en)?spiel)\b/i],['rp',/\b(renntempo\w*|race ?pace|wettkampftempo|marathon ?(pace|tempo)|marathontempo|hm-?tempo|[0-9]+ ?k ?pace)\b/i],['cruise',/\b(schwelle\w*|threshold|laktat\w*|cruise|sweet ?spot|\blt\b)/i],['tempo',/\b(tempo ?(dauer)?lauf|tempo-?run|tempodauerlauf)\b/i],['vo2',/(\bvo ?[2₂]|\bv02|\bvo2max\b|\bbahn(training)?\b|\btrack\b)/i]];
function shotKw(text){for(const[k,re]of SHOT_KW)if(re.test(text))return k;return null}
// kind of interval session from the data: name in the screenshot, climbing, pace relative to the zones; the plan only decides when the data fit it
function ivClass(a,c,pt){
  const v=a.iv,p=v.pace,pc=c.pc,kw=a.kw||null;
  const wkm=v.reps&&v.reps.length?v.reps.reduce((x,r)=>x+(r.d||0),0):v.wt&&p?v.wt/p:0;
  const hilly=!!((v.gap&&p&&p-v.gap>=12)||(v.gain!=null&&wkm>0&&v.gain/wkm>=30));
  const flat=!!((v.gap&&p&&p-v.gap<6)||(v.gain!=null&&wkm>0&&v.gain/wkm<12));
  if(hilly||(kw==='hills'||pt==='hills')&&!flat&&(kw==='hills'||!kw))return'hills';
  const one=v.n===1;
  if(kw==='tempo'||kw==='cruise')return one?'tempo':'cruise';
  if(kw==='rp')return one&&c.d>=40?'mpace':'rp';
  if(kw==='fartlek'||kw==='vo2')return kw;
  if(!p)return pt&&IVT.has(pt)&&pt!=='hills'?pt:'cruise';
  const fits={vo2:p<=pc.T*.985,cruise:p>=pc.T*.95&&p<=pc.T*1.07,rp:!!pc.RP&&Math.abs(p-pc.RP)/pc.RP<=.05,fartlek:true};
  if(pt&&fits[pt])return pt;
  if(one)return p<=pc.T*1.05?'tempo':c.d>=40&&p<=pc.M*1.04?'mpace':'easy';
  if(p<(pc.T+pc.I)/2)return'vo2';
  if(p<=pc.T*1.05)return'cruise';
  if(pc.RP&&Math.abs(p-pc.RP)/pc.RP<=.04)return'rp';
  return'fartlek';
}
function guessType(a,pl){
  const c=ctxFor(S),pt=pl&&pl.type!=='rest'&&pl.type!=='alt'?rtOfPlan(pl.type):null;
  if(a.iv)return ivClass(a,c,pt&&IVT.has(pt)?pt:null);
  if(a.kw==='tempo'&&!(pt&&!IVT.has(pt)&&pt!=='easy'&&pt!=='recovery'))return'tempo';
  if(pt&&!IVT.has(pt))return pt;
  return a.km>=15?'long':a.avgPace>c.pc.E[1]*1.05?'recovery':a.avgPace<c.pc.T*1.04?'tempo':'easy';
}
function openImport(a){ui.mk=null;ui.mkCore=null;ui.lf=lfFromImport(a,ui.impFor);ui.lfErr='';ui.lfAll=false;ui.lfSportAll=false;ui.sheet={kind:'run'};renderSheet()}
function lfFromImport(a,want){
  const ap=ui.altPick;ui.altPick=null;let L;
  if(ap){a.sport=ap.sport||(a.sport&&a.sport!=='run'?a.sport:'other');if(!a.dateFound&&ap.date&&a.src==='screenshot')a.date=ap.date;if(a.mov==null&&a.km&&a.speed)a.mov=Math.round(a.km/a.speed*3600)}
  if(a.sport&&a.sport!=='run'){const pl=planSession(a.date),logged=S.logs[a.date],can=pl&&!['rest','race'].includes(pl.type)&&!logged&&a.date>=S.plan.startMonday;
    ui.lf={mode:can?'plan':'extra',assign:can&&pl.type==='alt'?'plan':can&&ap&&ap.assign==='replace'&&ap.date===a.date?'replace':'extra',date:a.date,kind:'alt',sport:a.sport,sportTxt:'',dur:a.mov?fmtTime(a.mov).replace(/:\d\d$/,''):'',dist:a.km!=null?String(a.km):'',distm:a.km!=null?String(Math.round(a.km*1000)):'',spd:a.speed?String(a.speed):'',env:'pool',pool:25,gain:a.gain!=null?String(a.gain):'',hr:a.avgHr||'',rpe:null,imp:a,type:'easy',km:'',pace:'',elev:null,reps:'',h1p:'',h1h:'',h2p:'',h2h:''};
    L=ui.lf;if(want&&a.dateFound&&a.date!==want&&want<=today())L.dateAsk={plan:want,found:a.date};return L}
  const pl=planSession(a.date),logged=S.logs[a.date];
  const toPlan=pl&&pl.type!=='rest'&&pl.type!=='alt'&&!logged&&a.date>=S.plan.startMonday;
  if(a.ser)applyPlanFit(a,toPlan?plannedFor(a.date)||pl:null);
  const type=guessType(a,toPlan?pl:null),iv=IVT.has(type)||BLK.has(type),noWork=iv&&!a.iv;
  L={sec:a.mov?fmtTime(a.mov):'',wsec:a.iv&&a.iv.wt?fmtTime(a.iv.wt):'',mode:toPlan?'plan':'extra',assign:'plan',date:a.date,kind:'run',type,km:a.km?String(a.km):'',pace:noWork?'':(iv&&a.iv?a.iv.pace:a.avgPace)?fmtPace(iv&&a.iv?a.iv.pace:a.avgPace):'',hr:noWork?'':(iv&&a.iv?a.iv.hr:a.avgHr)||'',elev:a.gain!=null?elevIdx(a.gain):null,gain:a.gain!=null?String(a.gain):'',hrMax:a.hrMax?String(a.hrMax):'',rpe:null,dur:'',sport:'',imp:a,h1p:'',h1h:'',h2p:'',h2h:''};
  if(type==='mptest')lfPrefill(L);partsPrefill(L);
  if(want&&a.dateFound&&a.date!==want&&want<=today())L.dateAsk={plan:want,found:a.date};
  return L}
// values from the import for the chosen run type (intervals: work phases; race-pace test: the test section from the splits)
function lfPrefill(f){const a=f.imp;if(!a)return;const v=f.type,iv=IVT.has(v)||BLK.has(v),nw=iv&&!a.iv;
  if(v==='mptest'){const pl=f.mode==='plan'?plannedFor(f.date):null,tp=pl&&pl.type==='mptest'&&pl.pace?mid2(pl.pace):ctxFor(S).pc.RP,sg=testSeg(a.splits,tp);f.seg=sg;
    if(sg){f.pace=fmtPace(sg.pace);f.hr=sg.hr||'';if(sg.h){f.h1p=fmtPace(sg.h[0]);f.h1h=sg.h[1];f.h2p=fmtPace(sg.h[2]);f.h2h=sg.h[3]}}else{f.pace='';f.hr=''}return}
  f.seg=null;const pv=iv&&a.iv?a.iv.pace:a.avgPace;f.pace=nw||!pv?'':fmtPace(pv);f.hr=nw?'':(iv&&a.iv?a.iv.hr:a.avgHr)||'';if(a.hrMax&&!f.hrMax)f.hrMax=String(a.hrMax)}
const IMPORT_HELP=`<details class="help"><summary>Woher bekomme ich die Datei?</summary><ul class="notes">
  <li><b>Screenshots</b>: Bildschirmfotos der Aktivität aus Garmin Connect, Strava, Apple Fitness, Coros, Polar usw. Am besten die Übersicht (Distanz, Zeit, Pace, Puls, Anstieg) und bei Intervallen die Runden bzw. Splits; mehrere Bilder auf einmal wählen. Die Zahlen werden direkt auf dem Gerät gelesen. Werte danach kurz prüfen.</li>
  <li><b>Garmin Connect</b> (Web): Aktivität öffnen → Zahnrad oben rechts → «Original exportieren» (ZIP mit FIT-Datei, kann direkt importiert werden) oder «In GPX/TCX exportieren».</li>
  <li><b>Garmin Connect App</b>: Aktivität öffnen → ⋯ → «Exportieren», falls angeboten; sonst über die Webseite.</li>
  <li><b>Strava</b> (Web): Aktivität öffnen → ⋯ links → «Original exportieren» oder «GPX exportieren».</li>
  <li>Andere Uhren (Coros, Polar, Suunto) bieten ebenfalls FIT-, GPX- oder TCX-Export an.</li></ul></details>`.replace('</ul></details>',T('<li><b>Andere Sportarten</b> (Velo, Mountainbike, Langlauf, Schwimmen, Wandern, Hyrox …): Screenshot oder Datei genauso hochladen. Die App erkennt die Sportart und öffnet das Formular für Alternativtraining.</li>','<li><b>Other sports</b> (cycling, mountain bike, cross-country skiing, swimming, hiking, Hyrox …): upload a screenshot or file the same way. The app recognises the sport and opens the cross-training form.</li>')+'</ul></details>');

