/* ---- review every two weeks ----
   Principles: no conclusions from too little data; if everything fits (completion, RPE, heart rate), nothing changes.
   Paces change only with evidence from at least 3 quality sessions with pace, heart rate and RPE in the last 4 weeks.
   Volume is never raised automatically (progression is already in the plan); it is reduced only on clear warning signs.
   "Dynamic" means: the type of the second quality session follows what the data shows (aerobic / threshold / speed). */
const QTHR=['tempo','cruise','mpace'],QSPD=['vo2','rp'];
function qualSamples(end){const from=addD(end,-28);
  return Object.entries(S.logs).map(([d,l])=>({...l,date:d})).filter(l=>l.done&&l.date>=from&&l.date<end&&l.s&&l.s.pct&&l.pace&&l.hr&&l.rpe&&logType(l)===rtOfPlan(l.s.type)&&[...QTHR,...QSPD].includes(logType(l))).map(l=>{
    const ty=logType(l),E=RPE[ty]||[6,8],pv=isIv(l)||isBlk(l)&&blkData(l)?l.pace:gapOf(l),tp=l.s.pace,hi=l.s.hr?l.s.hr[1]:null;
    const impl=vo2(60000/pv)/l.s.pct,hrOk=!hi||l.hr<=hi+3,rpeOk=l.rpe<=E[1],slow=tp&&pv>tp[1]*1.03,hard=l.rpe>E[1]+1||(hi&&l.hr>hi+5)||slow;
    return{ty,impl,hrOk,rpeOk,hard,thr:QTHR.includes(ty)}})}
