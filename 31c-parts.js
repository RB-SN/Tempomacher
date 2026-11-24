/* ---- one run in parts: total + core part, run-walk segments, several files for one run ----
   The total (distance, time) counts for volume and load. The core part counts for performance index, best time and
   prediction (races, tests) or is rated against its target pace (long runs with a fast finish or a marathon-pace part,
   progression runs). Found from the plan, the laps or the file; correctable with the pace-curve marking. */
const CORE_L={race:['Wettkampf','Race'],test:['Testabschnitt','Test section'],fin:['Endbeschleunigung','Fast finish'],mp:['Marathontempo-Teil','Marathon-pace part'],prog:['Steigerung am Schluss','Build-up at the end']};
const coreL=k=>T(...(CORE_L[k]||CORE_L.test));
// what the core part of this run is: kind, distance (km) or duration (s), target pace
function coreSpec(type,pl,date){
  const P=pl&&pl.type!=='rest'&&pl.type!=='alt'?pl:null;
  if(type==='race'){const r=(S.races||[]).find(x=>x.date===date),km=r?r.dist:P&&P.type==='race'?P.km:null;return{kind:'race',km:km||null}}
  if(type==='test'){if(P&&P.test&&P.test.t30)return{kind:'test',sec:1800};let km=null;
    if(P&&P.type==='test'){const m=String(P.title||'').match(/(\d+(?:[.,]\d+)?)\s*km/);km=m?+m[1].replace(',','.'):P.km>4?P.km-3:null}return{kind:'test',km}}
  if(!P||!P.fin||!['long','easy','recovery'].includes(type))return null;
  const f=P.fin;return{kind:f.cap?'prog':f.end?'fin':'mp',km:f.km,pace:f.pace||null,end:!!f.end,cap:!!f.cap}}
const rwPlanned=pl=>!!(pl&&(pl.rw||/Lauf-Geh|run-walk/i.test(pl.title||'')));
// ---- detection in the per-second samples ----
function serStat(S,a,b){let d=S.D[b]-S.D[a],h=0,n=0,mv=0;const lag=Math.min(30,Math.round((b-a)*.4));for(let s=a;s<b;s++){if(S.mov[s])mv++;if(s>=a+lag&&S.HR[s]){h+=S.HR[s];n++}}
  return{a,b,km:Math.round(d)/1000,sec:b-a,mov:mv,hr:n?Math.round(h/n):null}}
// fastest stretch covering m metres (two pointers; time includes stops, like a race clock)
function winDist(S,m){const{D,T}=S;let best=null,a=0;if(D[T]-D[0]<m*.98)return null;
  for(let b=1;b<=T;b++){while(a+1<b&&D[b]-D[a+1]>=m)a++;if(D[b]-D[a]>=m&&(!best||b-a<best.b-best.a))best={a,b}}
  if(!best){return{a:0,b:T}}return best}
// longest distance in a fixed duration (30-minute test)
function winTime(S,sec){const{D,T}=S;if(T<sec)return null;let best=null;for(let a=0;a+sec<=T;a+=1){const d=D[a+sec]-D[a];if(!best||d>best.d)best={a,b:a+sec,d}}return best}
// the last m metres before the end of moving (fast finish)
function winEnd(S,m){const{D,T,mov}=S;let b=T;while(b>0&&!mov[b-1])b--;let a=b;while(a>0&&D[b]-D[a]<m)a--;return D[b]-D[a]>=m*.9?{a,b}:null}
// watch laps that together match the target distance (±3 %): the fastest such run of laps
function lapsDist(S,m){const L=S.laps;if(!L||L.length<2)return null;let best=null;
  for(let i=0;i<L.length;i++){let d=0;for(let j=i;j<L.length;j++){d+=L[j].d;if(d>m*1.03)break;if(d>=m*.97){const t=L[j].b-L[i].a;if(!best||t/d<best.p)best={a:L[i].a,b:L[j].b,p:t/d}}}}
  return best&&!(best.a===L[0].a&&best.b===L[L.length-1].b)?best:null}
