// energy cost of running on a grade (Minetti 2002), J/kg/m; grade as fraction
// relative effort of running on a grade (g in %), close to the grade-adjusted pace used by Strava: +6 % ≈ 24 % slower, −4 % ≈ 6 % faster, gains fade beyond −10 %
const gapF=g=>{g=clamp(g,-30,30);return g>=0?1+.033*g+.0012*g*g:Math.max(.88,1+.018*g+.0009*g*g)};
const minetti=x=>gapF(x*100)*3.6;
// heat: temperature + dew point in °F (rule used by many coaches): % slower
function heatAdj(tc,dc){if(tc==null||dc==null)return 0;const s=(tc*9/5+32)+(dc*9/5+32);
  return s<=100?0:s<=110?.5:s<=120?1.5:s<=130?2.5:s<=140?3.8:s<=150?5.2:s<=160?7:s<=170?9:12}
const dewFrom=(t,rh)=>{const a=17.27,b=237.7,al=a*t/(b+t)+Math.log(Math.max(1,rh)/100);return b*al/(a-al)};
function wxAdvice(tc,dc,wind){const h=heatAdj(tc,dc),o=[];
  if(h>=12)o.push(T('Sehr belastend: nur locker oder auf kühle Tageszeit verschieben.','Very stressful: easy only or move to a cooler time of day.'));
  else if(h>=.5)o.push(T(`Wärme: rund <b>${fk(h)} % langsamer</b> laufen (≈ ${Math.round(h/100*330)} s/km bei 5:30), nach Puls statt Pace.`,`Heat: run about <b>${fk(h)} % slower</b> (≈ ${Math.round(h/100*330)} s/km at 5:30), by heart rate rather than pace.`));
  if(wind!=null&&wind>=20)o.push(T(`Wind ${Math.round(wind)} km/h: Gegenwind kostet etwa ${Math.round(wind/10)*2}–${Math.round(wind/10)*4} s/km, Rückenwind gibt nur rund die Hälfte zurück. In Gegenwind-Abschnitten nach Anstrengung laufen.`,`Wind ${Math.round(wind)} km/h: headwind costs about ${Math.round(wind/10)*2}–${Math.round(wind/10)*4} s/km, tailwind gives back only about half. Run headwind sections by effort.`));
  if(tc!=null&&tc<=-5)o.push(T('Kälte: länger einlaufen, Tempoeinheiten eher auf Laufband oder später am Tag.','Cold: longer warm-up, quality sessions rather on a treadmill or later in the day.'));
  return{h,o}}