function evaluateWeek(mon,nw=2){
  const dates=[...Array(7*nw)].map((_,i)=>addD(mon,i)),end=addD(mon,7*nw);
  const planned=dates.map(d=>planSession(d)).filter(s=>s&&!['race','rest','alt','fun'].includes(s.type));
  const logs=dates.map(d=>S.logs[d]).filter(Boolean),done=logs.filter(l=>l.done);
  const skips=logs.filter(l=>!l.done),sick=skips.filter(l=>l.reason==='sick').length,tired=skips.filter(l=>l.reason==='tired').length;
  const doneP=dates.filter(d=>{const s=planSession(d),l=S.logs[d];return s&&l&&l.done&&!['race','rest','alt','fun'].includes(s.type)}).length;
  const cis=dates.map(d=>S.checkins[d]).filter(Boolean);
  const notes=[];const vd=vdotOf(S);
  if(!done.length&&!cis.length&&!skips.length){return{week:mon,weeks:nw,verdict:'hold',nodata:true,volFactor:S.adapt.volFactor,vdotDelta:0,focus:S.adapt.focus||null,notes:[T(`Für ${nw===2?'diese zwei Wochen':'diese Woche'} wurde nichts eingetragen. Der Plan bleibt unverändert.`,`Nothing was logged for ${nw===2?'these two weeks':'this week'}. The plan stays unchanged.`)]}}
  const completion=planned.length?doneP/planned.length:1;
  const an=done.map(analyze),strain=avg(an.map(a=>a.strain));
  const feel=cis.length?avg(cis.map(c=>[2,1,0,-1,-2][c.feel])):0,pain=(cis.reduce((a,c)=>a+[0,1,3][c.pain],0)+skips.filter(l=>l.reason==='pain').length*3+sick*2)/nw;
  // warning signs only from what was reported, never from sessions that were simply not logged
  const strongPain=cis.filter(c=>c.pain===2).length+skips.filter(l=>l.reason==='pain').length;
  const warn=strongPain>=1||pain>=3||sick>=2||tired>=2||(done.length>=4&&strain>.6&&feel<0);
  let vf=S.adapt.volFactor;
  if(warn)vf=Math.max(.7,vf-.12);else if(vf<1)vf=Math.min(1,vf+.04);
  // paces: evidence from at least 3 quality sessions with heart rate and RPE (last 4 weeks)
  const Q=qualSamples(end);let vdotDelta=0;
  if((!S.profile.lab||labOld(S.profile))&&Q.length>=3){const ok=Q.filter(q=>q.hrOk&&q.rpeOk),up=ok.filter(q=>q.impl-vd>.5).length,dn=Q.filter(q=>q.hard).length;
    if(!warn&&ok.length>=3&&up>=Math.ceil(Q.length*2/3)&&avg(ok.map(q=>q.impl))-vd>.8)vdotDelta=.5;
    else if(dn>=Math.ceil(Q.length*2/3)&&avg(Q.map(q=>q.impl))-vd<-1)vdotDelta=-.5}
  // measured threshold (tempo blocks near threshold heart rate): the index learns from it, at most ±0.5 per review
  const tS=warn?Math.min(0,thrVdotStep(end)):thrVdotStep(end);if(tS>0&&vdotDelta>=0)vdotDelta=Math.max(vdotDelta,tS);else if(tS<0&&vdotDelta<=0)vdotDelta=Math.min(vdotDelta,tS);const thrLearn=tS!==0&&vdotDelta===tS;
  // focus of the second quality session for the next two weeks
  const lr=done.filter(l=>l.dec!=null&&logKm(l)>=15).concat((S.extra||[]).filter(x=>x.done&&x.dec!=null&&x.date>=addD(end,-28)&&x.date<end&&logKm(x)>=15));
  const thrHard=Q.filter(q=>q.thr&&q.hard).length,spdHard=Q.filter(q=>!q.thr&&q.hard).length;
  let focus=null;
  if(lr.length&&avg(lr.map(l=>l.dec))>5)focus='aerobic';
  else if(thrHard>=2&&thrHard>spdHard)focus='threshold';
  else if(spdHard>=2&&spdHard>thrHard)focus='speed';
  const verdict=warn||vdotDelta<0?'down':vdotDelta>0?'up':'hold';
  notes.push(T(`${doneP} von ${planned.length} geplanten Läufen erfasst.`,`${doneP} of ${planned.length} planned runs logged.`));
  if(completion<.6&&!warn)notes.push(T('Nicht erfasste Einheiten werden nicht als Müdigkeit gewertet; der Umfang bleibt.','Sessions not logged are not treated as fatigue; volume stays.'));
  if(strain>.6)notes.push(T('Die Läufe fühlten sich im Schnitt härter an als vorgesehen.','On average the runs felt harder than intended.'));
  else if(strain<-.4)notes.push(T('Die Läufe fühlten sich im Schnitt leichter an als vorgesehen. Der Plan steigert ohnehin; zusätzlich wird nichts erhöht.','On average the runs felt easier than intended. The plan already progresses; nothing extra is added.'));
  if(sick)notes.push(T('Krankheitstage eingetragen: nach dem Gesundwerden langsam und locker wieder einsteigen.','Sick days logged: return slowly and easily once recovered.'));
  if(pain>0&&!sick)notes.push(strongPain||pain>=3?T('Schmerzen gemeldet: der Umfang wird zurückgenommen, damit sich der Körper erholen kann.','Pain reported: volume is reduced so your body can recover.'):T('Leichte Schmerzen gemeldet. Weiter beobachten.','Slight pain reported. Keep an eye on it.'));
  if(warn)notes.push(T('Die nächsten zwei Wochen weniger Umfang (−12 %), Intensität bleibt kontrolliert.','Less volume for the next two weeks (−12 %), intensity stays controlled.'));
  if(thrLearn)notes.push(vdotDelta>0?T(`Deine gemessene Schwelle liegt über mehrere Tempoeinheiten schneller als die Vorgabe: Der Leistungsindex steigt um ${vdotDelta.toFixed(1)}, Paces und Prognosen werden etwas schneller.`,`Your measured threshold has been faster than the target over several tempo sessions: the performance index rises by ${vdotDelta.toFixed(1)}, paces and predictions get a little faster.`):T('Deine gemessene Schwelle liegt über mehrere Tempoeinheiten langsamer als die Vorgabe: Der Leistungsindex sinkt um 0.5.','Your measured threshold has been slower than the target over several tempo sessions: the performance index drops by 0.5.'));
  else if(vdotDelta>0)notes.push(T(`${Q.length} Qualitätseinheiten mit Puls und Anstrengung zeigen: Du bist schneller als die Vorgaben, bei passendem Puls. Die Trainingspaces werden um etwa 2 s/km schneller.`,`${Q.length} quality sessions with heart rate and effort show: you are faster than the targets at a fitting heart rate. Training paces get about 2 s/km faster.`));
  else if(vdotDelta<0&&!thrLearn)notes.push(T('Mehrere Qualitätseinheiten waren zu hart (Puls, Anstrengung oder Tempo). Die Trainingspaces werden etwas langsamer.','Several quality sessions were too hard (heart rate, effort or pace). Training paces get a bit slower.'));
  else if(S.profile.lab)notes.push(T('Paces aus der Leistungsdiagnostik bleiben fix.','Paces from your lab test stay fixed.'));
  else if(Q.length<3)notes.push(T(`Paces bleiben: Für eine Anpassung braucht es mindestens 3 Qualitätseinheiten mit Pace, Puls und Anstrengung in 4 Wochen (bisher ${Q.length}).`,`Paces stay: an adjustment needs at least 3 quality sessions with pace, heart rate and effort within 4 weeks (so far ${Q.length}).`));
  else{const fastBad=Q.filter(q=>q.impl-vd>.5&&!(q.hrOk&&q.rpeOk)).length,hardN=Q.filter(q=>q.hard).length;
    notes.push(fastBad>=Math.ceil(Q.length/2)?T('Schneller als vorgegeben, aber mit zu hohem Puls oder zu hoher Anstrengung: Die Paces bleiben. Schneller werden sie erst, wenn das Tempo bei passendem Puls gelingt.','Faster than the targets, but with too high a heart rate or effort: paces stay. They only get faster once the pace works at a fitting heart rate.')
      :hardN?T(`${hardN} von ${Q.length} Qualitätseinheiten waren zu hart; für eine Anpassung der Paces reicht das nicht.`,`${hardN} of ${Q.length} quality sessions were too hard; not enough to change the paces.`)
      :T('Paces passen: Qualitätseinheiten im Zielbereich bei passendem Puls und Anstrengung.','Paces fit: quality sessions on target with fitting heart rate and effort.'))}
  const FN={aerobic:T('Grundlage: Puls stieg in langen Läufen hinten raus. Die zweite Qualitätseinheit wird ein ruhigerer Tempodauerlauf statt harter Intervalle.','Aerobic base: heart rate drifted late in long runs. The second quality session becomes a steadier tempo run instead of hard intervals.'),
    threshold:T('Schwelle: Schwellen-Einheiten waren mehrfach zu hart. Die zweite Qualitätseinheit wird ebenfalls ein Schwellentraining, um die Schwelle gezielt zu verbessern.','Threshold: threshold sessions were too hard several times. The second quality session also becomes threshold work to target it.'),
    speed:T('Tempohärte: Intervalle waren mehrfach zu hart. Die zweite Qualitätseinheit wird ein VO₂max-Intervall, um die Tempohärte gezielt zu verbessern.','Speed: intervals were too hard several times. The second quality session becomes VO₂max intervals to target it.')};
  if(focus)notes.push(T('Schwerpunkt der nächsten zwei Wochen – ','Focus for the next two weeks – ')+FN[focus]);
  if(verdict==='hold'&&!focus&&!warn&&vf>=1&&vdotDelta===0&&strain<=.6&&!Q.some(q=>q.hard||(q.impl-vd>.5&&!(q.hrOk&&q.rpeOk))))notes.push(T('Alles im Lot: Der Plan bleibt genau so.','All in order: the plan stays exactly as it is.'));
  return{week:mon,weeks:nw,verdict,completion:+completion.toFixed(2),volFactor:+vf.toFixed(2),vdotDelta,focus,notes};
}
function rwProgress(r){const R=S.plan.rw;if(!R||R.stage>=RW.length||r.nodata)return;
  const ds=[...Array(7)].map((_,i)=>S.logs[addD(r.week,i)]).filter(l=>l&&l.done),rpe=ds.length?avg(ds.map(l=>l.rpe)):9;
  const cis=[...Array(7)].map((_,i)=>S.checkins[addD(r.week,i)]).filter(Boolean),pain=cis.some(c=>c.pain>0);
  if(r.verdict!=='down'&&!pain&&ds.length>=2&&rpe<=5){R.stage++;r.notes.push(R.stage>=RW.length?'Lauf-Geh-Training geschafft: ab jetzt läufst du am Stück.':`Lauf-Geh: nächste Stufe, ${fk(RW[R.stage][0])} min laufen und ${fk(RW[R.stage][1])} min gehen.`)}
  else r.notes.push(`Lauf-Geh: Du bleibst noch eine Woche bei ${fk(RW[R.stage][0])} min laufen und ${fk(RW[R.stage][1])} min gehen.`)}