// time of the first half inside a stretch (for the race review)
function halfAt(S,a,b){const m=S.D[a]+(S.D[b]-S.D[a])/2;let s=a;while(s<b&&S.D[s]<m)s++;return s-a}
// without a planned distance: the longest clearly faster stretch (two pace clusters, gaps up to 30 s bridged, at least 4 min)
function blockWin(S){const{V,T}=S,mv=[];for(let s=0;s<=T;s++)if(V[s]>.5)mv.push(V[s]);if(mv.length<600)return null;mv.sort((x,y)=>x-y);
  let lo=mv[Math.floor(mv.length*.2)],hi=mv[Math.floor(mv.length*.95)];
  for(let it=0;it<12;it++){const th=(lo+hi)/2;let p=0,np=0,q=0,nq=0;for(const v of mv){if(v<th){p+=v;np++}else{q+=v;nq++}}if(np)lo=p/np;if(nq)hi=q/nq}
  if(hi/lo<1.1)return null;const th=(lo+hi)/2;let best=null,st=-1,gap=0;
  for(let s=0;s<=T+31;s++){const on=s<=T&&V[s]>th;if(on){if(st<0)st=s;gap=0}else if(st>=0){gap++;if(gap>30){const b=s-gap+1;if(b-st>=240&&(!best||b-st>best.b-best.a))best={a:st,b};st=-1;gap=0}}}
  return best}
function coreFromSer(S,sp){let w=null,how='auto';
  if(!sp.km&&!sp.sec)w=blockWin(S);
  else if(sp.sec)w=winTime(S,sp.sec);
  else if(sp.km){const m=sp.km*1000;
    if(sp.kind==='race'||sp.kind==='test'){const L=lapsDist(S,m);if(L){w=L;how='laps'}else w=winDist(S,m)}
    else if(sp.end)w=winEnd(S,m);else w=winDist(S,m)}
  if(!w)return null;const st=serStat(S,w.a,w.b),c={kind:sp.kind,how,a:w.a,b:w.b,km:st.km,sec:st.sec,hr:st.hr};
  // official distance for races and tests on a known distance: the watch usually measures a little more
  if(sp.km&&(sp.kind==='race'||sp.kind==='test')){if(how==='auto')c.sec=Math.round(st.sec*sp.km*1000/Math.max(1,S.D[w.b]-S.D[w.a]));c.km=sp.km}
  if(!sp.km&&!sp.sec&&sp.kind==='test'){const r=Math.round(c.km*2)/2;if(r>=1&&Math.abs(c.km/r-1)<=.03){c.sec=Math.round(c.sec*r/c.km);c.km=r}}
  if(sp.kind==='race')c.h1=halfAt(S,w.a,w.b);return c}
// from kilometre splits (screenshots): the same, on whole kilometres
function coreFromSplits(sp,spec){if(!sp||sp.length<3)return null;const R=sp.filter(r=>(r.dist||1)>=.9),tw=r=>r.time||r.pace*(r.dist||1);if(R.length<3)return null;
  let n,i0;if(spec.sec)return null;const k=spec.km;if(!k)return null;n=Math.round(k);if(n<1||n>R.length||Math.abs(n-k)>.25&&!(spec.kind==='race'&&n>=5))return null;
  if(spec.end)i0=R.length-n;else{let bt=1e9;for(let i=0;i+n<=R.length;i++){const t=R.slice(i,i+n).reduce((x,r)=>x+tw(r),0);if(t<bt){bt=t;i0=i}}}
  const S2=R.slice(i0,i0+n),t=S2.reduce((x,r)=>x+tw(r),0),hs=S2.filter(r=>r.hr),hr=hs.length?Math.round(hs.reduce((x,r)=>x+r.hr*tw(r),0)/hs.reduce((x,r)=>x+tw(r),0)):null;
  return{kind:spec.kind,how:'splits',i:i0,n,km:spec.end||spec.kind==='mp'||spec.kind==='prog'?n:k,sec:Math.round(t*k/n),hr}}