// weather for today near your home (Open-Meteo, no account); cached per hour, silently skipped when offline
const WX={};
async function wxLoad(){const h=S&&S.profile&&S.profile.home;if(!h||!h.lat||WX.busy)return;const k=today()+':'+new Date().getHours();if(WX.k===k)return;
  const c=lsGet('tempomacher.wx');if(c){try{const o=JSON.parse(c);if(o.k===k&&o.lat===h.lat){Object.assign(WX,o);return}}catch(e){}}
  WX.busy=true;try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${h.lat}&longitude=${h.lon}&hourly=temperature_2m,dew_point_2m,wind_speed_10m,precipitation_probability&forecast_days=2&timezone=auto`);
    if(r.ok){const j=await r.json();Object.assign(WX,{k,lat:h.lat,hourly:j.hourly});lsSet('tempomacher.wx',JSON.stringify({k,lat:h.lat,hourly:j.hourly}));if(ui.tab==='home')render()}}catch(e){}WX.busy=false}
function wxNext(){if(!WX.hourly)return null;const H=WX.hourly,now=new Date(),key=`${today()}T${String(Math.min(22,Math.max(now.getHours()+1,7))).padStart(2,'0')}:00`,i=H.time.indexOf(key);if(i<0)return null;
  const w=[i,i+1,i+2].filter(x=>x<H.time.length);const av=k=>avg(w.map(x=>H[k][x]).filter(v=>v!=null));
  return{t:av('temperature_2m'),dp:av('dew_point_2m'),wind:av('wind_speed_10m'),rain:Math.max(...w.map(x=>H.precipitation_probability[x]||0)),h:+key.slice(11,13)}}
function wxLine(s){const x=wxNext();if(!x||!s||s.type==='rest'||s.type==='alt')return'';const A=wxAdvice(x.t,x.dp,x.wind);
  const base=`${Math.round(x.t)} °C${x.wind>=15?` · ${T('Wind','wind')} ${Math.round(x.wind)} km/h`:''}${x.rain>=50?` · ${T('Regen','rain')} ${x.rain} %`:''}`;
  return`<div class="wxl"><span>${T(`Ab ${x.h} Uhr`,`From ${x.h}:00`)}: ${base}</span>${A.o.length?`<span>${A.o[0]}</span>`:''}</div>`}

// course profile from a GPX route (with or without times): distance and elevation every ~100 m, scaled to the race distance
function courseFromGpx(text,dist){const doc=xmlDoc(text);let pts=byLocal(doc,'trkpt');if(!pts.length)pts=byLocal(doc,'rtept');if(pts.length<10)throw new Error(T('In der Datei ist keine Strecke.','No route in the file.'));
  let d=0,prev=null;const raw=[];pts.forEach(pt=>{const la=+pt.getAttribute('lat'),lo=+pt.getAttribute('lon'),el=firstLocal(pt,'ele');if(prev)d+=haversine(prev[0],prev[1],la,lo);prev=[la,lo];if(el)raw.push([d,+el.textContent])});
  if(raw.length<10)throw new Error(T('Die Strecke hat keine Höhenangaben.','The route has no elevation data.'));
  const f=dist&&d>0?dist/d:1,step=.1,out=[];let j=0;for(let x=0;x<=d*f+1e-9;x+=step){while(j<raw.length-2&&raw[j+1][0]*f<x)j++;const a=raw[j],b=raw[j+1]||a,t=b[0]>a[0]?(x/f-a[0])/(b[0]-a[0]):0;out.push(a[1]+(b[1]-a[1])*clamp(t,0,1))}
  const sm=out.map((_,i)=>avg(out.slice(Math.max(0,i-2),i+3)));let gain=0,loss=0;for(let i=1;i<sm.length;i++){const z=sm[i]-sm[i-1];if(z>0)gain+=z;else loss-=z}
  return{e:sm.map(v=>Math.round(v*10)/10),step,gain:Math.round(gain),loss:Math.round(loss)}}
// equal-effort time share for the course up to x km (relative to flat)
function courseEq(co,x){const n=Math.min(co.e.length-1,Math.round(x/co.step));let q=0;for(let i=1;i<=n;i++)q+=minetti((co.e[i]-co.e[i-1])/(co.step*1000))/3.6;return q*co.step}
function courseSVG(co,splits){const W0=400,H0=150,L=34,R=8,Tp=10,B=24,n=co.e.length,lo=Math.min(...co.e),hi=Math.max(...co.e),rg=Math.max(20,hi-lo);
  const x=i=>L+(W0-L-R)*i/(n-1),y=v=>Tp+(H0-Tp-B)*(1-(v-lo)/rg),km=(n-1)*co.step,tk=km>25?10:km>12?5:km>6?2:1;
  return`<div class="chartw"><svg class="chart" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${T('Höhenprofil der Strecke','Course elevation profile')}">
    <path d="M${x(0)},${H0-B} ${co.e.map((v,i)=>`L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} L${x(n-1)},${H0-B}Z" fill="color-mix(in srgb,var(--blue) 18%,transparent)" stroke="var(--blue)" stroke-width="1.6" stroke-linejoin="round"/>
    <text x="${L-5}" y="${y(hi)+4}" text-anchor="end">${Math.round(hi)}</text><text x="${L-5}" y="${y(lo)+4}" text-anchor="end">${Math.round(lo)}</text>
    ${[...Array(Math.floor(km/tk)+1)].map((_,k)=>{const i=Math.round(k*tk/co.step);return i<n?`<text x="${x(i)}" y="${H0-6}" text-anchor="${k===0?'start':'middle'}">${k*tk}</text>`:''}).join('')}</svg></div>`}
function courseClimbs(co){const o=[];let st=null;const e=co.e,stp=co.step;for(let i=1;i<e.length;i++){const up=e[i]>e[i-1];if(up&&st==null)st=i-1;if((!up||i===e.length-1)&&st!=null){const g=e[i-1]-e[st];if(g>=15)o.push({a:st*stp,b:(i-1)*stp,m:Math.round(g)});st=null}}return o.sort((a,b)=>b.m-a.m).slice(0,3)}

