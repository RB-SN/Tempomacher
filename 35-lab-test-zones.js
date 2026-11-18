/* ---- lab test zones ---- */
function parseLabPace(str){str=String(str||'').trim().replace(',','.');if(!str)return null;
  if(str.includes(':'))return parsePace(str);const v=parseFloat(str);if(v>=5&&v<=30)return 3600/v;return NaN}
const labIn=(k,ph,w)=>`<input class="input" id="lab_${k}" style="${w?'width:'+w+';':''}min-width:0" inputmode="decimal" placeholder="${ph}" value="${esc(ui.lab[k])}" data-bind="lab.${k}">`;
function labCard(){
  const p=S.profile,L=ui.lab;
  if(!L){
    if(!p.lab)return`<div class="card"><h3>Leistungsdiagnostik</h3><p class="muted" style="font-size:14.5px;margin:4px 0 12px">Hast du einen Laktatstufentest oder eine Spiroergometrie gemacht? Gemessene Zonen sind genauer als jede Schätzung und ersetzen die berechneten Puls- und Pacebereiche.</p><button class="btn small blue" data-act="labEdit">Testergebnis eintragen</button></div>`;
    return`<div class="card"><h3>Leistungsdiagnostik</h3><p class="muted" style="font-size:14.5px;margin:6px 0 10px">${p.lab.type==='spiro'?'Spiroergometrie':'Laktatstufentest'} vom ${fdate(p.lab.date)} ${pd(p.lab.date).getFullYear()} · ${p.lab.mode==='thr'?`LT1 ${p.lab.lt1hr} bpm${p.lab.lt1pace?' / '+pace(p.lab.lt1pace):''} · LT2 ${p.lab.lt2hr} bpm${p.lab.lt2pace?' / '+pace(p.lab.lt2pace):''}`:'5 Zonen direkt übernommen'}</p>
      <div class="row"><button class="btn ghost small" data-act="labEdit">Bearbeiten</button>${ui.labDelAsk?'<button class="btn small danger" data-act="labDel">Wirklich entfernen</button>':'<button class="btn ghost small" data-act="labDelAsk">Entfernen</button>'}</div></div>`;
  }
  const zrows=['Z1','Z2','Z3','Z4','Z5'].map(z=>`<tr><td><span class="pill zp ${z}">${z}</span></td><td><div class="row" style="gap:4px;flex-wrap:nowrap">${labIn(z+'h0','von','60px')}–${labIn(z+'h1','bis','60px')}</div></td><td><div class="row" style="gap:4px;flex-wrap:nowrap">${labIn(z+'p0','4:30','68px')}–${labIn(z+'p1','5:00','68px')}</div></td></tr>`).join('');
  return`<div class="card stack" style="gap:14px"><h3>Testergebnis eintragen</h3>
    <div class="field"><span class="flabel">Testart</span><div class="seg">${opt('labSet','type','laktat','Laktatstufentest',L.type)}${opt('labSet','type','spiro','Spiroergometrie',L.type)}</div></div>
    <div class="grid2"><div class="field"><label for="labDate">Testdatum</label><input class="input" id="labDate" type="date" max="${today()}" value="${esc(L.date)}" data-bind="lab.date"></div>
    <div class="field"><label for="lab_hrMax">Max. Herzfrequenz (falls gemessen)</label>${labIn('hrMax','z. B. 192')}</div></div>
    <div class="field"><span class="flabel">Was steht im Testbericht?</span><div class="seg">${opt('labSet','mode','thr','Zwei Schwellen (LT1/LT2)',L.mode)}${opt('labSet','mode','zones','Fünf Zonen',L.mode)}</div></div>
    ${L.mode==='thr'?`<div class="grid2"><div class="field"><span class="flabel">Aerobe Schwelle (LT1 / VT1)</span><div class="row" style="gap:6px;flex-wrap:nowrap">${labIn('lt1hr','Puls','84px')}${labIn('lt1pace','Pace oder km/h')}</div></div>
      <div class="field"><span class="flabel">Anaerobe Schwelle (LT2 / VT2 / IANS)</span><div class="row" style="gap:6px;flex-wrap:nowrap">${labIn('lt2hr','Puls','84px')}${labIn('lt2pace','Pace oder km/h')}</div></div></div>
      <p class="hint" style="margin:0">Die Zonen werden daraus nach dem üblichen 5-Zonen-Modell abgeleitet: Z2 bis LT1, Z3 zwischen den Schwellen, Z4 um LT2, Z5 darüber.</p>`
    :`<div class="scroll-x"><table class="t"><thead><tr><th>Zone</th><th>Puls (bpm)</th><th>Pace (optional)</th></tr></thead><tbody>${zrows}</tbody></table></div>`}
    <p class="hint" style="margin:0">Tempo als Pace (z. B. 5:10) oder direkt die Laufband-Geschwindigkeit in km/h (z. B. 11.6). Laufbandwerte gelten bei 1 % Steigung ungefähr wie auf der Strasse.</p>
    ${ui.labErr?`<div class="err">${esc(ui.labErr)}</div>`:''}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="labCancel">Abbrechen</button><button class="btn primary" data-act="labSave">Zonen übernehmen</button></div></div>`;
}

