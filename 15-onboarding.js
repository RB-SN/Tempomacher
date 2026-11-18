/* ---- onboarding ---- */
function refLive(o){
  const d=o.refDist==='x'?pnum(o.refCustom):+o.refDist,sec=hms(o.rh,o.rm,o.rs);
  if(!d||!sec||d<1||d>100)return'Gib Distanz und Zeit ein, dann rechnen wir Pace und Trainingszonen aus.';
  const vd=vdotFrom(d,sec),pc=paceSet(vd,null);
  return`Pace <b>${pace(sec/d)}</b> · Leistungsindex (VDOT) <b>${vd.toFixed(1)}</b><br>Locker ${fmtPace(pc.E[0])}–${fmtPace(pc.E[1])} · Schwelle ${fmtPace(pc.T)} · Intervall ${fmtPace(pc.I)}`;
}
function prepLive(o){
  if(o.goalMode==='fit'){const p=obProfile(o),fi=fitInfo(p);return T(`Ziel-Umfang: <b>${fi.km} km pro Woche</b> (≈ ${fi.min} min${fi.capped?', begrenzt durch deine Trainingstage':''}). Du startest bei ${fi.cur} km${fi.weeks?` und erreichst das Ziel in etwa <b>${fi.weeks} Wochen</b>`:' und bist schon dort'}; danach hält der Plan deine Form.`,`Target volume: <b>${fi.km} km per week</b> (≈ ${fi.min} min${fi.capped?', limited by your training days':''}). You start at ${fi.cur} km${fi.weeks?` and reach the target in about <b>${fi.weeks} weeks</b>`:' and are already there'}; then the plan keeps your form.`)}
  if(o.goalMode==='goal'){const r=obRace(o);if(!r)return'';const p=obProfile(o),pi=prepInfo(p,r,baseVdot(p)),dt=goalDate(p,r.dist,r.goal,o.gDate);
    return T(`Übliche Vorbereitung für ${fk(r.dist)} km: <b>${pi.lo}–${pi.hi} Wochen</b>, für dich <b>${pi.weeks} Wochen</b>. Zieltest am <b>${fdate(dt)}</b>${r.goal&&showPred(r.dist)?`, aktuelle Prognose ${fmtTime(predict(baseVdot(p),r.dist))}`:''}.`,`Typical preparation for ${fk(r.dist)} km: <b>${pi.lo}–${pi.hi} weeks</b>, for you <b>${pi.weeks} weeks</b>. Goal test on <b>${fdate(dt)}</b>${r.goal&&showPred(r.dist)?`, current prediction ${fmtTime(predict(baseVdot(p),r.dist))}`:''}.`)}
  const d=o.raceDist==='x'?pnum(o.raceCustom):+o.raceDist;
  if(!d||d<1||d>100||!o.raceDate||o.raceDate<=today())return'Wähle Distanz und Datum, dann siehst du die empfohlene Vorbereitungszeit.';
  let ref=null;if(o.refOn){const rd=o.refDist==='x'?pnum(o.refCustom):+o.refDist,sec=hms(o.rh,o.rm,o.rs);if(rd&&sec)ref={dist:rd,sec}}
  const p={age:+o.age||35,sex:o.sex,exp:+o.exp||0,km:o.over150?+o.kmBig:+o.km,ref,daysSel:o.daysSel};
  const g=hms(o.gh,o.gm,o.gs),pi=prepInfo(p,{dist:d,goal:g||null},baseVdot(p));
  const cur=monday(today()),start=dow(today())>=4?addD(cur,7):cur,total=daysBetween(start,monday(o.raceDate))/7+1;
  let t=`Übliche Vorbereitung für ${fk(d)} km: <b>${pi.lo}–${pi.hi} Wochen</b>. Für dich empfohlen: <b>${pi.weeks} Wochen</b>`+
    ` (${p.exp<=1?'wenig Erfahrung':'viel Erfahrung'}, ${pi.why.vol>.4?'Umfang muss noch wachsen':'Umfang passt schon gut'}${pi.why.goal!=null?(pi.why.goal>.5?', ambitionierte Zielzeit':', realistische Zielzeit'):''}${pi.why.days<pi.why.rec?`, ${pi.why.days} statt ${pi.why.rec} Trainings pro Woche`:''}).`;
  if(total>pi.weeks)t+=`<br>Dein Rennen ist in ${total} Wochen. In den ersten ${total-pi.weeks} Wochen trainierst du locker und abwechslungsreich, ab ${fdate(addD(start,7*(total-pi.weeks)))} startet die Zielvorbereitung.`;
  else if(total<pi.lo)t+=`<br><b>Nur ${total} Wochen bis zum Rennen</b>, kürzer als üblich. Der Plan wird kompakt und setzt mehr auf Frische als auf Aufbau.`;
  return t;
}
// how realistic is a goal time? today's prediction and what is possible until race day (about 0.25 % per week, at most 6 %)
function goalReal(pred,goal,weeks){const room=Math.min(.06,.01+Math.max(0,weeks)*.0025),best=Math.round(pred*(1-room));
  return{pred,best,st:goal>=pred?'ok':goal>=best?'near':goal>=best*.97?'far':'off'}}
