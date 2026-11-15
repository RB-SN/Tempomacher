/* ---- month view: one week per row, one circle per day; size = km, colour = kind of run, dashed = planned ---- */
const MONL=()=>LANG==='en'?['January','February','March','April','May','June','July','August','September','October','November','December']:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const isoKw=d=>{const x=pd(d),t=new Date(Date.UTC(x.getFullYear(),x.getMonth(),x.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y0=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y0)/864e5+1)/7)};
// kind of run → colour: easy green, long blue, hard orange, race dark, cross-training grey
const kindOf=t=>t==='race'?'race':t==='long'||t==='mlong'?'long':t==='alt'?'alt':t==='rest'||!t?null:['easy','recovery','shakeout','fun','free'].includes(t)?'easy':'hard';
const KCOL={easy:'var(--z2)',long:'var(--c6)',hard:'var(--z4)',race:'var(--ink)',alt:'var(--z1)'};
function monthHTML(){const t=today(),hz=addD(monday(t),13),ym=ui.mon&&ui.mon<=hz.slice(0,7)?ui.mon:ui.mon?hz.slice(0,7):t.slice(0,7),[Y,M]=ym.split('-').map(Number),first=`${ym}-01`,last=addD(`${M===12?Y+1:Y}-${String(M===12?1:M+1).padStart(2,'0')}-01`,-1);
  const runs=allRuns().filter(l=>l.done&&l.date>=addD(monday(first),0)&&l.date<=addD(monday(last),6)),byD={};runs.forEach(l=>{(byD[l.date]=byD[l.date]||[]).push(l)});
  const kmD=d=>(byD[d]||[]).filter(l=>!isAlt(l)).reduce((a,l)=>a+logKm(l),0);
  // circle size: area grows with km, 12 km ≈ middle, 30 km+ = largest
  const sz=km=>Math.round(clamp(18+Math.sqrt(Math.max(0,km))*3,24,36));
  const cell=d=>{const L=byD[d]||[],inM=d>=first&&d<=last,s=planSession(d),run=L.filter(l=>!isAlt(l)),alt=L.filter(isAlt),km=kmD(d),cls=`mc${inM?'':' out'}${d===t?' today':''}`;
    const dn=`<span class="mdn">${pd(d).getDate()}</span>`;const inH=d<=hz;
    if(run.length){const main=run.slice().sort((a,b)=>logKm(b)-logKm(a))[0],k=kindOf(main.type||logType(main))||'easy',z=sz(km);
      return`<button class="${cls}" data-act="openDay" data-d="${d}" aria-label="${fdate(d)}: ${fk(Math.round(km*10)/10)} km">${dn}<span class="mci done" style="--kc:${KCOL[k]};width:${z}px;height:${z}px">${Math.round(km)}</span>${alt.length?'<i class="mxa"></i>':''}</button>`}
    if(alt.length){const m=alt.reduce((a,l)=>a+(altDurMin(l.dur)||0),0);return`<button class="${cls}" data-act="openDay" data-d="${d}" aria-label="${fdate(d)}: ${T('Alternativtraining','Cross-training')}">${dn}<span class="mci done alt" style="--kc:${KCOL.alt};width:26px;height:26px">${m?m+'′':'·'}</span></button>`}
    const sk=S.logs[d]&&S.logs[d].skipped;
    if(s&&s.type!=='rest'&&inH&&!(S.pause&&S.pause.from<=d&&S.pause.to>=d)){const k=kindOf(s.type),fut=d>=t,v=s.type==='alt'?(s.dur||45)+'′':Math.round(s.km||0);
      if(s.optional)return`<button class="${cls}" data-act="openDay" data-d="${d}" aria-label="${fdate(d)}: ${esc(s.title)}">${dn}<span class="mci mopt" aria-hidden="true">+</span></button>`;
      return`<button class="${cls}" data-act="openDay" data-d="${d}" aria-label="${fdate(d)}: ${esc(s.title)}">${dn}<span class="mci ${fut?'plan':'miss'}${sk?' skip':''}" style="--kc:${KCOL[k]||KCOL.easy};width:${s.type==='alt'?26:sz(s.km||0)}px;height:${s.type==='alt'?26:sz(s.km||0)}px">${fut||!sk?v:'–'}</span></button>`}
    return`<span class="${cls}">${dn}</span>`};
  const weeks=[];for(let m=monday(first);m<=last;m=addD(m,7))weeks.push(m);
  const rows=weeks.map(m=>{const ds=[0,1,2,3,4,5,6].map(i=>addD(m,i)),dk=ds.reduce((a,d)=>a+kmD(d),0),w=planWeek(m),pk=w?ds.filter(d=>d>=t&&d<=hz).reduce((a,d,i)=>{const x=planSession(d);return a+(x&&x.type!=='rest'&&x.type!=='alt'&&!x.optional?x.km||0:0)},0):0;
    const cur=t>=m&&t<=addD(m,6);
    return`<div class="mrow${cur?' cur':''}"><span class="mkw">${isoKw(m)}${w&&w.recovery&&m<=hz?`<i>${T('Entl.','rec.')}</i>`:''}</span>${ds.map(cell).join('')}<span class="mwk"><b>${m>t&&!dk?'–':Math.round(dk)}</b>${pk>.5?`<i>+${Math.round(pk)}</i>`:''}</span></div>`}).join('');
  const inMonth=runs.filter(l=>l.date>=first&&l.date<=last&&!isAlt(l)),mk=inMonth.reduce((a,l)=>a+logKm(l),0),lg=Math.max(0,...inMonth.map(logKm));
  let planned=0;for(let d=first;d<=last;d=addD(d,1)){const x=planSession(d);if(d>=t&&d<=hz&&x&&x.type!=='rest'&&x.type!=='alt'&&!x.optional)planned+=x.km||0}
  const prevYm=M===1?`${Y-1}-12`:`${Y}-${String(M-1).padStart(2,'0')}`,nextYm=M===12?`${Y+1}-01`:`${Y}-${String(M+1).padStart(2,'0')}`;
  // current month: compare with the previous month up to the same day, otherwise whole months
  const curM=ym===t.slice(0,7),cut=curM?`${prevYm}-${t.slice(8)}`:`${prevYm}-31`;
  const pm=allRuns().filter(l=>l.done&&!isAlt(l)&&l.date.slice(0,7)===prevYm&&l.date<=cut).reduce((a,l)=>a+logKm(l),0);
  return`<div class="card monv" data-swipe="mon">
    <div class="mhead"><button class="iconbtn" data-act="monGo" data-v="${prevYm}" aria-label="${T('Vormonat','Previous month')}">‹</button><div><h3>${MONL()[M-1]} ${Y}</h3>${ym!==t.slice(0,7)?`<button class="link" data-act="monGo" data-v="${t.slice(0,7)}">${T('Heute','Today')}</button>`:''}</div><button class="iconbtn" data-act="monGo" data-v="${nextYm}" aria-label="${T('Nächster Monat','Next month')}" ${nextYm>hz.slice(0,7)?'disabled':''}>›</button></div>
    <div class="msum"><div><b>${thou(Math.round(mk))}</b><span>km${planned>.5?` <i>+${Math.round(planned)} ${T('geplant','planned')}</i>`:''}</span></div><div><b>${inMonth.length}</b><span>${T('Läufe','runs')}</span></div><div><b>${lg?fk(Math.round(lg*10)/10):'–'}</b><span>${T('längster','longest')}</span></div>${pm>0&&ym<=t.slice(0,7)?`<div><b style="color:${mk>=pm?'var(--good)':'var(--muted)'}">${mk>=pm?'+':'−'}${Math.round(Math.abs(mk-pm))}</b><span>${curM?T(`zum Vormonat bis ${+t.slice(8)}.`,`vs last month to day ${+t.slice(8)}`):T('zum Vormonat','vs last month')}</span></div>`:''}</div>
    <div class="mgrid"><div class="mrow mh"><span>${T('KW','Wk')}</span>${DOWS.map(d=>`<span>${T(d,{Mo:'Mo',Di:'Tu',Mi:'We',Do:'Th',Fr:'Fr',Sa:'Sa',So:'Su'}[d])}</span>`).join('')}<span>km</span></div>${rows}</div>
    <div class="legend mleg"><span><i class="sw" style="background:var(--z2)"></i>${T('locker','easy')}</span><span><i class="sw" style="background:var(--c6)"></i>${T('lang','long')}</span><span><i class="sw" style="background:var(--z4)"></i>${T('hart','hard')}</span><span><i class="sw" style="background:var(--ink)"></i>${T('Rennen','race')}</span><span><i class="sw dash"></i>${T('geplant','planned')}</span><span><i class="sw optl">+</i>${T('optional','optional')}</span></div><p class="hint" style="margin:8px 0 0;text-align:center">${T('Geplant siehst du jeweils 2 Wochen im Voraus: Der Plan passt sich laufend an.','You see the plan 2 weeks ahead: it keeps adapting.')}</p></div>`}