// run-walk: alternating running and walking (each walk ≥ 20 s); two pace clusters, the slower one at walking speed
function rwFromSer(S){const{D,T,mov}=S,V=[];for(let s=0;s<=T;s++){const a=Math.max(0,s-5),b=Math.min(T,s+5);V.push(b>a?(D[b]-D[a])/(b-a):0)}
  const mv=V.filter(v=>v>.6).sort((x,y)=>x-y);if(mv.length<600)return null;let lo=mv[Math.floor(mv.length*.1)],hi=mv[Math.floor(mv.length*.9)];
  for(let it=0;it<12;it++){const th=(lo+hi)/2;let p=0,np=0,q=0,nq=0;for(const v of mv){if(v<th){p+=v;np++}else{q+=v;nq++}}if(np)lo=p/np;if(nq)hi=q/nq}
  if(!(lo<2&&hi/lo>=1.3))return null;const th=(lo+hi)/2,W=[];let st=-1;
  for(let s=0;s<=T;s++){const w=V[s]>.6&&V[s]<th;if(w&&st<0)st=s;else if(!w&&st>=0){if(s-st>=20)W.push([st,s]);st=-1}}
  if(W.length<3)return null;const wt=W.reduce((x,[a,b])=>x+b-a,0),inW=s=>W.some(([a,b])=>s>=a&&s<b);
  let rd=0,rt=0,h=0,n=0,wd=0;for(let s=0;s<T;s++){if(!mov[s])continue;const dd=D[s+1]-D[s];if(inW(s))wd+=dd;else{rd+=dd;rt++;if(S.HR[s]){h+=S.HR[s];n++}}}
  if(wt<rt*.06||rt<600)return null;
  return{n:W.length,run:{km:Math.round(rd)/1000,sec:rt,hr:n?Math.round(h/n):null},walk:{km:Math.round(wd)/1000,sec:wt}}}
// decoupling on a part of the run (the easy part before a fast finish or a marathon-pace part)
function decRange(S,s0,s1){const{D,HR,ALT,mov}=S,hasAlt=ALT.some(a=>!isNaN(a)),R=[];let cur={t:0,d:0,h:0,g:0,gn:0},mt=0;
  for(let s=s0;s<s1;s++){if(!mov[s]||!HR[s])continue;mt++;const dd=D[s+1]-D[s];cur.t++;cur.d+=dd;cur.h+=HR[s];
    if(hasAlt){const a=Math.max(0,s-15),b=Math.min(S.T,s+15),run=D[b]-D[a];if(run>20&&!isNaN(ALT[a])&&!isNaN(ALT[b])){cur.g+=dd*gapF((ALT[b]-ALT[a])/run*100);cur.gn+=dd}}
    if(cur.t>=60){const km=cur.d/1000;if(km>0)R.push({t:cur.t,d:km,hr:cur.h/cur.t,g:hasAlt&&cur.gn>cur.d*.8?cur.t/km/(cur.g/cur.gn):null});cur={t:0,d:0,h:0,g:0,gn:0}}}
  if(mt<2700)return{dec:null,why:'short'};return decFrom(R,null)||{dec:null,why:'short'}}
function splitsDec(sp,i0){const R=sp.slice(0,i0).map(r=>({t:r.time||r.pace*(r.dist||1),d:r.dist||1,hr:r.hr,g:null}));
  if(R.reduce((x,r)=>x+r.t,0)<2700)return{dec:null,why:'short'};return decFrom(R,null)||{dec:null,why:'short'}}
