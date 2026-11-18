/* ---- log analysis ---- */
const logKm=l=>l.km!=null?l.km:(l.s&&l.s.km)||0;
// total training time in seconds: entered/imported value, else derived from pace for continuous runs
function logSec(l){if(!l||!l.done)return null;if(l.sec)return l.sec;if(l.impSum&&l.impSum.mov)return l.impSum.mov;if(l.dur)return l.dur*60;
  if(l.pace&&logKm(l)&&!isIv(l))return Math.round(l.pace*logKm(l));return null}
const logWork=l=>l&&l.done?(l.wsec||(l.impSum&&l.impSum.iv&&l.impSum.iv.wt)||null):null;
const logDur=l=>{const s=logSec(l);return s?s/60:(l.pace?l.pace*logKm(l)/60:logKm(l)*6)};
function parseDur(str){str=String(str||'').trim().replace(/[.,]/g,':');if(!str)return null;const p=str.split(':').map(Number);if(p.some(x=>!isFinite(x)||x<0))return NaN;
  if(p.length===1)return p[0]*60;if(p.length===2)return p[1]<60?p[0]*60+p[1]:NaN;if(p.length===3)return p[1]<60&&p[2]<60?p[0]*3600+p[1]*60+p[2]:NaN;return NaN}
// climbing: exact value from screenshot/file if available, else the class midpoint (class «0–50» counts as flat)
const gainOf=l=>{if(l.interval)return null;if(l.gain!=null)return l.gain;const ig=l.impSum&&l.impSum.gain;if(ig!=null&&(l.elev==null||elevIdx(ig)===l.elev))return ig;if(l.elev==null)return null;return l.elev===0?0:ELEV[l.elev].m};
// pace is only corrected on noticeably hilly runs: only the climbing above 1 % of the distance counts, and only half of it, because descents give part back
const hilly=l=>!l.interval&&(gainOf(l)||0)>logKm(l)*10;
function gapOf(l){const km=logKm(l);if(!l.pace||!km)return l.pace||null;return hilly(l)?l.pace*km/(km+(gainOf(l)-km*10)*.004):l.pace}
function analyze(l){
  const s=l.s,out={strain:0,msgs:[],implied:null,verdict:'Wie geplant',tone:'hold'};
  if(!l.done){out.verdict='Nicht durchgeführt';return out}
  const ty=logType(l),planTy=rtOfPlan(s.type),same=!l.type||ty===planTy||s.type==='free',qual=IVT.has(ty)||['tempo','mpace','race'].includes(ty);
  const E=RPE[ty]||[3,6],mid=(E[0]+E[1])/2;let strain=(l.rpe-mid)/2;
  if(!same&&s.type!=='alt')out.msgs.push(`Gelaufen als ${RTL[ty]} statt wie geplant «${s.title}».`);
  const gap=gapOf(l);
  if(!l.interval&&l.elev!=null&&ELEV[l.elev].m>=150&&gap)out.msgs.push(`Mit ${ELEV[l.elev].l} Höhenmetern entspricht deine Pace etwa ${pace(gap)} im Flachen.`);
  if(l.interval&&l.reps)out.msgs.push(`${l.reps} Belastungen ausgewertet. Pace und Puls gelten nur für die Belastungsphasen, die Trabpausen sind herausgerechnet.`);
  if(gap&&s.pace&&same){
    const[f,sl]=s.pace;
    if(!qual&&gap<f*.97&&!noRef())out.msgs.push('Schneller als die Vorgabe. Lockere Läufe wirken nur, wenn sie wirklich locker sind.');
    if(qual&&gap<f*.98)out.msgs.push(l.rpe<=E[1]?T('Schneller als die Vorgabe. Die Einheit ist kontrolliert gemeint; fällt dir das Tempo wiederholt leicht, passt die nächste Auswertung deine Vorgaben an.','Faster than the target. The session is meant to be controlled; if the pace keeps feeling easy, the next review raises your targets.'):'Schneller als die Vorgabe, aber sehr anstrengend. Beim nächsten Mal das Zieltempo halten.');
    if(qual&&gap>sl*1.03)out.msgs.push('Langsamer als die Vorgabe.');
    if(s.pct&&l.rpe<=E[1]+.5)out.implied=vo2(60000/gap)/s.pct;
  }
  if(l.hr&&s.hr&&same){
    if(l.hr>s.hr[1]+5){strain+=.5;out.msgs.push(`Puls ${l.hr} lag über dem Zielbereich (${s.hr[0]}–${s.hr[1]}). Hitze, Schlafmangel oder Müdigkeit?`)}
    else if(!qual&&l.hr>=s.hr[0]-3&&l.hr<=s.hr[1]+5)out.msgs.push('Puls im Zielbereich.');
  }
  if(ty==='test'&&l.refSet)out.msgs.push(`Testlauf ausgewertet: ${fk(l.km)} km in ${fmtTime(l.sec||l.pace*l.km)}. Pace und Zonen sind jetzt darauf abgestimmt.`);
  if(l.dec!=null)out.msgs.push(`Decoupling ${fk(+l.dec.toFixed(1))} %: ${l.dec<5?'unter 5 %, deine aerobe Grundlage trägt über die ganze Distanz.':'der Puls stieg in der zweiten Hälfte deutlich an. Häufige Gründe: zu schneller Start, Wärme, zu wenig getrunken, oder die Grundlage für diese Länge braucht noch Zeit.'}`);
  const ef=effAny(l),eg=effGroup(l);if(ef)out.msgs.push(`${eg==='base'?'Effizienz-Index':effName(eg)} ${f2(ef)}${eg!=='base'?' (nur Belastung)':''}.`);
  if(l.rpe>E[1]+1)out.msgs.push(`Anstrengung ${l.rpe}/10 ist höher als für diese Einheit erwartet (${E[0]}–${E[1]}).`);
  else if(l.rpe<E[0]-1&&qual)out.msgs.push(`Anstrengung ${l.rpe}/10 ist tiefer als erwartet. Fühlt sich das öfter so an, zieht der Plan an.`);
  out.strain=clamp(strain,-2,3);
  if(out.strain>.75){out.verdict='Härter als geplant';out.tone='down'}
  else if(out.strain<-.5){out.verdict='Leichter als erwartet';out.tone='up'}
  if(out.msgs.length<=1&&!out.msgs.some(m=>m.startsWith('Schneller')))out.msgs.push('Alles im erwarteten Rahmen. Genau so baut sich Form auf.');
  return out;
}
// Efficiency index: speed (km/h) divided by the share of heart-rate reserve used.
// Continuous runs use elevation-adjusted average pace; interval sessions use only the work phases,
// because slow recovery jogs with a still-high heart rate would distort the value.