function applyEval(r){S.adapt.volFactor=r.volFactor;if(!r.safety)S.adapt.focus=r.focus||null;S.adapt.vdotAdj=clamp((S.adapt.vdotAdj||0)+r.vdotDelta,-4,6);r.vdot=+vdotOf(S).toFixed(1);S.adapt.history.push(r)}
// in the middle of a two-week block: only react to clear warning signs (strong pain, illness), never increase
function safetyCheck(mon){
  const ds=[...Array(7)].map((_,i)=>addD(mon,i)),cis=ds.map(d=>S.checkins[d]).filter(Boolean),sk=ds.map(d=>S.logs[d]).filter(l=>l&&!l.done);
  const strong=cis.filter(c=>c.pain===2).length+sk.filter(l=>l.reason==='pain').length,sick=sk.filter(l=>l.reason==='sick').length;
  if(strong<1&&sick<2)return null;
  const vf=Math.max(.7,S.adapt.volFactor-.12);
  return{week:mon,weeks:1,safety:true,verdict:'down',volFactor:+vf.toFixed(2),vdotDelta:0,
    notes:[sick>=2?'Zwischen-Check: Krankheitstage eingetragen.':'Zwischen-Check: starke Schmerzen gemeldet.','Zur Sicherheit wird der Umfang schon jetzt reduziert (−12 %). Die reguläre Auswertung folgt nach zwei Wochen.']};
}
const blockStartOf=d=>{const k=Math.floor(daysBetween(S.plan.startMonday,monday(d))/7);return addD(S.plan.startMonday,7*(k-((k%2)+2)%2))};
const nextEvalDate=()=>addD(blockStartOf(today()),14);
function weeklyCheck(){if(S&&archiveYears())save();
  if(!S||!S.plan)return;
  migrate();
  if(S.lang!==LANG){S.lang=LANG;regenerate();save()}
  {const L=S.plan.weeks[S.plan.weeks.length-1];if(!L||L.monday<addD(monday(today()),7*8)){regenerate();save()}}
  if(switchMain(S.plan.mainId)){regenerate();save()}
  if(!S.plan.prep){setPrep(true);regenerate();save()}
  const cur=monday(today());
  if(!S.adapt.lastEval){S.adapt.lastEval=cur;return}
  if(S.adapt.lastEval>=cur)return;
  // evaluation every two weeks (block start = plan start + 2n weeks); run-walk stages still advance weekly
  const bs=blockStartOf(cur),prevW=addD(cur,-7);
  if(S.plan.rw&&prevW>=S.plan.startMonday){const rr={week:prevW,verdict:'hold',notes:[]};rwProgress(rr);if(rr.notes.length)S.adapt.rwNote={week:prevW,text:rr.notes.join(' '),seen:false}}
  if(S.adapt.lastEval<bs&&addD(bs,-14)>=S.plan.startMonday){const r=evaluateWeek(addD(bs,-14),2);r.at=Date.now();r.seen=false;applyEval(r)}
  else if(prevW>=S.plan.startMonday&&prevW!==addD(bs,-14)){const r=safetyCheck(prevW);if(r){r.at=Date.now();r.seen=false;applyEval(r)}}
  S.adapt.lastEval=cur;regenerate();save();
}
// logged volume replaces the stated one only when the app has seen 3 full weeks (otherwise e.g. 2 logged runs would turn 60 km into 4 km)
function recentWeeklyKm(){const t=today();let sum=0,n=0;const first=allRuns().find(l=>l.done);if(!first||first.date>addD(t,-21))return null;
  for(let i=1;i<=21;i++){const l=S.logs[addD(t,-i)];if(l&&l.done){sum+=logKm(l);n++}}
  (S.extra||[]).forEach(x=>{if(x.date<t&&x.date>=addD(t,-21)){sum+=logKm(x);n++}});
  return n>=4?sum/3:null}
