/* ---- alternative training ----
   Running equivalent: how much of the aerobic stimulus transfers to running (specificity principle). Weight-bearing, running-like
   movements transfer most (aqua jogging, elliptical, cross-country skiing), cycling about half, swimming least. Heart-rate zones
   are corrected for the lower sport-specific HRmax (cycling ~5–10, swimming ~10–15 bpm below running). Load (duration × RPE) counts fully. */
const SPORT_DEF=[
  ['mtb','Mountainbike','Mountain bike',.6,6,/mountain\s*-?bike|\bmtb\b|bergvelo/i],
  ['indoor','Indoor-Velo','Indoor cycling',.55,7,/indoor\s*(cycl|bike|velo|ride)|virtual\s*ride|zwift|spinning|rollentrainer|hometrainer|ergometer/i],
  ['bike','Rennrad / Velo','Road bike',.55,7,/rennrad|radfahrt|radfahren|radtour|\bvelo\b|\bride\b|cycling|road\s*bike|fahrrad|\bbike\b/i],
  ['xcski','Langlauf','Cross-country skiing',.85,2,/langlauf|skating|nordic\s*ski|cross.?country\s*ski|klassisch\s*ski/i],
  ['skitour','Skitour / Schneeschuh','Ski touring / snowshoe',.7,3,/skitour|backcountry|schneeschuh|snowshoe/i],
  ['aqua','Aqua-Jogging','Aqua jogging',.8,10,/aqua/i],
  ['swim','Schwimmen','Swimming',.4,12,/schwimm|\bswim/i],
  ['elliptical','Crosstrainer','Elliptical',.8,4,/crosstrainer|elliptical|ellipsen/i],
  ['row','Rudern','Rowing',.6,3,/rudern|\browing\b|ruderger/i],
  ['hyrox','Hyrox','Hyrox',.8,0,/hyrox/i],
  ['hike','Wandern','Hiking',.35,0,/wander|\bhike\b|hiking|\bwalk\b|walking|bergtour|spazier/i],
  ['other','Andere','Other',.5,3,null]];
const SP=k=>{const d=SPORT_DEF.find(x=>x[0]===k)||SPORT_DEF[SPORT_DEF.length-1];return{k:d[0],name:T(d[1],d[2]),f:d[3],off:d[4]}};
function sportOfText(t){for(const d of SPORT_DEF)if(d[5]&&d[5].test(t))return d[0];if(/\blauf|laufen|\brun\b|running|jogg/i.test(t))return'run';return null}
// fields per sport: what the watch shows for it and what matters for the load
const ALTF={bike:['dur','dist','spd','gain','hr'],mtb:['dur','dist','spd','gain','hr'],xcski:['style','dur','dist','spd','gain','hr'],skitour:['dur','dist','gain','hr'],hike:['dur','dist','gain','hr'],
  indoor:['dur','hr','watt','dist'],row:['dur','distm','split','hr'],swim:['env','dur','distm','p100','hr'],aqua:['dur','hr'],elliptical:['dur','hr','dist'],hyrox:['dur','hr','dist'],other:['dur','dist','hr']};
const altDurMin=v=>{const ds=String(v||'').trim().replace(/[.,]/g,':');return /:/.test(ds)?Math.round((parseDur(ds.split(':').length===2?ds+':00':ds)||0)/60):+ds||0};
const fSplit=s=>s?`${Math.floor(s/60)}:${pad(Math.round(s%60))}`:'';
// what the form calculates live: speed, split per 500 m, pace per 100 m, or the distance from them
function altCalc(f){const d=altDurMin(f.dur),F=ALTF[f.sport]||[];if(!d)return'';
  if(F.includes('spd')){const km=pnum(f.dist),v=pnum(f.spd);if(km>0)return T(`Ø ${fk(Math.round(km/(d/60)*10)/10)} km/h`,`avg. ${fk(Math.round(km/(d/60)*10)/10)} km/h`);if(v>0)return T(`≈ ${fk(Math.round(v*d/60*10)/10)} km`,`≈ ${fk(Math.round(v*d/60*10)/10)} km`)}
  if(F.includes('split')){const m=pnum(f.distm),sp=parsePace(f.split);if(m>0)return T(`Ø ${fSplit(d*60/m*500)} /500 m`,`avg. ${fSplit(d*60/m*500)} /500 m`);if(sp)return`≈ ${thou(Math.round(d*60/sp*500))} m`}
  if(F.includes('p100')){const m=pnum(f.distm),sp=parsePace(f.p100);if(m>0)return T(`Ø ${fSplit(d*60/m*100)} /100 m`,`avg. ${fSplit(d*60/m*100)} /100 m`);if(sp)return`≈ ${thou(Math.round(d*60/sp*100))} m`}
  if(F.includes('dist')){const km=pnum(f.dist);if(km>0)return T(`Ø ${fk(Math.round(km/(d/60)*10)/10)} km/h`,`avg. ${fk(Math.round(km/(d/60)*10)/10)} km/h`)}
  return''}
