/* ---- training feedback: score 1–10, plus / minus / what to improve, comparison with similar sessions, form trend ----
   Basis: target pace and heart-rate zones of the plan (Daniels VDOT, % HRmax), expected effort per session type (RPE, Foster),
   aerobic decoupling (< 5 % = good aerobic base, Friel), efficiency index (speed per heart-rate reserve) against your own similar runs.
   Paces of continuous runs are elevation-adjusted, so hilly and flat runs stay comparable. */
const T=(de,en)=>LANG==='en'?en:de,TX=T; // TX: for chart functions that use a local T (top margin)
const SIMG={easy:['easy','recovery'],recovery:['recovery','easy'],long:['long'],tempo:['tempo','cruise'],cruise:['cruise','tempo'],mpace:['mpace','tempo'],vo2:['vo2','rp'],rp:['rp','vo2'],fartlek:['fartlek'],hills:['hills'],race:['race'],test:['test'],mptest:['mptest','mpace']};
function fbRuns(){
  const r=[];Object.keys(S.logs||{}).forEach(d=>{const l=S.logs[d];if(l&&l.done)r.push({date:d,l})});
  (S.extra||[]).forEach(x=>{if(x&&x.done)r.push({date:x.date,l:x})});
  return r.filter(o=>o.l.s&&o.l.s.type!=='alt'&&logType(o.l)&&logKm(o.l)>0).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.l.at||0)-(b.l.at||0));
}
function similarRuns(date,l,ty){
  const all=fbRuns().filter(o=>o.l!==l&&(o.date<date||(o.date===date&&(o.l.at||0)<(l.at||0)))&&daysBetween(o.date,date)<=180);
  let s=all.filter(o=>logType(o.l)===ty);if(s.length<2)s=all.filter(o=>(SIMG[ty]||[ty]).includes(logType(o.l)));
  // tempo and marathon-pace blocks: compare block with block only (older entries may hold the whole-run average)
  if(BLK.has(ty))s=s.filter(o=>blkData(o.l)===blkData(l));
  // prefer runs of similar hilliness (within 10 m/km), if there are enough
  const g=hillG(l);if(g!=null&&!isIv(l)&&!isBlk(l)){const near=s.filter(o=>{const h=hillG(o.l);return h!=null&&Math.abs(h-g)<=10});if(near.length>=2)s=near}
  return s.slice(-6);
}
function targetPace(ty,s,c){
  if(s&&s.pace&&s.type!=='free')return s.pace;const p=c.pc;
  return{easy:p.E,long:[p.E[0],p.E[1]*1.03],recovery:[p.E[1],p.E[1]*1.12],tempo:[p.T*.98,p.T*1.03],cruise:[p.T*.98,p.T*1.03],mpace:[p.M*.98,p.M*1.02],
    vo2:[p.I*.98,p.I*1.03],rp:p.RP?[p.RP*.98,p.RP*1.02]:null}[ty]||null;
}
// upper end of the target range for the AVERAGE heart rate
function hrCap(ty,s,c){if(s&&s.hr&&s.type!=='free')return s.hr[1];return{easy:.79,long:.80,recovery:.72}[ty]?Math.round(c.hm*{easy:.79,long:.80,recovery:.72}[ty]):null}
// heart-rate cap: the MAXIMUM heart rate should stay below it (range top + 3 % HRmax); none for VO2max, hills, fartlek
const CAPTY=new Set(['easy','long','recovery','shakeout','fun','mpace','tempo','cruise','rp']);
const capFrom=(hi,hm)=>hi?Math.min(hm,hi+Math.round(.03*hm)):null;
function hrMaxCap(ty,s,c){const t=s&&s.type!=='free'?s.type:ty;return CAPTY.has(t)||CAPTY.has(ty)&&s&&s.type==='free'?capFrom(hrCap(ty,s,c)||(s&&s.hr?s.hr[1]:null),c.hm):null}
const elevM=l=>gainOf(l);
const pctTxt=x=>(x>0?'+':x<0?'−':'')+fk(Math.abs(Math.round(x*10)/10))+' %';
const FBC=new Map();let fbcAt=null;
function fbFull(l,date){if(!l)return null;const v=(S&&S.updatedAt)||0;if(fbcAt!==v){FBC.clear();fbcAt=v}
  const k=date+'|'+(l.id||'d')+'|'+(l.at||'')+'|'+logKm(l)+'|'+(l.pace||'')+'|'+(l.hr||'')+'|'+(l.hrMax||'')+'|'+(l.dur||'');if(FBC.has(k))return FBC.get(k);FBC.set(k,null);const r=isAlt(l)?rateAlt(l,date):rateRun(l,date);FBC.set(k,r);return r}