function goalLive(o){const r=obRace(o);if(!r||!r.goal||!showPred(r.dist)||!o.raceDate||o.goalMode!=='race')return'';const p=obProfile(o),wk=daysBetween(today(),o.raceDate)/7,G=goalReal(predict(baseVdot(p),r.dist),r.goal,wk);
  const ref=obRefOk(o)?'':T(' (geschätzt; mit einer aktuellen Zeit wird es genauer)',' (estimated; a recent time makes it precise)');
  if(G.st==='ok')return`<div class="live">${T(`<b>Realistisch.</b> Deine aktuelle Form ergibt schon etwa ${fmtTime(G.pred)}${ref}.`,`<b>Realistic.</b> Your current form already gives about ${fmtTime(G.pred)}${ref}.`)}</div>`;
  if(G.st==='near')return`<div class="live">${T(`<b>Ambitioniert, aber machbar.</b> Heute etwa ${fmtTime(G.pred)}${ref}; mit ${Math.round(wk)} Wochen Training sind rund ${fmtTime(G.best)} möglich.`,`<b>Ambitious but doable.</b> About ${fmtTime(G.pred)} today${ref}; with ${Math.round(wk)} weeks of training about ${fmtTime(G.best)} is possible.`)}</div>`;
  return`<div class="adj">${T(`<b>${G.st==='far'?'Sehr ambitioniert':'Kaum erreichbar'}.</b> Heute etwa ${fmtTime(G.pred)}${ref}; bis zum Renntag sind realistisch rund <b>${fmtTime(G.best)}</b> möglich. Der Plan trainiert dich trotzdem in Richtung deines Ziels, der Renntag-Plan startet aber mit einem realistischen Tempo.`,`<b>${G.st==='far'?'Very ambitious':'Hardly reachable'}.</b> About ${fmtTime(G.pred)} today${ref}; by race day about <b>${fmtTime(G.best)}</b> is realistic. The plan still trains you towards your goal, but the race-day plan starts at a realistic pace.`)}
    <div class="row" style="margin-top:8px"><button class="btn small blue" data-act="obGoalSet" data-v="${G.best}">${T(`${fmtTime(G.best)} als Ziel übernehmen`,`Use ${fmtTime(G.best)} as goal`)}</button></div></div>`}
function obRace(o){if(!o.goalMode||o.goalMode==='fit')return null;if(o.goalMode==='goal'){const d=o.gDist==='x'?pnum(o.gCustom):+o.gDist;return d?{dist:d,goal:goalSec(o)}:null}
  const d=o.raceDist==='x'?pnum(o.raceCustom):+o.raceDist;const g=hms(o.gh,o.gm,o.gs);return d?{dist:d,goal:g||null}:null}
function obRefOk(o){if(!o.refOn)return false;const rd=o.refDist==='x'?pnum(o.refCustom):+o.refDist;return!!(rd&&hms(o.rh,o.rm,o.rs))}
function obProfile(o){let ref=null;if(o.refOn){const rd=o.refDist==='x'?pnum(o.refCustom):+o.refDist,sec=hms(o.rh,o.rm,o.rs);if(rd&&sec)ref={dist:rd,sec}}
  const pp=parsePace(o.pace);return{age:+o.age||35,sex:o.sex,exp:+o.exp||0,km:o.over150?+o.kmBig:+o.km,ref,daysSel:o.daysSel,longDay:o.longDay,pace:pp&&!Number.isNaN(pp)?pp:null,fitMin:o.fitMin}}