function altFields(f){const F=ALTF[f.sport]||ALTF.other,inp=(id,b,lab,ph,mode='decimal',fmt='')=>`<div class="field"><label for="${id}">${lab}</label><input class="input" id="${id}" inputmode="${mode}"${fmt?` data-fmt="${fmt}"`:''} placeholder="${ph}" value="${esc(f[b]??'')}" data-bind="lf.${b}" data-live="alt"></div>`,
  opt0=['indoor','elliptical','hyrox','other'].includes(f.sport),W=[];
  for(const k of F){
    if(k==='dur')W.push(inp('lfDur','dur',T('Dauer (h:mm oder min)','Duration (h:mm or min)'),T('z. B. 1:30','e.g. 1:30'),'decimal','dur'));
    if(k==='dist')W.push(inp('lfDist','dist',opt0?T('Distanz (km, optional)','Distance (km, optional)'):T('Distanz (km)','Distance (km)'),T('z. B. 42.5','e.g. 42.5')));
    if(k==='spd')W.push(inp('lfSpd','spd',T('Ø Geschwindigkeit (km/h)','Avg. speed (km/h)'),T('oder Distanz','or distance')));
    if(k==='gain')W.push(inp('lfGain','gain',f.sport==='skitour'||f.sport==='hike'?T('Höhenmeter (zählt für die Belastung)','Climbing (counts for the load)'):T('Höhenmeter','Climbing'),T('z. B. 650','e.g. 650'),'numeric'));
    if(k==='hr')W.push(inp('lfHr','hr',T('Ø Puls','Avg. heart rate'),f.sport==='swim'?T('optional','optional'):T('z. B. 135','e.g. 135'),'numeric'));
    if(k==='watt')W.push(inp('lfWatt','watt',T('Ø Leistung (Watt, optional)','Avg. power (watts, optional)'),T('z. B. 180','e.g. 180'),'numeric'));
    if(k==='distm')W.push(inp('lfDistm','distm',T('Distanz (m)','Distance (m)'),f.sport==='row'?T('z. B. 6000','e.g. 6000'):T('z. B. 1500','e.g. 1500'),'numeric'));
    if(k==='split')W.push(inp('lfSplit','split',T('Ø /500 m (min:sek)','Avg. /500 m (min:sec)'),T('oder Distanz','or distance'),'decimal','pace'));
    if(k==='p100')W.push(inp('lfP100','p100',T('Ø Pace /100 m (min:sek)','Avg. pace /100 m (min:sec)'),T('oder Distanz','or distance'),'decimal','pace'))}
  const segs=F.includes('env')?`<div class="field"><span class="flabel">${T('Wo?','Where?')}</span><div class="seg">${opt('lfSet','env','pool',T('Schwimmbad','Pool'),f.env||'pool')}${opt('lfSet','env','open',T('Freiwasser','Open water'),f.env||'pool')}</div>
      ${(f.env||'pool')==='pool'?`<div class="seg" style="margin-top:8px">${opt('lfSet','pool',25,'25 m',+f.pool||25)}${opt('lfSet','pool',50,'50 m',+f.pool||25)}</div>`:`<span class="hint">${T('Im Freiwasser ist die Pace wegen Strömung und Navigation meist langsamer; das ist normal.','In open water the pace is usually slower because of current and sighting; that is normal.')}</span>`}</div>`
    :F.includes('style')?`<div class="field"><span class="flabel">${T('Technik','Technique')}</span><div class="seg">${opt('lfSet','style','skate','Skating',f.style||'')}${opt('lfSet','style','classic',T('Klassisch','Classic'),f.style||'')}</div></div>`:'';
  const cells=[];for(let i=0;i<W.length;i+=2)cells.push(`<div class="grid2">${W[i]}${W[i+1]||''}</div>`);
  return segs+cells.join('')+`<div class="hint" id="altCalc" style="margin-top:-6px">${altCalc(f)}</div>`+(f.sport==='swim'?`<p class="hint" style="margin:0">${T('Puls am Handgelenk ist im Wasser oft ungenau; mit Brustgurt genauer. Ohne Puls zählt die Anstrengung.','Wrist heart rate is often inaccurate in water; a chest strap is better. Without heart rate, effort counts.')}</p>`:'')}
// the sport-specific values of a logged cross-training, for lists and feedback
function altMetrics(l){const o=[],sp=l.sport;
  if((sp==='row'||sp==='swim')&&l.dist)o.push(thou(Math.round(l.dist*1000))+' m');else if(l.dist)o.push(fk(l.dist)+' km');
  if(sp==='row'&&l.dist&&l.dur)o.push(fSplit(l.dur*60/(l.dist*1000)*500)+' /500 m');
  if(sp==='swim'&&l.dist&&l.dur)o.push(fSplit(l.dur*60/(l.dist*1000)*100)+' /100 m');
  if(sp==='swim'&&l.env)o.push(l.env==='open'?T('Freiwasser','open water'):T(`Becken ${l.pool||25} m`,`pool ${l.pool||25} m`));
  if(!['row','swim'].includes(sp)&&l.dist&&l.dur)o.push(fk(Math.round(l.dist/(l.dur/60)*10)/10)+' km/h');
  if(l.watt)o.push(l.watt+' W');if(l.gain)o.push('↗ '+l.gain+' hm');if(l.style)o.push(l.style==='skate'?'Skating':T('Klassisch','classic'));
  return o}
