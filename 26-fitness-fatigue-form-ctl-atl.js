/* ---- fitness, fatigue, form (CTL/ATL/TSB) ----
   load points per session ≈ TSS: hours × (25 + 10 × effort); fitness = 42-day, fatigue = 7-day weighted average, form = fitness − fatigue.
   The future is projected from the plan, so you see how fit and fresh you will be on race day. */
const loadPts=(min,rpe)=>min/60*(25+10*(rpe||4));
function planPts(s,c){if(!s||s.type==='rest'||s.pause||s.optional)return 0;if(s.type==='alt')return loadPts(s.dur||45,3);
  const E=RPE[s.type]||[3,5],p=s.quality&&s.pace?mid2(s.pace)*1.08:mid2(c.pc.E);return loadPts((s.km||0)*p/60,(E[0]+E[1])/2)}
function fitSeries(){
  const runs=allRuns().filter(l=>l.done);if(!runs.length)return null;
  const t=today(),c=ctxFor(S),L={};runs.forEach(l=>{const r=l.rpe||mid2(RPE[logType(l)]||[3,5]);L[l.date]=(L[l.date]||0)+loadPts(logDur(l),r)});
  const first=trackStart(runs),m=mainRace(S),end=m&&m.date>t&&daysBetween(t,m.date)<=200?m.date:addD(t,28);
  let ctl=0,atl=0;const out=[];
  // start at the beginning of continuous logging, seeded with the volume you stated (otherwise everyone starts at zero fitness).
  // Older isolated entries (a race from before you used the app) are left out: the empty weeks after them would read as lost fitness.
  const seed=S.profile.km?loadPts(S.profile.km/7*mid2(c.pc.E)/60,3.5):0;ctl=seed;atl=seed;
  for(let d=first;d<=end;d=addD(d,1)){const fut=d>t,ld=fut?planPts(planSession(d),c):(L[d]||0);
    ctl+=(ld-ctl)/42;atl+=(ld-atl)/7;out.push({d,ctl,atl,tsb:ctl-atl,fut})}
  return{pts:out,race:m&&m.date>t&&m.date<=end?m:null,today:t,from:first,skipped:runs.filter(l=>l.date<first).length}}
// first day of the current stretch of logging without a gap of more than 14 days
function trackStart(runs){const d=[...new Set(runs.map(l=>l.date))].sort();let i=d.length-1;while(i>0&&daysBetween(d[i-1],d[i])<=14)i--;return d[i]}
function formState(ctl,tsb){const r=ctl?tsb/ctl:0;
  return r<-.3?['var(--bad)',T('stark ermüdet','very tired'),T('Erholung einplanen, harte Einheiten notfalls schieben.','Plan recovery; move hard sessions if needed.')]
    :r<-.1?['var(--blue)',T('im Training','in training'),T('Produktive Ermüdung: So wird man fitter.','Productive fatigue: this is how you get fitter.')]
    :r<.05?['var(--good)',T('ausgeglichen','balanced'),T('Gut erholt und trotzdem im Training.','Well recovered and still in training.')]
    :['var(--good)',T('frisch','fresh'),T('Bereit für eine harte Einheit oder ein Rennen.','Ready for a hard session or a race.')]}
