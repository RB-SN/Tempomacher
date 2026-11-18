// ---- work phases without laps: planned session as a guide, long tempo blocks, manual marking ----
// planned work phases from the session text, e.g. «16 min am Stück», «6 × 1000 m», «3 × (5 × 400 m)», «1-2-3-2-1 km», «8 min …, dann 8 min …»
function planShape(pl){
  if(!pl||!pl.quality||pl.type==='hills'||!Array.isArray(pl.structure))return null;
  const num=x=>+String(x).replace(',','.'),u=(v,un)=>un==='min'?{t:Math.round(v*60)}:un==='s'?{t:Math.round(v)}:un==='km'?{d:Math.round(v*1000)}:{d:Math.round(v)};
  const N='(\\d+(?:[.,]\\d+)?)',U='(min|km|m|s)\\b';
  for(const raw of pl.structure){const s=String(raw).replace(/<[^>]+>/g,'');let m;
    if(/einlauf|auslauf|warm-?up|cool-?down|trabpause|gehpause|jog recovery|walk|^\s*(puls|heart rate)|steigerung|strides|lauf-abc|drills/i.test(s))continue;
    if(m=s.match(new RegExp(`(\\d+)\\s*[×x]\\s*\\(\\s*(\\d+)\\s*[×x]\\s*${N}\\s*${U}`)))return{reps:Array(+m[1]*+m[2]).fill(u(num(m[3]),m[4])),rest:true};
    if(m=s.match(new RegExp(`(\\d+)\\s*[×x]\\s*${N}\\s*${U}`)))return{reps:Array(+m[1]).fill(u(num(m[2]),m[3])),rest:+m[1]>1};
    if(m=s.match(/(\d+(?:[.,]\d+)?(?:\s*-\s*\d+(?:[.,]\d+)?)+)\s*(km|min)\b/))return{reps:m[1].split('-').map(x=>u(num(x),m[2])),rest:true};
    if((m=s.match(new RegExp(`^\\s*${N}\\s*(min|km)\\b.*?(?:dann|then)\\s+${N}\\s*(min|km)\\b`)))&&m[2]===m[4])return{reps:[u(num(m[1])+num(m[3]),m[2])],rest:false};
    if(m=s.match(new RegExp(`^\\s*${N}\\s*(min|km)\\b`)))return{reps:[u(num(m[1]),m[2])],rest:false};
  }
  return null}
// best placement of the planned reps in the samples (in order, fastest overall), dynamic programming over the start second
function fitReps(S,reps,gap){
  const{D,T}=S,K=reps.length,cache={};
  const spec=r=>{const k=r.t?'t'+r.t:'d'+r.d;if(cache[k])return cache[k];const E=new Int32Array(T+1).fill(-1),Vs=new Float32Array(T+1);
    if(r.t){for(let s=0;s+r.t<=T;s++){E[s]=s+r.t;Vs[s]=(D[s+r.t]-D[s])/r.t}}
    else{let e=0;for(let s=0;s<=T;s++){if(e<s)e=s;while(e<T&&D[e]-D[s]<r.d)e++;if(D[e]-D[s]>=r.d){E[s]=e;Vs[s]=r.d/Math.max(1,e-s)}}}
    return cache[k]={E,Vs}};
  const SP=reps.map(spec),NEG=-1e9,B=[],C=[];for(let k=0;k<=K;k++)B.push(new Float64Array(T+2).fill(k===K?0:NEG));for(let k=0;k<K;k++)C.push(new Uint8Array(T+2));
  for(let k=K-1;k>=0;k--){const{E,Vs}=SP[k],b=B[k],nx=B[k+1];
    for(let s=T;s>=0;s--){let take=NEG;if(E[s]>=0){const j=Math.min(T+1,E[s]+(k<K-1?gap:0)),r=nx[j];if(r>NEG/2)take=Vs[s]+r}
      if(take>NEG/2&&take>=b[s+1]){b[s]=take;C[k][s]=1}else b[s]=b[s+1]}}
  if(!(B[0][0]>NEG/2))return null;
  const out=[];let s=0;for(let k=0;k<K;k++){while(s<=T&&!C[k][s])s++;if(s>T)return null;const e=SP[k].E[s];out.push([s,e]);s=Math.min(T+1,e+(k<K-1?gap:0))}
  return out}
