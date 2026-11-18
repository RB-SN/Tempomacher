/* ---- charts ---- */
function niceTicks(lo,hi,n=4){if(hi-lo<1e-9){hi=lo+1}const raw=(hi-lo)/n,mag=Math.pow(10,Math.floor(Math.log10(raw))),st=[1,2,2.5,5,10].map(x=>x*mag).find(x=>x>=raw);
  const a=Math.floor(lo/st)*st,b=Math.ceil(hi/st)*st,t=[];for(let v=a;v<=b+st/2;v+=st)t.push(+v.toFixed(6));return t}
function allRuns(){const out=Object.entries(S.logs).map(([d,l])=>({...l,date:d}));(S.extra||[]).forEach(x=>out.push(x));return out.sort((a,b)=>a.date<b.date?-1:1)}
function effChart(){
  const det=detailOn(),all=allRuns().map(l=>{const g=effGroup(l);return{l,d:l.date,g,v:g==='base'?effOf(l):det?effBlk(l):null,iv:g!=='base',hilly:g==='base'&&(hillG(l)||0)>=20}}).filter(p=>p.v);
  if(all.length<3)return`<div class="card"><h3>Effizienz-Index</h3><p class="muted" style="margin:6px 0 0">Noch zu wenig Daten. Erfasse oder importiere Läufe mit Pace und Puls, dann zeigt dieses Diagramm, ob du bei gleichem Puls schneller wirst.</p></div>`;
  const W0=400,H0=210,L=34,R=12,T=12,B=28,d0=all[0].d,span=Math.max(1,daysBetween(d0,all[all.length-1].d));
  const vs=all.map(p=>p.v),ticks=niceTicks(Math.min(...vs)*.97,Math.max(...vs)*1.03);
  const x=d=>L+(W0-L-R)*daysBetween(d0,d)/span,y=v=>T+(H0-T-B)*(1-(v-ticks[0])/(ticks[ticks.length-1]-ticks[0]));
  const series=[['base','var(--blue)',TX('Locker & lang','Easy & long')],['thr','var(--hot)',TX('Schwelle (nur Belastung)','Threshold (work only)')],['mp','#D9A03A',TX('Marathontempo (nur Block)','Marathon pace (block only)')]].map(([k,col,lab])=>{const pts=all.filter(p=>p.g===k);
    const ma=pts.map((p,i)=>{const w=pts.slice(Math.max(0,i-4),i+1);return{d:p.d,v:avg(w.map(q=>q.v))}});
    // headline = trend over all runs (regression), only with enough data: at least 6 runs over at least 3 weeks
    const tr=pts.length>=4?linTrend(pts,d0):null,span=tr?tr.x1-tr.x0:0,chg=tr&&pts.length>=6&&span>=21?(tr.at(tr.x1)/tr.at(tr.x0)-1)*100:null;
    return{k,col,lab,pts,ma,chg,tr,wk:Math.max(1,Math.round(span/7))}});
  const main=series[0],avgE=series[0].pts.length?avg(series[0].pts.slice(-5).map(p=>p.v)):null;
  const xt=[0,.5,1].map(f=>addD(d0,Math.round(span*f)));
  return`<div class="card"><div class="spread"><h3>Effizienz</h3>${avgE?`<span class="hint">Index ${f2(avgE)}${TX(' · Ø 5 lockere Läufe',' · avg. 5 easy runs')}</span>`:''}</div>
    ${main.chg!=null?`<div class="num" style="font-size:28px;margin:2px 0 2px;color:${main.chg>=0?'var(--good)':'var(--bad)'}">${main.chg>=0?'+':''}${main.chg.toFixed(1)} %</div>`:''}<p style="margin:2px 0 8px;font-size:15px">${main.chg!=null?(main.chg>=1?TX(`Trend der letzten ${main.wk} Wochen: Du läufst bei gleichem Puls <b>${fk(Math.round(main.chg*10)/10)} % schneller</b>.`,`Trend over the last ${main.wk} weeks: at the same heart rate you run <b>${fk(Math.round(main.chg*10)/10)} % faster</b>.`):main.chg<=-1?TX(`Trend der letzten ${main.wk} Wochen: Du läufst bei gleichem Puls <b>${fk(Math.round(-main.chg*10)/10)} % langsamer</b>. Häufig: Müdigkeit, Hitze, wenig Schlaf.`,`Trend over the last ${main.wk} weeks: at the same heart rate you run <b>${fk(Math.round(-main.chg*10)/10)} % slower</b>. Often: fatigue, heat, little sleep.`):TX(`Trend der letzten ${main.wk} Wochen: bei gleichem Puls etwa gleich schnell, stabil.`,`Trend over the last ${main.wk} weeks: about as fast at the same heart rate, stable.`)):TX(`Noch zu wenig Daten für einen Trend (${series[0].pts.length} lockere Läufe über ${(()=>{const q=series[0].pts;return q.length>1?fk(Math.round(daysBetween(q[0].d,q[q.length-1].d)/7*10)/10):0})()} Wochen). Die Zahl erscheint ab 6 lockeren oder langen Läufen mit Puls über mindestens 3 Wochen.`,`Not enough data for a trend yet (${series[0].pts.length} easy runs over ${(()=>{const q=series[0].pts;return q.length>1?fk(Math.round(daysBetween(q[0].d,q[q.length-1].d)/7*10)/10):0})()} weeks). The number appears from 6 easy or long runs with heart rate over at least 3 weeks.`)}</p>
    <div class="chartw"><svg class="chart" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${TX('Effizienz-Index pro Lauf, getrennt nach lockeren Läufen, Schwelle und Marathontempo','Efficiency index per run, split into easy runs, threshold and marathon pace')}">
    ${ticks.map(v=>`<line x1="${L}" x2="${W0-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${fk(v)}</text>`).join('')}
    ${xt.map((d,i)=>`<text x="${x(d)}" y="${H0-8}" text-anchor="${['start','middle','end'][i]}">${fshort(d)}</text>`).join('')}
    ${series.map(s=>s.pts.map(p=>p.hilly?`<circle cx="${x(p.d)}" cy="${y(p.v)}" r="3.4" fill="none" stroke="${s.col}" stroke-width="1.6" opacity=".75"/>`:`<circle cx="${x(p.d)}" cy="${y(p.v)}" r="2.6" fill="${s.col}" opacity=".45"/>`).join('')+(s.ma.length>1?`<polyline points="${s.ma.map(p=>`${x(p.d)},${y(p.v)}`).join(' ')}" fill="none" stroke="${s.col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>`:'')+trendLine(s.tr,x,y,d0,s.col)).join('')}${all.map(p=>`<circle class="hit" cx="${x(p.d)}" cy="${y(p.v)}" r="9" data-tip="${esc(effTip(p))}"/>`).join('')}</svg><div class="ctip" hidden></div></div>
    <div class="legend">${series.filter(s=>s.pts.length).map(s=>`<span><i class="sw" style="background:${s.col};height:3px"></i>${s.lab}${s.k!=='base'&&s.tr&&s.tr.x1-s.tr.x0>=14?' '+pctTxt((s.tr.at(s.tr.x1)/s.tr.at(s.tr.x0)-1)*100):''}</span>`).join('')}${series.some(s=>s.tr)?`<span><i class="sw" style="border-top:1.5px dashed var(--muted);height:0;width:16px;border-radius:0"></i>${TX('Trend','Trend')}${(()=>{const s0=series.find(s=>s.k==='base'&&s.tr);if(!s0)return'';const t=s0.tr,ch=(t.at(t.x1)/t.at(t.x0)-1)*100,w=Math.max(1,Math.round((t.x1-t.x0)/7));return TX(` locker & lang: ${pctTxt(ch)} in ${w} ${w===1?'Woche':'Wochen'}`,` easy & long: ${pctTxt(ch)} in ${w} ${w===1?'week':'weeks'}`)})()}</span>`:''}${all.some(p=>p.hilly)?`<span><i class="sw" style="border:1.6px solid var(--blue);border-radius:50%;width:9px;height:9px"></i>${TX('hügelig (ab 20 m/km), höhenbereinigt','hilly (20+ m/km), elevation-adjusted')}</span>`:''}</div>${gainFixHTML()}${(()=>{const P=hillP();return HPC&&HPC.n[0]>=5&&HPC.n[1]>=5?`<p class="hint" style="margin:8px 0 0">${TX(`Persönliche Hügel-Anpassung aus ${HPC.n[0]} flachen und ${HPC.n[1]} hügeligen Läufen: Puls-Anteil × ${P.toFixed(2)}.`,`Personal hill adjustment from ${HPC.n[0]} flat and ${HPC.n[1]} hilly runs: heart-rate part × ${P.toFixed(2)}.`)}</p>`:''})()}</div>`;
}
// Aerobic decoupling (Pa:HR) of long runs over 15 km: drop of the speed/heart-rate ratio from first to second half
// least-squares trend line over the points (x = days since the first point)
// runs that count for efficiency but have no exact climbing: enter it quickly so the hill correction applies
function gainFixHTML(){const t=today(),R=allRuns().filter(l=>l.done&&!isIv(l)&&effRaw(l)&&l.gain==null&&!(l.impSum&&l.impSum.gain!=null)&&daysBetween(l.date,t)<=180).reverse();
  if(!R.length)return'';const key=l=>l.id?'x:'+l.id:'d:'+l.date;
  return`<details class="help" style="margin-top:10px"${ui.gfOpen?' open':''}><summary>${T(`Höhenmeter nachtragen (${R.length} ${R.length===1?'Lauf':'Läufe'} ohne genaue Angabe)`,`Add climbing (${R.length} ${R.length===1?'run':'runs'} without exact value)`)}</summary>
    <p class="hint" style="margin:8px 0">${T('Bei diesen Läufen kennt die App nur die gewählte Spanne («0–50» zählt als flach). Trag die genauen Höhenmeter aus deiner Uhr-App ein, dann wird die Effizienz korrekt bereinigt.','For these runs the app only knows the chosen range («0–50» counts as flat). Enter the exact climbing from your watch app and the efficiency is adjusted correctly.')}</p>
    <div class="list">${R.slice(0,ui.gfAll?R.length:12).map(l=>`<div class="li" style="grid-template-columns:52px 1fr auto"><span class="dt">${DOWS[dow(l.date)]}<b>${pd(l.date).getDate()}.${pd(l.date).getMonth()+1}.</b></span>
      <span class="t">${esc(l.type?RTL[l.type]:l.s.title)}<small>${fk(logKm(l))} km · <span style="white-space:nowrap">${l.elev!=null?ELEV[l.elev].l+' hm':T('keine Angabe','no value')}</span></small></span>
      <span class="row" style="gap:6px;flex-wrap:nowrap"><input class="input" style="width:74px;padding-inline:8px" inputmode="numeric" placeholder="hm" id="gf-${key(l).replace(':','_')}" aria-label="${T('Höhenmeter','Climbing')}"><button class="btn small primary" data-act="gainFix" data-v="${key(l)}">OK</button></span></div>`).join('')}</div>
    ${R.length>12&&!ui.gfAll?`<button class="link" style="margin-top:8px" data-act="gfAll">${T('Alle anzeigen','Show all')} (${R.length})</button>`:''}</details>`}
// tooltip for a point in the efficiency chart: what was run and how the value came about
function effTip(p){const l=p.l,g=hillG(l),hf=p.iv?1:hillFactor(l)||1;
  return`<b>${fdate(l.date)}</b><br>${esc(l.type?RTL[l.type]:l.s.title)} · ${fkm(logKm(l))} km${l.sec&&!p.iv?' · '+fmtTime(l.sec):''}<br>${p.iv?TX('Belastung ','Work ')+pace(l.pace):pace(l.pace)} · ♥ ${l.hr}${!p.iv&&g!=null?`<br>${Math.round(gainOf(l))} hm (${fk(Math.round(g*10)/10)} m/km)${hf>1?` · ${TX('Hügelfaktor','hill factor')} ×${f2(hf)}`:''}`:''}<br><b>${TX('Effizienz','Efficiency')} ${f2(p.v)}</b>`}
function showTip(el){const w=el.closest('.chartw');if(!w)return;const t=w.querySelector('.ctip');t.innerHTML=el.getAttribute('data-tip');t.hidden=false;
  w.querySelectorAll('.hit.on').forEach(x=>x.classList.remove('on'));el.classList.add('on');
  const r=w.getBoundingClientRect(),c=el.getBoundingClientRect(),cx=c.left+c.width/2-r.left,cy=c.top+c.height/2-r.top,tw=t.offsetWidth,th=t.offsetHeight;
  t.style.left=clamp(cx-tw/2,0,r.width-tw)+'px';t.style.top=(cy-th-12<0?cy+14:cy-th-12)+'px'}
function hideTips(except){document.querySelectorAll('.chartw').forEach(w=>{if(w===except)return;const t=w.querySelector('.ctip');if(t)t.hidden=true;w.querySelectorAll('.hit.on').forEach(x=>x.classList.remove('on'))})}
document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('.hit[data-tip]');if(el){hideTips(el.closest('.chartw'));showTip(el)}});
let lastTouch=0;document.addEventListener('touchstart',()=>{lastTouch=Date.now()},{passive:true});
{let sx=null,sy=null;document.addEventListener('touchstart',e=>{const m=e.target.closest&&e.target.closest('[data-swipe=mon]');sx=m?e.touches[0].clientX:null;sy=m?e.touches[0].clientY:null},{passive:true});
  document.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;if(Math.abs(dx)<60||Math.abs(dy)>Math.abs(dx)*.6)return;
    const[Y,M]=(ui.mon||today().slice(0,7)).split('-').map(Number),d=new Date(Y,M-1+(dx<0?1:-1),1);const nm=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(nm>addD(monday(today()),13).slice(0,7))return;ui.mon=nm;render()},{passive:true})}
document.addEventListener('mouseout',e=>{if(Date.now()-lastTouch<1500)return;const el=e.target.closest&&e.target.closest('.hit[data-tip]');if(el&&!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.ctip')))hideTips()});
document.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('.hit[data-tip]');if(el){hideTips(el.closest('.chartw'));showTip(el)}else if(!(e.target.closest&&e.target.closest('.ctip')))hideTips()});
function linTrend(pts,d0){if(pts.length<3)return null;const X=pts.map(p=>daysBetween(d0,p.d)),Y=pts.map(p=>p.v),mx=avg(X),my=avg(Y);let nu=0,de=0;
  X.forEach((x,i)=>{nu+=(x-mx)*(Y[i]-my);de+=(x-mx)**2});if(!de)return null;const b=nu/de,a=my-b*mx;return{at:x=>a+b*x,b,x0:Math.min(...X),x1:Math.max(...X)}}
const trendLine=(tr,x,y,d0,col)=>tr?`<line x1="${x(addD(d0,tr.x0))}" y1="${y(tr.at(tr.x0))}" x2="${x(addD(d0,tr.x1))}" y2="${y(tr.at(tr.x1))}" stroke="${col}" stroke-width="1.5" stroke-dasharray="5 4" opacity=".8"/>`:'';
function decChart(){
  const pts=allRuns().filter(l=>l.done&&l.dec!=null&&(logKm(l)>15||logType(l)==='mptest')).map(l=>({d:l.date,v:l.dec,km:logKm(l),mp:logType(l)==='mptest'}));
  if(!pts.length)return`<div class="card"><h3>Decoupling</h3><p class="muted" style="margin:6px 0 0">Erscheint nach langen Läufen über 15 km und nach Renntempo-Tests. Beim Import einer Datei wird es automatisch berechnet; bei manueller Eingabe brauchst du Pace und Puls der ersten und zweiten Hälfte.</p></div>`;
  const W0=400,H0=200,L=42,R=12,T=12,B=28;
  const d0=pts.length>1?pts[0].d:addD(pts[0].d,-14),d1=pts.length>1?pts[pts.length-1].d:addD(pts[0].d,14),span=Math.max(1,daysBetween(d0,d1));
  const ticks=niceTicks(Math.min(0,...pts.map(p=>p.v)),Math.max(10,...pts.map(p=>p.v+1)),4),tmin=ticks[0],tmax=ticks[ticks.length-1];
  const x=d=>L+(W0-L-R)*daysBetween(d0,d)/span,y=v=>T+(H0-T-B)*(1-(v-tmin)/(tmax-tmin));
  const last=pts[pts.length-1],dtr=linTrend(pts,d0);
  return`<div class="card"><div class="spread"><h3>Decoupling</h3><span class="num" style="font-size:18px;color:${last.v<5?'var(--good)':'var(--warn)'}">${fk(+last.v.toFixed(1))} %</span></div>
    <p class="hint" style="margin:2px 0 8px">Wie stark der Puls in der zweiten Hälfte im Verhältnis zum Tempo ansteigt. Unter 5 % (grüner Bereich) trägt deine Grundlage über die ganze Distanz; sinkt die Linie, wirst du ausdauernder.</p>
    <svg class="chart" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="Decoupling in Prozent">
    <rect x="${L}" y="${y(Math.min(5,tmax))}" width="${W0-L-R}" height="${y(Math.max(0,tmin))-y(Math.min(5,tmax))}" fill="var(--good)" opacity=".1"/>
    ${ticks.map(v=>`<line x1="${L}" x2="${W0-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v} %</text>`).join('')}
    <line x1="${L}" x2="${W0-R}" y1="${y(5)}" y2="${y(5)}" stroke="var(--good)" stroke-dasharray="4 3"/>
    ${pts.length>1?`<polyline points="${pts.map(p=>`${x(p.d)},${y(p.v)}`).join(' ')}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`:''}
    ${pts.map(p=>`<circle cx="${x(p.d)}" cy="${y(p.v)}" r="3" fill="var(--blue)"/>`).join('')}
    ${trendLine(dtr,x,y,d0,'var(--ink)')}
    ${[d0,d1].map((d,i)=>`<text x="${x(d)}" y="${H0-8}" text-anchor="${i?'end':'start'}">${fshort(d)}</text>`).join('')}</svg>
    <div class="legend"><span><i class="sw" style="background:var(--good);opacity:.35"></i>${TX('Unter 5 %: gut','Below 5 %: good')}</span>${dtr?`<span><i class="sw" style="border-top:1.5px dashed var(--ink);height:0;width:16px;border-radius:0"></i>${TX('Trend','Trend')}: ${(()=>{const ch=dtr.b*(dtr.x1-dtr.x0);return(ch<=0?'−':'+')+fk(Math.abs(Math.round(ch*10)/10))+TX(' Prozentpunkte',' percentage points')+(ch<-.5?TX(' (besser)',' (better)'):ch>.5?TX(' (schlechter)',' (worse)'):'')})()}</span>`:''}<span>${(()=>{const n=pts.filter(q=>!q.mp).length,m=pts.length-n;return TX(`${n} lange Läufe${m?`, ${m} Renntempo-Tests`:''}`,`${n} long runs${m?`, ${m} race-pace tests`:''}`)})()}</span></div></div>`;
}
function weeklyStats(){
  const first=S.plan.startMonday,cur=monday(today()),ws=[];
  for(let m=first;m<=cur;m=addD(m,7))ws.push({m,load:0,km:0,plan:(planWeek(m)||{}).km||0});
  allRuns().forEach(l=>{if(!l.done)return;const w=ws.find(w=>w.m===monday(l.date));if(!w)return;w.load+=logDur(l)*l.rpe;w.km+=logKm(l)});
  return ws.slice(-14);
}
function loadChart(){
  const ws=weeklyStats();if(ws.filter(w=>w.load).length<2)return'';
  const W0=400,H0=200,L=38,R=12,T=12,B=28,n=ws.length,bw=(W0-L-R)/n;
  const chronic=ws.map((w,i)=>{const p=ws.slice(Math.max(0,i-4),i).filter(x=>x.load);return p.length?avg(p.map(x=>x.load)):null});
  const ticks=niceTicks(0,Math.max(...ws.map(w=>w.load),...chronic.filter(Boolean)));
  const y=v=>T+(H0-T-B)*(1-v/ticks[ticks.length-1]);
  const lastC=chronic[n-1],acwr=lastC?ws[n-1].load/lastC:null;
  const prevW=ws[n-2],prevC=chronic[n-2],acwrP=prevC?prevW.load/prevC:null;
  const st=a=>a==null?'':LANG==='en'?(a<.8?'rather little, form may drop':a<=1.3?'in the safe range (0.8–1.3)':a<=1.5?'raised, mind recovery':dow(today())<=2?'high, higher injury risk; hard sessions are eased until Wednesday':'high, higher injury risk'):(a<.8?'eher wenig, Form könnte nachlassen':a<=1.3?'im sicheren Bereich (0.8–1.3)':a<=1.5?'erhöht, auf Erholung achten':dow(today())<=2?'hoch, erhöhtes Verletzungsrisiko; harte Einheiten sind bis Mittwoch entschärft':'hoch, erhöhtes Verletzungsrisiko');
  return`<div class="card"><div class="spread"><h3>Trainingsbelastung</h3>${acwrP?`<span class="num" style="font-size:20px;color:${acwrP>1.5?'var(--bad)':acwrP>1.3?'var(--warn)':'var(--good)'}">${fk(Math.round(acwrP*10)/10)}× ${LANG==='en'?'avg':'Schnitt'}</span>`:''}</div>
    <p style="margin:2px 0 8px;font-size:15px">${acwrP?(LANG==='en'?'Last week compared with the 4 weeks before: ':'Letzte Woche im Vergleich zu den 4 Wochen davor: ')+st(acwrP)+'.':''}</p>
    <svg class="chart" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="Wöchentliche Trainingsbelastung">
    ${ticks.map(v=>`<line x1="${L}" x2="${W0-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`).join('')}
    ${ws.map((w,i)=>`<rect x="${L+i*bw+bw*.18}" y="${y(w.load)}" width="${bw*.64}" height="${Math.max(0,H0-B-y(w.load))}" fill="${i===n-1?'var(--hot)':'var(--blue)'}"/>${i%2===0||i===n-1?`<text x="${L+i*bw+bw/2}" y="${H0-8}" text-anchor="middle">${fshort(w.m)}</text>`:''}`).join('')}
    <polyline points="${chronic.map((c,i)=>c==null?null:`${L+i*bw+bw/2},${y(c)}`).filter(Boolean).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="2.5"/></svg>
    <div class="legend"><span><i class="sw" style="background:var(--blue)"></i>Abgeschlossene Wochen</span><span><i class="sw" style="background:var(--hot)"></i>Laufende Woche</span><span><i class="sw" style="background:var(--ink);height:3px"></i>4-Wochen-Schnitt</span></div></div>`;
}
// Weekly volume as a brick wall: one brick per km, ten bricks per row, so each week's wall grows with its kilometres
function weekDoneKm(mon){return[...Array(7)].reduce((a,_,k)=>{const l=S.logs[addD(mon,k)];return a+(l&&l.done?logKm(l):0)},0)+(S.extra||[]).filter(x=>monday(x.date)===mon).reduce((a,x)=>a+logKm(x),0)}
// weekly volume shows only the weeks since the first activity / plan start: week 1 one wall, from week 4 the last 4 weeks
function volWeeks(){const cur=monday(today()),runs=allRuns().filter(l=>l.done);let st=S.plan.startMonday<=today()?S.plan.startMonday:null;
  if(runs.length&&(!st||runs[0].date<st))st=runs[0].date;if(!st)return 1;return clamp(Math.floor(daysBetween(monday(st),cur)/7)+1,1,4)}
// weekly volume as walls that build up: one brick per km, coloured by the kind of run (easy, long, hard, race), open planned km dashed.
// Bricks drop in row by row when the view opens; tapping a week lists its runs.
const BRK={easy:'var(--brick)',long:'color-mix(in srgb,var(--brick) 68%,#2a0d06)',hard:'#D9A03A',race:'color-mix(in srgb,var(--ink) 75%,var(--brick))'};
function volChart(){
  const cur=monday(today()),BW=16,BH=8,G=2,PX=BW+G,PY=BH+G,WW=10*PX-G,vn=volWeeks(),anim=!!ui.wallAnim;ui.wallAnim=false;
  const data=[...Array(vn)].map((_,i)=>vn-1-i).map(k=>{const m=addD(cur,-7*k),w=planWeek(m),runs=allRuns().filter(l=>l.done&&!isAlt(l)&&monday(l.date)===m).sort((a,b)=>a.date<b.date?-1:1);
    let cum=0,prev=0;const kinds=[];runs.forEach(l=>{cum+=logKm(l);const n=Math.round(cum)-prev;prev=Math.round(cum);const kd=kindOf(logType(l))||'easy';for(let i=0;i<n;i++)kinds.push(kd)});
    const done=kinds.length,plan=w?Math.round(w.km):0;return{m,done,kinds,runs,plan,n:Math.max(done,k===0?plan:done),isC:k===0}});
  const rows=Math.max(1,...data.map(d=>Math.ceil(d.n/10))),H=rows*PY;
  const brick=(x,y,k,kd,dl)=>{const sh=[1,.92,.97,.88,.95][(k*7+3)%5];
    return`<g class="bk${anim?'':' still'}" style="animation-delay:${dl}ms"><rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="1.2" fill="${BRK[kd]||BRK.easy}" fill-opacity="${sh}"/><rect x="${x+1}" y="${y+.8}" width="${BW-2}" height="1.4" rx=".7" fill="#fff" opacity=".28"/><rect x="${x}" y="${y+BH-1.6}" width="${BW}" height="1.6" rx=".8" fill="#000" opacity=".16"/></g>`};
  const walls=data.map((d,wi)=>{let s='';const full=Math.ceil(d.done/10);
    for(let r=0;r<full;r++){const cnt=Math.min(10,d.done-r*10);s+=`<rect x="${-G/2}" y="${H-(r+1)*PY-G/2}" width="${cnt*PX}" height="${PY}" fill="var(--mortar)"/>`}
    for(let k=0;k<d.n;k++){const r=Math.floor(k/10),c=k%10,x=c*PX,y=H-(r+1)*PY+G/2;
      s+=k<d.done?brick(x,y,k,d.kinds[k],Math.min(1100,wi*90+k*16)):`<rect x="${x+.6}" y="${y+.6}" width="${BW-1.2}" height="${BH-1.2}" rx="1.2" fill="none" stroke="var(--muted)" stroke-width="1.1" stroke-dasharray="3 2" opacity=".65"/>`}
    return`<button class="wallw ${d.isC?'cur':''} ${ui.wallSel===d.m?'sel':''}" data-act="wallSel" data-v="${d.m}" aria-pressed="${ui.wallSel===d.m}"><div class="wl">${d.isC?T('Diese Woche','This week'):T('ab ','from ')+fshort(d.m)}</div><div class="wk2">${d.isC&&d.plan?`${d.done}<span class="muted"> / ${d.plan}</span>`:d.done} km</div>
      <svg viewBox="${-G} ${-G} ${WW+2*G} ${H+2*G}" aria-hidden="true">${s}</svg></button>`}).join('');
  const tot=data.reduce((a,d)=>a+d.done,0),sel=data.find(d=>d.m===ui.wallSel);
  const list=sel?`<div class="wallrun"><div class="label">${sel.isC?T('Diese Woche','This week'):T('Woche ab ','Week from ')+fdate(sel.m)}</div>${sel.runs.length?sel.runs.map(l=>{const kd=kindOf(logType(l))||'easy';return`<button class="wr" data-act="openDay" data-d="${l.date}"><i style="background:${BRK[kd]}"></i><span>${DOWL[dow(l.date)].slice(0,2)} · ${esc((l.s&&l.s.title)||RTL[logType(l)]||'')}</span><b>${fk(Math.round(logKm(l)*10)/10)} km</b></button>`}).join(''):`<p class="hint" style="margin:4px 0">${T('Keine Läufe erfasst.','No runs logged.')}</p>`}</div>`:`<p class="hint" style="margin:8px 0 0;text-align:center">${T('Tippe auf eine Woche für ihre Läufe.','Tap a week to see its runs.')}</p>`;
  return`<div class="card"><h3>${T('Wochenumfang','Weekly volume')} · ${vn>1?T(`letzte ${vn} Wochen`,`last ${vn} weeks`):T('diese Woche','this week')}</h3>
    <p class="hint" style="margin:2px 0 10px">${T('1 Ziegel = 1 km, 10 pro Reihe.','1 brick = 1 km, 10 per row.')} ${vn>1?T(`Zusammen ${tot} km, im Schnitt ${Math.round(tot/vn)} km pro Woche.`,`${tot} km in total, ${Math.round(tot/vn)} km per week on average.`):T('Ab nächster Woche siehst du hier den Vergleich, bis zu 4 Wochen.','From next week you will see a comparison here, up to 4 weeks.')}</p>
    <div class="walls">${walls}</div>${list}
    <div class="legend" style="margin-top:10px"><span><i class="sw" style="background:${BRK.easy};width:16px;height:9px;border-radius:2px"></i>${T('locker','easy')}</span><span><i class="sw" style="background:${BRK.long};width:16px;height:9px;border-radius:2px"></i>${T('lang','long')}</span><span><i class="sw" style="background:${BRK.hard};width:16px;height:9px;border-radius:2px"></i>${T('hart','hard')}</span><span><i class="sw" style="border:1px dashed var(--muted);width:16px;height:9px;border-radius:2px"></i>${T('geplant','planned')}</span></div></div>`;
}
function vdotChart(bare){
  const h=S.adapt.history.filter(x=>x.vdot);if(h.length<3)return'';if(bare&&!detailOn())return'';const vv=h.map(x=>x.vdot);if(Math.max(...vv)-Math.min(...vv)<.3)return'';
  const W0=400,H0=170,L=34,R=12,T=12,B=28,ticks=niceTicks(Math.min(...h.map(x=>x.vdot))-.5,Math.max(...h.map(x=>x.vdot))+.5);
  const x=i=>L+(W0-L-R)*i/(h.length-1),y=v=>T+(H0-T-B)*(1-(v-ticks[0])/(ticks[ticks.length-1]-ticks[0]));
  return`<div class="${bare?'vdin':'card'}"><div class="spread"><h3>${bare?T('Verlauf Leistungsindex','Performance-index history'):'Leistungsindex'}</h3><span class="num" style="font-size:20px">${h[h.length-1].vdot.toFixed(1)}</span></div>
    <p class="hint" style="margin:2px 0 8px">VDOT nach jeder Auswertung (alle zwei Wochen). Er steigt, wenn deine Tempoeinheiten schneller sind als vorgegeben.</p>
    <svg class="chart" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="Leistungsindex über die Wochen">
    ${ticks.map(v=>`<line x1="${L}" x2="${W0-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${fk(v)}</text>`).join('')}
    <polyline points="${h.map((p,i)=>`${x(i)},${y(p.vdot)}`).join(' ')}" fill="none" stroke="var(--blue)" stroke-width="3"/>
    ${h.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.vdot)}" r="4" fill="var(--blue)"/>`).join('')}
    ${[0,h.length-1].map(i=>`<text x="${x(i)}" y="${H0-8}" text-anchor="${i?'end':'start'}">${fshort(h[i].week)}</text>`).join('')}</svg></div>`;
}
function entriesHTML(){
  const all=allRuns().reverse(),entries=ui.allLogs?all:all.slice(0,20);
  return`<button class="btn ghost small" style="align-self:flex-start" data-act="logHow">+ ${T('Training erfassen','Log training')}</button>
  ${entries.length?`<div class="list entries">${entries.map(l=>{const iv=isIv(l),sec=logSec(l),fb=l.done&&l.s?fbFull(l,l.date):null;
      const meta=!l.done?(l.reason==='alt'?T('durch Alternativtraining ersetzt','replaced by cross-training'):T('nicht durchgeführt','not done')):isAlt(l)?[(l.dur||'–')+' min',...altMetrics(l).slice(0,2),l.hr?'♥ '+l.hr:null,'≈ '+fk(altEq(l).eqKm)+T(' km Lauf',' km run')].filter(Boolean).join(' · '):[fk(logKm(l))+' km',sec?fmtTime(sec):null,l.pace?(iv?T('Belastung ','work '):'')+pace(l.pace):null,l.hr?'♥ '+l.hr:null].filter(Boolean).join(' · ');
      return`<button class="li ent" ${l.id?`data-act="openXView" data-v="${l.id}"`:`data-act="openDay" data-d="${l.date}"`}><span class="dt">${DOWS[dow(l.date)]}<b>${pd(l.date).getDate()}.${pd(l.date).getMonth()+1}.</b></span>
        <span class="t">${esc(isAlt(l)?altTitle(l):l.type&&l.type!==rtOfPlan(l.s.type)?RTL[l.type]:l.s.title)}${l.id&&l.s.type!=='alt'?`<span class="muted" style="font-weight:600"> · ${T('zusätzlich','extra')}</span>`:''}<small>${meta}</small></span>
        ${fb&&fb.score!=null?`<span class="fbs mini" style="--sc:${scoreCol(fb.score)}"><b>${fb.score}</b></span>`:'<span></span>'}</button>`}).join('')}</div>${all.length>entries.length?`<button class="link" style="margin:10px 4px" data-act="allLogs">${T('Alle','Show all')} ${all.length} ${T('Einträge anzeigen','entries')}</button>`:''}`
  :'<p class="muted">Noch keine Einträge. Erfasse oder importiere deinen ersten Lauf, daraus lernt der Plan.</p>'}`;
}