function fitCard(){const F=fitSeries();if(!F)return'';const P=F.pts,iT=P.findIndex(p=>p.d===F.today);if(iT<14)return'';
  const now=P[iT],ago=P[Math.max(0,iT-28)],wk=P[Math.max(0,iT-7)],dC=now.ctl-ago.ctl,ramp=now.ctl-wk.ctl,[col,lab,why]=formState(now.ctl,now.tsb);
  const rd=F.race?P.find(p=>p.d===addD(F.race.date,-1)):null,rs=rd?formState(rd.ctl,rd.tsb):null;
  const V=P.slice(Math.max(0,iT-112)),W0=400,H0=220,L=34,R=12,Tp=12,B=28,mid=Tp+(H0-Tp-B)*.62;
  const hi=Math.max(...V.map(p=>Math.max(p.ctl,p.atl)))*1.08||1,tb=Math.max(...V.map(p=>Math.abs(p.tsb)))||1;
  const x=i=>L+(W0-L-R)*i/(V.length-1),y=v=>Tp+(mid-8-Tp)*(1-v/hi),yt=v=>mid+(H0-B-mid)/2*(1-v/tb);
  const line=(k,fut)=>{const seg=V.map((p,i)=>[i,p]).filter(([,p])=>fut?p.d>=F.today:p.d<=F.today);return seg.length>1?`<polyline points="${seg.map(([i,p])=>`${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(' ')}" fill="none" stroke="${k==='ctl'?'var(--blue)':'var(--hot)'}" stroke-width="${k==='ctl'?2.4:1.6}" ${fut?'stroke-dasharray="4 4"':''} stroke-linejoin="round" stroke-linecap="round" opacity="${k==='ctl'?1:.8}"/>`:''};
  const bw=Math.max(1,(W0-L-R)/V.length-.4),iTV=V.findIndex(p=>p.d===F.today),xt=[0,iTV,V.length-1].filter((v,i,a)=>a.indexOf(v)===i);
  const rI=F.race?V.findIndex(p=>p.d===F.race.date):-1;
  return`<div class="card"><div class="spread"><h3>${T('Fitness & Form','Fitness & form')}</h3><span class="hint">${T('heute','today')}</span></div><p class="hint" style="margin:2px 0 4px">${T(`Gerechnet ab ${fshort(F.from)} (seither lückenlos erfasst), Startwert: deine ${S.profile.km||0} km/Woche aus dem Profil.`,`Calculated from ${fshort(F.from)} (logged without gaps since), starting value: your ${S.profile.km||0} km/week from your profile.`)}${F.skipped?T(` ${F.skipped} ${F.skipped===1?'älterer Eintrag zählt':'ältere Einträge zählen'} nicht.`,` ${F.skipped} older ${F.skipped===1?'entry is':'entries are'} left out.`):''}</p>
    <div class="fitnums"><div><b style="color:var(--blue)">${Math.round(now.ctl)}</b><span>${T('Fitness','Fitness')}${Math.abs(dC)>=1?` <i style="color:${dC>0?'var(--good)':'var(--bad)'}">${dC>0?'+':'−'}${Math.round(Math.abs(dC))}</i>`:''}</span></div><div><b style="color:var(--hot)">${Math.round(now.atl)}</b><span>${T('Ermüdung','Fatigue')}</span></div><div><b style="color:${col}">${sgnR(now.tsb)}</b><span>${T('Form','Form')} · ${lab}</span></div></div>
    <p style="margin:6px 0 8px;font-size:15px">${why}${Math.abs(dC)>=1?(iT>=28?T(` Fitness in 4 Wochen ${sgnR(dC)}.`,` Fitness ${sgnR(dC)} in 4 weeks.`):T(` Fitness seit ${fshort(F.from)} ${sgnR(dC)}.`,` Fitness ${sgnR(dC)} since ${fshort(F.from)}.`)):''}${ramp>7?T(` <b>Fitness steigt sehr schnell (+${Math.round(ramp)} in 7 Tagen)</b>: auf Erholung achten.`,` <b>Fitness is rising very fast (+${Math.round(ramp)} in 7 days)</b>: mind recovery.`):''}${rd?T(` <b>Am Renntag</b> (${fdate(F.race.date)}): Fitness ${Math.round(rd.ctl)}, Form ${sgnR(rd.tsb)}, ${rs[1]}.`,` <b>On race day</b> (${fdate(F.race.date)}): fitness ${Math.round(rd.ctl)}, form ${sgnR(rd.tsb)}, ${rs[1]}.`):''}</p>
    <div class="chartw"><svg class="chart" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${T('Fitness, Ermüdung und Form der letzten Wochen und nach Plan','Fitness, fatigue and form of recent weeks and according to plan')}">
    <rect x="${x(iTV)}" y="${Tp}" width="${Math.max(0,x(V.length-1)-x(iTV))}" height="${H0-Tp-B}" fill="var(--line)" opacity=".35"/>
    <line x1="${L}" x2="${W0-R}" y1="${yt(0)}" y2="${yt(0)}" stroke="var(--line)"/><text x="${L-6}" y="${yt(0)+4}" text-anchor="end">0</text><text x="${L-6}" y="${y(0)+4}" text-anchor="end">0</text><text x="${L-6}" y="${y(Math.round(hi*.9))+4}" text-anchor="end">${Math.round(hi*.9)}</text>
    ${V.map((p,i)=>`<rect x="${(x(i)-bw/2).toFixed(1)}" y="${Math.min(yt(0),yt(p.tsb)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(yt(p.tsb)-yt(0)).toFixed(1)}" fill="${formState(p.ctl,p.tsb)[0]}" opacity="${p.fut?.35:.6}"/>`).join('')}
    ${line('atl',false)}${line('atl',true)}${line('ctl',false)}${line('ctl',true)}
    ${rI>=0?`<line x1="${x(rI)}" x2="${x(rI)}" y1="${Tp}" y2="${H0-B}" stroke="var(--ink)" stroke-dasharray="2 3"/><text x="${x(rI)-4}" y="${Tp+10}" text-anchor="end">${esc(F.race.name||T('Rennen','Race'))}</text>`:''}
    ${xt.map((i,k)=>`<text x="${x(i)}" y="${H0-8}" text-anchor="${k===0?'start':i===V.length-1?'end':'middle'}">${i===iTV?T('heute','today'):fshort(V[i].d)}</text>`).join('')}
    </svg></div>
    <div class="legend"><span><i class="sw" style="background:var(--blue);height:3px"></i>${T('Fitness (6 Wochen)','Fitness (6 weeks)')}</span><span><i class="sw" style="background:var(--hot);height:3px"></i>${T('Ermüdung (7 Tage)','Fatigue (7 days)')}</span><span><i class="sw" style="background:var(--good)"></i>${T('Form','Form')}</span><span><i class="sw" style="background:var(--line)"></i>${T('nach Plan','by plan')}</span></div>
    <details class="help"><summary>${T('Wie wird das berechnet?','How is this calculated?')}</summary><p class="hint" style="margin:6px 0 0">${T('Jede Einheit bekommt Belastungspunkte aus Dauer und Anstrengung (1 Stunde locker ≈ 55, 1 Stunde hart ≈ 105). Fitness ist der Schnitt der letzten 6 Wochen, Ermüdung der letzten 7 Tage. Form = Fitness − Ermüdung: im Training leicht negativ, am Renntag positiv. Ab heute rechnet die Kurve mit deinem Plan.','Every session gets load points from duration and effort (1 hour easy ≈ 55, 1 hour hard ≈ 105). Fitness is the average of the last 6 weeks, fatigue of the last 7 days. Form = fitness − fatigue: slightly negative in training, positive on race day. From today the curve follows your plan.')}</p></details></div>`}

