/* ---- race result and review ----
   Compared with goal time, the prediction from training at that time, your best time, pacing (half splits),
   heart rate typical for the distance and the conditions; ends with concrete conclusions. */
const raceSec=r=>r&&r.res&&r.res.sec?r.res.sec:null;
function raceHrBand(d){return d<=5.5?[.93,.98]:d<=11?[.90,.96]:d<=22?[.86,.92]:d<=43?[.80,.88]:[.70,.82]}
function raceReview(r){const R=r.res;if(!R||!R.sec)return null;
  const d=r.dist,sec=R.sec,c=ctxFor(S),plus=[],minus=[],tips=[];let sc=7,fade=false,fast=false;
  const pb=(S.pbs||[]).filter(p=>Math.abs(p.dist-d)<=d*.01&&p.id!=='race-'+r.id&&p.date<r.date).sort((a,b)=>a.sec-b.sec)[0];
  if(r.goal){const q=sec/r.goal-1,dt=fmtTime(Math.abs(sec-r.goal));
    if(q<=0){sc+=q<=-.02?2:1.5;plus.push(T(`Ziel erreicht: ${dt} schneller als ${fmtTime(r.goal)}.`,`Goal reached: ${dt} faster than ${fmtTime(r.goal)}.`))}
    else if(q<=.02){sc-=.5;minus.push(T(`Ziel knapp verpasst: ${dt} über ${fmtTime(r.goal)} (${pctTxt(q*100)}).`,`Goal narrowly missed: ${dt} over ${fmtTime(r.goal)} (${pctTxt(q*100)}).`))}
    else{sc-=q<=.05?1.5:2.5;minus.push(T(`Ziel verpasst: ${dt} über ${fmtTime(r.goal)} (${pctTxt(q*100)}).`,`Goal missed: ${dt} over ${fmtTime(r.goal)} (${pctTxt(q*100)}).`))}}
  if(R.pred){const q=sec/R.pred-1;
    if(q<=-.10)tips.push(T('Mehr als 10 % schneller als die Prognose: Stimmen Distanz und Zeit? Wenn ja, unbedingt als Referenz übernehmen, sonst sind deine Trainingspaces zu langsam.','More than 10 % faster than predicted: are distance and time correct? If so, definitely use it as your reference, otherwise your training paces are too slow.'));
    if(q<=-.02){sc+=.5;fast=true;plus.push(T(`Schneller als die Prognose aus dem Training (${fmtTime(R.pred)}): Deine Form war besser, als die Trainingsdaten zeigten.`,`Faster than the prediction from training (${fmtTime(R.pred)}): your form was better than the training data showed.`))}
    else if(q<=.02)plus.push(T(`Genau im Bereich der Prognose (${fmtTime(R.pred)}): Training und Rennen passen zusammen.`,`Right at the prediction (${fmtTime(R.pred)}): training and race match.`));
    else if(q>.04){sc-=.5;minus.push(T(`Deutlich langsamer als die Prognose (${fmtTime(R.pred)}, ${pctTxt(q*100)}).`,`Clearly slower than the prediction (${fmtTime(R.pred)}, ${pctTxt(q*100)}).`))}}
  if(pb){if(sec<pb.sec)plus.push(T(`Neue Bestzeit! ${fmtTime(pb.sec-sec)} schneller als ${fmtTime(pb.sec)} (${fdate(pb.date)}).`,`New personal best! ${fmtTime(pb.sec-sec)} faster than ${fmtTime(pb.sec)} (${fdate(pb.date)}).`))}
  else plus.push(T('Erste erfasste Zeit auf dieser Distanz: gute Referenz für später.','First recorded time at this distance: a good reference for later.'));
  if(R.h1&&R.h1<sec){const h2=sec-R.h1,ps=(h2/R.h1-1)*100;
    if(ps<=-1)plus.push(T(`Negativer Split: 2. Hälfte ${pctTxt(-ps).replace('+','')} schneller. Ideal eingeteilt.`,`Negative split: second half ${pctTxt(-ps).replace('+','')} faster. Ideally paced.`));
    else if(ps<=2.5)plus.push(T(`Gleichmässig eingeteilt (2. Hälfte ${pctTxt(ps)}).`,`Evenly paced (second half ${pctTxt(ps)}).`));
    else if(ps<=5){sc-=.5;fade=true;minus.push(T(`Leicht positiver Split: 2. Hälfte ${pctTxt(ps)} langsamer.`,`Slightly positive split: second half ${pctTxt(ps)} slower.`))}
    else{sc-=1;fade=true;minus.push(T(`Zu schnell gestartet: 2. Hälfte ${pctTxt(ps)} langsamer.`,`Started too fast: second half ${pctTxt(ps)} slower.`))}}
  if(R.hr){const p=R.hr/c.hm,[lo,hi]=raceHrBand(d);
    if(p<lo-.03){minus.push(T(`Ø Puls ${R.hr} (${Math.round(p*100)} % HFmax) ist tief für ein Rennen über ${fk(d)} km (üblich ${Math.round(lo*100)}–${Math.round(hi*100)} %): Reserve vorhanden.`,`Avg. heart rate ${R.hr} (${Math.round(p*100)} % HRmax) is low for a ${fk(d)} km race (typical ${Math.round(lo*100)}–${Math.round(hi*100)} %): there was reserve.`));tips.push(T('Nächstes Mal mutiger: nach dem ersten Viertel ans Zieltempo herantasten und den Puls im typischen Bereich halten.','Next time be bolder: after the first quarter move towards goal pace and keep heart rate in the typical range.'))}
    else if(p>hi+.02)minus.push(T(`Ø Puls ${R.hr} (${Math.round(p*100)} % HFmax) über dem Üblichen für diese Distanz: am Limit oder zu schnell angelaufen.`,`Avg. heart rate ${R.hr} (${Math.round(p*100)} % HRmax) above typical for this distance: at the limit or started too fast.`));
    else plus.push(T(`Ø Puls ${R.hr} (${Math.round(p*100)} % HFmax) passt zur Distanz.`,`Avg. heart rate ${R.hr} (${Math.round(p*100)} % HRmax) fits the distance.`))}
  if(R.rpe&&R.rpe<=6)tips.push(T(`Anstrengung nur ${R.rpe}/10: Da lag mehr drin. Beim nächsten Rennen das Tempo ab Hälfte steigern.`,`Effort only ${R.rpe}/10: there was more in it. Next race increase the pace from halfway.`));
  const cnd=R.cond||[],hil=R.gain&&R.gain/d>=10;
  if(cnd.includes('heat'))minus.push(T('Hitze kostet typischerweise 1–3 % (mehr über lange Distanzen): Die Zeit ist besser, als sie aussieht.','Heat typically costs 1–3 % (more over long distances): the time is better than it looks.'));
  if(cnd.includes('wind'))minus.push(T('Wind kostet je nach Strecke 1–2 %.','Wind costs 1–2 % depending on the course.'));
  if(hil)minus.push(T(`Hügelige Strecke (${R.gain} hm): nicht direkt mit flachen Bestzeiten vergleichbar.`,`Hilly course (${R.gain} m): not directly comparable with flat best times.`));
  // conclusions
  if(fade&&d>=15&&!cnd.includes('heat'))tips.push(T('Einbruch in der 2. Hälfte: Ermüdungsresistenz stärken (lange Läufe mit schnellerem Schluss, Tempodauerläufe) und Verpflegung im Training üben (ab 75 min 30–60 g Kohlenhydrate pro Stunde).','Fade in the second half: build fatigue resistance (long runs with a faster finish, tempo runs) and practise fuelling in training (from 75 min, 30–60 g of carbohydrate per hour).'));
  else if(fade)tips.push(T('Einteilung: die ersten 2–3 km 3–5 s/km langsamer als das Zieltempo, dann steigern.','Pacing: run the first 2–3 km 3–5 s/km slower than goal pace, then build.'));
  if(fast||(pb&&sec<pb.sec))tips.push(T('Übernimm das Resultat als Referenz: Leistungsindex, Paces und Prognosen werden genauer.','Use the result as your reference: performance index, paces and predictions become more accurate.'));
  if(r.goal&&sec>r.goal*1.04&&!fade&&!cnd.length&&!hil)tips.push(T('Das Ziel war für die aktuelle Form zu ambitioniert. Setz das nächste Ziel nahe an der Prognose; mehr ist mit konsequentem Training über mehrere Monate realistisch.','The goal was too ambitious for your current form. Set the next goal close to the prediction; more is realistic with consistent training over several months.'));
  tips.push(T(`Erholung: ${recText(d)}.`,`Recovery: ${recText(d)}.`));
  const score=clamp(Math.round(sc),1,10),q=r.goal?sec/r.goal-1:null;
  return{score,ty:'race',verdict:r.goal?(q<=0?T(`Ziel erreicht: ${fmtTime(sec)} (Ziel ${fmtTime(r.goal)})`,`Goal reached: ${fmtTime(sec)} (goal ${fmtTime(r.goal)})`):T(`${fmtTime(sec)}: ${fmtTime(sec-r.goal)} über dem Ziel ${fmtTime(r.goal)}`,`${fmtTime(sec)}: ${fmtTime(sec-r.goal)} over the goal ${fmtTime(r.goal)}`)):T(`Resultat ${fmtTime(sec)} · ${pace(sec/d)}`,`Result ${fmtTime(sec)} · ${pace(sec/d)}`),
    plus,minus,tips:tips.slice(0,4),cmp:null,tab:null,trend:null,hist:[],isPB:!!pb&&sec<pb.sec,first:!pb,fast}}