// apply to an import: core part, easy part, run-walk and decoupling for the chosen run type
function partsPrefill(f){const a=f.imp;f.core=null;f.easy=null;f.rw=null;
  if(a&&!Object.prototype.hasOwnProperty.call(a,'dec0'))Object.defineProperty(a,'dec0',{value:{dec:a.dec,decNote:a.decNote,decSeg:a.decSeg,decCh:a.decCh},writable:true,enumerable:false});
  if(a){Object.assign(a,a.dec0);a.decPart=null}
  const pl=f.mode==='plan'?plannedFor(f.date):null,sp=coreSpec(f.type,pl,f.date);f.spec=sp;
  if(a&&sp&&sp.kind!=='race'&&sp.kind!=='test'&&IVT.has(f.type))return;
  let c=null;if(a&&sp&&(sp.km||sp.sec||sp.kind==='race'||sp.kind==='test')){c=a.ser?coreFromSer(a.ser,sp):coreFromSplits(a.splits,sp)}
  if(c&&ui.mkCore&&ui.mkCore.kind===sp.kind)c=ui.mkCore;
  if(c){f.core=c;f.ckm=String(Math.round(c.km*100)/100);f.csec=fmtTime(c.sec);f.chr=c.hr||''}
  else if(!f.editKey){f.ckm=sp&&sp.km&&(sp.kind==='race'||sp.kind==='test')?String(sp.km):'';f.csec='';f.chr=''}
  // easy part (before the core part): efficiency and decoupling of long runs with a fast finish or a marathon-pace part
  if(a&&c&&['fin','mp','prog'].includes(c.kind)){
    if(a.ser&&c.a>300){const e=serStat(a.ser,0,c.a);f.easy={km:e.km,sec:e.mov,hr:e.hr};if(f.type==='long'){const D0=decRange(a.ser,0,c.a);Object.assign(a,{dec:D0.dec,decNote:D0.why,decSeg:null,decCh:D0.ch||null,decPart:'easy'})}}
    else if(a.splits&&c.i>0){const E=a.splits.slice(0,c.i),tw=r=>r.time||r.pace*(r.dist||1),t=E.reduce((x,r)=>x+tw(r),0),hs=E.filter(r=>r.hr);
      f.easy={km:E.reduce((x,r)=>x+(r.dist||1),0),sec:Math.round(t),hr:hs.length?Math.round(hs.reduce((x,r)=>x+r.hr*tw(r),0)/hs.reduce((x,r)=>x+tw(r),0)):null};
      if(f.type==='long'){const D0=splitsDec(a.splits,c.i);Object.assign(a,{dec:D0.dec,decNote:D0.why,decSeg:null,decCh:D0.ch||null,decPart:'easy'})}}}
  // run-walk: running and walking separately; the running part counts for efficiency
  if(a&&a.ser&&['easy','long','recovery'].includes(f.type)&&!(c&&c.kind!=='race'&&c.kind!=='test')){const rw=rwFromSer(a.ser);if(rw&&(rwPlanned(pl)||rw.n>=3)){f.rw=rw;f.easy={km:rw.run.km,sec:rw.run.sec,hr:rw.run.hr};if(a.dec0&&a.dec0.dec!=null){a.dec=null;a.decNote='rw';a.decPart=null}}}}
// core part from the form fields; {core} or {err}
function coreFromForm(f){const sp=f.spec,has=String(f.ckm||'').trim()||String(f.csec||'').trim();
  if(!has)return{core:null};const km=pnum(f.ckm),sec=parseDur(f.csec),hr=f.chr===''||f.chr==null?null:Math.round(+f.chr);
  const lbl=coreL(sp?sp.kind:f.type==='race'?'race':'test');
  if(!(km>=.2&&km<=100))return{err:T(`${lbl}: bitte die Distanz in km eingeben.`,`${lbl}: please enter the distance in km.`)};
  if(!sec||Number.isNaN(sec)||sec<km*100||sec>km*1200)return{err:T(`${lbl}: bitte die Zeit als h:mm:ss oder mm:ss eingeben.`,`${lbl}: please enter the time as h:mm:ss or mm:ss.`)};
  if(hr!=null&&!(hr>=60&&hr<=230))return{err:T(`${lbl}: Puls zwischen 60 und 230.`,`${lbl}: heart rate between 60 and 230.`)};
  const c=f.core&&Math.abs(f.core.km-km)<.01&&Math.abs(f.core.sec-sec)<1?f.core:null;
  const o={kind:sp?sp.kind:f.type==='race'?'race':'test',km:Math.round(km*1000)/1000,sec,hr:hr||null,how:c?c.how:'hand'};if(c&&c.h1)o.h1=c.h1;if(sp&&sp.pace)o.tp=Math.round(sp.pace);if(sp&&sp.cap)o.cap=true;return{core:o}}