function rateRun(l,date,shallow){
  if(!l||!l.done||!l.s||l.s.type==='alt')return null;
  const ty=logType(l);if(!ty)return null;
  // easy part only (long run with a fast finish, run-walk): pace and heart rate of that part; distance stays the total
  if(l.easy&&l.easy.km&&l.easy.sec&&['easy','recovery','long'].includes(ty))l=Object.assign({},l,{pace:Math.round(l.easy.sec/l.easy.km),hr:l.easy.hr||l.hr,hrMax:null});
  const s=l.s,c=ctxFor(S),plus=[],minus=[],tips=[],km=logKm(l),gap=gapOf(l),E=RPE[ty]||[3,6];
  const easyT=['easy','recovery','long'].includes(ty),qual=['tempo','cruise','mpace','vo2','rp'].includes(ty),lab=(RTL[ty]||'').replace(/-/g,'‑');
  let sc=s.type==='free'?5.5:5,hrDone=false,ea=0,lo=0,bo=0,pos=0;
  if(ty==='mptest'){const e=mpEval(l);if(!e)return{score:null,ty,plus:[T('Renntempo-Test erfasst. Mit Pace und Puls des Testabschnitts gibt es die Auswertung.','Race-pace test logged. With pace and heart rate of the test section you get the review.')],minus:[],tips:[],cmp:null,trend:null,hist:[]};
    const tips=[];if(e.miss.length)tips.push(T(`Für eine sichere Aussage fehlen: ${e.miss.join(', ')}. Am einfachsten den Screenshot der Kilometer-Splits hochladen.`,`For a reliable verdict, missing: ${e.miss.join(', ')}. Easiest: upload the screenshot of the kilometre splits.`));
    if(e.st==='off'&&e.sug)tips.push(T(`Realistisch ist aktuell etwa ${fmtTime(e.sug)}. Der Renntag-Plan rechnet mit diesem Tempo; der nächste Test zeigt, ob es schneller geht.`,`About ${fmtTime(e.sug)} is realistic right now. The race-day plan uses this pace; the next test shows whether faster is possible.`));
    else if(e.st==='tight')tips.push(T('Im Rennen die ersten Kilometer bewusst 3–5 s/km langsamer angehen und erst in der zweiten Hälfte aufs Zieltempo gehen.','In the race, run the first kilometres 3–5 s/km slower on purpose and only settle into goal pace in the second half.'));
    else tips.push(T('Genau so im Rennen: gleichmässig, Verpflegung nach Plan. Das Tempo sitzt.','Exactly like this in the race: even pace, fuelling as planned. The pace is there.'));
    return{score:e.st==='ok'?9:e.st==='tight'?7:5,ty,verdict:e.st==='ok'?T('Zieltempo sitzt. Das gibt Sicherheit für den Renntag.','Goal pace is there. That gives confidence for race day.'):e.st==='tight'?T('Zieltempo knapp machbar: im Rennen kontrolliert starten.','Goal pace just about there: start the race controlled.'):T('Zieltempo sitzt noch nicht.','Goal pace is not there yet.'),plus:e.good,minus:e.flags,tips,cmp:null,trend:null,hist:[]}}
  if(ty==='test'){const tr=testRate(l,km);if(tr)return tr}
  if(ty==='test')return{score:null,ty,plus:[T('Testlauf erfasst: daraus werden Pace und Zonen berechnet.','Test run logged: paces and zones are calculated from it.')].concat(l.core?[T(`Testabschnitt ${fk(l.core.km)} km in ${fmtTime(l.core.sec)} (Ø ${pace(l.core.sec/l.core.km)}${l.core.hr?', Ø Puls '+l.core.hr:''}); gesamt ${fk(km)} km für den Umfang.`,`Test section ${fk(l.core.km)} km in ${fmtTime(l.core.sec)} (avg. ${pace(l.core.sec/l.core.km)}${l.core.hr?', avg. HR '+l.core.hr:''}); ${fk(km)} km in total for volume.`)]:[]),minus:[],tips:[],cmp:null,trend:null,hist:[]};
  if(ty==='race'){
    const r=(S.races||[]).find(x=>x.date===date),rk=l.core?l.core.km:km,sec=l.core?l.core.sec:l.sec||(l.pace?l.pace*km:null);
    const goal=r&&r.goal?r.goal:showPred(rk)?predict(vdotOf(S),rk):null;
    if(sec&&goal){const q=sec/goal;sc=q<=.98?10:q<=1?9:q<=1.02?8:q<=1.04?7:q<=1.07?6:q<=1.1?5:4;
      (q<=1?plus:minus).push(T(`${fmtTime(sec)} gegenüber ${r&&r.goal?'Zielzeit':'Prognose'} ${fmtTime(goal)} (${pctTxt((q-1)*100)}).`,`${fmtTime(sec)} versus ${r&&r.goal?'goal time':'prediction'} ${fmtTime(goal)} (${pctTxt((q-1)*100)}).`));
      if(q>1.04)tips.push(T('Rennen auswerten: Start zu schnell? Verpflegung? Für das nächste Rennen die ersten Kilometer bewusst kontrolliert angehen.','Review the race: too fast a start? Fuelling? Next time run the first kilometres deliberately controlled.'))}
    else plus.push(T('Rennen erfasst. Mit Zeit oder Pace gibt es eine Bewertung gegenüber Ziel bzw. Prognose.','Race logged. With time or pace you get a rating against goal or prediction.'));
    return{score:sec&&goal?sc:null,ty,plus,minus,tips,cmp:null,trend:null,hist:[]};
  }
  // 1) volume as planned
  if(s.km&&s.type!=='free'&&s.type!=='race'){const q=km/s.km;pos+=.5;
    if(Math.abs(km-s.km)<=Math.max(1,s.km*.1)){ea+=.5}
    else if(q<.8){lo+=1.5;minus.push(T(`Deutlich kürzer als geplant (${fk(km)} statt ${fk(s.km)} km).`,`Much shorter than planned (${fk(km)} instead of ${fk(s.km)} km).`));tips.push(T('Wenn die Zeit knapp ist: lieber die Einheit kürzen als ausfallen lassen, aber ehrlich im Plan vermerken. Häuft sich das, Trainingstage anpassen.','If time is short, shortening beats skipping. If it keeps happening, adjust your training days.'))}
    else if(q<.9&&s.km-km>1){lo+=.5;minus.push(T(`Etwas kürzer als geplant (${fk(km)} statt ${fk(s.km)} km).`,`A bit shorter than planned (${fk(km)} instead of ${fk(s.km)} km).`))}
    else if(easyT&&q>1.25&&km-s.km>1.5){lo+=.5;minus.push(T(`Deutlich länger als geplant (${fk(km)} statt ${fk(s.km)} km). Zusätzlicher Umfang erhöht das Verletzungsrisiko mehr, als er bringt.`,`Much longer than planned (${fk(km)} instead of ${fk(s.km)} km). Extra volume raises injury risk more than it helps.`))}}
  // 2) pace control (elevation-adjusted for continuous runs)
  const tp=targetPace(ty,s,c),pv=isIv(l)||isBlk(l)&&blkData(l)?l.pace:gap,em=elevM(l),cap0=hrCap(ty,s,c);
  if(isIv(l)&&(!l.pace||!l.hr))tips.unshift(T(`Für die Beurteilung der Intervalle fehlen ${!l.pace&&!l.hr?'Pace und Puls':!l.pace?'die Pace':'der Puls'} der Belastungen. Lade beim nächsten Mal einen Screenshot der Runden hoch oder trag die Werte der Belastungen ein; nur so lassen sich Effizienz und Form beurteilen.`,`To assess the intervals, ${!l.pace&&!l.hr?'pace and heart rate':!l.pace?'the pace':'the heart rate'} of the work phases are missing. Next time upload a screenshot of the laps or enter the work values; only then can efficiency and form be assessed.`));
  if(tp&&pv&&!noRef()){const[f,sl]=tp;pos+=easyT?1:qual?1.5:0;
    if(easyT&&l.hr&&cap0){hrDone=true;
      if(l.hr>cap0+3){const o=l.hr-cap0;lo+=o>6?2:1;minus.push(T(`Ø Puls ${l.hr} über dem Zielbereich (bis ${cap0}): für ${LABA[ty]||'diese Einheit'} zu zügig (${pace(pv)}${hilly(l)?', höhenbereinigt':''}). Lockere Läufe bauen die Grundlage nur auf, wenn sie wirklich locker sind.`,`Avg. heart rate ${l.hr} above the target range (up to ${cap0}): too brisk for an ${lab} (${pace(pv)}${hilly(l)?', elevation-adjusted':''}). Easy runs only build your base if they are truly easy.`));tips.push(T(`Auf der Uhr einen Pulsalarm bei ${hrMaxCap(ty,s,c)||cap0} setzen und das Tempo danach richten, nicht nach der Pace.`,`Set a heart-rate alarm at ${hrMaxCap(ty,s,c)||cap0} on your watch and pace by that, not by speed.`))}
      else if(l.hrMax&&hrMaxCap(ty,s,c)&&l.hrMax>hrMaxCap(ty,s,c)+2){const mc=hrMaxCap(ty,s,c);lo+=1;minus.push(T(`Max. Puls ${l.hrMax} über dem Pulsdeckel ${mc}, obwohl der Ø Puls ${l.hr} passte: Irgendwo (Anstieg, Schluss) wurde es kurz zu hart.`,`Max heart rate ${l.hrMax} above the cap ${mc}, although the average ${l.hr} was fine: somewhere (a climb, the finish) it briefly got too hard.`));tips.push(T(`Pulsalarm bei ${mc} setzen und am Berg bewusst langsamer werden oder gehen.`,`Set a heart-rate alarm at ${mc} and slow down or walk on climbs.`))}
      else{const mc=hrMaxCap(ty,s,c),mx=l.hrMax&&mc?T(`, max. ${l.hrMax} unter dem Deckel ${mc}`,`, max ${l.hrMax} below the cap ${mc}`):'';
        if(pv<f*.97){ea+=.5;plus.push(T(`Pace ${hilly(l)?'höhenbereinigt ':''}zügig (${pace(pv)}), der Ø Puls ${l.hr} blieb aber im Zielbereich (bis ${cap0})${mx}: passt.`,`Pace ${hilly(l)?'(elevation-adjusted) ':''}brisk (${pace(pv)}), but avg. heart rate ${l.hr} stayed in the target range (up to ${cap0})${mx}: fine.`))}
        else{ea+=1;plus.push(T(`Locker gelaufen: Ø Puls ${l.hr} im Zielbereich (bis ${cap0})${mx}, ${pace(pv)}${hilly(l)?' (höhenbereinigt)':''}.`,`Run easy: avg. heart rate ${l.hr} in the target range (up to ${cap0})${mx}, ${pace(pv)}${hilly(l)?' (elevation-adjusted)':''}.`))}}}
    else if(easyT){
      if(pv<f*.97&&!(l.hr&&cap0&&l.hr<=cap0+3)){lo+=1.5;minus.push(T(`Zu schnell für ${LABA[ty]||'diese Einheit'}: ${pace(pv)}${hilly(l)?' (höhenbereinigt)':''} statt ${fmtPace(f)}–${pace(sl)}. Lockere Läufe bauen die Grundlage nur auf, wenn sie wirklich locker sind (rund 80 % des Trainings).`,`Too fast for a ${lab}: ${pace(pv)} instead of ${fmtPace(f)}–${pace(sl)}. Easy runs only build your base if they are truly easy (about 80 % of training).`));tips.push(T(`Auf der Uhr einen Pulsalarm bei ${hrCap(ty,s,c)||Math.round(c.hm*.79)} setzen und das Tempo danach richten, nicht nach der Pace.`,`Set a heart-rate alarm at ${hrCap(ty,s,c)||Math.round(c.hm*.79)} on your watch and pace by that, not by speed.`))}
      else if(pv<f*.97){ea+=.5;plus.push(T(`Pace ${hilly(l)?'höhenbereinigt ':''}zügig (${pace(pv)}), der Puls ${l.hr} blieb aber im lockeren Bereich: passt.`,`Pace ${hilly(l)?'(elevation-adjusted) ':''}brisk (${pace(pv)}), but heart rate ${l.hr} stayed easy: fine.`))}
      else if(pv<=sl*1.08){ea+=1;plus.push(T(`Tempo diszipliniert im Zielbereich (${pace(pv)}${hilly(l)?', höhenbereinigt':''}).`,`Pace disciplined within the target range (${pace(pv)}${hilly(l)?', elevation-adjusted':''}).`))}
    }else if(qual){
      if(pv<f*.98){if(!l.rpe||l.rpe<=E[1]){lo+=.5;minus.push(T(`Zu schnell (${pace(pv)} statt ${fmtPace(f)}–${pace(sl)}). Die Einheit ist kontrolliert gemeint: Schneller trainiert einen anderen Bereich und kostet mehr Erholung, ohne mehr zu bringen.`,`Too fast (${pace(pv)} instead of ${fmtPace(f)}–${pace(sl)}). The session is meant to be controlled: faster trains a different system and costs more recovery without more benefit.`));tips.push(T('Fällt dir das Tempo wiederholt leicht, passt der Coach deine Vorgaben bei der nächsten Auswertung an. Bis dahin: am langsamen Ende der Vorgabe starten und halten.','If the pace keeps feeling easy, the coach raises your targets at the next review. Until then: start at the slow end of the target and hold it.'))}
        else{lo+=1;minus.push(T(`Zu schnell (${pace(pv)} statt ${fmtPace(f)}–${pace(sl)}) und dabei sehr hart. Das kostet Erholung, ohne mehr Reiz zu setzen.`,`Too fast (${pace(pv)} instead of ${fmtPace(f)}–${pace(sl)}) and very hard. That costs recovery without adding stimulus.`));tips.push(T('Die erste Wiederholung bewusst am langsamen Ende der Vorgabe laufen und dann halten.','Run the first repetition at the slow end of the target and hold it.'))}}
      else if(pv<=sl*1.02){ea+=1.5;plus.push(T(`Zieltempo getroffen (${pace(pv)}, Vorgabe ${fmtPace(f)}–${pace(sl)}).`,`Target pace hit (${pace(pv)}, target ${fmtPace(f)}–${pace(sl)}).`))}
      else if(pv>sl*1.03){lo+=1;minus.push(T(`Langsamer als die Vorgabe (${pace(pv)} statt ${fmtPace(f)}–${pace(sl)}).`,`Slower than the target (${pace(pv)} instead of ${fmtPace(f)}–${pace(sl)}).`));tips.push(T('Pausen vollständig einhalten; lieber eine Wiederholung weniger, dafür alle im Zieltempo.','Take the full recoveries; better one repetition fewer, all at target pace.'))}
    }}
  else if(!pv&&!isIv(l))tips.push(T('Mit Pace bzw. Dauer wird die Bewertung genauer.','With pace or duration the rating becomes more precise.'));
  // the planned session is the reference: say so when the data show another kind of session
  let diffT=false;{const pt=s.type&&s.type!=='free'?rtOfPlan(s.type):null;if(pt&&pt!==ty&&RTL[pt]&&(IVT.has(ty)||qual)&&(diffT=true))tips.unshift(T(`Geplant war ${RTL[pt]}, gelaufen hast du laut Daten ${RTL[ty]}. Pace und Wiederholungen werden an der geplanten Einheit gemessen.`,`Planned was ${RTL[pt]}; according to the data you ran ${RTL[ty]}. Pace and repetitions are measured against the planned session.`))}
  // 2b) number of repetitions vs plan (quality sessions)
  if(qual&&l.reps&&s.structure){const mm=s.structure.join(' ').match(/(\d+)\s*[×x]\s*\d/);const pr=s.reps||(mm?+mm[1]:0);
    if(pr)pos+=.5;if(pr&&l.reps<pr){lo+=1;minus.push(T(`${l.reps} statt ${pr} Wiederholungen.`,`${l.reps} instead of ${pr} repetitions.`));tips.push(T('Ging es nicht mehr, war das Tempo vermutlich zu hoch. Lieber alle Wiederholungen am langsamen Ende der Vorgabe.','If you could not finish, the pace was probably too high. Better all repetitions at the slow end of the target.'))}
    // more laps than planned: usually warm-up, cool-down or recoveries counted as laps; not a fault
    else if(pr){ea+=.5;plus.push(T(`Alle ${pr} Wiederholungen absolviert.`,`All ${pr} repetitions done.`))}}
  // 3) heart rate
  const cap=hrCap(ty,s,c);
  if(l.hr&&easyT&&cap&&!hrDone){pos+=.5;if(l.hr<=cap+3){ea+=.5;plus.push(T(`Puls ${l.hr} im lockeren Bereich (bis ${cap}).`,`Heart rate ${l.hr} within the easy range (up to ${cap}).`))}
    else if(l.hr>cap+5){lo+=1;minus.push(T(`Puls ${l.hr} über dem lockeren Bereich (bis ${cap}).`,`Heart rate ${l.hr} above the easy range (up to ${cap}).`))}}
  else if(l.hr&&qual&&s.hr&&s.hr[1]&&l.hr<=s.hr[1]+3&&l.hr>=s.hr[0]-8){pos+=.5;ea+=.5;plus.push(T(`Puls ${l.hr} im Zielbereich (${s.hr[0]}–${s.hr[1]}).`,`Heart rate ${l.hr} within the target range (${s.hr[0]}–${s.hr[1]}).`))}
  else if(l.hr&&qual&&s.hr&&l.hr>s.hr[1]+6){pos+=.5;minus.push(T(`Puls ${l.hr} deutlich über dem Zielbereich (${s.hr[0]}–${s.hr[1]}).`,`Heart rate ${l.hr} well above the target range (${s.hr[0]}–${s.hr[1]}).`))}
  if(!l.hr&&!shallow&&!isIv(l))tips.push(T('Mit Pulsdaten wird der Vergleich mit früheren Läufen und der Formverlauf aussagekräftiger.','With heart-rate data, the comparison with earlier runs and the form trend become more meaningful.'));
  // 4) perceived effort
  if(l.rpe){pos+=.5;if(l.rpe>E[1]+1){lo+=1;minus.push(T(`Anstrengung ${l.rpe}/10, erwartet ${E[0]}–${E[1]}. Das deutet auf Müdigkeit oder zu hohes Tempo.`,`Effort ${l.rpe}/10, expected ${E[0]}–${E[1]}. That points to fatigue or too high a pace.`));tips.push(T('Die nächsten 1–2 Tage bewusst locker; auf Schlaf und Essen achten.','Keep the next 1–2 days deliberately easy; mind sleep and food.'))}
    else if(l.rpe>=E[0]&&l.rpe<=E[1]){ea+=.5}
    else if(qual&&l.rpe<E[0]-1)plus.push(T(`Anstrengung nur ${l.rpe}/10: Reserven vorhanden.`,`Effort only ${l.rpe}/10: there is reserve.`))}
  // 5) long runs: aerobic decoupling
  const dSeg=l.impSum&&l.impSum.decPart==='easy'?T(' (lockerer Teil)',' (easy part)'):l.impSum&&l.impSum.decNote==='seg'&&l.impSum.decSeg?T(` (gleichmässiger Teil, ${l.impSum.decSeg[2]==='min'?'Minute':'km'} ${l.impSum.decSeg[0]}–${l.impSum.decSeg[1]})`,` (steady part, ${l.impSum.decSeg[2]==='min'?'minute':'km'} ${l.impSum.decSeg[0]}–${l.impSum.decSeg[1]})`):l.impSum&&l.impSum.decNote==='gap'?T(' (steigungsbereinigt)',' (grade-adjusted)'):'';
  if(l.dec!=null){pos+=1;if(l.dec<5){ea+=1;plus.push(T(`Decoupling ${fk(l.dec)} %${dSeg}: Die Grundlage trägt über die ganze Distanz.`,`Decoupling ${fk(l.dec)} %${dSeg}: your aerobic base carries the whole distance.`))}
    else if(l.dec>8){lo+=1;minus.push(T(`Decoupling ${fk(l.dec)} %${dSeg}: Der Puls stieg in der zweiten Hälfte stark.`,`Decoupling ${fk(l.dec)} %${dSeg}: heart rate rose strongly in the second half.`));tips.push(T('Langsamer starten und ab 60 min regelmässig trinken und Kohlenhydrate zuführen.','Start slower and drink and take carbohydrates regularly from 60 min.'))}}
  // 5b) core part (fast finish, marathon-pace part, build-up) and run-walk; run instead of the planned cross-training
  {if(s&&s.swapAlt)tips.push(T('Vorgesehen war Alternativtraining. Ein Lauf ist in Ordnung, wenn er wirklich locker war und nichts schmerzt; halte die nächsten 1–2 Tage ebenfalls locker.','Cross-training was planned. A run is fine if it was truly easy and nothing hurts; keep the next 1–2 days easy as well.'));const cr=coreRate(l);if(cr){pos+=1;if(cr.ok){ea+=1;plus.push(cr.txt)}else{lo+=1;minus.push(cr.txt)}}
   if(l.rw)plus.push(T(`Lauf-Geh: ${l.rw.n} Gehpausen; Pace und Puls oben gelten für die Laufabschnitte.`,`Run-walk: ${l.rw.n} walk breaks; pace and heart rate above refer to the running parts.`))}
  // 6) comparison with similar sessions
  let cmp=null,trend=null,hist=[],tab=null;
  if(!shallow){
    const prev=similarRuns(date,l,ty);
    if(prev.length){
      const P=prev.map(o=>({gap:isIv(o.l)||isBlk(o.l)&&blkData(o.l)?o.l.pace:gapOf(o.l),hr:o.l.hr,ef:effAny(o.l),km:logKm(o.l),em:elevM(o.l),rpe:o.l.rpe}));
      const av=k=>{const v=P.map(x=>x[k]).filter(x=>x!=null&&isFinite(x));return v.length?avg(v):null};
      const aG=av('gap'),aH=av('hr'),aE=av('ef'),aK=av('km'),aM=av('em'),aR=av('rpe'),ef=effAny(l),eg=effGroup(l),eN=effName(eg);
      const nm=prev.length===1?T('deinem letzten vergleichbaren Lauf','your last similar run'):T(`deinen letzten ${prev.length} vergleichbaren Läufen`,`your last ${prev.length} similar runs`);
      const part=(g,h,k,m)=>[g?pace(g)+(isIv(l)?T(' (Belastung)',' (work)'):''):null,h?T('Puls ','HR ')+Math.round(h):null,k?fk(Math.round(k*10)/10)+' km':null,m!=null?Math.round(m)+' Hm':null].filter(Boolean).join(' · ');
      void part;tab={n:prev.length,rows:[[T('Pace','Pace')+(isIv(l)?T(' Belastung',' work'):hilly(l)?T(' (höhenber.)',' (elev.-adj.)'):''),pv?pace(pv):'–',aG?pace(aG):'–'],
        [T('Puls','Heart rate'),l.hr||'–',aH?Math.round(aH):'–'],[T('Distanz','Distance'),fk(km)+' km',aK?fk(Math.round(aK*10)/10)+' km':'–'],
        ...(em!=null||aM!=null?[[T('Höhenmeter','Climbing'),em!=null?Math.round(em)+' m':'–',aM!=null?Math.round(aM)+' m':'–']]:[]),
        [T('Anstrengung','Effort'),l.rpe?l.rpe+'/10':'–',aR?fk(Math.round(aR*10)/10)+'/10':'–']]};
      cmp='';
      if(em!=null&&aM!=null&&Math.abs(em-aM)>=75)cmp+=T(` Heute ${em>aM?'deutlich mehr':'deutlich weniger'} Höhenmeter; die Pace ist darum höhenbereinigt verglichen.`,` Today ${em>aM?'much more':'much less'} climbing, so pace is compared elevation-adjusted.`);
      if(ef&&aE&&aH&&Math.abs(l.hr-aH)>8)cmp+=T(` Der Puls lag deutlich anders als sonst, darum ist die ${eN} nicht direkt vergleichbar.`,` Heart rate was quite different from usual, so ${eN.toLowerCase()} is not directly comparable.`);
      else if(ef&&aE){const d=(ef/aE-1)*100;
        if(d>=3){bo+=1;plus.push(T(`${eN} ${pctTxt(d)} gegenüber ${nm}: bei gleichem Puls schneller${eg==='thr'?' an der Schwelle':''}.`,`${eN} ${pctTxt(d)} versus ${nm}: faster at the same heart rate${eg==='thr'?' at threshold':''}.`))}
        else if(d<=-4){lo+=1;minus.push(T(`${eN} ${pctTxt(d)} gegenüber ${nm}. Häufige Gründe: Müdigkeit, Hitze, wenig Schlaf, beginnende Erkältung.`,`${eN} ${pctTxt(d)} versus ${nm}. Common reasons: fatigue, heat, little sleep, an oncoming cold.`))}
        else cmp+=T(` ${eN} im Rahmen (${pctTxt(d)}).`,` ${eN} within the usual range (${pctTxt(d)}).`)}
      // threshold and marathon pace: name the numbers of the last comparable block
      if((eg==='thr'||eg==='mp')&&ef){const q=[...prev].reverse().find(o=>effBlk(o.l));if(q)cmp+=T(` ${eg==='thr'?'Schwelle':'Marathontempo'} heute ${pace(l.pace)} bei Puls ${l.hr}, am ${fshort(q.date)} ${pace(q.l.pace)} bei Puls ${q.l.hr}.`,` ${eg==='thr'?'Threshold':'Marathon pace'} today ${pace(l.pace)} at HR ${l.hr}, on ${fshort(q.date)} ${pace(q.l.pace)} at HR ${q.l.hr}.`)}
      else if(pv&&aG&&l.rpe&&aR){const d=(aG/pv-1)*100;
        if(d>=3&&l.rpe<=aR+.5){bo+=.5;plus.push(T(`${pctTxt(d)} schneller als ${nm} bei gleicher Anstrengung.`,`${pctTxt(d)} faster than ${nm} at the same effort.`))}
        else if(d<=-4&&l.rpe>=aR-.5){lo+=.5;minus.push(T(`${pctTxt(-d).replace('+','')} langsamer als ${nm} bei gleicher Anstrengung.`,`${pctTxt(-d).replace('+','')} slower than ${nm} at the same effort.`))}}
      if(ty==='long'&&aK&&km>aK*1.15&&km>=18)plus.push(T(`Längster Lauf dieser Art seit Längerem (${fk(km)} km, sonst Ø ${fk(Math.round(aK*10)/10)} km).`,`Longest run of this kind in a while (${fk(km)} km, usually avg. ${fk(Math.round(aK*10)/10)} km).`));
      hist=prev.slice(-4).map(o=>{const r=fbFull(o.l,o.date);return r&&r.score}).filter(x=>x!=null);
    }else cmp=T(`Erste erfasste Einheit dieser Art («${lab}»). Ab der nächsten gibt es einen Vergleich.`,`First session of this kind («${lab}»). From the next one on, there is a comparison.`);
    // form trend: efficiency of similar runs, else of all continuous runs, over the last 8 weeks
    const series=g=>fbRuns().filter(o=>daysBetween(o.date,date)>=0&&daysBetween(o.date,date)<=56&&g(o)).map(o=>({x:daysBetween(o.date,date),y:effAny(o.l)})).filter(p=>p.y);
    const g0=effGroup(l);let pts=[],what='';
    if(g0==='thr'||g0==='mp'){pts=series(o=>effGroup(o.l)===g0);what=effName(g0)}
    else{pts=series(o=>(SIMG[ty]||[ty]).includes(logType(o.l))&&effGroup(o.l)==='base');what=T(`Effizienz bei «${lab}»`,`efficiency in «${lab}»`);
      if(pts.length<4){pts=series(o=>effGroup(o.l)==='base');what=T('Effizienz deiner lockeren und langen Läufe','efficiency of your easy and long runs')}}
    if(pts.length>=4){const mx=avg(pts.map(p=>p.x)),my=avg(pts.map(p=>p.y));let nu=0,de=0;pts.forEach(p=>{nu+=(p.x-mx)*(p.y-my);de+=(p.x-mx)**2});
      const span=Math.max(...pts.map(p=>p.x)),ch=de?(-nu/de)*span/my*100:0,w=Math.max(1,Math.round(span/7));
      trend=ch>=2?T(`Formverlauf ↗ steigend: ${what} ${pctTxt(ch)} in ${w} Wochen.`,`Form trend ↗ rising: ${what} ${pctTxt(ch)} in ${w} weeks.`)
        :ch<=-2?T(`Formverlauf ↘ fallend: ${what} ${pctTxt(ch)} in ${w} Wochen. Erholung prüfen.`,`Form trend ↘ falling: ${what} ${pctTxt(ch)} in ${w} weeks. Check your recovery.`)
        :T(`Formverlauf → stabil: ${what} ${pctTxt(ch)} in ${w} Wochen.`,`Form trend → stable: ${what} ${pctTxt(ch)} in ${w} weeks.`)}
    else trend=T('Formverlauf: Ab 4 Läufen mit Puls in den letzten 8 Wochen sichtbar.','Form trend: visible from 4 runs with heart rate in the last 8 weeks.');
  }
  // concrete tips also after good sessions: related to this run, the next sessions and the week
  if(!shallow&&tips.length<2){const ct=[],cap1=hrCap(ty,s,c);
    if(ty==='recovery'&&tp&&pv&&pv<tp[0])ct.push(l.hr&&cap0&&l.hr<=cap0?T(`Für einen Recovery Run warst du zügig (${pace(pv)}). Der Puls passte, trotzdem darf Recovery noch lockerer sein (${fmtPace(tp[0])}–${pace(tp[1])}): Ziel ist Erholung, nicht Training.`,`Brisk for a recovery run (${pace(pv)}). Heart rate was fine, but recovery may be even easier (${fmtPace(tp[0])}–${pace(tp[1])}): the goal is recovery, not training.`):T(`Für einen Recovery Run warst du zügig (${pace(pv)}). Recovery darf deutlich lockerer sein (${fmtPace(tp[0])}–${pace(tp[1])}): Ziel ist Erholung, nicht Training.`,`Brisk for a recovery run (${pace(pv)}). Recovery may be much easier (${fmtPace(tp[0])}–${pace(tp[1])}): the goal is recovery, not training.`));
    else if(easyT&&tp&&pv&&pv>=tp[0]*.97&&pv<tp[0]+(tp[1]-tp[0])*.25)ct.push(T(`Pace am schnellen Rand des Zielbereichs (${pace(pv)}). Ein paar Sekunden langsamer bringt für die Grundlage genauso viel und erholt besser.`,`Pace at the fast edge of the target range (${pace(pv)}). A few seconds slower builds your base just as well and recovers better.`));
    if(easyT&&l.hr&&cap1&&l.hr>=cap1-4&&l.hr<=cap1+3)ct.push(l.hr>cap1?T(`Ø Puls ${l.hr} knapp über dem Zielbereich (bis ${cap1}). Nächstes Mal etwas ruhiger starten; bei Wärme, Wind oder am Berg bewusst Tempo rausnehmen.`,`Avg. heart rate ${l.hr} just above the target range (up to ${cap1}). Start a bit calmer next time; in heat, wind or on hills, deliberately slow down.`):T(`Ø Puls ${l.hr} nahe am oberen Rand des Zielbereichs (${cap1}). Bei Wärme, Wind oder am Berg bewusst Tempo rausnehmen.`,`Avg. heart rate ${l.hr} close to the top of the target range (${cap1}). In heat, wind or on hills, deliberately slow down.`));
    if(ty==='long'&&logDur(l)>=75){if(l.dec==null)ct.push(T('Lade bei langen Läufen auch die Kilometer-Splits mit Puls hoch: Dann zeigt das Decoupling, ob deine Grundlage bis zum Schluss trägt.','For long runs also upload the kilometre splits with heart rate: decoupling then shows whether your base holds to the end.'));
      if(logDur(l)>=85)ct.push(T('Ab etwa 75–90 min unterwegs trinken und 30–60 g Kohlenhydrate pro Stunde zuführen; im Training üben, was du im Rennen nimmst.','From about 75–90 min drink on the way and take 30–60 g of carbohydrates per hour; practise in training what you will use in the race.'))}
    if(false){for(let i=1;i<=2;i++){const d2=addD(date,i);if(S.logs[d2])break;const x=planSession(d2);if(!x||x.type==='rest')continue;
      if(x.quality||x.type==='long'||x.type==='race'||x.type==='test'){ct.push(i===1?T(`Morgen: ${x.title}. Heute gut essen, trinken und früh schlafen.`,`Tomorrow: ${x.title}. Eat and drink well today and get to bed early.`):T(`Übermorgen: ${x.title}. Morgen frei oder ganz locker, damit du frisch bist.`,`The day after tomorrow: ${x.title}. Tomorrow rest or keep it very easy so you are fresh.`))}break}}
    if(false){const wm=monday(date),w=planWeek(wm);if(w&&w.km&&wm===monday(today())){const dk=Math.round(weekDoneKm(wm)),pk=Math.round(w.km);
      if(dk<pk*.95)ct.push(T(`Diese Woche ${dk} von ${pk} km. Die restlichen Einheiten bringen dich ans Wochenziel; Verpasstes nicht nachholen.`,`This week ${dk} of ${pk} km. The remaining sessions get you to the weekly target; do not make up missed ones.`));
      else ct.push(T(`Wochenumfang erreicht (${dk} von ${pk} km). Mehr ist diese Woche nicht nötig.`,`Weekly volume reached (${dk} of ${pk} km). No more is needed this week.`))}}
    for(const x of ct){if(tips.length>=2)break;tips.push(x)}}
  {const v=l.impSum&&l.impSum.iv;if(v&&v.reps&&v.reps.length>=3&&IVT.has(ty)){const P=v.reps.map(r=>r.p).filter(Boolean);
    if(P.length>=3){const f=P[0],la=P[P.length-1],mx=Math.max(...P),mn=Math.min(...P);
      pos+=1;if(la<f-2){ea+=1;plus.push(T(`Wiederholungen schneller werdend (${pace(f)} → ${pace(la)}): gut eingeteilt.`,`Repetitions getting faster (${pace(f)} → ${pace(la)}): well paced.`))}
      else if(la>f*1.04){lo+=.5;minus.push(T(`Tempo in den Wiederholungen nachgelassen (${pace(f)} → ${pace(la)}): beim nächsten Mal die erste etwas ruhiger angehen.`,`Pace faded over the repetitions (${pace(f)} → ${pace(la)}): start the first one a little calmer next time.`))}
      else if(mx-mn<=mn*.03){ea+=1;plus.push(T(`Sehr gleichmässige Wiederholungen (${pace(mn)}–${pace(mx)}).`,`Very even repetitions (${pace(mn)}–${pace(mx)}).`))}else ea+=.5}
    if(v.rec&&v.rec.hr&&v.hr&&ty!=='hills'&&v.rec.hr>v.hr-10)tips.push(T(`Puls in den Trabpausen (${v.rec.hr}) bleibt hoch: Pausen locker traben, nicht zu schnell.`,`Heart rate in the recoveries (${v.rec.hr}) stays high: jog the recoveries easily, not too fast.`));
}}
  // ---- score 1–10 in three groups: Umsetzung (plan executed: avg HR in range, max HR under the cap, pace, reps, volume),
  //      Qualität (decoupling, even reps, climbing, effort), Fortschritt (efficiency vs your similar sessions, level vs best times).
  //      Each factor 1–10; factors without data drop out; with little data the score stays closer to the middle ----
  const F=[],add=(k,g,v,w)=>{if(v!=null&&isFinite(v))F.push({k,g,v:clamp(v,1,10),w})};
  const lin=(x,P)=>{if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const[x0,y0]=P[i-1],[x1,y1]=P[i];return y0+(y1-y0)*(x-x0)/(x1-x0)}return P[P.length-1][1]};
  const hm=c.hm,rs=hrRest(c.p),ivS=l.impSum&&l.impSum.iv,hillT=ty==='hills'||ty==='fartlek',hrr=h=>(h-rs)/(hm-rs);
  const spd=o=>{const v=o.impSum&&o.impSum.iv;return logType(o)==='hills'&&v&&v.gap?v.gap:isIv(o)||isBlk(o)&&blkData(o)?o.pace:gapOf(o)};
  const zk={easy:'Z2',long:'Z2',recovery:'Z1',tempo:'Z4',cruise:'Z4',vo2:'Z5',mpace:'Z3'}[ty];
  const hz=s.hr&&s.type!=='free'?s.hr:zk?c.zones[zk].hr:ty==='rp'?MPB(c.d).hr.map(x=>Math.round(x*hm)):null,mcap=hrMaxCap(ty,s,c);
  // U1) average heart rate in the target range of the session
  let hrOk=null;
  if(l.hr){let v=null;
    if(hillT)v=lin(hrr(l.hr),[[.6,2],[.72,5],[.8,8],[.86,10]]);   // hills/fartlek: did the work reach the hard zone?
    else if(hz){const o=l.hr-hz[1];v=o<=(easyT?0:3)?(easyT||l.hr>=hz[0]-10?10:8):lin(o,[[3,10],[6,7],[10,4],[15,1]]);if(easyT&&o>0)v=lin(o,[[0,10],[3,8],[6,5],[10,2],[14,1]])}
    hrOk=v;add('ha','u',v,2.5)}
  // U2) maximum heart rate under the cap (easy, long, tempo, threshold, race pace)
  if(l.hrMax&&mcap){const o=l.hrMax-mcap;add('hx','u',o<=0?10:lin(o,[[0,10],[3,8],[6,5.5],[10,3],[15,1]]),1.5);
    if(!easyT&&o>2)minus.push(T(`Max. Puls ${l.hrMax} über dem Pulsdeckel ${mcap}: Das Tempo war phasenweise zu hoch für ${LABA[ty]||'diese Einheit'}.`,`Max heart rate ${l.hrMax} above the cap ${mcap}: the pace was too high at times for this session.`))}
  // U3) pace in the target range (easy runs: only when heart rate is missing or also too high, since heart rate decides there)
  if(tp&&pv&&!hillT){const[f,sl]=tp;let v;
    if(easyT)v=hrOk!=null&&hrOk>=8?null:pv>=f*.97?10:lin((f-pv)/f*100,[[3,10],[6,7],[10,4],[15,1]]);
    else{const d=pv<f?(f-pv)/f*100:pv>sl?(pv-sl)/sl*100:0;v=pv<f?lin(d,[[0,10],[2,9],[5,6],[10,3],[15,1]]):lin(d,[[0,10],[2,8],[4,5],[7,2],[9,1]])}
    add('pa','u',v,easyT?1:2.5)}
  // U4) repetitions as planned
  {const mm=s.structure&&s.structure.join(' ').match(/(\d+)\s*[×x]\s*\d/),pr=IVT.has(ty)&&s.type!=='free'?(s.reps||(mm?+mm[1]:0)):0;
    if(pr&&l.reps)add('rc','u',l.reps>=pr?10:lin(l.reps/pr,[[.5,1],[.75,5],[.9,8],[1,10]]),1.5)}
  // U5) volume: ±1 km or ±10 % is fine and barely moves the score
  if(s.km&&s.type!=='free'&&s.type!=='race'){const dv=km-s.km,rel=Math.abs(dv)/s.km;
    add('vo','u',Math.abs(dv)<=Math.max(1,s.km*.1)?10:dv<0?lin(rel,[[.1,10],[.2,8],[.35,5],[.5,2]]):easyT?lin(rel,[[.1,10],[.25,8],[.5,5]]):lin(rel,[[.1,10],[.4,8]]),.75)}
  // Q1) decoupling on long and race-pace runs
  if(l.dec!=null&&(ty==='long'||ty==='mptest'||ty==='mpace'))add('dc','q',lin(l.dec,[[3,10],[5,8],[8,4.5],[12,1]]),2);
  // Q2) even repetitions (last vs first)
  {const P=ivS&&ivS.reps?ivS.reps.map(r=>r.p).filter(Boolean):[];
    if(IVT.has(ty)&&ty!=='hills'&&P.length>=3){const fd=(P[P.length-1]-P[0])/P[0]*100;add('ev','q',lin(fd,[[-1,10],[1,9],[3,6.5],[5,4],[8,1]]),2)}}
  // Q3) climbing on hill reps: per work km from the laps, else grade from grade-adjusted pace, else climbing of the whole run
  if(ty==='hills'){const wkm=ivS&&ivS.reps&&ivS.reps.length&&ivS.reps.every(r=>r.d)?ivS.reps.reduce((x,r)=>x+r.d,0):null,tg=l.gain!=null?l.gain:l.impSum&&l.impSum.gain!=null?l.impSum.gain:l.elev!=null?ELEV[l.elev].m:null;
    let h=null,txt='';
    if(ivS&&ivS.gain!=null&&wkm){const g=ivS.gain/wkm;h=lin(g,[[10,2],[25,5],[40,8],[60,10]]);txt=T(`${ivS.gain} Höhenmeter in den Belastungen (≈ ${Math.round(g/10)} % Steigung)`,`${ivS.gain} m of climbing in the reps (≈ ${Math.round(g/10)} % grade)`)}
    else if(ivS&&ivS.gap&&ivS.pace){const dp=(ivS.pace-ivS.gap)/ivS.pace*100;h=lin(dp,[[2,2],[5,5],[9,8],[12,10]]);txt=T(`Bergauf ${pace(ivS.pace)}, an Steigung angepasst ${pace(ivS.gap)} (≈ ${Math.round(dp/2)} % Steigung)`,`Uphill ${pace(ivS.pace)}, grade-adjusted ${pace(ivS.gap)} (≈ ${Math.round(dp/2)} % grade)`)}
    else if(tg!=null&&km){const g=tg/km;h=lin(g,[[5,2],[12,5],[20,8],[30,10]]);txt=T(`${Math.round(tg)} Höhenmeter im ganzen Lauf (${Math.round(g)} m/km)`,`${Math.round(tg)} m of climbing in the whole run (${Math.round(g)} m/km)`)}
    if(h!=null){add('hm','q',h,2);(h<5?minus:plus).push(h<5?T(`Wenig Steigung für Bergintervalle: ${txt}. Für den Kraftreiz eine Steigung von 5–8 % suchen.`,`Little climbing for hill reps: ${txt}. For the strength stimulus look for a 5–8 % grade.`):txt+'.')}
    else tips.push(T('Für die Bewertung der Höhenmeter: in Garmin die Runden-Tabelle bis zur Spalte «Anstieg» schieben oder den Screenshot «Statistiken» mit Anstieg hochladen.','To rate the climbing: scroll the Garmin lap table to the «Ascent» column or upload the «Stats» screenshot with ascent.'))}
  // Q4) perceived effort for this kind of session
  if(l.rpe)add('rp','q',l.rpe>E[1]?lin(l.rpe-E[1],[[0,10],[1,7],[2,4],[3,1]]):l.rpe<E[0]&&qual?lin(E[0]-l.rpe,[[0,10],[2,8],[4,6]]):10,1);
  // F1) efficiency (speed per heart-rate reserve) against your similar sessions; without heart rate: pace at the same effort
  {const prev=similarRuns(date,l,ty).filter(o=>spd(o.l));
    if(prev.length){const sp=spd(l),ef=o=>{const x=spd(o);return x&&o.hr&&o.hr>rs+5?(3600/x)/hrr(o.hr):null};
      const e0=ef(l),eP=prev.map(o=>ef(o.l)).filter(Boolean);
      if(e0&&eP.length){const d=(e0/avg(eP)-1)*100;add('pr','f',lin(d,[[-9,1],[-6,3],[-3,5],[0,7],[2,8.5],[4,10]]),3)}
      else if(sp&&l.rpe){const R=prev.filter(o=>o.l.rpe);if(R.length){const d=(avg(R.map(o=>spd(o.l)))/sp-1)*100-(l.rpe-avg(R.map(o=>o.l.rpe)))*2;add('pr','f',lin(d,[[-9,1],[-6,3],[-3,5],[0,7],[2,8.5],[4,10]]),2)}}}}
  // F2) level: session VDOT from pace and heart rate (VO2 reserve ≈ heart-rate reserve) against your VDOT from best times and tests
  {const sp=spd(l),rep=ivS&&ivS.n?ivS.wt/ivS.n:null;
    // only for sustained efforts (heart rate settles; easy runs and short reps would bias the estimate)
    if(sp&&l.hr&&c.vd&&hrr(l.hr)>=.7&&hrr(l.hr)<=1&&(isIv(l)?rep!=null&&rep>=240&&ty!=='hills':!easyT||ty==='long')&&ty!=='race'){const vs=3.5+(vo2(60000/sp)-3.5)/hrr(l.hr),r=vs/c.vd;
      add('lv','f',lin(r,[[.85,1],[.9,3],[.95,5.5],[1,7.5],[1.05,10]]),1.5);
      if(r<.92)minus.push(T(`Für dein Niveau (VDOT ${fk(Math.round(c.vd*10)/10)}) war die Pace bei diesem Puls tief. Häufige Gründe: Müdigkeit, Hitze, Wind, Untergrund.`,`For your level (VDOT ${fk(Math.round(c.vd*10)/10)}) the pace was low for this heart rate. Common reasons: fatigue, heat, wind, terrain.`));
      else if(r>=1.03)plus.push(T(`Pace bei diesem Puls über deinem Niveau aus den Bestzeiten (VDOT ${fk(Math.round(c.vd*10)/10)}): Die Form ist besser als die Bestzeiten zeigen.`,`Pace for this heart rate above your level from best times (VDOT ${fk(Math.round(c.vd*10)/10)}): your form is better than your best times show.`))}}
  // groups: Umsetzung 40 %, Qualität 25 %, Fortschritt 35 %; a missing group is left out
  const GW={u:.4,q:.25,f:.35},G={};
  for(const g of['u','q','f']){const fs=F.filter(f=>f.g===g),w=fs.reduce((x,f)=>x+f.w,0);if(w)G[g]={v:fs.reduce((x,f)=>x+f.v*f.w,0)/w,w}}
  const W=F.reduce((x,f)=>x+f.w,0),gw=Object.keys(G).reduce((x,g)=>x+GW[g],0),raw=gw?Object.keys(G).reduce((x,g)=>x+G[g].v*GW[g],0)/gw:sc,conf=Math.min(1,W/5);
  const score=clamp(Math.min(minus.length?9:10,Math.round(5.5+(raw-5.5)*conf)),1,10);
  const parts=F.map(f=>({k:f.k,g:f.g,v:Math.round(f.v)})),groups=['u','q','f'].filter(g=>G[g]).map(g=>({k:g,v:Math.round(G[g].v)}));
  return{score,parts,groups,coach:shallow?null:coachSay(l,date,ty,c,spd,similarRuns(date,l,ty)),verdict:verdictOf(score,minus,plus,s.type==='free',diffT,parts,W),ty,plus,minus,tips:tips.slice(0,isIv(l)&&(!l.pace||!l.hr)?3:2),cmp:cmp?cmp.trim():null,tab,trend,hist};
}
// coach voice: what the session was for, how it compares with the last similar one, what it means for the goal, what comes next.
// Deterministic variants (by date) so the wording does not repeat run after run.
const CNOUN={easy:[['dein','lockerer Lauf'],'easy run'],long:[['dein','langer Lauf'],'long run'],recovery:[['dein','Regenerationslauf'],'recovery run'],tempo:[['dein','Tempodauerlauf'],'tempo run'],mpace:[['dein','Marathontempo-Lauf'],'marathon-pace run'],cruise:[['deine','Schwelleneinheit'],'threshold session'],vo2:[['deine','VO₂max-Einheit'],'VO₂max session'],rp:[['deine','Renntempo-Einheit'],'race-pace session'],fartlek:[['dein','Fahrtspiel'],'fartlek'],hills:[['deine','Bergeinheit'],'hill session']};
const CPURP={easy:[['Lockere Kilometer bauen Kapillaren, Mitochondrien und belastbare Sehnen auf.','Easy kilometres build capillaries, mitochondria and resilient tendons.'],['Genau diese ruhigen Läufe machen später das Tempo bezahlbar.','Exactly these calm runs make speed affordable later.']],
  long:[['Der lange Lauf trainiert Fettstoffwechsel und Ermüdungsresistenz: das Fundament für die zweite Rennhälfte.','The long run trains fat metabolism and fatigue resistance: the foundation for the second half of a race.']],
  recovery:[['Ziel war Durchblutung und Erholung, nicht Training.','The goal was blood flow and recovery, not training.']],
  tempo:[['Schwellenarbeit verschiebt den Punkt, ab dem sich Laktat anhäuft: der grösste Hebel von 10 km bis Marathon.','Threshold work shifts the point where lactate builds up: the biggest lever from 10 km to marathon.']],
  cruise:[['Schwellenarbeit verschiebt den Punkt, ab dem sich Laktat anhäuft: der grösste Hebel von 10 km bis Marathon.','Threshold work shifts the point where lactate builds up: the biggest lever from 10 km to marathon.']],
  vo2:[['VO₂max-Intervalle heben die maximale Sauerstoffaufnahme, die Obergrenze deines Motors.','VO₂max intervals raise maximal oxygen uptake, the ceiling of your engine.']],
  rp:[['Renntempo-Einheiten gewöhnen Körper und Kopf an das Zieltempo.','Race-pace sessions get body and mind used to goal pace.']],
  mpace:[['Marathontempo-Blöcke machen das Zieltempo ökonomisch.','Marathon-pace blocks make goal pace economical.']],
  fartlek:[['Das Fahrtspiel setzt Tempo-Reize ohne Druck und hält die Beine spritzig.','Fartlek adds speed without pressure and keeps the legs lively.']],
  hills:[['Bergläufe sind Krafttraining im Laufschritt: stärkerer Abdruck, robustere Waden und Sehnen.','Hill reps are strength training in running form: stronger push-off, sturdier calves and tendons.']]};