// is that a plausible work structure? faster than the rest of the run, reps similar, recoveries slower
function workOk(S,segs,rest){
  const{D,T,mov}=S,sp=([a,b])=>(D[b]-D[a])/Math.max(1,b-a),wd=segs.reduce((x,[a,b])=>x+D[b]-D[a],0),wt=segs.reduce((x,[a,b])=>x+b-a,0),wv=wd/Math.max(1,wt);
  const inW=new Uint8Array(T+1);segs.forEach(([a,b])=>{for(let s=a;s<b;s++)inW[s]=1});
  let od=0,ot=0;for(let s=0;s<T;s++)if(mov[s]&&!inW[s]){od+=D[s+1]-D[s];ot++}
  if(ot>=120&&wv<od/ot*1.08)return false;
  if(segs.length>1){const v=segs.map(sp).sort((a,b)=>a-b),md=v[Math.floor(v.length/2)];if(v[0]<md*.85)return false;
    if(rest){const g=segs.slice(1).map(([a],i)=>[segs[i][1],a]).filter(([a,b])=>b>a);if(g.filter(x=>sp(x)>wv*.93).length>Math.floor(g.length*.15))return false}}
  return true}
// work phases → the interval summary the rest of the app uses
function ivFromSegs(S,segs,how,unit,planN){
  const{D,HR}=S,hrOf=(a,b)=>{const lag=Math.min(30,Math.round((b-a)*.4));let s1=0,n=0;for(let s=a+lag;s<b;s++)if(HR[s]){s1+=HR[s];n++}return n?s1/n:null};
  const reps=segs.map(([a,b])=>{const d=D[b]-D[a],h=hrOf(a,b);return{t:b-a,d:Math.round(d)/1000,p:d>0?Math.round((b-a)/d*1000):null,hr:h?Math.round(h):null,s:a,e:b}});
  const wt=reps.reduce((x,r)=>x+r.t,0),wd=reps.reduce((x,r)=>x+r.d*1000,0);let hs=0,ht=0,hx=0;
  reps.forEach(r=>{if(r.hr){hs+=r.hr*r.t;ht+=r.t}for(let s=r.s;s<r.e;s++)if(HR[s]>hx&&HR[s]<235)hx=HR[s]});
  const md=wd/reps.length,mt=wt/reps.length;
  const rep=unit&&unit.t?(unit.t>=60?`${fk(Math.round(unit.t/6)/10)} min`:`${unit.t} s`):unit&&unit.d?(unit.d>1600?`${fk(unit.d/1000)} km`:`${unit.d} m`)
    :md>=350?`~${fk(Math.round(md/100)/10)} km`.replace('~1 km','~1000 m').replace(/~0[.,](\d) km/,'~$100 m'):`~${Math.round(mt)} s`;
  let rec=null;if(reps.length>1){const g=reps.slice(1).map((r,i)=>[reps[i].e,r.s]).filter(([a,b])=>b>a),gt=g.reduce((x,[a,b])=>x+b-a,0);let gh=0,gn=0;g.forEach(([a,b])=>{for(let s=a;s<b;s++)if(HR[s]){gh+=HR[s];gn++}});
    if(g.length)rec={n:g.length,t:Math.round(gt/g.length),hr:gn?Math.round(gh/gn):null}}
  return{n:reps.length,wt:Math.round(wt),pace:wd>0?wt/wd*1000:null,hr:ht?Math.round(hs/ht):null,hrMax:hx||null,rep,how,reps,rec,planN:planN||null}}
// the planned session as a guide: look for exactly these work phases (if fewer were run, the most that still fit)
function planFit(a,pl){
  const S=a&&a.ser,sh=S&&planShape(pl);if(!sh)return null;
  const K=sh.reps.length,movT=S.mov.reduce((x,v)=>x+v,0),same=sh.reps.every(r=>r.t===sh.reps[0].t&&r.d===sh.reps[0].d);
  for(let n=K;n>=Math.max(1,Math.ceil(K*.6));n--){const R=sh.reps.slice(0,n),need=R.reduce((x,r)=>x+(r.t||r.d/4),0);if(need>movT-60)continue;
    const segs=fitReps(S,R,sh.rest?20:0);if(segs&&workOk(S,segs,sh.rest))return ivFromSegs(S,segs,'Plan',same?sh.reps[0]:null,K)}
  return null}