// age follows the birth date, so heart-rate estimates stay right after each birthday
function ageFrom(b){if(!b||!/^\d{4}-\d{2}-\d{2}$/.test(b))return null;const[y,m,d]=b.split('-').map(Number),n=new Date();let a=n.getFullYear()-y;if(n.getMonth()+1<m||(n.getMonth()+1===m&&n.getDate()<d))a--;return a}
function migrate(){
  if(S.profile&&S.profile.birth){const a=ageFrom(S.profile.birth);if(a&&a!==S.profile.age)S.profile.age=a}
  if(!S.extra)S.extra=[];
  if(!S.pbs)S.pbs=[];
  if(!S.profile.daysSel){S.profile.daysSel=trainDays(S.profile);S.profile.longDay=longDayOf(S.profile)}
  S.races.forEach(r=>{if(!r.plan){r.plan=r.prio==='A'?'own':r.prio==='B'&&r.adapt!==false?'taper':'none'}if(!r.rel)r.rel=r.plan==='own'?'high':r.plan==='taper'?'mid':'low';r.prio=prioOf(r)});
}
function switchMain(prevId){
  if(S.plan.mode==='fit')return false;
  const m=mainRace(S);if(!m||m.id===S.plan.mainId)return false;
  const prev=S.races.find(r=>r.id===prevId),cur=monday(today());
  let start=dow(today())>=4?addD(cur,7):cur;
  if(prev&&prev.date<today())start=addD(monday(prev.date),7);
  if(m.date<start)start=monday(today());
  S.plan.startMonday=start;
  const rk=recentWeeklyKm();if(rk!=null)S.profile.km=Math.round(Math.max(rk,(S.profile.km||0)*.7));
  S.adapt.volFactor=1;S.plan.mainId=m.id;S.plan.weeks=[];S.plan.specStart=null;setPrep(true);
  return true;
}