const ordDE=n=>n+'.',ordEN=n=>n+(n%100>10&&n%100<14?'th':['th','st','nd','rd'][n%10]||'th');
function coachSay(l,date,ty,c,spd,prev){const out=[],t=today(),hv=[...date].reduce((a,ch)=>a+ch.charCodeAt(0),0),pick=a=>a[hv%a.length];
  const N=CNOUN[ty];if(!N)return null;
  // 1) where it stands in the current phase, and what it is for
  const w=planWeek(monday(date));let n=0;if(w){let m=monday(date);const same=x=>x&&x.phase===w.phase&&(x.genMode||'')===(w.genMode||'');const ws=[];while(same(planWeek(m))&&ws.length<20){ws.push(m);m=addD(m,-7)}
    n=fbRuns().filter(o=>o.date<=date&&ws.includes(monday(o.date))&&logType(o.l)===ty).length}
  const ph=w?phaseLabel(w):'',pu=pick(CPURP[ty]||[['','']]);
  if(n>=2)out.push(T(`Das war ${N[0][0]} ${ordDE(n)} ${N[0][1]} in der Phase «${ph}».`,`That was your ${ordEN(n)} ${N[1]} in the «${ph}» phase.`)+(n%3===0||ty==='long'&&n<=2?' '+T(...pu):''));
  else out.push((w?T(`Erste Einheit dieser Art in der Phase «${ph}».`,`First session of this kind in the «${ph}» phase.`)+' ':'')+T(...pu));
  // 2) against the last similar session: pace and heart rate together
  const sp=spd(l),P=prev.filter(o=>spd(o.l)),L3=P.slice(-3),last=L3.length?L3:null;
  if(sp&&last){// calm reference: average of the last up to 3 similar sessions, so one bad day does not set the bar
    const s0=avg(L3.map(o=>spd(o.l))),HR=L3.map(o=>o.l.hr).filter(Boolean),dp=Math.round(s0-sp),h0=HR.length?Math.round(avg(HR)):null,h1=l.hr,dh=h0&&h1?h1-h0:null,p0=pace(s0),p1=pace(sp),n3=L3.length,ref=n3===1?T(`am ${fshort(L3[0].date)}`,`on ${fshort(L3[0].date)}`):T(`im Schnitt deiner letzten ${n3}`,`your last ${n3} on average`);
    let x;
    if(dh!=null&&Math.abs(dp)<=3&&dh<=-3)x=T(`Gleiche Pace wie ${ref} (${p1}), aber ${-dh} Schläge tiefer: Deine Form steigt.`,`Same pace as ${ref} (${p1}) but ${-dh} beats lower: your fitness is rising.`);
    else if(dh!=null&&dp>=3&&dh<=1)x=T(`${dp} s/km schneller als ${ref} (${p1} statt ${p0}) bei ${dh<=-2?'tieferem':'gleichem'} Puls: klarer Fortschritt.`,`${dp} s/km faster than ${ref} (${p1} instead of ${p0}) at ${dh<=-2?'lower':'the same'} heart rate: clear progress.`);
    else if(dh!=null&&dp>=3)x=T(`Schneller als ${ref} (${p1} statt ${p0}), aber auch ${dh} Schläge höher: eher mehr Einsatz als mehr Form.`,`Faster than ${ref} (${p1} instead of ${p0}) but also ${dh} beats higher: more effort rather than more fitness.`);
    else if(dh!=null&&dp<=-3&&dh>=2)x=T(`Zäher als ${ref}: ${-dp} s/km langsamer bei ${dh} Schlägen mehr. Ein Tag sagt wenig; Schlaf, Hitze und Müdigkeit spielen mit.`,`Tougher than ${ref}: ${-dp} s/km slower with ${dh} more beats. One day says little; sleep, heat and fatigue play a part.`);
    else if(dh!=null&&dp<=-3)x=T(`Ruhiger als ${ref} (${p1} statt ${p0}, Puls ${dh<=0?dh:'+'+dh}).${['easy','recovery','long'].includes(ty)?' Für lockere Läufe genau richtig.':''}`,`Calmer than ${ref} (${p1} instead of ${p0}, heart rate ${dh<=0?dh:'+'+dh}).${['easy','recovery','long'].includes(ty)?' Exactly right for easy runs.':''}`);
    else if(dh!=null)x=T(`Fast wie ${ref} (${p0} → ${p1}, Puls ${h0} → ${h1}): stabil.`,`Almost the same as ${ref} (${p0} → ${p1}, heart rate ${h0} → ${h1}): steady.`);
    else x=dp>=3?T(`${dp} s/km schneller als ${ref}. Mit Puls könnte ich sagen, ob das Form oder Einsatz war.`,`${dp} s/km faster than ${ref}. With heart rate I could tell whether that was fitness or effort.`):dp<=-3?T(`${-dp} s/km langsamer als ${ref}. Mit Puls könnte ich sagen, ob das Absicht oder Müdigkeit war.`,`${-dp} s/km slower than ${ref}. With heart rate I could tell whether that was intent or fatigue.`):T(`Gleiches Tempo wie ${ref} (${p1}).`,`Same pace as ${ref} (${p1}).`);
    out.push(x)}
  else if(sp)out.push(T('Noch keine vergleichbare Einheit erfasst: Diese wird zur Messlatte für die nächsten.','No comparable session logged yet: this one becomes the benchmark for the next ones.'));
  // 3) what it means for the goal (quality and long runs; easy runs: the week)
  const m=mainRace(S),hard=!['easy','recovery'].includes(ty);
  const firstHard=!fbRuns().some(o=>o.l!==l&&monday(o.date)===monday(date)&&(o.date<date||o.date===date&&(o.l.at||0)<(l.at||0))&&!['easy','recovery',null,undefined].includes(logType(o.l))&&!isAlt(o.l));
  if(hard&&firstHard&&m&&m.date>t&&showPred(m.dist)){const pr=predict(c.vd,m.dist),wk=Math.max(1,Math.ceil(daysBetween(date,m.date)/7)),dn=m.dist>40?'Marathon':m.dist>20?T('Halbmarathon','half marathon'):fk(m.dist)+' km';
    if(m.goal){const q=pr/m.goal;out.push(q<=1?T(`Für dein ${dn}-Ziel ${fmtTime(m.goal)} heisst das: Du bist auf Kurs (Prognose ${fmtTime(pr)}), noch ${wk} Wochen.`,`For your ${dn} goal of ${fmtTime(m.goal)}: you are on track (prediction ${fmtTime(pr)}), ${wk} weeks to go.`)
      :q<=1.03?pick([T(`Für dein ${dn}-Ziel ${fmtTime(m.goal)} heisst das: knapp dran (Prognose ${fmtTime(pr)}). Genau solche Einheiten holen die letzten Sekunden.`,`For your ${dn} goal of ${fmtTime(m.goal)}: close (prediction ${fmtTime(pr)}). Sessions like this one win the last seconds.`),T(`Stand zum Ziel: Prognose ${fmtTime(pr)}, Ziel ${fmtTime(m.goal)}, noch ${wk} Wochen. Die Lücke ist klein genug für einen sauberen Block.`,`Goal check: prediction ${fmtTime(pr)}, goal ${fmtTime(m.goal)}, ${wk} weeks left. The gap is small enough for one clean block.`),T(`Noch ${Math.round(pr-m.goal)} s bis zu deinem Ziel ${fmtTime(m.goal)}, ${wk} Wochen Zeit. Das ist realistisch, wenn die Woche so weitergeht.`,`${Math.round(pr-m.goal)} s to your goal of ${fmtTime(m.goal)}, ${wk} weeks to go. Realistic if the week continues like this.`)])
      :T(`Für dein ${dn}-Ziel ${fmtTime(m.goal)} fehlt noch etwas (Prognose ${fmtTime(pr)}). Form wächst in Blöcken, nicht von Einheit zu Einheit: dranbleiben.`,`Your ${dn} goal of ${fmtTime(m.goal)} is still a step away (prediction ${fmtTime(pr)}). Fitness grows in blocks, not session by session: keep going.`))}
    else out.push(T(`Noch ${wk} Wochen bis zum ${m.name||dn}; aktuelle Prognose ${fmtTime(pr)}.`,`${wk} weeks to ${m.name||dn}; current prediction ${fmtTime(pr)}.`))}
  else if(!hard&&date>=addD(t,-1)){const wm=monday(date),pw=planWeek(wm);if(pw&&pw.km&&wm===monday(t)){const dk=Math.round(weekDoneKm(wm)),pk=Math.round(pw.km);out.push(dk>=pk*.95?T(`Wochenziel erreicht: ${dk} von ${pk} km.`,`Weekly target reached: ${dk} of ${pk} km.`):T(`Diese Woche ${dk} von ${pk} km.`,`This week ${dk} of ${pk} km.`))}}
  // 4) what comes next (only for recent sessions)
  if(date>=addD(t,-1))for(let i=1;i<=3;i++){const d2=addD(date,i);if(d2<t||S.logs[d2])continue;const x=planSession(d2);if(!x||x.type==='rest'||x.optional)continue;
    const when=i===1?T('Morgen','Tomorrow'):i===2?T('Übermorgen','The day after tomorrow'):T(DOWL[(pd(d2).getDay()+6)%7],DOWE[(pd(d2).getDay()+6)%7]);
    const xh=x.quality||x.type==='long'||x.type==='race'||x.type==='test';
    out.push(hard&&!xh?T(`${when}: ${x.title}${x.km?' '+fk(x.km)+' km':''}. Die Beine dürfen heute schwer sein.`,`${when}: ${x.title}${x.km?' '+fk(x.km)+' km':''}. Your legs are allowed to feel heavy today.`):xh?T(`${when}: ${x.title}. Bis dahin locker bleiben, gut essen und schlafen.`,`${when}: ${x.title}. Stay easy until then, eat and sleep well.`):T(`${when}: ${x.title}${x.km?' '+fk(x.km)+' km':''}.`,`${when}: ${x.title}${x.km?' '+fk(x.km)+' km':''}.`));break}
  return out}