function pbGroups(){
  const g={};(S.pbs||[]).forEach(p=>{const k=dkey(p.dist);(g[k]=g[k]||[]).push(p)});
  return Object.keys(g).map(Number).sort((a,b)=>a-b).map((k,i)=>({k,label:distLabel(k),col:`var(--c${i%8+1})`,items:g[k].sort((a,b)=>a.date<b.date?1:-1),best:g[k].reduce((a,b)=>b.sec/b.dist<a.sec/a.dist?b:a)}));
}
// Progress per distance: one bar per time in chronological order, the longer the bar the faster; fits any phone width
function pbChart(){
  const gs=pbGroups().filter(g=>g.items.length>=2);if(!gs.length)return'';
  const rows=gs.map(g=>{const pts=[...g.items].sort((a,b)=>a.date<b.date?-1:1).slice(-6),first=[...g.items].sort((a,b)=>a.date<b.date?-1:1)[0];
    const sp=pts.map(p=>p.dist/p.sec),lo=Math.min(...sp),hi=Math.max(...sp),rg=hi-lo;
    const w=v=>rg>0?Math.round(38+62*(v-lo)/rg):100;
    const diff=g.best.sec-first.sec,pct=first.sec?(1-g.best.sec/first.sec)*100:0;
    return`<div class="pbg"><div class="pbg-h"><span class="pbh"><i class="sw" style="background:${g.col}"></i>${g.label}</span>
      <span class="pbg-b"><b>${fmtTime(g.best.sec)}</b>${diff<0?`<span class="pbg-d">−${fmtTime(-diff)} · ${fk(Math.round(pct*10)/10)} %</span>`:''}</span></div>
      <div class="pbbars">${pts.map(p=>`<div class="pbbar${p===g.best?' best':''}"><span class="pbbar-dt">${MON[pd(p.date).getMonth()]} ${String(pd(p.date).getFullYear()).slice(2)}</span>
        <span class="pbbar-tr"><i style="width:${w(p.dist/p.sec)}%;background:${g.col}"></i></span><span class="pbbar-t">${fmtTime(p.sec)}${p===g.best?' ★':''}</span></div>`).join('')}</div></div>`}).join('');
  return`<div class="card"><h3>Fortschritt bei Bestzeiten</h3><p class="hint" style="margin:2px 0 4px">Pro Distanz deine Zeiten von alt nach neu. Je länger der Balken, desto schneller; ★ ist die Bestzeit. Oben rechts die Verbesserung seit der ersten Zeit.</p>${rows}</div>`;
}
function pbCard(){
  const gs=pbGroups();
  return`<div class="card"><div class="spread"><h3>Bestleistungen</h3><button class="btn small primary" data-act="pbNew">+ Neu</button></div>
  ${gs.length?`<div class="pbl">${gs.map(g=>`<button class="pbrow" data-act="pbDist" data-v="${g.k}"><i class="sw" style="background:${g.col};border-radius:50%"></i>
    <span class="pbd"><b>${g.label}</b><small>${esc(g.best.name||'Ohne Anlass')} · ${fshort(g.best.date)}${String(pd(g.best.date).getFullYear()).slice(2)}</small></span>
    <span class="pbt"><b>${fmtTime(g.best.sec)}</b><small>${pace(g.best.sec/g.best.dist)}</small></span><span class="muted">›</span></button>`).join('')}</div>`
  :'<p class="muted" style="margin:8px 0 0">Noch keine Bestleistungen. Trag deine besten Zeiten mit Datum ein, z. B. 10 km, Halbmarathon oder jede andere Distanz. Du kannst sie jederzeit anpassen.</p>'}</div>`;
}
function pbDistSheet(k){
  const g=pbGroups().find(x=>x.k===k);if(!g)return'<p class="muted">Keine Zeiten mehr für diese Distanz.</p><button class="btn ghost" data-act="closeSheet">Schliessen</button>';
  return`<div class="label">Alle Zeiten</div><h2 class="d" style="font-size:26px;margin:4px 0 14px">${g.label}</h2>
    <div class="list">${g.items.map(p=>`<button class="li" style="grid-template-columns:1fr auto" data-act="pbEdit" data-v="${p.id}"><span class="t">${p===g.best?'<span class="pbtag">PB</span> ':''}${esc(p.name||'Ohne Anlass')}<small>${fdate(p.date)} ${pd(p.date).getFullYear()} · ${pace(p.sec/p.dist)}</small></span><span class="k">${fmtTime(p.sec)}</span></button>`).join('')}</div>
    <div class="row" style="margin-top:14px;justify-content:space-between"><button class="btn blue small" data-act="pbNewDist" data-v="${g.k}">+ Zeit für ${g.label}</button><button class="btn ghost" data-act="closeSheet">Schliessen</button></div>`;
}
function pbSheet(){
  const f=ui.pbf,d=pnum(f.dist),sec=hms(f.h,f.m,f.s),ok=d>0&&sec>0,vd=ok?vdotFrom(d,sec):null,cur=vdotOf(S);
  return`<h2 class="d" style="font-size:26px;margin:4px 0 14px">${f.id?'Bestleistung bearbeiten':'Neue Bestleistung'}</h2><div class="stack" style="gap:14px">
    <div class="field"><label for="pbDist">Distanz in km</label><input class="input" id="pbDist" inputmode="decimal" placeholder="z. B. 10 oder 15.5" value="${esc(f.dist)}" data-bind="pbf.dist" data-live="pb">
      <div class="seg">${PBD.map(([v,l])=>opt('pbSet','dist',v,l,f.dist)).join('')}</div></div>
    <div class="grid2"><div class="field"><span class="flabel">Zeit</span><div class="tin"><input class="input" id="pbH" inputmode="numeric" placeholder="Std" value="${esc(f.h)}" data-bind="pbf.h" data-live="pb" aria-label="Stunden">:<input class="input" id="pbM" inputmode="numeric" placeholder="Min" value="${esc(f.m)}" data-bind="pbf.m" data-live="pb" aria-label="Minuten">:<input class="input" id="pbS" inputmode="numeric" placeholder="Sek" value="${esc(f.s)}" data-bind="pbf.s" data-live="pb" aria-label="Sekunden"></div></div>
    <div class="field"><label for="pbDate">Datum</label><input class="input" id="pbDate" type="date" max="${today()}" value="${esc(f.date)}" data-bind="pbf.date"></div></div>
    <div class="field"><label for="pbName">Anlass oder Ort (optional)</label><input class="input" id="pbName" placeholder="z. B. Zürich Marathon" value="${esc(f.name)}" data-bind="pbf.name"></div>
    <div class="live" id="pbLive">${pbLive()}</div>
    <label class="row" style="font-size:14.5px;gap:8px;align-items:flex-start"><input type="checkbox" id="pbRef" ${f.ref?'checked':''} data-bind="pbf.ref"> <span>Als Referenzzeit für meine Trainingszonen verwenden<br><span class="hint">Sinnvoll bei einer aktuellen Zeit (letzte 2–3 Monate).</span></span></label>
    ${ui.pbErr?`<div class="err">${esc(ui.pbErr)}</div>`:''}
    <div class="row" style="justify-content:space-between">${f.id?(f.del?'<button class="btn small danger" data-act="pbDel">Wirklich löschen</button>':'<button class="btn small ghost" data-act="pbDelAsk">Löschen</button>'):'<span></span>'}<div class="row"><button class="btn ghost" data-act="closeSheet">Abbrechen</button><button class="btn primary" data-act="pbSave">Speichern</button></div></div></div>`;
}
function pbLive(){const f=ui.pbf,d=pnum(f.dist),sec=hms(f.h,f.m,f.s);
  if(!(d>0)||!sec)return'Distanz und Zeit eingeben, dann siehst du Pace und Leistungsindex.';
  const vd=vdotFrom(d,sec),cur=vdotOf(S);
  return`Pace <b>${pace(sec/d)}</b> · Leistungsindex <b>${vd.toFixed(1)}</b> (aktuell im Plan: ${cur.toFixed(1)})`}