// core box in the log form
function coreBox(f){const sp=f.spec,show=sp&&(sp.kind==='race'||sp.kind==='test'||f.core||f.editKey&&(f.ckm||f.csec));if(!show)return'';
  const c=f.core,k=sp.kind,tp=sp.pace,cp=pnum(f.ckm)>0&&parseDur(f.csec)?parseDur(f.csec)/pnum(f.ckm):null;
  const how=c?{laps:T('aus den Runden der Uhr','from the watch laps'),auto:T('in der Datei gefunden','found in the file'),splits:T('aus den Kilometer-Splits','from the kilometre splits'),mark:T('von dir markiert','marked by you')}[c.how]||'':'';
  const intro=k==='race'?T('Nur das Rennen, ohne Ein- und Auslaufen. Zählt für Bestzeit, Leistungsindex und Prognose.','The race only, without warm-up and cool-down. Counts for best time, performance index and prediction.')
    :k==='test'?T('Nur der Testabschnitt, ohne Ein- und Auslaufen. Daraus berechnet Tempomacher Pace und Zonen.','The test section only, without warm-up and cool-down. Tempomacher calculates paces and zones from it.')
    :k==='mp'?T(`Wird am Zieltempo${tp?' '+pace(tp):''} gemessen. Decoupling und Effizienz zählen nur auf dem lockeren Teil davor.`,`Measured against goal pace${tp?' '+pace(tp):''}. Decoupling and efficiency only count on the easy part before.`)
    :T(`Wird am Zieltempo${tp?' '+pace(tp):''} gemessen. Decoupling und Effizienz zählen nur auf dem lockeren Teil davor.`,`Measured against the target pace${tp?' '+pace(tp):''}. Decoupling and efficiency only count on the easy part before.`);
  return`<div class="field corebox"><span class="flabel">${coreL(k)}${how?` <span class="hint">· ${how}</span>`:''}</span>
    <div class="grid3"><div class="field"><label for="lfCkm">${T('Distanz (km)','Distance (km)')}</label><input class="input" id="lfCkm" inputmode="decimal" value="${esc(f.ckm||'')}" data-bind="lf.ckm"></div>
    <div class="field"><label for="lfCsec">${T('Zeit','Time')}</label><input class="input" id="lfCsec" inputmode="decimal" data-fmt="dur" placeholder="${T('z. B. 21:40','e.g. 21:40')}" value="${esc(f.csec||'')}" data-bind="lf.csec"></div>
    <div class="field"><label for="lfChr">${T('Ø Puls','Avg. HR')}</label><input class="input" id="lfChr" type="number" inputmode="numeric" value="${esc(f.chr||'')}" data-bind="lf.chr"></div></div>
    <span class="hint">${cp?T(`Ø ${pace(cp)}. `,`Avg. ${pace(cp)}. `):''}${intro}${f.imp&&f.imp.ser?` <button type="button" class="link" data-act="mkOpen" data-v="core">${T('Auf der Tempokurve anpassen','Adjust on the pace curve')}</button>`:''}</span></div>`}
// run-walk and easy part, shown under the import summary
function partsTxt(f){const a=f.imp,o=[];
  if(f.rw){const r=f.rw;o.push(T(`Lauf-Geh: ${r.n} Gehpausen (zusammen ${fmtTime(r.walk.sec)}), gelaufen ${fk(r.run.km)} km in Ø ${pace(r.run.sec/r.run.km)}${r.run.hr?' · Ø Puls '+r.run.hr:''}`,`Run-walk: ${r.n} walk breaks (${fmtTime(r.walk.sec)} in total), ran ${fk(r.run.km)} km at avg. ${pace(r.run.sec/r.run.km)}${r.run.hr?' · avg. HR '+r.run.hr:''}`))}
  else if(f.easy&&f.core)o.push(T(`Lockerer Teil: ${fk(f.easy.km)} km · Ø ${pace(f.easy.sec/f.easy.km)}${f.easy.hr?' · Ø Puls '+f.easy.hr:''}`,`Easy part: ${fk(f.easy.km)} km · avg. ${pace(f.easy.sec/f.easy.km)}${f.easy.hr?' · avg. HR '+f.easy.hr:''}`));
  if(a&&a.files>1)o.push(T(`${a.files} Dateien zu einem Lauf zusammengefügt`,`${a.files} files merged into one run`));
  return o.length?`<div class="hint" style="margin-top:4px">${o.join('<br>')}</div>`:''}
// efficiency: on the easy part (long runs with a fast finish) or the running part (run-walk) when known
function effL(l){const e=l&&l.easy;if(!e||!e.km||!e.sec||!e.hr)return l;const g=gainOf(l),km=logKm(l);
  return Object.assign({},l,{km:e.km,sec:e.sec,pace:Math.round(e.sec/e.km),hr:e.hr,gain:g!=null&&km?Math.round(g*e.km/km):l.gain,impSum:null,easy:null})}