// one clear sentence first: what was good, what was the main issue
const VK=[[/^(Max\. Puls|Max heart rate)/,T('Max. Puls über dem Deckel','max HR above the cap')],[/^(Ø Puls|Avg\. heart rate)/,T('Ø Puls zu hoch','avg. HR too high')],[/^(Zu schnell|Too fast)/,T('zu schnell','too fast')],[/^(Deutlich kürzer|Etwas kürzer|Much shorter|A bit shorter)/,T('kürzer als geplant','shorter than planned')],[/^(Deutlich länger|Much longer)/,T('zu lang','too long')],[/^(Langsamer|Slower)/,T('langsamer als die Vorgabe','slower than the target')],[/^\d+ (statt|instead)/,T('andere Anzahl Wiederholungen','different number of repetitions')],[/^(Puls|Heart rate)/,T('Puls zu hoch','heart rate too high')],[/^(Anstrengung|Effort)/,T('härter als vorgesehen','harder than intended')],[/^Decoupling/,T('Puls stieg hinten raus','heart rate drifted late')],[/^(Effizienz|Efficiency)/,T('Effizienz tiefer als sonst','efficiency lower than usual')],[/(langsamer als|slower than)/,T('langsamer als sonst','slower than usual')],[/^(Wenig Steigung|Little climbing)/,T('wenig Steigung','little climbing')],[/^(Für dein Niveau|For your level)/,T('unter deinem Niveau','below your level')]];
const PARTL={u:['Umsetzung','Execution'],q:['Qualität','Quality'],f:['Fortschritt','Progress'],ha:['Ø Puls','Avg. HR'],hx:['Max. Puls','Max HR'],pa:['Pace','Pace'],rc:['Wiederholungen','Reps'],vo:['Umfang','Volume'],dc:['Decoupling','Decoupling'],ev:['Gleichmässigkeit','Evenness'],hm:['Höhenmeter','Climbing'],rp:['Anstrengung','Effort'],pr:['Effizienz','Efficiency'],lv:['Niveau','Level']};
const partLbl=k=>T(...PARTL[k]);
const PARTW={ha:['Ø Puls nicht im Zielbereich','avg. HR off target'],hx:['Max. Puls über dem Deckel','max HR above the cap'],pa:['Pace nicht im Ziel','pace off target'],rc:['weniger Wiederholungen','fewer repetitions'],pr:['weniger effizient als sonst','less efficient than usual'],lv:['unter deinem Niveau','below your level'],vo:['Umfang abweichend','volume off'],rp:['härter als vorgesehen','harder than intended'],dc:['Puls stieg hinten raus','heart rate drifted late'],ev:['Wiederholungen ungleichmässig','uneven repetitions'],hm:['wenig Steigung','little climbing']};
function verdictOf(sc,minus,plus,extra,other,parts,W){const k=[];minus.forEach(m=>{const v=VK.find(([r])=>r.test(m));if(v&&!k.includes(v[1]))k.push(v[1])});
  const low=(parts||[]).filter(p=>p.v<=5).sort((a,b)=>a.v-b.v).map(p=>T(...PARTW[p.k]));
  const ks=(k.length?k:low).slice(0,2).join(T(' und ',' and ')),pr=(parts||[]).find(p=>p.k==='pr');
  if(W!=null&&W<3)return T('Erfasst. Mit Pace, Puls und Anstrengung wird die Bewertung genauer.','Logged. With pace, heart rate and effort the rating gets more precise.');
  if(sc>=9&&ks)return T(`Starke Einheit, kleiner Punkt: ${ks}.`,`Strong session, one small point: ${ks}.`);
  if(sc>=9)return pr&&pr.v>=8?T('Top-Einheit: besser als deine bisherigen vergleichbaren.','Top session: better than your previous similar ones.'):T('Starke Einheit, genau so war sie gedacht.','Strong session, exactly as intended.');
  if(other&&!ks&&sc>=6)return T('Gute Einheit, aber eine andere Art als geplant.','Good session, but a different kind than planned.');
  if(sc>=7)return ks?T(`Gute Einheit, aber ${ks}.`,`Good session, but ${ks}.`):extra?T('Gutes Zusatztraining.','Good extra session.'):T('Gute Einheit, wie geplant.','Good session, as planned.');
  if(sc>=5)return ks?T(`Solide, aber ${ks}.`,`Solid, but ${ks}.`):T('Solide Einheit.','Solid session.');
  if(sc>=3)return ks?T(`Schwacher Tag: ${ks}.`,`Weak day: ${ks}.`):T('Schwacher Tag. Erholung, Schlaf und Essen prüfen.','Weak day. Check recovery, sleep and food.');
  return T(`Deutlich daneben${ks?': '+ks:''}. Ein Tag zum Abhaken, die nächsten Tage locker.`,`Well off${ks?': '+ks:''}. Tick it off and keep the next days easy.`)}