function freqLive(o){if(o.goalMode==='fit')return fitFreqText(fitFreq(obProfile(o)),o.daysSel.length);const r=obRace(o);if(!r)return{ok:true,t:''};const p=obProfile(o);return freqText(freqInfo(p,r,baseVdot(p)),o.daysSel.length,r.dist)}
function renderOnboarding(){
  const o=ui.ob,s=o.step;
  const lap=`${laceSVG(6,s)}<div class="label">Schritt ${s+1} von 6 · Schuhe schnüren</div>`;
  let body='';
  if(s===0)body=`<h1 class="ob-h">${T('Wer läuft?','Who is running?')}</h1><p class="muted" style="margin:0">${T('Alter und Geschlecht bestimmen Pulszonen und Erholungsbedarf.','Age and sex determine heart-rate zones and recovery needs.')}</p>
    <div class="field"><label for="obAge">${T('Geburtsdatum','Date of birth')}</label><input class="input" id="obAge" type="date" min="1925-01-01" max="${addD(today(),-3650)}" value="${esc(o.birth||'')}" data-bind="ob.birth" data-rerender="1"><span class="hint">${o.age?T(`${o.age} Jahre. Das Alter zählt automatisch mit; es dient zur Schätzung deines Maximalpulses.`,`${o.age} years. Your age updates automatically; it is used to estimate your maximum heart rate.`):T('Dient zur Schätzung deines Maximalpulses. Das Alter zählt automatisch mit.','Used to estimate your maximum heart rate. Your age updates automatically.')}</span></div>
    <div class="field"><span class="flabel">Geschlecht</span><div class="seg">${opt('ob','sex','w','Weiblich',o.sex)}${opt('ob','sex','m','Männlich',o.sex)}${opt('ob','sex','d','Divers',o.sex)}</div></div>
    <div class="field"><label for="obHome">${T('Wohnort (optional)','Home town (optional)')}</label><input class="input" id="obHome" list="gazList0" autocomplete="off" placeholder="${T('z. B. Zug','e.g. Zug')}" value="${esc(o.home||'')}" data-bind="ob.home"><datalist id="gazList0">${GAZ().map(g=>`<option value="${esc(gName(g))}">`).join('')}</datalist><span class="hint">${T('Für den Jahresvergleich: «Du bist so weit gelaufen wie von Zug bis Rom.»','For the yearly comparison: «You ran as far as from Zug to Rome.»')}</span></div>`;
  if(s===1)body=`<h1 class="ob-h">Lauferfahrung</h1><p class="muted" style="margin:0">Davon hängen Steigerung, Anzahl harter Einheiten und Entlastungswochen ab.</p>
    <div class="seg">${EXPL.map(([a,b],i)=>opt('ob','exp',i,`<b>${a}</b><small>${b}</small>`,o.exp,'tall')).join('')}</div>
    <details class="help" ${o.hrMax||o.hrRest?'open':''}><summary>${T('Maximal- und Ruhepuls bekannt? (optional)','Know your max and resting heart rate? (optional)')}</summary><div class="stack" style="gap:12px;margin-top:10px">
    <div class="grid2"><div class="field"><label for="obHr">Maximale Herzfrequenz (optional)</label><input class="input" id="obHr" type="number" inputmode="numeric" min="120" max="230" placeholder="${o.age?'geschätzt '+Math.round(208-0.7*o.age):'z. B. 188'}" value="${esc(o.hrMax)}" data-bind="ob.hrMax"></div>
    <div class="field"><label for="obHrR">Ruhepuls (optional)</label><input class="input" id="obHrR" type="number" inputmode="numeric" min="30" max="100" placeholder="${o.exp!==null?'geschätzt '+[70,66,61,57][o.exp]:'z. B. 55'}" value="${esc(o.hrRest)}" data-bind="ob.hrRest"></div></div>
    <span class="hint">Maximalpuls am genausten aus einem Leistungstest oder dem höchsten Uhrenwert bei einem harten Bergsprint. Ruhepuls morgens im Liegen messen. Leer lassen, dann schätzen wir. Werte aus einem Laktatstufentest oder einer Spiroergometrie kannst du später im Profil eintragen.</span></div></details>`;
  if(s===2)body=`<h1 class="ob-h">Aktuelle Form</h1><p class="muted" style="margin:0">Optional. Eine aktuelle Zeit macht deine Paces genau. Ohne Zeit schätzen wir und kalibrieren nach den ersten Tempoläufen.</p>
    <div class="seg">${opt('ob','refOn',true,'Ich habe eine Zeit',o.refOn)}${opt('ob','refOn',false,'Lieber schätzen',o.refOn)}</div>
    ${o.refOn?`<div class="field"><span class="flabel">Distanz</span><div class="seg">${[[5,'5 km'],[10,'10 km'],[21.1,'Halbmarathon'],[42.2,'Marathon'],['x','Andere Distanz']].map(([v,l])=>opt('ob','refDist',v,l,o.refDist)).join('')}</div></div>
    ${o.refDist==='x'?`<div class="field"><label for="obRc">Distanz in km</label><input class="input" id="obRc" inputmode="decimal" placeholder="z. B. 15" value="${esc(o.refCustom)}" data-bind="ob.refCustom" data-live="ref"></div>`:''}
    <div class="field"><span class="flabel">Zeit</span><div class="tin"><input class="input" id="obRh" inputmode="numeric" placeholder="Std" value="${esc(o.rh)}" data-bind="ob.rh" data-live="ref" aria-label="Stunden">:<input class="input" id="obRm" inputmode="numeric" placeholder="Min" value="${esc(o.rm)}" data-bind="ob.rm" data-live="ref" aria-label="Minuten">:<input class="input" id="obRs" inputmode="numeric" placeholder="Sek" value="${esc(o.rs)}" data-bind="ob.rs" data-live="ref" aria-label="Sekunden"></div></div>
    <div class="live" id="refLive">${refLive(o)}</div>`:''}`;
  if(s===3)body=`<h1 class="ob-h">Bisheriges Training</h1><p class="muted" style="margin:0">Der Plan startet bei deinem jetzigen Umfang und steigert höchstens rund 10 % pro Woche.</p>
    <div class="field"><span class="flabel">Läufe pro Woche</span><div class="seg">${[0,1,2,3,4,5,6,7].map(v=>opt('ob','runs',v,v,o.runs)).join('')}</div></div>
    <div class="field"><div class="spread"><label for="obKm">Kilometer pro Woche</label><span class="num" style="font-size:22px" id="kmVal">${o.over150?'> 150':o.km} km</span></div>
      <input type="range" id="obKm" min="0" max="150" step="1" value="${o.km}" data-bind="ob.km" data-live="km" ${o.over150?'disabled':''}>
      <label class="row" style="font-size:14.5px"><input type="checkbox" id="obOver" ${o.over150?'checked':''} data-bind="ob.over150" data-rerender="1"> Ich laufe mehr als 150 km</label>
      ${o.over150?`<input class="input" id="obKmBig" type="number" inputmode="numeric" min="151" max="400" value="${esc(o.kmBig)}" data-bind="ob.kmBig" aria-label="Kilometer pro Woche">`:''}</div>
    <div class="field"><label for="obLong">${T('Längster Lauf der letzten 4 Wochen (km, optional)','Longest run in the last 4 weeks (km, optional)')}</label><input class="input" id="obLong" inputmode="decimal" style="max-width:140px" placeholder="${T('z. B. 16','e.g. 16')}" value="${esc(o.longest||'')}" data-bind="ob.longest"><span class="hint">${T('Damit startet der lange Lauf auf deinem Niveau statt zu tief.','So the long run starts at your level instead of too low.')}</span></div>
    <div class="field"><label for="obPace">${T('Ø Pace deiner normalen Läufe (min:sek pro km)','Avg. pace of your normal runs (min:sec per km)')}${obRefOk(o)?T(' (optional)',' (optional)'):''}</label><input class="input" id="obPace" inputmode="decimal" data-fmt="pace" placeholder="${T('z. B. 6:15','e.g. 6:15')}" value="${esc(o.pace)}" data-bind="ob.pace"><span class="hint">${T('Das Tempo, in dem du üblicherweise läufst. Daraus schätzt Tempomacher deine Trainingsbereiche, bis ein Testlauf genauer misst.','The pace you usually run at. Pacemaker estimates your training zones from it until a test run measures more precisely.')}</span></div>`;
  if(s===5){const sel=o.daysSel,n=sel.length,fl=n?freqLive(o):null,fr0=(()=>{const p=obProfile(o);if(o.goalMode==='fit')return fitFreq(p);const r=obRace(o);if(!r)return null;return freqInfo(p,r,baseVdot(p))})();
    body=`<h1 class="ob-h">Trainingstage</h1><p class="muted" style="margin:0">An welchen Tagen kannst du grundsätzlich trainieren? Der Plan legt Einheiten nur auf diese Tage.</p>
    ${fr0?`<div class="impbox"><div class="label">Empfehlung für dein Ziel</div><b style="font-size:16px">${fr0.rec} Trainings pro Woche</b><span>Mindestens ${fr0.min}. ${o.goalMode==='fit'?T('Für Ausdauer und Gesundheit bringen regelmässige Läufe am meisten.','Regular runs do the most for endurance and health.'):`Basierend auf Distanz, Lauferfahrung${fr0.amb>.04?' und deiner ambitionierten Zielzeit':''}.`}</span></div>`:''}
    <div class="field"><span class="flabel">Mögliche Trainingstage</span><div class="seg">${DOWL.map((l,i)=>`<button type="button" class="opt" data-act="obDay" data-v="${i}" aria-pressed="${sel.includes(i)}">${l}</button>`).join('')}</div>
    <span class="hint">${n?`${n} ${n===1?'Tag':'Tage'} gewählt.`:'Noch keine Tage gewählt.'}${n===7?' Plane trotzdem mindestens einen Ruhetag pro Woche ein; der Plan nutzt nicht zwingend alle Tage gleich stark.':''}</span></div>
    ${fl&&fl.t?`<div class="${fl.ok?(fl.warn?'adj':'live'):'adj'}" style="${fl.ok?'':'border:2px solid var(--bad)'}">${fl.t}</div>`:''}
    <div class="field"><span class="flabel">Tag für den langen Lauf</span>${n?`<div class="seg">${sel.slice().sort((a,b)=>a-b).map(i=>opt('ob','longDay',i,DOWL[i],o.longDay)).join('')}</div><span class="hint">Am besten ein Tag mit genug Zeit, oft Samstag oder Sonntag.</span>`:'<span class="hint">Wähle zuerst deine Trainingstage.</span>'}</div>
    ${n&&(!fl||fl.ok)?`<div class="live" id="prepLive">${prepLive(o)}</div>`:''}
    <label class="healthck"><input type="checkbox" ${o.healthOk?'checked':''} data-bind="ob.healthOk"><span><b>${T('Gesundheit','Health')}:</b> ${T('Bei Vorerkrankungen (z. B. Herz, Blutdruck, Gelenke), über 35 nach langer Sportpause oder in der Schwangerschaft lasse ich mich vor dem Start ärztlich durchchecken. Bei Brustschmerzen, Schwindel oder Atemnot höre ich sofort auf.','With pre-existing conditions (e.g. heart, blood pressure, joints), over 35 after a long break from sport or during pregnancy I will get a medical check-up before starting. With chest pain, dizziness or shortness of breath I stop immediately.')}</span></label>`;
  }
  if(s===4){
    const d=o.raceDist==='x'?pnum(o.raceCustom):+o.raceDist,wk=o.raceDate?Math.floor(daysBetween(today(),o.raceDate)/7):0,warn=[];
    if(o.exp===0&&d>=42&&wk<20)warn.push('Ein Marathon oder Ultra ohne Lauferfahrung braucht meist mehr als 20 Wochen. Der Plan bleibt vorsichtig; ein kürzeres Zwischenziel wäre sinnvoll.');
    if(o.exp<=1&&d>50&&wk<24)warn.push('Für Ultras über 50 km sind 6 Monate Vorbereitung und viel Lauferfahrung üblich.');
    if(o.goalMode!=='race')body=`<h1 class="ob-h">${T('Dein Ziel','Your goal')}</h1><p class="muted" style="margin:0">${T('Ein Rennen, ein persönliches Ziel oder einfach fit werden und bleiben. Du kannst das später jederzeit ändern.','A race, a personal goal or simply getting and staying fit. You can change this any time later.')}</p>${goalFormHTML(o,'ob')}`;
    else body=`<h1 class="ob-h">Dein Ziel</h1><p class="muted" style="margin:0">Jede Distanz bis 100 km. Weitere Rennen kannst du später eintragen.</p>${goalFormHTML(o,'ob')}
    <div class="field"><label for="obRn">Name des Rennens</label><input class="input" id="obRn" placeholder="z. B. Stadtlauf" value="${esc(o.raceName)}" data-bind="ob.raceName"></div>
    <div class="field"><span class="flabel">Distanz</span><div class="seg">${[[5,'5 km'],[10,'10 km'],[21.1,'Halbmarathon'],[42.2,'Marathon'],[50,'50 km'],[100,'100 km'],['x','Andere Distanz']].map(([v,l])=>opt('ob','raceDist',v,l,o.raceDist)).join('')}</div>
    ${o.raceDist==='x'?`<input class="input" id="obRcx" inputmode="decimal" placeholder="Distanz in km, z. B. 15, 25 oder 64.5" value="${esc(o.raceCustom)}" data-bind="ob.raceCustom" data-live="prep">`:''}</div>
    <div class="grid2"><div class="field"><label for="obRd">Datum</label><input class="input" id="obRd" type="date" min="${addD(today(),1)}" value="${esc(o.raceDate)}" data-bind="ob.raceDate" data-rerender="1"></div>
    <div class="field"><span class="flabel">Zielzeit (optional)</span><div class="tin"><input class="input" id="obGh" inputmode="numeric" placeholder="Std" value="${esc(o.gh)}" data-bind="ob.gh" data-live="goal" aria-label="Stunden">:<input class="input" id="obGm" inputmode="numeric" placeholder="Min" value="${esc(o.gm)}" data-bind="ob.gm" data-live="goal" aria-label="Minuten">:<input class="input" id="obGs" inputmode="numeric" placeholder="Sek" value="${esc(o.gs)}" data-bind="ob.gs" data-live="goal" aria-label="Sekunden"></div></div></div>
    <div id="goalLive">${goalLive(o)}</div>
    ${warn.map(w=>`<div class="adj">${w}</div>`).join('')}
    <p class="hint" style="margin:0">Im nächsten Schritt wählst du deine Trainingstage. Tempomacher sagt dir dort, wie viele Trainings pro Woche du für dieses Ziel brauchst.</p>`;
  }
  return`<div class="stack" style="gap:18px">${lap}${body}${ui.obErr?`<div class="err">${esc(ui.obErr)}</div>`:''}
    <div class="row" style="justify-content:space-between">${s>0?'<button class="btn ghost" data-act="obBack">Zurück</button>':'<button class="link" data-act="demo">Erst ein Beispiel ansehen</button>'}
    <button class="btn primary" data-act="obNext">${s<5?'Weiter':'Plan erstellen'}</button></div></div>`;
}
function obValidate(){
  const o=ui.ob;
  if(o.step===0){const a=ageFrom(o.birth);if(!a||a<10||a>95)return T('Bitte dein Geburtsdatum eingeben (Alter zwischen 10 und 95).','Please enter your date of birth (age between 10 and 95).');if(!o.sex)return'Bitte ein Geschlecht wählen.'}
  if(o.step===1){if(o.exp===null)return'Bitte deine Lauferfahrung wählen.';
    if(o.hrMax!==''&&(+o.hrMax<120||+o.hrMax>230))return'Die maximale Herzfrequenz liegt meist zwischen 120 und 230.';
    if(o.hrRest!==''&&(+o.hrRest<30||+o.hrRest>100))return'Der Ruhepuls liegt meist zwischen 30 und 100.'}
  if(o.step===2&&o.refOn){const d=o.refDist==='x'?pnum(o.refCustom):+o.refDist,sec=hms(o.rh,o.rm,o.rs);
    if(o.rh||o.rm||o.rs||o.refDist==='x'){if(!d||d<1||d>100)return'Distanz zwischen 1 und 100 km eingeben.';if(!sec||sec/d<150||sec/d>1200)return'Die Zeit passt nicht zur Distanz. Format: Std : Min : Sek.'}}
  if(o.step===3&&o.over150&&(!(+o.kmBig>150)||+o.kmBig>400))return'Bitte einen Umfang zwischen 151 und 400 km eingeben.';
  if(o.step===3){const kmv=o.over150?+o.kmBig:+o.km,pp=parsePace(o.pace);if(o.pace&&(Number.isNaN(pp)||pp<150||pp>900))return T('Pace bitte als min:sek pro km eingeben, z. B. 6:15.','Please enter pace as min:sec per km, e.g. 6:15.');if(kmv>0&&+o.runs>0&&!o.pace&&!obRefOk(o))return T('Bitte die Ø Pace deiner normalen Läufe eingeben, z. B. 6:15. Ohne Referenzzeit braucht Tempomacher sie, um deine Form einzuschätzen.','Please enter the average pace of your normal runs, e.g. 6:15. Without a reference time Pacemaker needs it to assess your form.')}
  if(o.step===5){if(o.daysSel.length<1)return'Bitte deine Trainingstage wählen.';if(o.longDay===null||!o.daysSel.includes(o.longDay))return'Bitte den Tag für den langen Lauf wählen.';
    const fl=freqLive(o);if(!fl.ok)return'Zu wenige Trainingstage für dieses Ziel. Wähle mehr Tage oder gehe zurück und wähle ein kürzeres Ziel.';if(o.daysSel.length<2)return'Bitte mindestens 2 Trainingstage wählen.';
    if(!o.healthOk)return T('Bitte bestätige den Gesundheitshinweis.','Please confirm the health note.')}
  if(o.step===4&&!o.goalMode)return T('Bitte wähle dein Ziel: ein Rennen, ein persönliches Ziel oder fit werden & bleiben.','Please choose your goal: a race, a personal goal or getting & staying fit.');
  if(o.step===4&&o.goalMode==='goal'){const d=o.gDist==='x'?pnum(o.gCustom):+o.gDist;if(!d||d<1||d>100)return T('Die Distanz muss zwischen 1 und 100 km liegen.','The distance must be between 1 and 100 km.');
    if(o.gType==='time'){const g=hms(o.gh,o.gm,o.gs);if(!g||g/d<150||g/d>1500)return T('Bitte eine Zielzeit eingeben, die zur Distanz passt.','Please enter a target time that fits the distance.')}
    if(o.gType==='pace'){const pp=parsePace(o.gp);if(!pp||Number.isNaN(pp)||pp<150||pp>1200)return T('Bitte die Zielpace als min:sek pro km eingeben, z. B. 5:30.','Please enter the target pace as min:sec per km, e.g. 5:30.')}
    if(o.gDate&&o.gDate<addD(today(),14))return T('Das Datum sollte mindestens 2 Wochen in der Zukunft liegen.','The date should be at least 2 weeks ahead.');return''}
  if(o.step===4&&o.goalMode==='fit'){if(!o.fitMin)return T('Bitte wähle, wie viel Zeit du pro Woche laufen möchtest.','Please choose how much time per week you want to run.');return''}
  if(o.step===4){const d=o.raceDist==='x'?pnum(o.raceCustom):+o.raceDist;
    if(!d||d<1||d>100)return'Die Distanz muss zwischen 1 und 100 km liegen.';if(!o.raceDate||o.raceDate<=today())return'Bitte ein Datum in der Zukunft wählen.';
    const g=hms(o.gh,o.gm,o.gs);if(g&&(g/d<150||g/d>1500))return'Die Zielzeit passt nicht zur Distanz.'}
  return'';
}
function obFinish(){
  const o=ui.ob,gm=o.goalMode||'race',rd=gm==='goal'?(o.gDist==='x'?pnum(o.gCustom):+o.gDist):o.raceDist==='x'?pnum(o.raceCustom):+o.raceDist,pp=parsePace(o.pace);
  let ref=null;if(o.refOn){const d=o.refDist==='x'?pnum(o.refCustom):+o.refDist,sec=hms(o.rh,o.rm,o.rs);if(d&&sec)ref={dist:d,sec}}
  const g=gm==='goal'?goalSec(o):hms(o.gh,o.gm,o.gs),prof=obProfile(o),rdate=gm==='goal'?goalDate(prof,rd,g,o.gDate):o.raceDate;
  S=newState({hrMax:o.hrMax===''?null:+o.hrMax,hrRest:o.hrRest===''?null:+o.hrRest,age:+o.age,birth:o.birth,sex:o.sex,exp:+o.exp,ref,runs:+o.runs,km:o.over150?+o.kmBig:+o.km,daysSel:[...o.daysSel].sort((a,b)=>a-b),longDay:+o.longDay,raceName:o.raceName,raceDist:rd,raceDate:rdate,mode:gm,pace:pp&&!Number.isNaN(pp)?pp:null,fitMin:gm==='fit'?o.fitMin:null,goal:g||null});
  S.healthOk=!!o.healthOk;S.profile.strength=true;{const g=placeFind(o.home);if(g)S.profile.home={name:gName(g),lat:g.lat,lon:g.lon}}{const lg=pnum(o.longest);if(lg>=3&&lg<=100)S.profile.longest=Math.round(lg*10)/10}setPrep(true);regenerate();save();ui.tab='home';ui.ob=null;render();
}