// 1–2 long continuous blocks (8 min or more) found by the pace pattern: tempo run, 2 × 15 min, marathon-pace section
function longBlocks(segs,D,ALT,T,moving,mov){
  const m=[];segs.forEach(([a,b])=>{const l=m[m.length-1];if(l&&a-l[1]<=40&&b-l[0]>0)l[1]=b;else m.push([a,b])});
  const B=m.filter(([a,b])=>b-a>=480);if(!B.length||B.length>2)return null;
  const wt=B.reduce((x,[a,b])=>x+b-a,0),wd=B.reduce((x,[a,b])=>x+D[b]-D[a],0);if(wt>mov-180)return null;
  const inB=s=>B.some(([a,b])=>s>=a&&s<b);let od=0,ot=0;for(let s=0;s<T;s++)if(moving(s)&&!inB(s)){od+=D[s+1]-D[s];ot++}
  if(ot<180||wd/wt<od/ot*1.1)return null;
  if(B.some(([a,b])=>!isNaN(ALT[a])&&!isNaN(ALT[b])&&(ALT[b]-ALT[a])/Math.max(1,D[b]-D[a])<-.02))return null;
  return B.map(([a,b])=>({a,b,dist:D[b]-D[a],tt:b-a}))}
// marked range → one block, or the reps inside it when the range clearly alternates fast and slow
function markIv(S,a,b){
  const{D}=S,V=[];for(let s=a;s<=b;s++){const x=Math.max(a,s-10),y=Math.min(b,s+10);V.push(y>x?(D[y]-D[x])/(y-x):0)}
  const mv=V.filter(v=>v>.5).sort((x,y)=>x-y);let segs=[[a,b]];
  if(mv.length>60){let lo=mv[Math.floor(mv.length*.2)],hi=mv[Math.floor(mv.length*.9)];
    for(let it=0;it<12;it++){const th=(lo+hi)/2;let p=0,np=0,q=0,nq=0;for(const v of mv){if(v<th){p+=v;np++}else{q+=v;nq++}}if(np)lo=p/np;if(nq)hi=q/nq}
    if(hi/lo>=1.15){const th=(lo+hi)/2,S2=[];let st=-1,gap=0;
      V.forEach((v,i)=>{if(v>th){if(st<0)st=i;gap=0}else if(st>=0){gap++;if(gap>12){S2.push([a+st,a+i-gap+1]);st=-1;gap=0}}});if(st>=0)S2.push([a+st,b]);
      const w=S2.filter(([x,y])=>y-x>=30);if(w.length>=2&&workOk(S,w,true))segs=w}}
  return ivFromSegs(S,segs,'Markiert',null,null)}
// keep the watch's own laps; otherwise prefer the plan-guided result, else what the pace pattern gave
function applyPlanFit(a,pl){
  if(!a||!a.ser)return;
  if(!Object.prototype.hasOwnProperty.call(a,'iv0'))Object.defineProperty(a,'iv0',{value:a.iv||null,writable:true,enumerable:false});
  if(a.iv0&&/Runden/.test(a.iv0.how||'')){a.iv=a.iv0;return}
  a.iv=(pl&&planFit(a,pl))||a.iv0}
function ivHow(v){return!v?'':v.how==='Plan'?`<br><span class="hint">${v.planN&&v.planN>v.n?T(`Nach Plan gesucht: ${v.n} von ${v.planN} Belastungen gefunden.`,`Searched using the plan: ${v.n} of ${v.planN} reps found.`):T('Nach der geplanten Einheit gesucht.','Searched using the planned session.')}</span>`
  :v.how==='Markiert'?`<br><span class="hint">${T('Von dir markiert.','Marked by you.')}</span>`:''}
// ---- manual marking: pace curve, start and end sliders ----
function mkStat(S,a,b){const d=S.D[b]-S.D[a],t=b-a;let h=0,n=0;for(let s=a+Math.min(30,Math.round(t*.4));s<b;s++)if(S.HR[s]){h+=S.HR[s];n++}
  return`${fmtTime(a)}–${fmtTime(b)} · <b>${fmtTime(t)}</b> · ${fk(Math.round(d/10)/100)} km · Ø ${d>0?pace(t/d*1000):'–'}${n?T(' · Ø Puls ',' · avg. HR ')+Math.round(h/n):''}`}