/* ============ state & persistence ============ */
/* accounts: one profile per person on this device, protected by a password (salted SHA-256, stored only locally) */
function sha256hex(str){
  const bytes=new TextEncoder().encode(str),K=[],H=[];let p=2,c=0;
  const frac=x=>((x-Math.floor(x))*4294967296)|0;
  while(c<64){let ip=true;for(let d=2;d*d<=p;d++)if(p%d===0){ip=false;break}if(ip){if(c<8)H[c]=frac(Math.sqrt(p));K[c]=frac(Math.cbrt(p));c++}p++}
  const l=bytes.length,bl=((l+9+63)>>6)<<6,m=new Uint8Array(bl);m.set(bytes);m[l]=0x80;
  const dv=new DataView(m.buffer),bits=l*8;dv.setUint32(bl-4,bits>>>0);dv.setUint32(bl-8,Math.floor(bits/4294967296));
  const w=new Int32Array(64);
  for(let i=0;i<bl;i+=64){
    for(let t=0;t<16;t++)w[t]=dv.getInt32(i+t*4);
    for(let t=16;t<64;t++){const a=w[t-15],b=w[t-2];const s0=(a>>>7|a<<25)^(a>>>18|a<<14)^(a>>>3),s1=(b>>>17|b<<15)^(b>>>19|b<<13)^(b>>>10);w[t]=(w[t-16]+s0+w[t-7]+s1)|0}
    let a=H[0],b=H[1],cc=H[2],d=H[3],e=H[4],f=H[5],g=H[6],hh=H[7];
    for(let t=0;t<64;t++){const S1=(e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[t]+w[t])|0;
      const S0=(a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10),mj=(a&b)^(a&cc)^(b&cc),t2=(S0+mj)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=cc;cc=b;b=a;a=(t1+t2)|0}
    H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+cc)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+hh)|0}
  return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
}
function pwHash(salt,pw){let x=salt+':'+pw;for(let i=0;i<500;i++)x=sha256hex(salt+':'+x);return x}
const ACC='startlinie.accounts',LEGACY='startlinie.v1',SESS='startlinie.session';
const slugOf=n=>String(n).trim().toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'user';
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
function ssGet(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function ssSet(k,v){try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}}
function accounts(){try{return JSON.parse(lsGet(ACC)||'{"users":{}}')}catch(e){return{users:{}}}}
function saveAccounts(a){lsSet(ACC,JSON.stringify(a))}
let CU=null,dlNS=null;
const userKey=()=>'startlinie.u.'+CU;
let S=null,docRef=null,writing=false,pending=false,saveT=null,sync='local',sampleFn=null;
function loadLocal(){if(!CU)return null;try{const t=lsGet(userKey());return t?JSON.parse(t):null}catch(e){return null}}
function saveLocal(){if(!CU)return;lsSet(userKey(),S?JSON.stringify(S):null)}
function save(){if(!S||!CU||S.demo)return;S.updatedAt=Date.now();saveLocal();schedulePush()}
// Profiles stay on this device unless they are online profiles (username + password, encrypted; see config.js / docs/CLOUD.md)
function flush(){}
function connect(){if(isCloud()){sync='busy';cSync()}else sync='local'}