// verdict on the core part of an easy or long run (finish, marathon-pace part, build-up)
function coreRate(l){const c=l.core;if(!c||!['fin','mp','prog'].includes(c.kind)||!c.km||!c.sec)return null;const p=c.sec/c.km,tp=c.tp,L=coreL(c.kind),hr=c.hr?T(`, Ø Puls ${c.hr}`,`, avg. HR ${c.hr}`):'';
  if(!tp)return{ok:true,txt:T(`${L}: ${fk(c.km)} km in Ø ${pace(p)}${hr}.`,`${L}: ${fk(c.km)} km at avg. ${pace(p)}${hr}.`)};const q=p/tp-1;
  if(c.cap||c.kind==='prog')return q<-.03?{ok:false,txt:T(`${L}: Ø ${pace(p)}, schneller als vorgesehen (höchstens ${pace(tp)}). Das Finish soll kontrolliert bleiben.`,`${L}: avg. ${pace(p)}, faster than intended (at most ${pace(tp)}). The finish should stay controlled.`)}:{ok:true,txt:T(`${L}: Ø ${pace(p)}${hr}, kontrolliert wie vorgesehen.`,`${L}: avg. ${pace(p)}${hr}, controlled as intended.`)};
  if(q<-.025)return{ok:false,txt:T(`${L}: ${fk(c.km)} km in Ø ${pace(p)}, schneller als das Zieltempo ${pace(tp)}. Auf müden Beinen genau das Zieltempo zu treffen, ist der Trainingsreiz.`,`${L}: ${fk(c.km)} km at avg. ${pace(p)}, faster than the target ${pace(tp)}. Hitting exactly the target on tired legs is the point.`)};
  if(q>.03)return{ok:false,txt:T(`${L}: ${fk(c.km)} km in Ø ${pace(p)}, langsamer als das Zieltempo ${pace(tp)}${hr}.`,`${L}: ${fk(c.km)} km at avg. ${pace(p)}, slower than the target ${pace(tp)}${hr}.`)};
  return{ok:true,txt:T(`${L}: ${fk(c.km)} km in Ø ${pace(p)}, Zieltempo ${pace(tp)} getroffen${hr}.`,`${L}: ${fk(c.km)} km at avg. ${pace(p)}, target ${pace(tp)} hit${hr}.`)}}
// pills on the entry card
function partsPills(l){const o=[];if(l.core&&l.core.km&&l.core.sec)o.push(`${coreL(l.core.kind)} ${fk(l.core.km)} km · ${fmtTime(l.core.sec)}`);
  if(l.rw)o.push(T(`${l.rw.n} Gehpausen`,`${l.rw.n} walk breaks`));if(l.files>1)o.push(T(`${l.files} Dateien`,`${l.files} files`));return o.map(x=>`<span class="pill n">${esc(x)}</span>`).join('')}
// ---- several files for one run (the watch was stopped and started again) ----
function mergeRaw(A,B){const[x,y]=[A,B].sort((p,q)=>(p.recs[0]?p.recs[0].t:0)-(q.recs[0]?q.recs[0].t:0)),lastD=x.recs.reduce((m,r)=>r.d!=null&&r.d>m?r.d:m,0),firstD=(y.recs.find(r=>r.d!=null)||{d:0}).d;
  // the gap between the files does not count (watch restarted): the second file follows one second after the first
  const tEnd=x.recs.reduce((m,r)=>isFinite(r.t)&&r.t>m?r.t:m,0),tSt=(y.recs.find(r=>isFinite(r.t))||{t:tEnd+1}).t,sh=Math.max(0,tSt-tEnd-1);
  const recs=x.recs.concat(y.recs.map(r=>Object.assign({},r,{t:r.t-sh,d:r.d!=null?r.d-firstD+lastD:null}))),tx=x.total||{},ty=y.total||{},sum=k=>tx[k]!=null&&ty[k]!=null?tx[k]+ty[k]:null;
  const hr=tx.hr&&ty.hr&&tx.tt&&ty.tt?Math.round((tx.hr*tx.tt+ty.hr*ty.tt)/(tx.tt+ty.tt)):null;
  return{sport:x.sport,recs,laps:(x.laps||[]).concat((y.laps||[]).map(l=>Object.assign({},l,{start:l.start?l.start-sh:l.start}))),total:{start:tx.start||ty.start,dist:sum('dist'),tt:sum('tt'),asc:sum('asc'),hr},n:(x.n||1)+(y.n||1)}}
