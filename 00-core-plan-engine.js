function showFatal(msg){
  var app=document.getElementById('app');if(!app)return;
  app.innerHTML='<div class="card"><h3>Da ist etwas schiefgelaufen</h3><p class="muted" style="margin:6px 0 10px">Die App konnte nicht angezeigt werden. Schick mir bitte diese Meldung:</p><pre style="white-space:pre-wrap;font-size:12.5px;background:var(--sunk);padding:10px;margin:0 0 12px"></pre><button class="btn ghost small" id="fatalReset">Daten zurücksetzen und neu starten</button></div>';
  app.querySelector('pre').textContent=String(msg);
  document.getElementById('fatalReset').onclick=function(){try{if(typeof CU!=='undefined'&&CU)localStorage.removeItem('startlinie.u.'+CU)}catch(e){}location.reload()};
}
window.addEventListener('error',function(e){showFatal((e.message||'Fehler')+(e.lineno?' (Zeile '+e.lineno+')':''))});
/* ============ helpers ============ */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return iso(d)};
const dow=s=>(pd(s).getDay()+6)%7;
const monday=s=>addD(s,-dow(s));
const today=()=>iso(new Date());
const daysBetween=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const r05=x=>Math.max(0,Math.round(x*2)/2);
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const fk=n=>Number(n).toLocaleString('de-CH',{maximumFractionDigits:1}),f2=n=>Number(n).toLocaleString('de-CH',{minimumFractionDigits:2,maximumFractionDigits:2}),fkm=n=>Number(n).toLocaleString('de-CH',{maximumFractionDigits:2});
const fmtPace=sec=>{if(!sec||!isFinite(sec))return'–';let m=Math.floor(sec/60),s=Math.round(sec%60);if(s===60){m++;s=0}return`${m}:${pad(s)}`};
const pace=sec=>`${fmtPace(sec)} /km`;
const fmtTime=sec=>{sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${h}:${pad(m)}:${pad(s)}`:`${m}:${pad(s)}`};
function parsePace(str){str=String(str||'').trim().replace(',',':').replace('.',':');if(!str)return null;let m,s;if(str.includes(':')){[m,s]=str.split(':').map(Number)}else if(/^\d{3,4}$/.test(str)){m=+str.slice(0,-2);s=+str.slice(-2)}else return NaN;if(!isFinite(m)||!isFinite(s)||s>59)return NaN;return m*60+s}
const hms=(h,m,s)=>(+h||0)*3600+(+m||0)*60+(+s||0);
const LANG=window.TM_LANG==='en'?'en':'de';
function setLang(l){try{localStorage.setItem('tempomacher.lang',l)}catch(e){}location.reload()}
const langSw=()=>`<div class="langsw" role="group" aria-label="Sprache / Language"><button type="button" data-act="lang" data-v="de" aria-pressed="${LANG==='de'}">DE</button><button type="button" data-act="lang" data-v="en" aria-pressed="${LANG==='en'}">EN</button></div>`;
const DOWS=['Mo','Di','Mi','Do','Fr','Sa','So'];
const DOWE=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DOWL=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
const MON=['Jan.','Feb.','März','Apr.','Mai','Juni','Juli','Aug.','Sep.','Okt.','Nov.','Dez.'];
const fdate=s=>`${DOWS[dow(s)]}, ${pd(s).getDate()}. ${MON[pd(s).getMonth()]}`;
const fdateL=s=>`${DOWL[dow(s)]}, ${pd(s).getDate()}. ${MON[pd(s).getMonth()]} ${pd(s).getFullYear()}`;
const fshort=s=>`${pd(s).getDate()}.${pd(s).getMonth()+1}.`;
const uid=()=>Math.random().toString(36).slice(2,9);
const pnum=v=>parseFloat(String(v).replace(',','.'));

/* ============ sport science model ============ */
// Daniels/Gilbert: oxygen cost of running and the fraction of VO2max sustainable for t minutes
const vo2=v=>-4.6+0.182258*v+0.000104*v*v;
const pctMax=t=>0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t);
function vdotFrom(km,sec){
  if(km>42.195){sec=sec/Math.pow(km/42.195,1.15);km=42.195}
  const t=sec/60,v=km*1000/t;return vo2(v)/pctMax(t);
}
function velAt(o){const a=0.000104,b=0.182258,c=-(o+4.6);return(-b+Math.sqrt(b*b-4*a*c))/(2*a)}
const paceAtPct=(vd,p)=>60000/velAt(vd*p);
function predict(vd,d){
  const dm=Math.min(d,42.195);let lo=dm*100,hi=dm*1500;
  for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(vdotFrom(dm,mid)>vd)lo=mid;else hi=mid}
  let t=(lo+hi)/2;if(d>42.195)t*=Math.pow(d/42.195,1.15);return t;
}
const showPred=d=>d<=42.2;
function estimateVdot(p){
  if(p.pace>=150&&p.pace<=900){let lo=20,hi=85;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(paceAtPct(m,.72)>p.pace)lo=m;else hi=m}return(lo+hi)/2}
  let v=[27,32,37,42][p.exp]+Math.min(8,(p.km||0)/12);
  if(p.sex==='w')v-=3.5;
  if(p.age>35)v-=0.2*(p.age-35);
  if(p.age<16)v-=(16-p.age)*0.6;
  return clamp(v,22,60);
}
// Zones from a lab test (lactate step test or spiroergometry) override the model where values exist
const mid2=a=>(a[0]+a[1])/2;
function labZones(p){const L=p.lab;if(!L)return null;
  if(L.mode==='thr'){const h1=L.lt1hr,h2=L.lt2hr,p1=L.lt1pace,p2=L.lt2pace,top=Math.max(p.hrMax||Math.round(208-0.7*p.age),Math.round(h2*1.05));
    return{Z1:{hr:[Math.round(h1*.85),Math.round(h1*.93)],pace:p1?[p1*1.10,p1*1.22]:null},Z2:{hr:[Math.round(h1*.93),h1],pace:p1?[p1,p1*1.10]:null},
      Z3:{hr:[h1,Math.round(h2*.96)],pace:p1&&p2?[p2*1.04,p1]:null},Z4:{hr:[Math.round(h2*.96),Math.round(h2*1.02)],pace:p2?[p2*.985,p2*1.04]:null},
      Z5:{hr:[Math.round(h2*1.02),top],pace:p2?[p2*.90,p2*.97]:null}}}
  return L.zones;
}
function baseVdot(p){const L=labZones(p);
  if(L&&L.Z4&&L.Z4.pace)return vo2(60000/mid2(L.Z4.pace))/.88;
  return p.ref&&p.ref.dist&&p.ref.sec?vdotFrom(p.ref.dist,p.ref.sec):estimateVdot(p)}
const vdotOf=st=>clamp(baseVdot(st.profile)+(st.profile.lab&&!labOld(st.profile)?0:(st.adapt.vdotAdj||0)),20,85);
const hrMax=p=>p.hrMax||Math.round(208-0.7*p.age);
const hrRest=p=>p.hrRest||[70,66,61,57][p.exp];
const ZONES={Z1:{n:'Regeneration',hr:[.60,.70]},Z2:{n:'Grundlage',hr:[.68,.79]},Z3:{n:'Marathon',hr:[.79,.86]},Z4:{n:'Schwelle',hr:[.86,.91]},Z5:{n:'VO₂max',hr:[.91,.97]}};
function paceSet(vd,race,lab){
  let E=[paceAtPct(vd,.70),paceAtPct(vd,.62)],M=predict(vd,42.195)/42.195,T=paceAtPct(vd,.88),I=paceAtPct(vd,.975),R=paceAtPct(vd,1.05);
  if(lab){if(lab.Z2.pace)E=[...lab.Z2.pace].sort((a,b)=>a-b);if(lab.Z3.pace)M=mid2(lab.Z3.pace);if(lab.Z4.pace)T=mid2(lab.Z4.pace);if(lab.Z5.pace){I=mid2(lab.Z5.pace);R=I*.95}}
  let RP=null,RPsrc='prognose';
  if(race){const pr=predict(vd,race.dist)/race.dist;RP=pr;
    if(race.goal){const g=race.goal/race.dist;if(g>=pr*0.96){RP=g;RPsrc='ziel'}else{RP=pr*0.98;RPsrc='gedeckelt'}}}
  return{E,M,T,I,R,RP,RPsrc};
}
const zoneFor=(pc,p)=>p<=pc.I*1.03?'Z5':p<=pc.T*1.03?'Z4':p<=pc.M*1.03?'Z3':'Z2';
const band=(p,f=.015)=>[p*(1-f),p*(1+f)];

const PEAK={5:[22,32,45,60],10:[26,40,55,75],21.1:[32,45,65,85],42.2:[42,58,78,100],50:[50,65,88,110],100:[60,80,105,130]};
// Peak weekly volume (km) by goal time, as in common training plans: [goal time faster than (s), lowest, highest]
const PB={5:[[18*60,55,70],[20*60,45,60],[22*60,38,50],[25*60,30,40],[28*60,25,32],[Infinity,18,25]],
  10:[[37*60,65,80],[41*60,55,70],[45*60,45,58],[50*60,38,48],[55*60,30,40],[Infinity,25,32]],
  21.0975:[[82*60,75,95],[90*60,65,80],[100*60,55,70],[110*60,45,58],[125*60,38,48],[Infinity,30,40]],
  42.195:[[180*60,90,110],[195*60,80,95],[210*60,70,85],[225*60,60,75],[255*60,50,65],[Infinity,45,55]],
  50:[[225*60,95,115],[270*60,80,100],[330*60,70,90],[390*60,60,80],[Infinity,55,70]],
  100:[[480*60,120,150],[600*60,100,130],[720*60,85,110],[840*60,75,95],[Infinity,65,85]]};
const bandAt=(d,sec)=>{const b=PB[d].find(x=>sec<x[0]);return[b[1],b[2]]};
// range for any distance: same performance level (from goal time, else prediction), interpolated between neighbouring distances
function peakRange(d,vd,goal){
  const lvl=goal?vdotFrom(d,goal):vd,ks=Object.keys(PB).map(Number).sort((a,b)=>a-b),at=k=>bandAt(k,predict(lvl,k));
  if(d<=ks[0])return at(ks[0]);if(d>=ks[ks.length-1])return at(ks[ks.length-1]);
  for(let i=0;i<ks.length-1;i++){const a=ks[i],b=ks[i+1];if(d>=a&&d<=b){const t=(d-a)/(b-a),A=at(a),B=at(b);return[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]}}
}
// experience sets the position in the range; days per week and the current volume cap it
function longMaxKm(d,exp,epace){const cap=tbl(LONGCAP,d,exp),maxMin=d>43?240:d>30?180:exp===0?150:180;return Math.min(cap,maxMin*60/epace)}
function peakTarget(p,race,vd,epace){
  const[lo,hi]=peakRange(race.dist,vd,race.goal),pos=[0,.3,.65,1][p.exp],days=trainDays(p).length;
  const lm=longMaxKm(race.dist,p.exp,epace||paceSet(vd,null).E[0]),daysCap=lm+(days-1)*(race.dist>43?16:14);
  let target=Math.min(lo+pos*(hi-lo),daysCap);
  // marathon: enough weekly volume that a 26 km+ long run is not more than about 38 % of the week
  if(race.dist>30&&p.exp>=1&&days>=4)target=Math.min(daysCap,Math.max(target,Math.min(lm,26)/.38));
  return{lo,hi,target,daysCap,cap:Math.max(Math.min(hi,daysCap),target)};
}
const LONGCAP={5:[10,12,15,16],10:[12,15,18,20],21.1:[15,19,22,24],42.2:[28,30,32,35],50:[28,32,36,40],100:[30,36,42,48]};
function tbl(T,d,e){const ks=Object.keys(T).map(Number).sort((a,b)=>a-b);
  if(d<=ks[0])return T[ks[0]][e];if(d>=ks[ks.length-1])return T[ks[ks.length-1]][e];
  for(let i=0;i<ks.length-1;i++){const a=ks[i],b=ks[i+1];if(d>=a&&d<=b){const t=(d-a)/(b-a);return T[a][e]+(T[b][e]-T[a][e])*t}}}
const PAT={3:[1,3,6],4:[1,3,5,6],5:[1,2,3,5,6],6:[0,1,2,3,5,6],7:[0,1,2,3,4,5,6]};
// The weekdays a person can train on; quality days are spread as far as possible from the long run and from each other
function trainDays(p){if(p.daysSel&&p.daysSel.length)return[...p.daysSel].sort((a,b)=>a-b);const off=p.longDay-6;return PAT[clamp(p.days||4,3,7)].map(x=>(x+off+7)%7).sort((a,b)=>a-b)}
const longDayOf=p=>{const t=trainDays(p);return t.includes(p.longDay)?p.longDay:t[t.length-1]};
const cdist=(a,b)=>{const d=Math.abs(a-b)%7;return Math.min(d,7-d)};
function qualityDays(pat,ld,n){const out=[];
  for(let q=0;q<n;q++){let best=null,bs=-1e9;
    pat.forEach(x=>{if(x===ld||out.includes(x))return;const s=Math.min(cdist(x,ld),...out.map(o=>cdist(x,o)))*10-Math.abs(((x-ld+7)%7)-2.5);if(s>bs){bs=s;best=x}});
    if(best===null)break;out.push(best)}
  if(n===2&&out.length===2){const c=pat.filter(x=>x!==ld);let bp=null,bv=-1e9;
    for(let i=0;i<c.length;i++)for(let k=i+1;k<c.length;k++){const a=c[i],b=c[k],sp=Math.min(cdist(a,ld),cdist(b,ld),cdist(a,b)),v=sp*10-Math.abs(((a-ld+7)%7)-2.5)-Math.abs(((b-ld+7)%7)-2.5);if(v>bv){bv=v;bp=[a,b]}}
    if(bp&&Math.min(cdist(bp[0],ld),cdist(bp[1],ld),cdist(bp[0],bp[1]))>Math.min(cdist(out[0],ld),cdist(out[1],ld),cdist(out[0],out[1]))){const first=cdist(bp[0],ld)>=cdist(bp[1],ld)?bp[0]:bp[1];return[first,first===bp[0]?bp[1]:bp[0]]}}
  return out}
const PH={recover:'Erholung',gen:'Allgemein',base:'Grundlage',build:'Aufbau',peak:'Spezifisch',taper:'Tapering'};
const RPE={test:[7,9],mptest:[5,7],free:[2,5],easy:[2,4],recovery:[1,3],shakeout:[2,3],long:[3,6],fartlek:[5,7],hills:[6,8],tempo:[6,7],cruise:[6,8],vo2:[7,9],rp:[6,8],mpace:[5,7],race:[8,10],fun:[3,6],alt:[2,5],free:[2,6]};
// Run types a person can log; interval types are scored on their work phases only
const RT=[['test','Testlauf'],['mptest','Renntempo-Test'],['easy','Lockerer Lauf'],['long','Langer Lauf'],['recovery','Regenerationslauf'],['tempo','Tempodauerlauf'],['mpace','Marathontempo-Lauf'],['cruise','Schwellenintervalle'],['vo2','VO₂max-Intervalle'],['rp','Renntempo-Intervalle'],['fartlek','Fahrtspiel'],['hills','Bergintervalle'],['race','Wettkampf']];
const RTL=Object.fromEntries(RT);
const LABA={easy:'einen lockeren Lauf',long:'einen langen Lauf',recovery:'einen Regenerationslauf'};
const IVT=new Set(['cruise','vo2','rp','fartlek','hills']);
const rtOfPlan=t=>RTL[t]?t:'easy';
const logType=l=>l.type||rtOfPlan(l.s&&l.s.type);
const isIv=l=>IVT.has(logType(l));
// tempo run and marathon-pace run: pace and heart rate describe the block, not the whole run
const BLK=new Set(['tempo','mpace']),isBlk=l=>BLK.has(logType(l));
const ELEV=[{l:'0–50',m:25},{l:'50–100',m:75},{l:'100–150',m:125},{l:'150–200',m:175},{l:'200–300',m:250},{l:'300–500',m:400},{l:'500+',m:650}];
const RPEL=['','Sehr leicht','Leicht','Locker','Angenehm','Etwas fordernd','Fordernd','Hart','Sehr hart','Extrem hart','Maximal'];
const EXPL=[['Keine','Ich fange gerade an'],['Wenig','Ab und zu, unter 1 Jahr'],['Viel','Regelmässig, 1–5 Jahre'],['Sehr viel','Jahrelang, mit Wettkämpfen']];
const FEEL=['Sehr gut','Gut','Ok','Naja','Schlecht'];
const PAIN=['Keine','Wenig','Stark'];
const SKIP={time:'Keine Zeit',tired:'Müde, erschöpft',sick:'Krank',pain:'Schmerzen',other:'Anderer Grund'};
const REL={high:['Saisonhöhepunkt','Darauf richte ich alles aus'],mid:['Wichtig','Ich will gut laufen'],low:['Nebensache','Zum Spass oder als Test']};
const PLANO={own:'Eigener Vorbereitungsplan',taper:'In laufenden Plan einbauen',none:'Aus dem Training heraus laufen'};
const prioOf=r=>r.plan==='own'?'A':r.plan==='taper'?'B':'C';

let MKX=null; // extra fields for the next session built by mk (core part of long and progression runs)
function mk(c,o){
  const s={type:o.type,title:o.title,km:r05(o.km),zone:o.zone,pace:o.pace?o.pace.map(Math.round):null,
    hr:o.hr?[...o.hr]:[...c.zones[o.zone].hr],structure:o.structure||[],note:o.note||'',interval:!!o.interval,quality:!!o.quality};
  if(o.dur)s.dur=o.dur;if(o.test)s.test=o.test;if(MKX){Object.assign(s,MKX);MKX=null}if(o.reps)s.reps=o.reps;if(o.variant)s.variant=o.variant;
  if(o.pace&&o.track){const m=(o.pace[0]+o.pace[1])/2;s.pct=vo2(60000/m)/c.vd}
  return s;
}
// Run-walk progression for beginners: [minutes running, minutes walking]; after the last stage runs are continuous
const RW=[[1,1.5],[2,1],[3,1],[5,1],[8,1],[12,1],[20,1]];
function rwText(km,c,st){const[a,b]=RW[st],tot=Math.round(km*mid2(c.pc.E)*1.12/60),n=Math.max(3,Math.round(tot/(a+b)));
  return`${n} × (${fk(a)} min laufen, ${fk(b)} min gehen), zusammen ca. ${Math.round(n*(a+b))} min`}
const FUN=[
  {t:'Trail- oder Waldlauf',s:['45–60 min auf Naturwegen, gerne mit Höhenmetern','Steile Stücke gehen, bergab locker laufen lassen'],n:'Neue Strecke, weicher Untergrund, kein Blick auf die Pace.'},
  {t:'Fahrtspiel nach Lust',s:['40–50 min locker','Zwischendurch spontan zügig: bis zur nächsten Laterne, den nächsten Hügel hoch'],n:'Keine Vorgaben. Tempo nach Lust und Laune.'},
  {t:'Lauftreff oder Lauf mit Freunden',s:['45–60 min im Plaudertempo','Das Tempo bestimmt die Gruppe'],n:'Gemeinsam laufen hält die Motivation hoch.'},
  {t:'Entdeckungslauf',s:['40–60 min auf einer Strecke, die du noch nicht kennst'],n:'Laufen als Ausflug. Aussicht geniessen und Fotos machen ist erlaubt.'},
  {t:'Parkrun oder Volkslauf',s:['5 km bei einem lokalen Lauf, locker bis zügig','Davor und danach je 10 min traben'],n:'Wettkampfstimmung ohne Druck: mitlaufen statt rennen.'},
  {t:'Steigerungen im Park',s:['30 min locker','6–8 Steigerungen über 80 m auf Gras'],n:'Lockert die Beine und hält die Spritzigkeit.'}];
const ALT=['Velo','Schwimmen','Wandern','Kraft- und Rumpftraining','Langlauf oder Skating','Aqua-Jogging'];
const W={
  easy(c,km,o={}){return mk(c,{type:'easy',title:o.runwalk!=null&&o.runwalk!==false?'Lauf-Geh-Training':o.strides?'Lockerer Lauf + Steigerungen':'Lockerer Dauerlauf',km,zone:'Z2',pace:c.pc.E,
    structure:[o.runwalk!=null&&o.runwalk!==false?rwText(km,c,o.runwalk):`${fk(r05(km))} km ruhig im Grundlagentempo`].concat(o.strides?['Danach 5 × 20 s Steigerungen, dazwischen 60 s gehen']:[]),
    note:o.runwalk!=null&&o.runwalk!==false?`Lauf-Geh-Stufe ${o.runwalk+1} von ${RW.length}. Die Gehpausen sind Teil des Plans: Sie machen die Belastung für Sehnen und Gelenke verträglich. Ganz locker laufen, du solltest dabei sprechen können.`:'Du solltest dich dabei problemlos unterhalten können. Lieber zu langsam als zu schnell.'})},
  easyFree(c,km,strides){const m=Math.round(km*mid2(c.pc.E)/60/5)*5;return mk(c,{type:'easy',title:strides?T('Lockerer Lauf + Steigerungen','Easy run + strides'):'Lockerer Lauf nach Gefühl',km,zone:'Z2',pace:c.pc.E,
    structure:[`${m}–${m+15} min locker, ohne Pace-Vorgabe`].concat(strides?[T('Danach 5 × 20 s Steigerungen, dazwischen 60 s gehen','Then 5 × 20 s strides, 60 s walk in between')]:[]),note:'Uhr auf Puls stellen oder ganz weglassen. Hauptsache, es fühlt sich gut an.'})},
  // easy-run forms for variety: same easy stimulus, different focus (coordination, ankle stability, a controlled finish)
  easyVar(c,km,kind){const k=r05(km),E=c.pc.E,z2=c.zones.Z2.hr,z3=c.zones.Z3.hr;
    if(kind==='abc')return mk(c,{type:'easy',variant:'abc',title:T('Lockerer Lauf + Lauf-ABC','Easy run + running drills'),km,zone:'Z2',pace:E,
      structure:[T('10 min einlaufen','10 min warm-up'),T('6–8 min Lauf-ABC: Fussgelenksarbeit, Skippings, Anfersen, Hopserlauf, Kniehebelauf, je 2 × 20 m','6–8 min drills: ankle work, skips, butt kicks, bounding skips, high knees, 2 × 20 m each'),T(`Rest locker, total ${fk(k)} km`,`Rest easy, ${fk(k)} km in total`)],
      note:T('Das Lauf-ABC verbessert Koordination und Laufökonomie: sauberer Abdruck, aktiver Fuss, weniger Energie pro Schritt. Locker und präzise, nicht schnell.','Drills improve coordination and running economy: clean push-off, active foot, less energy per stride. Relaxed and precise, not fast.')});
    if(kind==='trail')return mk(c,{type:'easy',variant:'trail',title:T('Lockerer Lauf im Gelände','Easy trail run'),km,zone:'Z2',pace:[E[0],E[1]*1.1],
      structure:[T(`${fk(k)} km locker auf Waldweg, Feldweg oder Trail, Tempo nach Puls`,`${fk(k)} km easy on forest paths or trails, pace by heart rate`)],
      note:T('Weicher, unebener Untergrund trainiert Fussgelenke, Stabilität und Kraft und schont die Gelenke. Die Pace ist hier egal, am Hang bewusst langsamer: Nur der Puls zählt.','Soft, uneven ground trains ankles, stability and strength and spares the joints. Pace does not matter; slow down on climbs: only heart rate counts.')});
    if(kind==='prog'){const f=Math.min(3,Math.max(1.5,r05(k*.25)));MKX={fin:{km:f,pace:Math.round(c.pc.M),end:1,cap:1}};return mk(c,{type:'easy',variant:'prog',title:T('Progressiver Dauerlauf','Progression run'),km,zone:'Z2',pace:[c.pc.M,E[1]],hr:[z2[0],z3[1]],
      structure:[T(`${fk(r05(k-f))} km locker`,`${fk(r05(k-f))} km easy`),T(`letzte ${fk(f)} km zügig steigern bis ins lockere Marathontempo (${pace(c.pc.M)}), nicht schneller`,`last ${fk(f)} km build up to relaxed marathon pace (${pace(c.pc.M)}), not faster`)],
      note:T('Ein kontrolliertes Finish auf müden Beinen: trainiert Tempogefühl und Ermüdungsresistenz, ohne eine harte Einheit zu sein. Am Ende noch sprechen können.','A controlled finish on tired legs: trains pace feel and fatigue resistance without being a hard session. You should still be able to talk at the end.')})}
    return W.easy(c,km,{strides:true})},
  optional(c,km){const q=mk(c,{type:'easy',title:T('Optional: locker oder Alternativtraining','Optional: easy run or cross-training'),km:r05(km),zone:'Z2',pace:c.pc.E,
    structure:[T(`${fk(r05(km))} km locker oder 30–45 min Velo, Schwimmen, Langlauf`,`${fk(r05(km))} km easy or 30–45 min bike, swim, cross-country ski`)],note:T('Bonus: zählt, wenn du ihn machst, und kostet nichts, wenn du ihn auslässt. Wenn du müde bist: frei nehmen.','Bonus: counts if you do it and costs nothing if you skip it. If you feel tired: take the day off.')});q.optional=true;return q},
  recovery(c,km){return mk(c,{type:'recovery',title:'Regenerationslauf',km,zone:'Z1',pace:c.zones.Z1.pace,structure:[`${fk(r05(km))} km sehr locker, maximal 30 min`],note:'Ganz ruhig. Ziel ist Durchblutung, nicht Training.'})},
  shakeout(c){return mk(c,{type:'shakeout',title:'Vorbelastung',km:4,zone:'Z2',pace:c.pc.E,structure:['20 min sehr locker','4 × 15 s Steigerungen bis Renntempo'],note:'Beine wach machen, nicht ermüden. Startnummer, Schuhe und Verpflegung bereitlegen.'})},
  test(c,km){return mk(c,{type:'test',title:'Testlauf '+km+' km',km:km+3,zone:'Z4',pace:null,quality:true,
    structure:['10 min ganz locker einlaufen',`${km} km so zügig, wie du es gleichmässig durchhalten kannst (Anstrengung etwa 8/10)`,'Gehpausen sind erlaubt, die Uhr läuft weiter','10 min auslaufen oder gehen'],
    note:`Damit lernt Tempomacher dein aktuelles Tempo. Trag die Zeit für die ${km} km ein (Distanz ${km} km, Dauer oder Pace des Testabschnitts). Danach werden Pace und Zonen automatisch daraus berechnet.`})},
  // 30-minute test (after Friel): distance → VDOT, average heart rate of the last 20 minutes → threshold heart rate for personal zones
  test30(c){const km=r05(2.5+1800/c.pc.T+2);return mk(c,{type:'test',title:T('30-Minuten-Test','30-minute test'),km,zone:'Z4',pace:null,quality:true,test:{t30:true},
    structure:[T('15 min locker einlaufen, 3 Steigerungen','15 min easy warm-up, 3 strides'),T('30 min allein so schnell, wie du gleichmässig durchhältst (Anstrengung 8–9/10)','30 min alone as fast as you can hold evenly (effort 8–9/10)'),T('Nach 10 min die Runden-Taste drücken: Der Ø Puls der letzten 20 min ist deine Schwellen-Herzfrequenz','Press the lap button after 10 min: the average heart rate of the last 20 min is your threshold heart rate'),T('10 min auslaufen','10 min cool-down')],
    note:T('Eintragen: Distanz und Zeit der 30 min und den Ø Puls der letzten 20 min. Daraus berechnet Tempomacher Paces und Pulszonen neu, persönlich für dich.','Enter: distance and time of the 30 min and the average heart rate of the last 20 min. Tempomacher then recalculates paces and heart-rate zones, personal to you.')})},
  fun(c,j,km){const f=FUN[j%FUN.length];return mk(c,{type:'fun',title:f.t,km:Math.max(5,km),zone:'Z2',pace:null,structure:f.s,note:f.n})},
  alt(c,j){return mk(c,{type:'alt',title:'Alternativtraining',km:0,dur:45,zone:'Z2',pace:null,
    structure:[`30–60 min ${ALT[j%ALT.length]} oder eine andere Sportart nach Lust`,'Locker bis mittel, Puls in Z1–Z2'],note:'Entlastet Sehnen und Gelenke und bringt Abwechslung. Ausfallen lassen ist auch ok.'})},
  long(c,km,v='plain',st){
    km=r05(km);const b={type:'long',km,zone:'Z2',pace:c.pc.E},fu=fuelLine(c,km);
    if(v==='progress'){const f=clamp(Math.round(km*.2),3,5),mar=c.d>25;MKX={fin:{km:f,pace:Math.round(c.pc.RP),end:1}};return mk(c,{...b,title:mar?T('Langer Lauf mit Marathontempo-Finish','Long run with marathon-pace finish'):'Langer Lauf mit Endbeschleunigung',structure:[`${fk(km-f)} km locker`,T(`Letzte ${f} km im ${mar?'Marathontempo':'Renntempo'} ${pace(c.pc.RP)} (${hzRP(c)})`,`Last ${f} km at ${mar?'marathon pace':'race pace'} ${pace(c.pc.RP)} (${hzRP(c)})`)].concat(fu?[fu]:[]),note:T('Trainiert, auf müden Beinen das Renntempo zu halten. Die Verpflegung gleich mitüben.','Trains holding race pace on tired legs. Practise your fuelling at the same time.')})}
    if(v==='mlong'){const j=st||0,m=Math.min(clamp(Math.round(8+2.5*j),8,c.exp>=2?18:14),Math.max(6,km-8),Math.max(8,Math.floor(capK(c,.24,8)))),w=r05(Math.max(3,(km-m)*.6));MKX={fin:{km:m,pace:Math.round(c.pc.RP||c.pc.M)}};return mk(c,{...b,title:'Langer Lauf mit Marathontempo',structure:[`${fk(w)} km locker`,T(`${m} km im Marathontempo ${pace(c.pc.RP||c.pc.M)} (dein Zieltempo, ${hzRP(c)})`,`${m} km at marathon pace ${pace(c.pc.RP||c.pc.M)} (your goal pace, ${hzRP(c)})`),T(`${fk(r05(Math.max(1,km-w-m)))} km locker auslaufen`,`${fk(r05(Math.max(1,km-w-m)))} km easy cool-down`)].concat(fu?[fu]:[]),note:T('Generalprobe: Schuhe, Kleidung, Frühstück und Verpflegung wie am Renntag. So lernt der Körper, das Zieltempo auf müden Beinen und mit Kohlenhydraten im Magen zu halten.','Dress rehearsal: shoes, clothes, breakfast and fuelling as on race day. Your body learns to hold goal pace on tired legs with carbohydrate in the stomach.')})}
    if(v==='ultra')return mk(c,{...b,title:'Langer Lauf (hügelig)',pace:[c.pc.E[1],c.pc.E[1]*1.15],structure:[`${fk(km)} km in hügeligem Gelände oder auf Trails`,'Steile Anstiege zügig gehen','Ab der 2. Stunde 60–90 g Kohlenhydrate pro Stunde üben'],note:'Zeit auf den Beinen zählt mehr als Tempo.'});
    if(v==='medium')return mk(c,{...b,title:T('Mittellanger Lauf','Medium-long run'),structure:[T(`${fk(km)} km locker im Grundlagentempo`,`${fk(km)} km easy at base pace`)],note:T('Ausdauer ohne zusätzliche Intensität: Diese Woche steckt das Marathontempo schon im langen Lauf.','Endurance without extra intensity: this week the marathon pace is already in the long run.')});
    if(v==='b2b')return mk(c,{...b,title:'Mittellanger Lauf (Back-to-Back)',structure:[`${fk(km)} km locker`],note:'Am Tag vor dem langen Lauf: deine Beine lernen, vorermüdet weiterzulaufen.'});
    if(v==='runwalk')return mk(c,{...b,title:'Längeres Lauf-Geh-Training',structure:[rwText(km,c,st||0)],note:'Gleichmässig bleiben. Ziel ist, die Dauer ohne Erschöpfung zu schaffen.'});
    if(v==='gen'){const m=Math.round(km*mid2(c.pc.E)/60/5)*5;return mk(c,{...b,title:'Längerer Lauf nach Gefühl',structure:[`Ca. ${m} min locker, gerne auf einer schönen Strecke`],note:'Kein Druck auf Distanz oder Tempo. Kürzer ist auch gut.'})}
    return mk(c,{...b,title:'Langer Lauf',structure:[`${fk(km)} km gleichmässig im Grundlagentempo`].concat(fu?[fu]:km>=18?['Ab 75 min Verpflegung testen (Wasser, Kohlenhydrate)']:[]),note:'Ruhig bleiben. Die zweite Hälfte darf minimal schneller sein als die erste.'});
  },
  mptest(c,km,no,of){const P=c.pc.RP,d=c.d,dl=d>25?T('Marathon','marathon'):d>12?T('Halbmarathon','half-marathon'):fk(d)+'-km',dur=km*P/60;
    return mk(c,{type:'mptest',title:T('Renntempo-Test','Race-pace test'),km:2+km+1.5,zone:zoneFor(c.pc,P),hr:hrRP(c),pace:band(P,.01),quality:true,track:true,test:{no,of,km},
      structure:[T(`2 km einlaufen${d<=12?' + 3 Steigerungen':''}`,`2 km warm-up${d<=12?' + 3 strides':''}`),T(`${fk(km)} km am Stück im ${dl}-Renntempo ${pace(P)} (${hzRP(c)})`,`${fk(km)} km non-stop at ${dl} race pace ${pace(P)} (${hzRP(c)})`),T('1.5 km auslaufen','1.5 km cool-down')].concat(dur>=50?[d>25?T('Verpflegung wie am Renntag: nach 30–40 min ein Gel mit Wasser, dann alle 25–30 min','Fuel as on race day: a gel with water after 30–40 min, then every 25–30 min'):T('Verpflegung wie am Renntag: nach 40–45 min ein Gel mit Wasser','Fuel as on race day: a gel with water after 40–45 min')]:[]),
      note:T(`Test ${no} von ${of}: Er zeigt, ob dein Zieltempo sitzt, und gibt dir Sicherheit für den Renntag. Gleichmässig laufen, nicht schneller als vorgegeben. Danach den Kilometer-Splits-Screenshot hochladen (oder Pace und Puls beider Hälften eintragen): Daraus beurteilt der Coach Pulsniveau und Decoupling.`,`Test ${no} of ${of}: it shows whether your goal pace is there and gives you confidence for race day. Run evenly, not faster than prescribed. Afterwards upload the kilometre-splits screenshot (or enter pace and heart rate of both halves): from it the coach judges heart-rate level and decoupling.`)})},
  // ---- quality sessions: a library of variants that rotate week by week (same purpose, different form) ----
  // every variant states pace or effort, the recovery jog and the heart-rate range of the work phases
  fartlek(c,j,light){const b0=c.exp===0,Z=hz(c,'Z4'),zp=(c.pc.I+c.pc.T)/2,V=light||b0?[0,1,2,3]:[0,1,2,3,4,5],v=V[vix(c,'f')%V.length];let st,ws,rs,n,t,reps;
    if(v===0){n=light?6:Math.min(b0?4+j:6+j,b0?8:10);const r=b0?120:60;ws=n*60;rs=n*r;reps=n;t=T('Fahrtspiel 1 min','Fartlek 1 min');st=[T(`${n} × 1 min zügig`,`${n} × 1 min brisk`),T(`Trabpause je ${jogS(r)}${b0?' (gehen erlaubt)':''}`,`Jog recovery ${jogS(r)} each${b0?' (walking allowed)':''}`)]}
    else if(v===1){const P=j>=2&&!light?[1,2,3,4,3,2,1]:[1,2,3,2,1];ws=P.reduce((a,b)=>a+b,0)*60;rs=ws/2;reps=P.length;t=T('Pyramiden-Fahrtspiel','Pyramid fartlek');st=[T(`${P.join('-')} min zügig`,`${P.join('-')} min brisk`),T('Trabpause jeweils halb so lang wie der Abschnitt davor','Jog recovery half as long as the section before')]}
    else if(v===2){const k=light||b0?1:2,m=light?10:8;ws=k*m*30;rs=k*m*30+(k-1)*180;reps=k*m;t=T('30/30-Fahrtspiel','30/30 fartlek');st=[T(`${k>1?k+' × (':''}${m} × 30 s zügig / 30 s locker traben${k>1?')':''}`,`${k>1?k+' × (':''}${m} × 30 s brisk / 30 s easy jog${k>1?')':''}`)].concat(k>1?[T('3 min Trab zwischen den Serien','3 min jog between sets')]:[])}
    else if(v===3){n=light?4:Math.min(4+j,7);ws=n*120;rs=n*60;reps=n;t=T('Fahrtspiel 2 min','Fartlek 2 min');st=[T(`${n} × 2 min zügig`,`${n} × 2 min brisk`),T('Trabpause je 1 min','Jog recovery 1 min each')]}
    else if(v===4){ws=2*90+4*60+4*30+4*15;rs=ws;reps=14;t=T('Mona-Fartlek','Mona fartlek');st=[T('2 × 90 s, 4 × 60 s, 4 × 30 s, 4 × 15 s zügig','2 × 90 s, 4 × 60 s, 4 × 30 s, 4 × 15 s brisk'),T('Trabpause jeweils gleich lang wie der Abschnitt davor (zusammen 20 min)','Jog recovery as long as the section before (20 min in total)')]}
    else{const k=j>=2?3:2;ws=k*6*60;rs=k*2*60+(k-1)*120;reps=k*3;t=T('Leiter-Fahrtspiel','Ladder fartlek');st=[T(`${k} × (3 min – 2 min – 1 min zügig)`,`${k} × (3 min – 2 min – 1 min brisk)`),T('Je 1 min Trab, 2 min Trab zwischen den Serien','1 min jog each, 2 min jog between sets')]}
    return mk(c,{type:'fartlek',title:light?T('Lockeres ','Easy ')+t:t,km:2+ws/zp+rs/c.pc.E[1]+1.5,zone:'Z4',pace:[c.pc.I,c.pc.T],interval:true,quality:true,reps,
      structure:[T('2 km einlaufen','2 km warm-up'),...st,T(`Puls gegen Ende der zügigen Abschnitte ${Z}`,`Heart rate towards the end of the brisk sections ${Z}`),T('1.5 km auslaufen','1.5 km cool-down')],note:T('Zügig heisst etwa 10-km-Renngefühl, nicht sprinten. Abwechslung hält den Kopf frisch, die Wirkung ist dieselbe.','Brisk means about 10 km race feel, no sprinting. Variety keeps you fresh; the effect is the same.')})},
  hills(c,j){const b0=c.exp===0,v=vix(c,'h')%4,Z=hz(c,'Z4');let st,ws,reps,t;
    if(v===0){const n=b0?Math.min(4+j,8):Math.min(6+j,10);ws=n*60;reps=n;t=T('Hügelsprints 60 s','Hill reps 60 s');st=[T(`${n} × 60 s bergauf zügig (Anstrengung 8/10)`,`${n} × 60 s uphill brisk (effort 8/10)`),T('Trabpause: locker zurücktraben (ca. 90 s)','Recovery: jog back down easily (about 90 s)')]}
    else if(v===1){const n=Math.min(8+j,12);ws=n*30;reps=n;t=T('Kurze Bergsprints','Short hill sprints');st=[T(`${n} × 30 s steil bergauf, kräftig (9/10)`,`${n} × 30 s up a steep hill, powerful (9/10)`),T('Pause: zurückgehen oder sehr locker traben (ca. 90 s)','Recovery: walk or jog very easily back down (about 90 s)')]}
    else if(v===2){const n=b0?3:Math.min(4+Math.floor(j/2),6);ws=n*120;reps=n;t=T('Lange Hügel','Long hills');st=[T(`${n} × 2 min an einem längeren Anstieg (4–6 %), kontrolliert hart (7–8/10)`,`${n} × 2 min on a longer climb (4–6 %), controlled hard (7–8/10)`),T('Trabpause: locker zurücktraben (ca. 2–3 min)','Recovery: jog back down easily (about 2–3 min)')]}
    else{const P=j>=2?[30,60,90,60,30,60,30]:[30,60,90,60,30];ws=P.reduce((a,b)=>a+b,0);reps=P.length;t=T('Hügel-Pyramide','Hill pyramid');st=[T(`Bergauf ${P.join('-')} s zügig`,`Uphill ${P.join('-')} s brisk`),T('Trabpause: jeweils locker zurücktraben','Recovery: jog back down easily each time')]}
    return mk(c,{type:'hills',title:t,km:2.5+2*ws/(c.pc.T*1.15)+2,zone:'Z4',pace:null,interval:true,quality:true,reps,
      structure:[T('2.5 km einlaufen bis zum Hügel','2.5 km warm-up to the hill'),...st,T(`Puls gegen Ende der Anstiege ${Z} (hinkt nach, Tempo nach Gefühl)`,`Heart rate at the end of the climbs ${Z} (it lags; pace by feel)`),T('2 km auslaufen','2 km cool-down')],
      note:T('Kraft und Laufökonomie: aufrecht bleiben, kurze schnelle Schritte, Arme aktiv.','Strength and running economy: stay upright, short quick steps, active arms.')})},
  tempo(c,j,short){const P=c.pc.T,a=c.amb&&c.d>=5?c.amb:0,m=Math.max(10,a?Math.max(Math.min(short?Math.min(12+2*j,20):Math.min(18+3*j,35),Math.round(capK(c,.1,4)*P/60)),Math.min(Math.round((c.wkKm||0)*(short?.075:.09)*(a===2?1.1:1)*P/60),40)):Math.min(short?Math.min(12+2*j,20):Math.min(18+3*j,c.exp>=2?35:25),Math.round(capK(c,.1,4)*P/60))),v0=vix(c,'t')%4,v=v0===0&&m>25?(m>36?2:1):v0,Z=hz(c,'Z4');let st,ws=m*60,rs=0,t;
    if(v===0||m<16){t=short?T('Kurzer Tempolauf','Short tempo run'):T('Tempodauerlauf','Tempo run');st=[T(`${m} min am Stück im Schwellentempo ${pace(P)}`,`${m} min continuously at threshold pace ${pace(P)}`)]}
    else if(v===1){const h=Math.round(m/2);t=T('Tempolauf 2-teilig','Tempo run in two parts');st=[T(`2 × ${h} min im Schwellentempo ${pace(P)}`,`2 × ${h} min at threshold pace ${pace(P)}`),T('Trabpause 2 min','Jog recovery 2 min')];rs=120}
    else if(v===2){const h=Math.max(6,Math.round(m/3));t=T('Tempolauf 3-teilig','Tempo run in three parts');st=[T(`3 × ${h} min im Schwellentempo ${pace(P)}`,`3 × ${h} min at threshold pace ${pace(P)}`),T('Trabpause je 90 s','Jog recovery 90 s each')];rs=180}
    else{const h=Math.round(m/2);t=T('Progressiver Tempolauf','Progressive tempo run');st=[T(`${h} min in ${pace(P+8)}, dann ${m-h} min in ${pace(P)}`,`${h} min at ${pace(P+8)}, then ${m-h} min at ${pace(P)}`)]}
    return mk(c,{type:'tempo',title:t,km:2.5+ws/P+rs/c.pc.E[1]+2,zone:'Z4',pace:band(P),quality:true,track:true,
      structure:[T('2.5 km einlaufen','2.5 km warm-up'),...st,T(`Puls ${Z}; ab der Mitte prüfen`,`Heart rate ${Z}; check from halfway`),T('2 km auslaufen','2 km cool-down')],note:T('Kontrolliert hart: kurze Sätze gehen noch, ein Gespräch nicht mehr.','Controlled hard: short sentences still work, a conversation does not.')})},
  cruise(c,j){const a=c.amb&&c.d>=5?c.amb:0,tot=a?Math.max(Math.min(5+1.6*j,8,capK(c,.1,4)),Math.min((c.wkKm||0)*(a===2?.1:.09),a===2?10:9)):Math.min(5+1.6*j,c.exp>=2?8:6.5,capK(c,.1,4)),v=vix(c,'c')%6,Z=hz(c,'Z4'),P=c.pc.T;let st,wk,rs,reps,t=T('Schwellenintervalle','Threshold intervals');
    if(v===0){const n=Math.max(3,Math.round(tot/1.6));wk=n*1.6;rs=(n-1)*60;reps=n;st=[T(`${n} × 1.6 km im Schwellentempo ${pace(P)}`,`${n} × 1.6 km at threshold pace ${pace(P)}`),T('Trabpause je 60 s','Jog recovery 60 s each')]}
    else if(v===1){const n=Math.max(4,Math.round(tot));wk=n;rs=(n-1)*60;reps=n;st=[T(`${n} × 1000 m im Schwellentempo ${pace(P)}`,`${n} × 1000 m at threshold pace ${pace(P)}`),T('Trabpause je 60 s','Jog recovery 60 s each')]}
    else if(v===2){const n=Math.max(2,Math.round(tot/2));wk=n*2;rs=(n-1)*90;reps=n;st=[T(`${n} × 2 km im Schwellentempo ${pace(P)}`,`${n} × 2 km at threshold pace ${pace(P)}`),T('Trabpause je 90 s','Jog recovery 90 s each')]}
    else if(v===3){const L=tot>=7.5?[1,2,3,2]:tot>=6?[1,2,2,1]:[1,2,1];wk=L.reduce((a,b)=>a+b,0);rs=(L.length-1)*90;reps=L.length;t=T('Schwellen-Pyramide','Threshold pyramid');st=[T(`${L.join('-')} km im Schwellentempo ${pace(P)}`,`${L.join('-')} km at threshold pace ${pace(P)}`),T('Trabpause je 90 s','Jog recovery 90 s each')]}
    else if(v===4){const n=Math.max(3,Math.round(tot*P/360));wk=n*360/P;rs=(n-1)*60;reps=n;st=[T(`${n} × 6 min im Schwellentempo ${pace(P)}`,`${n} × 6 min at threshold pace ${pace(P)}`),T('Trabpause je 1 min','Jog recovery 1 min each')]}
    else{const n=tot>=7.5?3:2;wk=n*3;rs=(n-1)*120;reps=n;st=[T(`${n} × 3 km im Schwellentempo ${pace(P)}`,`${n} × 3 km at threshold pace ${pace(P)}`),T('Trabpause je 2 min','Jog recovery 2 min each')]}
    return mk(c,{type:'cruise',title:t,km:2.5+wk+rs/c.pc.E[1]+2,zone:'Z4',pace:band(P),interval:true,quality:true,track:true,reps,
      structure:[T('2.5 km einlaufen','2.5 km warm-up'),...st,T(`Puls in den Belastungen ${Z}`,`Heart rate in the work phases ${Z}`),T('2 km auslaufen','2 km cool-down')],note:T('Gleichmässig: die letzte Wiederholung so schnell wie die erste.','Even: the last repetition as fast as the first.')})},
  vo2(c,j){const a=c.amb&&c.d<=12?c.amb:0,tot=a?Math.max(Math.min(4+.5*j,6,capK(c,.08,3)),Math.min((c.wkKm||0)*(a===2?.08:.07),a===2?8:7)):Math.min(4+.5*j,c.exp>=2?6:5,capK(c,.08,3)),V=c.exp>=1?[0,1,2,3,4,5]:[1,3,6],v=V[vix(c,'v')%V.length],Z=hz(c,'Z5'),P=c.pc.I;let st,wk,rs,reps,t=T('Intervalle','Intervals');
    if(v===0){const n=Math.max(4,Math.round(tot));wk=n;rs=n*140;reps=n;st=[T(`${n} × 1000 m im Intervalltempo ${pace(P)}`,`${n} × 1000 m at interval pace ${pace(P)}`),T('Trabpause je 400 m (ca. 2:20 min)','Jog recovery 400 m each (about 2:20 min)')]}
    else if(v===1){const n=Math.max(5,Math.round(tot/.8));wk=n*.8;rs=n*120;reps=n;st=[T(`${n} × 800 m im Intervalltempo ${pace(P)}`,`${n} × 800 m at interval pace ${pace(P)}`),T('Trabpause je 400 m (ca. 2 min)','Jog recovery 400 m each (about 2 min)')]}
    else if(v===2){const n=Math.max(3,Math.round(tot/1.2));wk=n*1.2;rs=n*180;reps=n;st=[T(`${n} × 1200 m im Intervalltempo ${pace(P)}`,`${n} × 1200 m at interval pace ${pace(P)}`),T('Trabpause je 3 min','Jog recovery 3 min each')]}
    else if(v===3){const n=Math.min(c.exp>=2?6:5,Math.max(4,Math.round(tot*P/180)));wk=n*180/P;rs=n*120;reps=n;st=[T(`${n} × 3 min im Intervalltempo (${pace(P)})`,`${n} × 3 min at interval pace (${pace(P)})`),T('Trabpause je 2 min','Jog recovery 2 min each')]}
    else if(v===4){const L=tot>=5.5?[400,800,1200,1600,1200,800]:[400,800,1200,800,400];wk=L.reduce((a,b)=>a+b,0)/1000;rs=wk*P;reps=L.length;t=T('Intervall-Pyramide','Interval pyramid');st=[T(`${L.join('-')} m im Intervalltempo ${pace(P)}`,`${L.join('-')} m at interval pace ${pace(P)}`),T('Trabpause jeweils so lang wie die Belastung davor','Jog recovery as long as the rep before')]}
    else if(v===5){const k=tot>=5?3:2;wk=k*5*.4;rs=k*5*75+(k-1)*180;reps=k*5;t=T('400er-Serien','400 m sets');st=[T(`${k} × (5 × 400 m) in ${pace(P-3)}`,`${k} × (5 × 400 m) at ${pace(P-3)}`),T('Trabpause je 200 m (ca. 75 s), 3 min zwischen den Serien','Jog recovery 200 m (about 75 s), 3 min between sets')]}
    else{const n=Math.min(5+j,8);wk=n*120/P;rs=n*120;reps=n;st=[T(`${n} × 2 min zügig (${pace(P)})`,`${n} × 2 min brisk (${pace(P)})`),T('Trabpause je 2 min','Jog recovery 2 min each')]}
    return mk(c,{type:'vo2',title:t,km:2.5+wk+rs/c.pc.E[1]+2,zone:'Z5',pace:band(P,.02),interval:true,quality:true,track:true,reps,
      structure:[T('2.5 km einlaufen + 3 Steigerungen','2.5 km warm-up + 3 strides'),...st,T(`Puls gegen Ende der Belastungen ${Z} (hinkt nach)`,`Heart rate towards the end of each rep ${Z} (it lags)`),T('2 km auslaufen','2 km cool-down')],note:T('Die letzten 30 s jeder Wiederholung fühlen sich hart an. Bricht das Tempo stark ein: aufhören.','The last 30 s of each rep feel hard. If the pace drops a lot: stop.')})},
  // speed (repetition pace, Daniels R): short fast reps with full recovery; running economy and speed reserve for 5 and 10 km
  reps(c,j){const P=c.pc.R,v=vix(c,'v')%3,mx=capK(c,.05,2);let n,len,t,rest;
    if(v===0){len=.2;n=Math.min(8+j,12);t=T('Schnelligkeit 200 m','Speed 200 m');rest=T('200 m locker traben','200 m easy jog')}
    else if(v===1){len=.4;n=Math.min(5+j,8);t=T('Schnelligkeit 400 m','Speed 400 m');rest=T('400 m locker traben','400 m easy jog')}
    else{len=.3;n=Math.min(6+j,10);t=T('Schnelligkeit 300 m','Speed 300 m');rest=T('300 m locker traben, nach der Hälfte 3 min','300 m easy jog, 3 min after half of them')}
    n=Math.max(4,Math.min(n,Math.floor(mx/len)));
    return mk(c,{type:'vo2',title:t,km:2.5+2*n*len+2,zone:'Z5',hr:[...c.zones.Z5.hr],pace:band(P,.02),interval:true,quality:true,reps:n,
      structure:[T('2.5 km einlaufen + 3 Steigerungen','2.5 km warm-up + 3 strides'),T(`${n} × ${Math.round(len*1000)} m in ${pace(P)} (schnell, aber locker und sauber)`,`${n} × ${Math.round(len*1000)} m at ${pace(P)} (fast but relaxed and smooth)`),T(`Pause: ${rest}, voll erholt starten`,`Recovery: ${rest}, start each rep fully recovered`),T('Puls ist hier kein Massstab, die Pace zählt','Heart rate is no guide here; pace counts'),T('2 km auslaufen','2 km cool-down')],
      note:T('Schnell heisst nicht verbissen: lockere Schultern, schnelle Schritte. Die Pausen sind lang, damit jede Wiederholung gleich schnell und sauber wird.','Fast does not mean strained: loose shoulders, quick steps. Recoveries are long so every rep is equally fast and clean.')})},
  rp(c,j,sharp){const d=c.d,RP=c.pc.RP,z=zoneFor(c.pc,RP),Z=d<=43?hzRP(c):hz(c,z),v=vix(c,'r')%3;let n,len,rest,restKm,line;
    if(d<=5.5){[[len,n,rest,restKm]]=[sharp?[1,3,T('400 m Trab','400 m jog'),.4]:[[1,Math.min(4+j,6),T('400 m Trab (ca. 2 min)','400 m jog (about 2 min)'),.4],[.8,Math.min(5+j,7),T('200 m Trab (ca. 75 s)','200 m jog (about 75 s)'),.2],[1.6,Math.min(2+Math.floor(j/2),3),T('3 min Trab','3 min jog'),.5]][v]]}
    else if(d<=12){[[len,n,rest,restKm]]=[sharp?[2,2,T('600 m Trab','600 m jog'),.6]:[[2,Math.min(3+Math.floor(j/2),4),T('600 m Trab (ca. 3 min)','600 m jog (about 3 min)'),.6],[1,Math.min(5+j,7),T('60 s Trab','60 s jog'),.2],[3,2,T('3 min Trab','3 min jog'),.5]][v]]}
    else if(d<=25){[[len,n,rest,restKm]]=[sharp?[2,2,T('1 km Trab','1 km jog'),1]:[[c.exp>=2?4:3,Math.min(2+Math.floor(j/2),3),T('1 km Trab','1 km jog'),1],[2,Math.min(4+Math.floor(j/2),5),T('90 s Trab','90 s jog'),.3],[c.exp>=2?5:4,2,T('1 km Trab','1 km jog'),1]][v]]}
    else if(d<=43){len=sharp?3:5;n=sharp?2:Math.min(2+Math.floor(j/2),3);rest=T('1 km locker','1 km easy');restKm=1}
    else{n=sharp?2:Math.min(2+Math.floor(j/2),3);len=r05(20*60/RP);rest=T('5 min locker','5 min easy');restKm=.8;line=T(`${n} × 20 min im Ultra-Renntempo ${pace(RP)} auf welligem Kurs`,`${n} × 20 min at ultra race pace ${pace(RP)} on a rolling course`)}
    if(!line){const mx=capK(c,d<=12?(c.exp===0?.12:.14):d<=25?.16:.2,3);n=Math.max(sharp?2:Math.min(n,2),Math.min(n,Math.floor(mx/len+1e-9)));if(!sharp&&n*len>mx*1.25)len=Math.max(d<=12?.8:2,r05(mx/n))}
    const notes=[T('Genau im vorgegebenen Tempo, nicht schneller. Das Gefühl für dieses Tempo ist das eigentliche Ziel.','Exactly at the prescribed pace, not faster. The feel for this pace is the real goal.')];
    if(c.pc.RPgoal&&RP>c.pc.RPgoal+1)notes.push(rpWay(c));
    if(c.pc.RPsrc==='gedeckelt')notes.push(T('Deine Wunschzeit liegt deutlich über der aktuellen Form. Trainiert wird darum etwas langsamer. Verbesserst du dich, zieht das Tempo automatisch nach.','Your target time is well beyond your current form, so training is a bit slower. As you improve, the pace follows automatically.'));
    return mk(c,{type:'rp',title:sharp?T('Renntempo-Schärfung','Race-pace sharpener'):T('Renntempo-Intervalle','Race-pace intervals'),km:2.5+n*len+(n-1)*restKm+2,zone:z,hr:d<=43?hrRP(c):null,pace:band(RP,.01),interval:true,quality:true,track:true,reps:n,
      structure:[T('2.5 km einlaufen','2.5 km warm-up'),line||T(`${n} × ${fk(len)} km im Renntempo ${pace(RP)}`,`${n} × ${fk(len)} km at race pace ${pace(RP)}`),T(`Trabpause: ${rest}`,`Jog recovery: ${rest}`),T(`Puls in den Belastungen ${Z}`,`Heart rate in the work phases ${Z}`),T('2 km auslaufen','2 km cool-down')],note:notes.join(' ')})},
  mpace(c,j){const mar=c.d>25&&c.d<=43,P=mar?c.pc.RP:c.pc.M,Z=mar?hzRP(c):hz(c,'Z3'),v=vix(c,'m')%4;let m=Math.max(6,Math.min(8+2*j,c.exp>=3?14:c.exp>=2?12:10,Math.floor(capK(c,.2,8)))),st,t=T('Marathontempo-Lauf','Marathon-pace run'),rk=0;
    if(v===0||m<9)st=[T(`${m} km am Stück im Marathontempo ${pace(P)}`,`${m} km continuously at marathon pace ${pace(P)}`)];
    else if(v===1){const h=Math.round(m/2);st=[T(`2 × ${h} km im Marathontempo ${pace(P)}`,`2 × ${h} km at marathon pace ${pace(P)}`),T('Dazwischen 1 km locker','1 km easy in between')];rk=1;m=h*2}
    else if(v===2){const k=Math.min(5,Math.round(m/2));t=T('Marathontempo-Wechsel','Marathon-pace alternations');st=[T(`${k} × 2 km im Marathontempo ${pace(P)}`,`${k} × 2 km at marathon pace ${pace(P)}`),T('Dazwischen je 1 km locker (nicht stehen bleiben)','1 km easy in between each (keep moving)')];rk=k-1;m=k*2}
    else{const h=Math.round(m/2);t=T('Progressiver Marathontempo-Lauf','Progressive marathon-pace run');st=[T(`${h} km in ${pace(P+10)}, dann ${m-h} km im Marathontempo ${pace(P)}`,`${h} km at ${pace(P+10)}, then ${m-h} km at marathon pace ${pace(P)}`)]}
    return mk(c,{type:'mpace',title:t,km:2+m+rk+1.5,zone:'Z3',hr:mar?hrRP(c):null,pace:band(P),quality:true,track:true,
      structure:[T('2 km einlaufen','2 km warm-up'),...st,T(`Puls ${Z}`,`Heart rate ${Z}`),T('1.5 km auslaufen','1.5 km cool-down')],note:T('Fühlt sich zu Beginn fast zu leicht an. Genau richtig.','Feels almost too easy at first. That is exactly right.')+(mar&&c.pc.RPgoal&&P>c.pc.RPgoal+1?' '+rpWay(c):'')})},
  race(c,r,isMain){
    const rel=r.rel||'mid',base=isMain?c.pc.RP:(r.goal?r.goal/r.dist:predict(c.vd,r.dist)/r.dist),RPr=base*(rel==='low'?1.04:1);
    const ultra=r.dist>42.2,timeLine=ultra&&!r.goal?'Gleichmässig nach Gefühl, steile Anstiege gehen':`${fk(r.dist)} km mit Ø ${pace(RPr)}, Zielzeit ca. ${fmtTime(RPr*r.dist)}`;
    const effort={high:'Saisonhöhepunkt: gut einteilen und auf den letzten Kilometern alles geben.',mid:'Ein gutes Rennen laufen, ohne alles zu riskieren.',low:'Aus dem Training heraus: kontrolliert hart, nicht ans Limit.'}[rel];
    if(r.virtual)return Object.assign(mk(c,{type:'race',title:T('Zieltest ','Goal test ')+fk(r.dist)+' km',km:r.dist,zone:r.goal?zoneFor(c.pc,r.goal/r.dist):'Z3',pace:r.goal?band(r.goal/r.dist,.01):null,quality:true,
      structure:[T('10–15 min einlaufen, 3 Steigerungen','10–15 min warm-up, 3 strides'),r.goal?T(`${fk(r.dist)} km gleichmässig, Ziel ${fmtTime(r.goal)} (Ø ${pace(r.goal/r.dist)})`,`${fk(r.dist)} km evenly, goal ${fmtTime(r.goal)} (avg. ${pace(r.goal/r.dist)})`):T(`${fk(r.dist)} km am Stück, in einem Tempo, das du bis zum Schluss halten kannst`,`${fk(r.dist)} km non-stop, at a pace you can hold to the end`),T('Danach 10 min auslaufen oder gehen','Then 10 min cool-down jog or walk')],
      note:T('Dein Zieltest. Trag danach Zeit und Distanz ein: Du siehst, ob du dein Ziel erreicht hast, und kannst ein neues setzen oder die Form halten.','Your goal test. Log time and distance afterwards: you will see whether you reached your goal and can set a new one or keep your form.')}),{raceId:r.id});
    return Object.assign(mk(c,{type:'race',title:r.name||'Wettkampf',km:r.dist,zone:zoneFor(c.pc,RPr),pace:ultra&&!r.goal?null:band(RPr,.01),quality:true,
      structure:[r.dist<=21.1?'15 min einlaufen + 4 Steigerungen':'Kurz und sehr locker einlaufen',timeLine,
        r.dist>42.2?T('Verpflegung ab der ersten Stunde regelmässig: 60–90 g Kohlenhydrate pro Stunde','Fuel regularly from the first hour: 60–90 g carbohydrate per hour'):r.dist>25?T('Verpflegung nach Renntag-Plan: ab 35 min ein Gel etwa alle 25 min (60 g Kohlenhydrate pro Stunde)','Fuel as in the race-day plan: a gel about every 25 min from 35 min (60 g carbohydrate per hour)'):r.dist>=21?T('Verpflegung nach Renntag-Plan: ab 40 min ein Gel (30–45 g Kohlenhydrate pro Stunde, bei über 75 min)','Fuel as in the race-day plan: a gel from 40 min (30–45 g carbohydrate per hour, if over 75 min)'):'Die ersten 1–2 km bewusst kontrolliert, dann aufs Gefühl gehen'],
      note:effort+' Danach folgt die Erholung, die der Plan automatisch einbaut.'}),{raceId:r.id});
  }
};
function qCount(exp,ph,rec,days,style){
  if(rec)return exp===0?0:1;
  let n={base:[0,1,1,2],build:[1,1,2,2],peak:[1,1,2,2],taper:[1,1,1,1]}[ph][exp];
  if(ph==='base'&&exp===2&&days>=5)n=2;
  // demanding: a second quality session from 4 running days on (not for beginners); careful: one quality session below 5 days
  if(style==='hard'&&exp>=1&&days>=4&&ph!=='taper')n=Math.max(n,2);
  if(style==='safe'&&days<5)n=Math.min(n,1);
  if(days<=3)n=Math.min(n,1);
  if(days===4&&exp<=1&&style!=='hard')n=Math.min(n,1);
  return n;
}
function pickQ(c,ph,q,j,rec,lv){const d=c.d;
  if(rec)return W.fartlek(c,0,true);
  const fo=S&&S.adapt&&S.adapt.focus;if(fo&&q===1&&(ph==='build'||ph==='peak')&&c.exp>=1)return fo==='aerobic'?W.tempo(c,j):fo==='threshold'?W.cruise(c,j):W.vo2(c,j);
  if(ph==='base')return q===0?(j%2===0?W.hills(c,j):W.fartlek(c,j)):W.tempo(c,j,true);
  if(ph==='taper')return W.rp(c,0,true);
  if(ph==='build'){
    if(c.exp===0&&j<2)return W.fartlek(c,j+2);
    if(d<=12)return q===0?((d<=5.5?j%2===1:j%3===2)?W.reps(c,j):W.vo2(c,j)):W.cruise(c,j);
    if(d<=25)return q===0?W.cruise(c,j):W.vo2(c,j);
    if(d<=43)return q===0?W.cruise(c,j):W.mpace(c,j);
    return q===0?W.hills(c,j):W.tempo(c,j);
  }
  // 5/10 km ambitious: VO₂max every week in the specific block next to race pace (threshold only every third week)
  if(d<=12&&c.amb&&q===1)return d<=5.5?(j%3===2?W.reps(c,j):W.vo2(c,j)):(j%3===2?W.cruise(c,j):W.vo2(c,j));
  if(d<=12)return q===0?W.rp(c,j):d<=5.5?(j%2?W.vo2(c,j):W.reps(c,j)):(j%2?W.vo2(c,j):W.cruise(c,j));
  if(d<=25)return q===0?W.rp(c,j):(j%3===2?W.vo2(c,j):W.cruise(c,j));
  if(d<=43)return q===0?W.cruise(c,j):(lv==='mlong'?W.vo2(c,0):W.mpace(c,j));
  return q===0?W.rp(c,j):W.hills(c,j);
}
function mainRace(st){
  const t=today(),A=st.races.filter(r=>prioOf(r)==='A').sort((a,b)=>a.date<b.date?-1:1);
  return A.find(r=>r.date>=t)||A[A.length-1]||null;
}
function manualPaces(p){const M=p.zonesManual;if(!M)return null;const o={};['Z1','Z2','Z3','Z4','Z5'].forEach(k=>o[k]={pace:M[k]&&M[k].pace||null});return Object.values(o).some(x=>x.pace)?o:null}
function zonesOf(p,pc,hm){const L=labZones(p),z={};
  const def={Z1:[pc.E[1],pc.E[1]*1.08],Z2:pc.E,Z3:band(pc.M),Z4:band(pc.T),Z5:band(pc.I,.02)};
  const LT=!L&&p.lthr&&p.lthr.hr?p.lthr.hr:null,LTZ={Z1:[.72,.84],Z2:[.85,.89],Z3:[.90,.94],Z4:[.95,1],Z5:[1.01,1.06]};
  for(const k of ['Z1','Z2','Z3','Z4','Z5'])z[k]={hr:L&&L[k]?L[k].hr:LT?[Math.round(LTZ[k][0]*LT),Math.min(hm,Math.round(LTZ[k][1]*LT))]:[Math.round(ZONES[k].hr[0]*hm),Math.round(ZONES[k].hr[1]*hm)],pace:L&&L[k]&&L[k].pace?[...L[k].pace].sort((a,b)=>a-b):def[k]};
  const M=p.zonesManual;if(M)for(const k of ['Z1','Z2','Z3','Z4','Z5']){if(M[k]&&M[k].hr)z[k].hr=[...M[k].hr];if(M[k]&&M[k].pace)z[k].pace=[...M[k].pace]}
  return z}
// performance class from your level (VDOT) and current volume, not only from years of running
const CLASSL=()=>[T('Einsteiger','Beginner'),T('Fortgeschritten','Intermediate'),T('Ambitioniert','Ambitious'),T('Leistung','Competitive')];
function perfClass(p,vd){const km=p.km||0;return vd>=50&&km>=50?3:vd>=44&&km>=35?2:vd>=38&&km>=20?1:0}
// coach style: careful · balanced (default) · demanding; balanced lifts the plan by at most one class above your experience
function expEff(p,vd){const c=perfClass(p,vd),st=p.coach||'bal';return st==='safe'?p.exp:st==='hard'?Math.max(p.exp,c):Math.max(p.exp,Math.min(c,p.exp+1))}
function ctxFor(st){const p=st.profile,race=mainRace(st),vd=vdotOf(st),hm=hrMax(p),pc=paceSet(vd,race,labZones(p)||manualPaces(p));
  const e=expEff(p,vd),pp=e!==p.exp?{...p,exp:e}:p;
  return{p:pp,exp:e,d:race?race.dist:10,vd,pc,hm,zones:zonesOf(p,pc,hm),style:p.coach||'bal',capF:{safe:.85,bal:1,hard:1.15}[p.coach||'bal'],amb:ambLevel(p,race,vd,e)}}
// how ambitious the goal is (performance index of the goal time, else of the current form; needs some running experience):
// 0 = beginner to good recreational, 1 = ambitious (≥ 49.5: about HM 1:31 / M 3:12), 2 = performance (≥ 54: about HM 1:25 / M 2:58)
function ambLevel(p,race,vd,exp){if((exp??p.exp)<1)return 0;const g=race&&race.goal&&race.dist?vdotFrom(race.dist,race.goal):0,v=Math.max(g||0,g?0:vd);return v>=54?2:v>=49.5?1:0}

// Typical lengths of a race-specific preparation (weeks), from coaching practice
const PREP={5:[8,12],10:[10,16],21.1:[12,20],42.2:[16,32],50:[20,34],100:[24,36]};
// Runs per week: minimum for a serious preparation and an individual recommendation (distance, experience, goal ambition)
const FREQ={5:[2,3],10:[2,3],21.1:[3,4],42.2:[3,4],50:[4,5],100:[4,5]};
function freqInfo(p,race,vd){
  const d=race.dist;let min=Math.round(tbl(FREQ,d,0)),rec=Math.round(tbl(FREQ,d,1));const why=[];
  if(p.exp===0&&d>=21){min=Math.max(min,3);if(d>=42){min=4;rec=Math.max(rec,4)}why.push('ohne Lauferfahrung braucht der Körper viele kurze, regelmässige Reize statt weniger langer')}
  let amb=0;if(race.goal&&showPred(d))amb=predict(vd,d)/race.goal-1;
  if(amb>.04){rec++;why.push('deine Zielzeit ist ambitionierter als die aktuelle Prognose')}
  if(amb>.10){rec++}
  if(p.exp>=2&&race.goal&&d>=21&&amb>0&&rec<5){rec++;why.push('mit Erfahrung bringt eine zusätzliche Einheit am meisten Tempo')}
  rec=clamp(rec,min,6);
  return{min,rec,amb,why};
}
function freqText(fr,days,d){
  const lab=fk(d)+' km';
  if(days<fr.min)return{ok:false,t:`<b>Mit ${days} ${days===1?'Training':'Trainings'} pro Woche ist ${d>=42?'ein Marathon':d>=21?'ein Halbmarathon':'dieses Ziel'} nicht seriös vorzubereiten.</b> Für ${lab} braucht es mindestens ${fr.min} Läufe pro Woche: Sonst fehlt der Umfang, und der lange Lauf wird zur Überlastung. Wähle mehr Trainingstage oder ein kürzeres Ziel.`};
  const base=`Empfehlung für dich: <b>${fr.rec} Trainings pro Woche</b> (mindestens ${fr.min})${fr.why.length?', weil '+fr.why.join(' und '):''}.`;
  if(days<fr.rec)return{ok:true,warn:true,t:base+` Mit ${days} Tagen ist es machbar, die Vorbereitung wird aber länger und die Zielzeit schwieriger.`};
  if(days>fr.rec+1)return{ok:true,t:base+` Du hast ${days} Tage gewählt. Der Plan nutzt sie, hält aber genug Ruhetage frei.`};
  return{ok:true,t:base+` Du hast ${days} Tage gewählt. Das passt.`};
}
function prepInfo(p,race,vd){
  const lo=Math.round(tbl(PREP,race.dist,0)),hi=Math.round(tbl(PREP,race.dist,1));
  const expF=[1,.85,.4,0][p.exp],target=peakTarget(p,race,vd).target;
  const volGap=clamp((target-(p.km||0))/target,0,1);
  let goalGap=.3;if(race.goal&&showPred(race.dist)){goalGap=clamp((predict(vd,race.dist)/race.goal-1)/.08,0,1)}
  // little experience pushes towards the upper end; structured training, experience and a realistic goal towards the lower end
  const days=(p.daysSel&&p.daysSel.length)||p.days||4,fr=freqInfo(p,race,vd);
  // fewer runs per week than recommended lengthen the preparation, more shorten it slightly
  const f=clamp(Math.max([.85,.6,0,0][p.exp],.45*expF+.25*volGap+.3*goalGap)+clamp((fr.rec-days)*.15,-.1,.45),0,1);
  return{lo,hi,weeks:Math.round(lo+f*(hi-lo)),why:{exp:expF,vol:volGap,goal:race.goal?goalGap:null,days,rec:fr.rec}};
}
function setPrep(force){
  const m=mainRace(S);if(!m)return;
  if(force||!S.plan.prep||!S.plan.specStart||today()<S.plan.specStart)S.plan.prep=prepInfo(S.profile,m,vdotOf(S));
}
// Post-race recovery, independent of how important the race was: complete rest first, then days without intensity (Daniels: one easy day per 3 km raced)
function recInfo(d){
  const rest=d<=6?1:d<=11?2:d<=22?3:d<=43?7:d<=60?9:14;
  return{rest,easy:Math.max(rest+2,Math.ceil(d/3)),minF:d<=11?.75:d<=22?.6:d<=43?.45:.35};
}
function recText(d){const R=recInfo(d);
  return`${R.rest} ${R.rest===1?'Tag':'Tage'} ohne Laufen (nur leichte Gymnastik, Mobilisation, Spazieren), insgesamt ${R.easy} Tage ohne Intensität, der Umfang startet bei ${Math.round(R.minF*100)} %`}
function recRest(){return{type:'rest',title:'Ruhetag nach dem Wettkampf',km:0,zone:'Z1',pace:null,hr:null,structure:['Kein Lauftraining','Erlaubt: leichte Gymnastik, Mobilisation, Dehnen, Spazieren'],note:'Muskeln, Sehnen und Immunsystem brauchen nach einem Wettkampf Zeit. Auch wenn du dich gut fühlst: diese Tage nicht überspringen.'}}

// heart-rate range of a zone, recovery as text, rotating variant per week (stable for a given plan week)
const hz=(c,z)=>{const h=c.zones[z].hr;return`♥ ${h[0]}–${h[1]}`};
// work volume of one session at most a share of the week (Daniels: threshold ≤ 10 %, interval pace ≤ 8 %, marathon pace ≤ 20 %), with a floor for low weekly volumes
const capK=(c,f,mn)=>c.wkKm?Math.max(mn,f*(c.capF||1)*c.wkKm):Infinity;
// on the way to goal pace: race-pace sessions start at today's form and get faster week by week
const rpWay=c=>T(`Auf dem Weg zum Zieltempo ${pace(c.pc.RPgoal)}: Das Renntempo startet bei deiner aktuellen Form und wird Woche für Woche schneller. So bleibt jede Einheit machbar.`,`On the way to goal pace ${pace(c.pc.RPgoal)}: race pace starts at your current form and gets faster week by week, so every session stays doable.`);
const jogS=s=>s>=60?(s%60?`${Math.floor(s/60)}:${pad(s%60)} min`:`${s/60} min`):`${s} s`;
const hrRP=c=>MPB(c.d).hr.map(x=>Math.round(x*c.hm)),hzRP=c=>{const h=hrRP(c);return`♥ ${h[0]}–${h[1]}`};
const vix=(c,k)=>(c.wi||0)+{f:0,h:1,t:2,c:3,v:1,r:0,m:2}[k];
// fuelling practice in long runs: race distance and duration decide how much (practise exactly what you will take in the race)
function fuelLine(c,km){const dur=km*mid2(c.pc.E)/60;
  if(c.d>25&&dur>=75)return T('Verpflegung üben: ab 40 min alle 25–30 min ein Gel (ca. 25 g Kohlenhydrate) mit Wasser, gleiches Produkt wie am Renntag','Practise fuelling: from 40 min a gel (about 25 g carbohydrate) with water every 25–30 min, same product as on race day');
  if(c.d>12&&dur>=70)return T('Verpflegung testen: nach 45–60 min ein Gel mit Wasser, wie am Renntag','Test fuelling: a gel with water after 45–60 min, as on race day');
  if(dur>=90)return T('Ab 75 min trinken und Kohlenhydrate testen','From 75 min drink and test carbohydrates');
  return null}
function buildPlan(st){
  let p=st.profile;const race=mainRace(st);if(st.plan.mode==='fit'||!race)return buildFitPlan(st,st.plan.startMonday,false);
  const start=st.plan.startMonday,raceMon=monday(race.date);
  if(raceMon<start)return[];
  const NT=daysBetween(start,raceMon)/7+1,c=ctxFor(st),d=race.dist,exp=c.exp,cur=monday(today()),HB=habKm(st);p={...c.p,km:HB.km};st.plan.hab=HB;c.curIdx=Math.max(0,daysBetween(start,cur)/7);
  const prep=(st.plan.prep||prepInfo(p,race,c.vd)).weeks;
  const G=Math.max(0,NT-prep),N=NT-G;
  st.plan.specStart=addD(start,7*G);
  const pt=peakTarget(p,race,c.vd,mid2(c.pc.E)),cyc=(exp===0||p.age>=50)?3:4,target=pt.target,growth=exp<=1?1.07:1.09;
  const curKm=Math.max(p.km||0,exp===0?8:12);
  const entryKm=Math.max(exp===0?10:15,target*.5),holdKm=Math.max(entryKm*.75,Math.min(curKm*(exp>=2?1:.92),Math.max(target*.9,entryKm)));
  const weeks=[];
  // general phase before the race-specific block: build fitness, or keep it with less volume and more variety
  let gk=curKm,reached=curKm>=entryKm*.95,gl=curKm,gj=0,hj=0;
  for(let i=0;i<G;i++){
    const mon=addD(start,7*i),left=G-i;let km,mode,rec=false;
    if(left<=2&&G>2){km=Math.max(reached?holdKm:gl,holdKm+(entryKm-holdKm)*(3-left)/2);mode='build'}
    else if(!reached){if(i>0)gk*=1.06;if(gk>=entryKm*.95)reached=true;km=Math.min(gk,entryKm);mode='build';rec=i>0&&(i+1)%cyc===0;if(rec)km*=.8}
    else{mode='hold';rec=exp>=2&&hj%4===3;km=holdKm*(rec?.8:1);hj++}
    gl=km;if(mon>=cur)km*=st.adapt.volFactor;
    weeks.push({monday:mon,phase:'gen',genMode:mode,recovery:rec,days:makeGenWeek(c,i,gj++,rec,km,mode)});
  }
  const startKm=G?Math.max(entryKm*.9,gl):curKm;
  let taper=d<=10.5?1:d<=25?2:(d<=43&&exp<2)?2:3;
  taper=Math.max(1,Math.min(taper,Math.floor(N/4)||1));
  const R=N-taper;
  let peakW=R<=2?R:Math.max(1,Math.round(R*.3));
  const buildW=Math.round((R-peakW)*.55),baseW=R-peakW-buildW;
  const phases=[],recov=[];
  for(let i=0;i<N;i++){phases.push(i<baseW?'base':i<baseW+buildW?'build':i<R?'peak':'taper');recov.push(i>0&&i<R-1&&(i+1)%cyc===0)}
  const rampIdx=[...Array(R).keys()].filter(i=>!recov[i]&&phases[i]!=='peak');
  // peak: target from goal time and experience, at most 1.5x the volume at the start of the block, reachable with the weekly ramp
  const baseKm=Math.max(startKm,curKm);
  let peakKm=baseKm>=target?Math.min(Math.max(target,Math.min(baseKm,pt.hi)),pt.daysCap):Math.min(target,baseKm*1.5,startKm*Math.pow(growth,Math.max(1,rampIdx.length)));
  st.plan.peak={lo:Math.round(pt.lo),hi:Math.round(pt.hi),target:Math.round(target),km:Math.round(peakKm),limit:target<pt.lo+[0,.3,.65,1][exp]*(pt.hi-pt.lo)-1?'days':peakKm<target-1?'current':null};
  const TF={1:[.55],2:[.75,.5],3:[.8,.65,.45]}[taper];
  let last=startKm,k=0,pj=0;const jIn={};
  // race pace grows from today's form to the goal: reached about 5 weeks before the race (last race-pace test), never closer to
  // threshold than physiology allows (marathon ≥ 3 % slower than threshold, half ≥ threshold, 10 km ≥ 3 % faster than threshold)
  const pc0=c.pc,prRP=showPred(d)&&pc0.RP?predict(c.vd,d)/d:null,iFull=Math.max(1,N-1-5);
  const rpAt=i=>{if(!prRP||!pc0.RP||pc0.RP>=prRP)return pc0.RP;const f=clamp(i/iFull,0,1),v=prRP+(pc0.RP-prRP)*f;
    const fl=d>25?pc0.T*1.03:d>12?pc0.T:d>7?pc0.T*.97:pc0.I*.99;return Math.max(pc0.RP,d<=43?Math.max(v,Math.min(fl,prRP)):v)};
  for(let i=0;i<N;i++){
    const ph=phases[i],mon=addD(start,7*(G+i));let km;
    c.pc={...pc0,RP:rpAt(i),RPgoal:pc0.RP};
    if(ph==='taper')km=peakKm*TF[i-R];
    else if(recov[i])km=last*.75;
    else if(ph==='peak'){km=peakKm*(pj++%2?.94:1);last=km}
    else{const n=rampIdx.length;km=startKm*Math.pow(peakKm/startKm,peakW>0?k/n:(n>1?k/(n-1):1));k++;last=km}
    if(mon>=cur){km*=ph==='taper'?Math.min(1,st.adapt.volFactor):st.adapt.volFactor;km=Math.min(km,Math.max(pt.cap,peakKm))}
    const j=jIn[ph]=(jIn[ph]??-1)+(recov[i]?0:1);
    weeks.push({monday:mon,phase:ph,recovery:recov[i],rp:c.pc.RP,days:makeWeek(c,G+i,ph,Math.max(0,j),recov[i],km)});
  }
  c.pc=pc0;
  // recovery after the main race, then easy maintenance until every later race (and its recovery) is covered
  const RI=recInfo(d),NR=Math.max(1,Math.ceil((RI.easy-(6-dow(race.date)))/7));
  const MIr=maintInfo(p,HB.km,d,Math.max(2,trainDays(p).length||3),mid2(c.pc.E)),recKm=Math.min(holdKm,MIr.trans);
  for(let r=1;r<=NR;r++){const mon=addD(raceMon,7*r);weeks.push({monday:mon,phase:'recover',recovery:false,days:makeGenWeek(c,G+N+r,r,false,recKm,'hold')})}
  let need=addD(raceMon,7*NR+6);
  st.races.forEach(r=>{if(r.id!==race.id&&r.date>race.date&&prioOf(r)!=='A'){const e=addD(r.date,recInfo(r.dist).easy);if(e>need)need=e}});
  for(let mon=addD(raceMon,7*(NR+1)),q=0;mon<=need;mon=addD(mon,7),q++)weeks.push({monday:mon,phase:'gen',genMode:'hold',recovery:false,days:makeGenWeek(c,99,q,false,holdKm,'hold')});
  // fitness tests every 6–8 weeks, in a recovery week (fresh legs): alternately 5 km time trial and 30-minute test (threshold heart rate);
  // none in the last weeks before the race, where the race-pace tests take over. Without any reference time the first test comes early.
  if(!p.lab){const pat=trainDays(p),ld=longDayOf(p),cand=qualityDays(pat,ld,1).concat(pat.filter(x=>x!==ld)),stop=addD(raceMon,-(d>25?70:d>12?49:42));
    let last=-99,n=0;const tryW=(w,k)=>{if(!w||w.monday<cur||w.phase==='taper'||w.phase==='recover'||w.monday>=stop||k-last<6)return;const di=cand.find(x=>w.days[x]&&w.days[x].type!=='race'&&w.days[x].type!=='mptest');if(di==null)return;
      const rw=rwAt(c,k)!=null;w.days[di]=exp===0||rw?W.test(c,3):n%2===1&&p.hrMax!==0?W.test30(c):W.test(c,5);last=k;n++};
    if(!p.ref){const k0=weeks.findIndex((w,k)=>k>=(exp===0?5:3)&&w.monday>=cur&&!w.recovery&&w.phase!=='taper'&&w.phase!=='recover'&&w.monday<stop);if(k0>=0)tryW(weeks[k0],k0)}
    weeks.forEach((w,k)=>{if(w.recovery&&k>=2)tryW(w,k)})}
  // ramp guard: a normal week may exceed the higher of the last two normal weeks by at most 15 % (+2 km), counting optional runs too
// (the tendons do not care about labels). Typical cause: the first build week brings two hard sessions with warm-up and cool-down
// at once. Fix in order: the second hard session becomes an easy run, then easy runs shrink (not below 3 km).
function rampGuard(weeks,c){const tot=w=>w.days.reduce((a,x)=>a+(x&&x.type!=='rest'&&x.type!=='alt'&&x.type!=='race'?x.km||0:0),0);let hist=[],pL=0;
  weeks.forEach(w=>{if(!['base','build','peak'].includes(w.phase)){hist=[];return}if(w.recovery)return;
    if(hist.length){const lim=Math.max(...hist.slice(-2))*1.15+2;
      if(tot(w)>lim){const Q=w.days.map((x,i)=>[x,i]).filter(([x])=>x&&x.quality&&!['race','mptest','test'].includes(x.type));
        if(Q.length>=2){const[x,i]=Q[Q.length-1];w.days[i]=W.easy(c,Math.max(3,Math.min(x.km*.6,8)),{strides:true})}
        if(tot(w)>lim)trimEasy(w,lim);
        const L=w.days.find(x=>x&&x.type==='long');if(L&&tot(w)>lim&&pL){const nk=Math.floor(Math.max(pL*1.1,L.km-(tot(w)-lim))*2)/2;if(nk<L.km){L.km=nk;if(L.structure&&L.structure[0])L.structure[0]=L.structure[0].replace(/^[\d.]+ km/,fk(nk)+' km')}}}}
    hist.push(tot(w));const L=w.days.find(x=>x&&x.type==='long');if(L)pL=L.km})}
// keeps a week at a volume target after a session was swapped in: easy runs shrink proportionally (not below 3 km)
function trimEasy(w,target){const tot=()=>w.days.reduce((a,x)=>a+(x&&!x.optional&&x.type!=='rest'?x.km||0:0),0);let ex=tot()-target;if(ex<=.5)return;
  const E=w.days.filter(x=>x&&x.type==='easy'&&!x.optional&&!x.quality),pool=E.reduce((a,x)=>a+Math.max(0,x.km-3),0);if(!pool)return;
  E.forEach(x=>{const cut=Math.min(x.km-3,ex*(Math.max(0,x.km-3)/pool));if(cut>0){x.km=r05(x.km-cut);if(x.structure&&x.structure[0])x.structure[0]=x.structure[0].replace(/^[\d.]+ km/,fk(x.km)+' km')}})}
// race-pace tests: continuous runs at goal pace in the specific block (confidence, heart-rate level and decoupling at race pace)
  if(!race.virtual&&d>=9&&d<=43){const TS=d>25?[[9,exp>=1?12:10],[5,exp>=1?18:14]]:d>12?[[6,exp>=1?6:5],[3,exp>=1?10:8]]:exp===0?[[4,4]]:[[5,3],[3,5]],pat=trainDays(p),ld=longDayOf(p);
    TS.forEach(([wb,km],k)=>{let wi=weeks.findIndex(w=>w.monday===addD(raceMon,-7*wb));if(wi<0)return;let w=weeks[wi];
      if(w.recovery||w.phase==='taper'||!isSpec(w)){const w2=weeks[wi-1];if(w2&&!w2.recovery&&isSpec(w2)&&w2.phase!=='taper')w=w2;else return}
      // on short races the test replaces race-pace or threshold work, not the VO₂max session
      const qd=qualityDays(pat,ld,2).filter(x=>w.days[x]&&w.days[x].quality&&w.days[x].type!=='race');
      let di=d>25&&k===TS.length-1?ld:(d<=12?qd.find(x=>!['vo2','reps'].includes(w.days[x].type)):undefined)??qd[0];
      if(di==null)di=qualityDays(pat,ld,1)[0];if(di==null||!w.days[di]||w.days[di].type==='race')return;
      const wk0=w.days.reduce((a,x)=>a+(x&&!x.optional&&x.type!=='rest'?x.km||0:0),0),cw={...c,pc:{...c.pc,RP:w.rp||c.pc.RP,RPgoal:c.pc.RP},wkKm:w.days.reduce((a,x)=>a+(x&&x.km||0),0)};w.days[di]=W.mptest(cw,km,k+1,TS.length);
      // a race-pace test on the long-run day is the hard session of the week: the other interval session becomes easy
      if(di===ld)w.days.forEach((x,i)=>{if(x&&i!==di&&x.quality&&x.type!=='race'&&(x.type==='vo2'||x.type==='cruise'||x.type==='rp'))w.days[i]=W.easy(c,Math.min(x.km,10))});w.days.forEach((x,i)=>{if(x&&i!==di&&x.type==='mpace')w.days[i]=W.long(c,Math.min(x.km,16),'medium')});
      // the test must not add volume on top of the week: easy runs give back what the test adds
      trimEasy(w,wk0)})}
  rampGuard(weeks,c);
  applyRaces(weeks,c,st,race);addStrength(weeks,p);
  weeks.forEach(w=>w.km=r05(w.days.reduce((a,s)=>a+(s&&s.type!=='rest'&&s.type!=='race'&&!s.optional?s.km:0),0)));
  if(st.plan.peak)st.plan.peak.longCap=c.longCapped||null;
  if(st.plan.peak&&d>30){let sh=0;weeks.forEach(w=>{if((w.phase==='build'||w.phase==='peak')&&!w.recovery){const L=w.days.find(x=>x&&x.type==='long'),k=w.days.reduce((a,x)=>a+(x&&x.type!=='rest'&&x.type!=='race'&&!x.optional?x.km:0),0);if(L&&k)sh=Math.max(sh,L.km/k)}});st.plan.peak.longShare=sh>.4?Math.round(sh*100):null}
  if(st.plan.peak){const k=st.plan.peak;k.km=Math.round(Math.max(0,...weeks.filter(w=>isSpec(w)).map(w=>w.km)));if(k.limit==='current'&&k.km>=k.target-1)k.limit=null}
  // after the last race or goal test the plan continues with maintenance instead of ending
  if(weeks.length){const nx=addD(weeks[weeks.length-1].monday,7);if(nx<=addD(monday(today()),7*12))weeks.push(...buildFitPlan(st,nx,true,{d,raceMon}))}
  return weeks;
}
function rwAt(c,i){const R=S&&S.plan&&S.plan.rw;if(!R||R.stage>=RW.length)return null;const s=R.stage+Math.max(0,i-(c.curIdx||0));return s<RW.length?s:null}
function makeWeek(c,i,ph,j,rec,km){c.wi=i;c.wkKm=km;
  const p=c.p,pat=trainDays(p),days=pat.length,ld=longDayOf(p);
  const qD=qualityDays(pat,ld,2),arr=Array(7).fill(null);
  const rws=rwAt(c,i),runwalk=rws!=null,nQ=runwalk?0:Math.min(qD.length,Math.max(qCount(p.exp,ph,rec,days,c.style),c.amb&&c.d>=5&&!rec&&days>=4&&(ph==='build'||ph==='peak'||ph==='base'&&c.amb===2)?2:0)),d=c.d;
  let lv='plain';
  if(d>43&&(ph==='build'||ph==='peak'))lv='ultra';
  else if(ph==='peak'&&d>12&&d<=25)lv='progress';
  else if(ph==='build'&&d>12&&d<=25&&p.exp>=1&&j%2===1)lv='progress';
  else if(ph==='peak'&&d>25&&d<=43)lv=j%2===0?'mlong':'plain';
  else if(ph==='build'&&d>25&&d<=43&&j%2===1)lv='progress';
  if(rec&&lv!=='ultra')lv='plain';
  if(runwalk)lv='runwalk';
  const share={1:.7,2:.48,3:.38,4:.33,5:.30,6:.27,7:.25}[days];
  const cap=longMaxKm(d,p.exp,mid2(c.pc.E));
  let longKm=Math.max(5,Math.min(cap,km*share));
  if(p.longest&&ph!=='taper')longKm=Math.max(longKm,Math.min(cap,p.longest*(rec?.75:.9)));
  if(d>30&&!rec&&(ph==='build'||ph==='peak'))longKm=Math.max(longKm,cap*(ph==='peak'?1:Math.min(.9,.72+.04*j)));
  // the long run grows step by step (at most +12 % or +2.5 km per week), even when the target for the phase is higher
  // the long run stays a reasonable share of the week (more runs per week allow a longer one); marathon: at least 26 km in the build-up
  {const sh={1:.7,2:.5,3:.42,4:.4,5:c.amb&&d>30?.37:.34,6:c.amb&&d>30?.35:.3,7:c.amb&&d>30?.33:.28}[days],fl=d>30&&(ph==='build'||ph==='peak')?Math.min(cap,26):0;longKm=Math.min(longKm,Math.max(km*sh,fl,5));if(ph==='peak'&&d>30&&!rec&&longKm<cap-1)c.longCapped=Math.max(c.longCapped||0,Math.round(longKm))}
  if(c.prevLong&&!rec&&ph!=='taper')longKm=Math.min(longKm,Math.max(c.prevLong*1.12,c.prevLong+2.5));
  // marathon taper: the long run comes down gradually (about 70 % and 50 % of the longest), not in one step
  if(ph==='taper'&&d>25&&c.prevLong)longKm=Math.max(longKm,Math.min(cap,c.prevLong*(j===0?.7:.5)));
  arr[ld]=W.long(c,longKm,lv,lv==='mlong'?j:rws);
  if(!rec&&ph!=='taper')c.prevLong=arr[ld].km;
  for(let q=0;q<nQ;q++)arr[qD[q]]=pickQ(c,ph,q,j,rec,lv);
  if(d>25&&d<=43&&(lv==='mlong'||lv==='progress'))for(const x of qD)if(arr[x]&&arr[x].type==='mpace')arr[x]=W.long(c,Math.min(longKm*.6,18),'medium');
  // half marathon and shorter: a long run with a fast finish already counts as a hard session; with two others, race-pace intervals become easy + strides
  if(d<=25&&(lv==='mlong'||lv==='progress')&&nQ>=2&&c.style!=='hard'&&!c.amb){const drop=ph==='peak'?['cruise','vo2','tempo']:['rp'];for(const x of qD)if(arr[x]&&drop.includes(arr[x].type)){arr[x]=W.easy(c,Math.min(arr[x].km,10));break}}
  if(d>43&&(ph==='build'||ph==='peak')&&!rec&&days>=5){const b=(ld+6)%7;if(pat.includes(b)&&!arr[b])arr[b]=W.long(c,longKm*.55,'b2b')}
  const easyDays=pat.filter(x=>!arr[x]);
  return fillEasy(c,arr,easyDays,km,longKm,{drop:days>=4&&(ph==='base'||ph==='taper'||rec),medium:!rec&&ph!=='taper'&&days>=4,strides:!runwalk&&!rec&&ph!=='taper'&&(p.exp>=1||i>=2),vary:!runwalk&&!rec&&ph!=='taper',runwalk,rws});
}
// easy days: short recovery run after a hard day, one medium-long run mid-week, the rest normal; distances vary week to week.
// In calmer phases (general, base, recovery and taper weeks) one easy day becomes optional, so the number of runs follows the phase.
function fillEasy(c,arr,easyDays,km,longKm,o){const p=c.p,ld=longDayOf(p),minE=p.exp===0?3:p.exp===1?4:5,i=c.wi||0,hard=x=>{const q=arr[(x+7)%7];return!!(q&&(q.quality||q.type==='long'||q.type==='race'||q.type==='test'||q.type==='mptest'))};
  let E=easyDays.slice(),opt=null;
  let nd=o.drop===true?1:+o.drop||0;let off=[];
  // a day becomes optional or off only if the week's volume still fits on the remaining runs (easy runs are capped relative to the long run)
  {const capE=Math.max(minE,longKm*(o.ecap||.7)),rest0=Math.max(0,km-arr.reduce((a,q)=>a+(q&&!q.optional?q.km||0:0),0));while(nd>0&&rest0>(E.length-nd)*capE*.95)nd--}
  if(nd&&E.length>=2&&!o.runwalk){opt=E.includes((ld+6)%7)?(ld+6)%7:E.includes((ld+1)%7)?(ld+1)%7:E[E.length-1];E=E.filter(x=>x!==opt);
    // further days off: the easy day with a hard day on both sides first, otherwise the one closest after the long run
    for(let k=1;k<nd&&E.length>=2;k++){const sc=x=>(hard(x-1)?1:0)+(hard(x+1)?1:0);const r=E.slice().sort((a,b)=>sc(b)-sc(a))[0];off.push(r);E=E.filter(x=>x!==r)}}
  const used=arr.reduce((a,q)=>a+(q?q.km:0),0),rest=Math.max(0,km-used);if(!E.length){if(opt!=null)arr[opt]=W.optional(c,Math.max(minE,Math.min(8,rest*.5)));return arr}
  const role={};E.forEach(x=>{role[x]=hard(x-1)?'rec':'n'});
  const cand=E.filter(x=>role[x]==='n'&&!hard(x+1)&&x!==(ld+6)%7);
  const med=o.medium&&E.length>=2&&longKm>=11&&cand.length?cand[(i)%cand.length]:null;if(med!=null)role[med]='m';
  // short–medium–long: one normal day becomes a short run so the easy runs differ clearly (e.g. 6 / 10 / 8 instead of 8 / 8 / 8)
  // the day before the long run stays short and easy, so the long run can be run in good quality
  {const pre=(ld+6)%7;if(E.includes(pre)&&role[pre]!=='m')role[pre]='pl'}
  {const nn=E.filter(x=>role[x]==='n');if(nn.length>=2)role[nn[i%nn.length]]='s';
    else{const c2=E.filter(x=>role[x]!=='m'&&role[x]!=='pl');if(c2.length>=2){const al=c2.find(x=>{const q=arr[(x+6)%7];return q&&q.type==='long'});const sd=al!=null?al:c2[i%c2.length];role[sd]='s';c2.forEach(x=>{if(x!==sd&&role[x]==='rec')role[x]='rl'})}}}
  const wig=[1,1.12,.9,1.05,.95][i%5],w={rec:.7,rl:1.05,n:1,m:0,s:.68,pl:.6};let mKm=med!=null?Math.min(longKm*.78,rest*.4):0;
  const sw=E.reduce((a,x)=>a+(role[x]==='m'?0:w[role[x]]*(E.indexOf(x)%2?wig:2-wig)),0),unit=sw?(rest-mKm)/sw:0;
  let strides=0,varied=false;const stN=p.exp>=1?2:1;
  // one easy run per week gets its own form; after a hard day only calm forms (trail, drills)
  const nonS=E.filter(x=>role[x]==='n'||role[x]==='m'&&o.gen),vRec=!nonS.length,vday=nonS.length?nonS[i%nonS.length]:(E.filter(x=>role[x]==='rl').concat(E.filter(x=>role[x]==='rec'||role[x]==='s')).slice(0,1)[0]??null);
  E.forEach(x=>{const r=role[x];let k=r==='pl'?Math.min(10,Math.max(minE,unit*w.pl)):r==='m'?mKm:Math.max(r==='rec'||r==='s'||r==='rl'||r==='pl'?Math.max(3,minE-1):minE,unit*w[r]*(r==='s'?1:E.indexOf(x)%2?wig:2-wig));k=Math.min(k,Math.max(minE,longKm*(r==='m'?.8:o.ecap||.7)));if(r!=='m'&&med!=null)k=Math.min(k,Math.max(minE,mKm*.85));
    const vk=o.vary&&!o.runwalk&&x===vday?(()=>{const ks=['abc','trail','prog','strides'].filter(z=>z!=='prog'||p.exp>=1&&k>=6&&k<=16&&!vRec).filter(z=>z!=='trail'||k<=14).filter(z=>!vRec||z!=='strides');return ks[i%ks.length]})():null;
    if(vk){varied=true;arr[x]=W.easyVar(c,k,vk);return}
    const st=(r==='n'||r==='s')&&strides<stN&&o.strides;if(st)strides++;
    if(o.runwalk)arr[x]=W.easy(c,k,{runwalk:o.rws});
    else if(r==='rec'&&k<=8&&!o.gen){const q=W.recovery(c,k);arr[x]=q}
    else if(r==='m'){const q=W.easy(c,k);q.title=T('Mittellanger Lauf','Medium-long run');q.structure=[T(`${fk(r05(k))} km locker und gleichmässig im Grundlagentempo`,`${fk(r05(k))} km easy and steady at base pace`)];q.note=T('Der zweite Ausdauerreiz der Woche neben dem langen Lauf: Er baut die Grundlage aus, ohne so lange zu erholen wie ein langer Lauf.','The second endurance stimulus of the week besides the long run: it builds your base without the recovery cost of a long run.');arr[x]=q}
    else arr[x]=o.gen?W.easyFree(c,k,st):W.easy(c,k,{strides:st})});
  if(opt!=null)arr[opt]=W.optional(c,Math.max(minE,Math.min(8,unit*.8||minE)));
  return arr}
// General weeks: fewer long runs, a playful session, optional cross-training, easy runs by feel
function makeGenWeek(c,i,j,rec,km,mode){c.wi=i;c.wkKm=km;
  const p=c.p,pat=trainDays(p),days=pat.length,ld=longDayOf(p);
  const[qa,qb]=qualityDays(pat,ld,2),arr=Array(7).fill(null);
  const hold=mode==='hold',keep=mode==='keep',rws=rwAt(c,i),runwalk=rws!=null,ep=mid2(c.pc.E);
  const amb=hold&&p.exp>=2;
  const mt=(keep||hold)&&!runwalk;let longKm=Math.max(5,Math.min(km*(mt?.35:.3),(hold&&!amb?75:90)*60/ep,tbl(LONGCAP,Math.min(c.d,21.1),p.exp)));
  if(p.longest&&c.d>=21)longKm=Math.max(longKm,Math.min(longMaxKm(c.d,p.exp,ep),p.longest*(rec?.7:.85)));
  arr[ld]=(!hold||amb||j%2===0)?W.long(c,longKm,runwalk?'runwalk':'gen',rws):W.fun(c,j+3,longKm*.8);
  if(!rec)c.prevLong=Math.max(c.prevLong||0,arr[ld].km);
  if(qa!=null)arr[qa]=runwalk?W.easy(c,km*.2,{runwalk:rws}):(keep||amb)&&!rec&&!c.trans?(p.exp===0?W.fartlek(c,0,true):[W.fartlek(c,1,true),W.hills(c,1),W.tempo(c,Math.min(j%6,3),true)][j%3]):(hold||rec||c.trans||p.exp===0)?W.fun(c,j,km*.2):(j%2?W.fartlek(c,Math.min(j,2),true):W.hills(c,Math.min(j,2)));
  /* no fixed cross-training days: rest or cross-training comes only as a reaction to high load (loadGuard) */
  if((amb||c.amb&&hold)&&qb!=null&&days>=5&&!rec&&(c.amb===2||j%2===1)&&!runwalk&&!arr[qb])arr[qb]=arr[qa]&&arr[qa].type==='tempo'?W.hills(c,1):W.tempo(c,Math.min(j,3),true);
  const easyDays=pat.filter(x=>!arr[x]);
  // maintaining fitness (keep/hold): with intensity kept, about 3 runs a week are enough (Mujika & Padilla); one more stays optional, further days are off
  const maint=(keep||hold)&&!runwalk,act=Math.max(3,days-(c.trans?2:1)),filled=arr.filter(x=>x&&x.type!=='alt').length,nd=maint&&days>=4?Math.max(easyDays.length>=2?1:0,easyDays.length-Math.max(0,act-filled)):days>=4?1:0;
  return fillEasy(c,arr,easyDays,km,longKm,{ecap:maint?.85:.7,drop:nd,medium:!rec&&days>=5&&longKm>=12&&!maint,strides:!rec&&(p.exp>=1||i>=2),vary:!rec&&!runwalk&&!c.trans,runwalk,rws,gen:true});
}
function applyRaces(weeks,c,st,main){
  const loc=d=>{const w=weeks.find(w=>w.monday===monday(d));return w?{w,i:dow(d)}:null};
  const get=d=>{const m=loc(d);return m?m.w.days[m.i]:null};
  const set=(d,s,tag)=>{const m=loc(d);if(m){if(s&&tag)s.tag=tag;m.w.days[m.i]=s}};
  const easyFrom=(s,f,cap,tag)=>{const e=W.easy(c,Math.min(Math.max(s.km,4)*f,cap));e.tag=tag;return e};
  if(!weeks.length)return;
  const first=weeks[0].monday,last=addD(weeks[weeks.length-1].monday,6);
  st.races.filter(r=>r.id!==main.id&&r.date>=first&&r.date<=last&&!(prioOf(r)==='A'&&r.date>main.date)).forEach(r=>{
    const D=n=>addD(r.date,n),tagB='Vor '+(r.name||'Rennen');
    set(r.date,W.race(c,r,false));
    if(prioOf(r)==='B'){
      set(D(-1),c.exp>=2&&get(D(-1))?W.shakeout(c):null,tagB);
      const s2=get(D(-2));if(s2)set(D(-2),easyFrom(s2,1,6,tagB));
      const s3=get(D(-3));if(s3&&(s3.quality||s3.type==='long'))set(D(-3),easyFrom(s3,1,8,tagB));
      for(let k=4;k<=6;k++){const s=get(D(-k));if(s&&s.type==='long')set(D(-k),easyFrom(s,.6,10,tagB))}
    }else{
      const s1=get(D(-1));if(s1&&(s1.quality||s1.type==='long'))set(D(-1),easyFrom(s1,s1.type==='long'?.6:1,6,tagB));
    }
  });
  if(main.date>=first&&main.date<=last){
    const D=n=>addD(main.date,n),tag='Rennwoche';
    set(main.date,W.race(c,main,true));
    set(D(-1),trainDays(c.p).length>=4?W.shakeout(c):null,tag);
    set(D(-2),null);
    let qEarlier=false;for(let k=4;k<=7;k++){const s=get(D(-k));if(s&&s.quality)qEarlier=true}
    const s3=get(D(-3));
    if(s3)set(D(-3),(!qEarlier&&c.d<=21.1&&c.exp>=1)?W.rp(c,0,true):easyFrom(s3,1,6,tag),tag);
    // marathon race week: one short race-pace sharpening 4–5 days before, if the week has none yet
    if(!qEarlier&&c.d>21.1&&c.d<=43&&c.exp>=1)for(const k of[4,5]){const s=get(D(-k));if(s&&s.type!=='rest'&&!s.quality){set(D(-k),W.rp(c,0,true),tag);break}}
    for(let k=4;k<=6;k++){const s=get(D(-k));if(s&&s.type==='long')set(D(-k),easyFrom(s,.6,c.d>25?12:8,tag))}
  }
  // every entered race is followed by an adequate break, whether it had its own plan or not
  st.races.forEach(r=>{
    const R=recInfo(r.dist);if(addD(r.date,R.easy)<first||r.date>last)return;
    if(prioOf(r)==='A'&&r.id!==main.id&&r.date>main.date)return;
    const tag='Erholung nach '+(r.name||'Rennen');
    for(let k=1;k<=R.easy;k++){const dt=addD(r.date,k),s=get(dt);
      if(k<=R.rest){set(dt,recRest(),tag);continue}
      if(!s||s.type==='race'||s.type==='rest')continue;
      if(s.type==='alt'||s.optional){s.tag=tag;continue}
      const f=R.minF+(1-R.minF)*Math.min(1,(k-1)/R.easy),km=Math.max(3,(s.km||5)*f);
      set(dt,k===R.rest+1?W.recovery(c,Math.min(km,5)):s.type==='long'?W.long(c,Math.max(4,km),'plain'):W.easy(c,km),tag)}
  });
}
function regenerate(){
  const cur=monday(today()),np=buildPlan(S);
  const old=(S.plan.weeks||[]).filter(w=>w.monday<cur&&w.monday>=S.plan.startMonday);
  S.plan.weeks=[...old,...np.filter(w=>w.monday>=cur||!old.find(o=>o.monday===w.monday))].sort((a,b)=>a.monday<b.monday?-1:1);
  applySwaps();applyPause();
}
