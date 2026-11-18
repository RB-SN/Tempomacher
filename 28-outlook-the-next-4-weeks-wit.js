/* ---- outlook: the next 4 weeks with their key sessions, so the way to the goal is visible ---- */
const KTY_=()=>({cruise:T('Schwelle','Threshold'),tempo:T('Tempo','Tempo'),vo2:'VO₂max',rp:T('Renntempo','Race pace'),mpace:T('Marathontempo','Marathon pace'),fartlek:T('Fahrtspiel','Fartlek'),hills:T('Hügel','Hills')});
function keyLbl(s){if(s.type==='long')return T('Lang ','Long ')+fk(s.km)+' km'+(/Marathontempo|marathon-pace|Endbeschleunigung|Renntempo/i.test(s.title)?T(' mit Tempo',' with pace'):'');
  if(s.type==='mptest')return T('Renntempo-Test ','Race-pace test ')+fk(s.test?s.test.km:s.km)+' km';if(s.type==='race')return'🏁 '+esc(s.title);if(s.type==='test')return esc(s.title);
  const st=(s.structure||[]).join(' · '),m=st.match(/(\d+\s*×\s*\(\d+\s*×\s*[\d.,]+\s*(?:min|km|m|s)\)|\d+\s*×\s*\([^)]*\)|\d+\s*×\s*[\d.,]+\s*(?:min|km|m|s)\b|(?:\d+[-–])+\d+\s*(?:km|m|min|s)\b|\d+(?:[.,]\d)?\s*km am Stück|\d+\s*min am Stück|\d+\s*km in [\d:]+ \/km, dann \d+ km)/);
  const nm=/^Schnelligkeit|^Speed/.test(s.title)?T('Schnelligkeit','Speed'):KTY_()[s.type]||esc(s.title);return nm+(m?' '+m[0].replace(/ am Stück| continuously/,'').replace(/km in [\d:]+ \/km, dann \d+ km/,'km progressiv'):'')}
function keySessions(ws){const o=[];ws.forEach(w=>w.days.forEach(s=>{if(s&&(s.quality||s.type==='long'||s.type==='mptest'))o.push(keyLbl(s))}));return o}
function outlookHTML(){const cw=monday(today()),W=[1,2,3,4].map(k=>planWeek(addD(cw,7*k))).filter(Boolean);if(!W.length)return'';
  const ph=[...new Set(W.map(w=>w.phase))];
  const rows=W.map(w=>{const ks=[];w.days.forEach((s,i)=>{if(s&&(s.quality||s.type==='long'||s.type==='mptest'||s.type==='race'))ks.push(`<span class="olk-c" style="--zc:${zcol(s)}">${keyLbl(s)}</span>`)});
    return`<div class="olr"><div class="olh"><b>${fshort(w.monday)}–${fshort(addD(w.monday,6))}</b><span>${phaseLabel(w)}${w.recovery?T(' · Entlastung',' · recovery'):''} · ${fk(w.km)} km</span></div><div class="olc">${ks.join('')||`<span class="hint">${T('nur locker','easy only')}</span>`}</div></div>`}).join('');
  const lg=W.map(w=>Math.max(0,...w.days.filter(s=>s&&s.type==='long').map(s=>s.km)));
  return`<details class="card outl" data-fold="outl" ${foldState().outl?'open':''}><summary><span><b>${T('Die nächsten 4 Wochen','The next 4 weeks')}</b><span class="hint"> · ${W.map(w=>fk(Math.round(w.km))).join(' → ')} km</span></span><span class="chev">${CHEV}</span></summary>
    <div class="stack" style="gap:10px;margin-top:10px">${rows}
    <p class="hint" style="margin:0">${T('Woche 3 und 4 sind eine Vorschau: Bis dahin kann sich der Plan je nach deinem Training noch ändern. ','Weeks 3 and 4 are a preview: the plan may still change depending on your training. ')}${ph.map(x=>PHW_()[x]).filter(Boolean).join(' ')}${lg.filter(Boolean).length>1?T(` Längster Lauf: ${lg.filter(Boolean).map(v=>fk(v)).join(' → ')} km.`,` Long run: ${lg.filter(Boolean).map(v=>fk(v)).join(' → ')} km.`):''}</p>
    <button class="link" data-act="goPlan" style="align-self:flex-start">${T('Ganzer Trainingsplan ›','Full training plan ›')}</button></div></details>`}

/* ================= tools: calculators, knowledge, analyses, weather, course ================= */