async function addRunFile(file){const f=ui.lf,a=f&&f.imp;if(!a||!a.raw)return;ui.sheet={kind:'busy'};renderSheet();
  try{const b=await readActivity(file);if(!b.raw)throw new Error(T('Diese Datei ist kein Lauf und kann nicht angehängt werden.','This file is not a run and cannot be added.'));
    const raw=mergeRaw(a.raw,b.raw),n=raw.n,dt=Math.abs((b.raw.recs[0].t)-(a.raw.recs[a.raw.recs.length-1].t));
    if(dt>6*3600&&Math.abs(a.raw.recs[0].t-b.raw.recs[b.raw.recs.length-1].t)>6*3600)throw new Error(T('Die zweite Datei liegt mehr als 6 Stunden von der ersten entfernt. Ist es wirklich derselbe Lauf?','The second file is more than 6 hours away from the first. Is it really the same run?'));
    const c=analyzeActivity(raw);c.src=a.src;c.files=n;Object.defineProperty(c,'raw',{value:raw,enumerable:false});
    const keep={mode:f.mode,assign:f.assign,date:f.date,rpe:f.rpe,shoe:f.shoe,dateAsk:f.dateAsk};ui.mkCore=null;openImport(c);Object.assign(ui.lf,keep);lfPrefill(ui.lf);partsPrefill(ui.lf);renderSheet()}
  catch(err){ui.sheet={kind:'run'};ui.lfErr=(err&&err.message)||T('Die Datei konnte nicht gelesen werden.','The file could not be read.');renderSheet()}}
function addFilePick(){let fi=document.getElementById('addIn');if(!fi){fi=document.createElement('input');fi.type='file';fi.id='addIn';fi.hidden=true;fi.accept='.fit,.gpx,.tcx,.zip';document.body.appendChild(fi);
  fi.addEventListener('change',()=>{if(fi.files&&fi.files[0])addRunFile(fi.files[0])})}fi.value='';fi.click()}
// form values when an entry is edited (older tests and races: the logged distance and time were the core part)
function coreEdit(l){const c=l.core,ty=logType(l),o={core:c||null,rw:l.rw||null,easy:l.easy||null};
  if(c){o.ckm=String(c.km);o.csec=fmtTime(c.sec);o.chr=c.hr||''}
  else if((ty==='test'||ty==='race')&&l.km){const s=l.sec||(l.pace?Math.round(l.pace*l.km):null);o.ckm=String(l.km);o.csec=s?fmtTime(s):'';o.chr=l.hr||''}
  return o}
// a race logged with its core part: becomes the race result (best time, review) unless one was entered already
function raceFromCore(x,date){const r=(S.races||[]).find(q=>q.date===date),c=x.core;if(!r||!c||Math.abs(c.km-r.dist)>r.dist*.02)return;x.raceId=r.id;if(r.res&&r.res.sec)return;
  r.res={sec:c.sec,hr:c.hr||null,h1:c.h1||null,gain:x.gain!=null?x.gain:null,cond:[],rpe:x.rpe||null,pred:showPred(r.dist)?Math.round(predict(vdotOf(S),r.dist)):null,at:Date.now()}}
function raceLog(r){const l=S.logs[r.date];if(l&&(l.raceId===r.id||logType(l)==='race'))return l;return(S.extra||[]).find(e=>e.raceId===r.id||e.date===r.date&&logType(e)==='race')||null}
// several run files chosen at once: one run, in time order
async function readRuns(list){if(list.length<2)return readActivity(list[0]);const R=[];for(const f of list){const a=await readActivity(f);if(a.raw)R.push(a)}
  if(R.length<2)return R[0]||readActivity(list[0]);R.sort((p,q)=>p.raw.recs[0].t-q.raw.recs[0].t);for(let i=1;i<R.length;i++){const e=R[i-1].raw.recs,s=R[i].raw.recs;if(s[0].t-e[e.length-1].t>6*3600)return R[0]}let raw=R[0].raw;for(let i=1;i<R.length;i++)raw=mergeRaw(raw,R[i].raw);
  const c=analyzeActivity(raw);c.src=R[0].src;c.files=R.length;Object.defineProperty(c,'raw',{value:raw,enumerable:false});return c}
function coreSum(c){return`${coreL(c.kind)} ${T('erkannt','recognised')}: <b>${fk(c.km)} km</b> · ${fmtTime(c.sec)} · Ø ${pace(c.sec/c.km)}${c.hr?T(' · Ø HF ',' · avg. HR ')+c.hr:''}`}