function mkHTML(a){
  const S=a.ser,T0=S.T,N=Math.min(240,T0),W=300,H=84,pts=[];
  for(let i=0;i<=N;i++){const s=Math.round(i*T0/N),x=Math.max(0,s-15),y=Math.min(T0,s+15);pts.push(y>x?(S.D[y]-S.D[x])/(y-x):0)}
  const sv=pts.filter(v=>v>.5).sort((x,y)=>x-y),lo=sv.length?sv[Math.floor(sv.length*.03)]*.95:0,hi=sv.length?sv[sv.length-1]*1.02:1;
  const Y=v=>Math.round((H-4-(Math.min(hi,Math.max(lo,v))-lo)/(hi-lo||1)*(H-8))*10)/10,X=s=>Math.round(s/T0*W*10)/10;
  const path=pts.map((v,i)=>`${i?'L':'M'}${Math.round(i/N*W*10)/10},${Y(v)}`).join(''),m=ui.mk;
  const old=(a.iv&&a.iv.reps||[]).filter(r=>r.s!=null).map(r=>`<rect x="${X(r.s)}" y="0" width="${Math.max(1,X(r.e)-X(r.s))}" height="${H}" class="mkold"/>`).join('');
  return`<div class="mk"><div class="flabel">${T('Belastung markieren','Mark the work phase')}</div>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="mksvg" aria-hidden="true">${old}<rect id="mkSel" x="${X(m.a)}" y="0" width="${Math.max(1,X(m.b)-X(m.a))}" height="${H}" class="mksel"/><path d="${path}" class="mkline"/></svg>
    <div class="mkax"><span>0:00</span><span>${T('höher = schneller','higher = faster')}</span><span>${fmtTime(T0)}</span></div>
    <label class="mkr"><span>${T('Start','Start')}</span><input type="range" min="0" max="${T0}" step="5" value="${m.a}" data-mk="a" aria-label="${T('Start der Belastung','Start of the work phase')}"></label>
    <label class="mkr"><span>${T('Ende','End')}</span><input type="range" min="0" max="${T0}" step="5" value="${m.b}" data-mk="b" aria-label="${T('Ende der Belastung','End of the work phase')}"></label>
    <div id="mkInfo" class="mkinfo">${mkStat(S,m.a,m.b)}</div>
    <p class="hint" style="margin:4px 0 8px">${T('Bei Intervallen den ganzen Bereich vom ersten bis zum letzten Intervall markieren. Die einzelnen Belastungen sucht die App darin selbst.','For intervals mark everything from the first to the last rep. The app finds the single reps inside.')}</p>
    <div class="mkb"><button type="button" class="btn small primary" data-act="mkApply">${T('Übernehmen','Apply')}</button><button type="button" class="btn small ghost" data-act="mkCancel">${T('Abbrechen','Cancel')}</button>${a.iv?`<button type="button" class="btn small ghost" data-act="mkNone">${T('Kein Block','No block')}</button>`:''}</div></div>`}
function mkBtn(a){return a&&a.ser&&!ui.mk?`<button type="button" class="link" data-act="mkOpen">${a.iv?T('Belastung anpassen','Adjust work phase'):T('Belastung selbst markieren','Mark the work phase yourself')}</button>`:''}
document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.mk;if(!k||!ui.mk||!ui.lf||!ui.lf.imp||!ui.lf.imp.ser)return;
  const S=ui.lf.imp.ser,m=ui.mk;m[k]=+e.target.value;
  if(m.b-m.a<60){if(k==='a')m.b=Math.min(S.T,m.a+60);else m.a=Math.max(0,m.b-60);const o=document.querySelector(`[data-mk="${k==='a'?'b':'a'}"]`);if(o)o.value=k==='a'?m.b:m.a}
  const r=document.getElementById('mkSel');if(r){r.setAttribute('x',Math.round(m.a/S.T*3000)/10);r.setAttribute('width',Math.max(1,Math.round((m.b-m.a)/S.T*3000)/10))}
  const i=document.getElementById('mkInfo');if(i)i.innerHTML=mkStat(S,m.a,m.b)});
function mkAfter(f){const a=f.imp,pl=f.mode==='plan'?plannedFor(f.date):null;f.type=guessType(a,pl);f.wsec=a.iv&&a.iv.wt?fmtTime(a.iv.wt):'';f.reps=a.iv&&a.iv.n>1?String(a.iv.n):'';lfPrefill(f);ui.mk=null;ui.lfErr='';renderSheet()}
