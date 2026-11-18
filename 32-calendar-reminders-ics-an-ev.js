/* ---- calendar reminders (.ics): an event at 21:00 the evening before each session, with an alert ---- */
function icsEsc(s){return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n')}
function icsFold(line){const out=[];let cur='',len=0;for(const ch of line){const b=new TextEncoder().encode(ch).length;if(len+b>73){out.push(cur);cur=' '+ch;len=1+b}else{cur+=ch;len+=b}}out.push(cur);return out.join('\r\n')}
const icsDate=d=>d.replace(/-/g,'');
function buildICS(range){
  const t=today(),last=range==='all'?addD(S.plan.weeks[S.plan.weeks.length-1].monday,6):addD(t,14),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tempomacher//Laufcoach//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Tempomacher Training'];let n=0;
  for(let d=addD(t,1);d<=last;d=addD(d,1)){
    const s=planSession(d);if(!s)continue;const eve=addD(d,-1);
    const what=s.type==='rest'?s.title:s.type==='alt'?`${s.title} (${s.dur||45} min, freiwillig)`:`${s.title} · ${fk(s.km)} km`;
    const desc=[`${fdateL(d)}`,s.tag||'',...(s.structure||[]).map(x=>'• '+x),s.pace?`Pace ${fmtPace(s.pace[0])}–${fmtPace(s.pace[1])} /km`:'',s.hr&&s.type!=='alt'&&s.type!=='rest'?`Puls ${s.hr[0]}–${s.hr[1]}`:'',s.note||''].filter(Boolean).join('\n');
    L.push('BEGIN:VEVENT',`UID:${icsDate(d)}-${CU||'demo'}@tempomacher`,`DTSTAMP:${stamp}`,`DTSTART:${icsDate(eve)}T210000`,`DTEND:${icsDate(eve)}T211500`,
      icsFold('SUMMARY:'+icsEsc('Morgen: '+what)),icsFold('DESCRIPTION:'+icsEsc(desc)),'TRANSP:TRANSPARENT',
      'BEGIN:VALARM','ACTION:DISPLAY',icsFold('DESCRIPTION:'+icsEsc('Morgen: '+what)),'TRIGGER:PT0M','END:VALARM','END:VEVENT');n++}
  L.push('END:VCALENDAR');return{text:L.join('\r\n')+'\r\n',n};
}
async function downloadText(name,text,mime){
  if(dlNS){try{await dlNS.save({filename:name,data:new Blob([text],{type:mime})});return'ok'}catch(e){if(e&&e.code==='declined')return'declined';return'err'}}
  try{const url=URL.createObjectURL(new Blob([text],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},1500);return'ok'}catch(e){return'err'}
}
function reminderCard(){
  const r=S.reminder||{};
  return`<div class="card stack" style="gap:12px"><div class="row" style="gap:10px"><span class="tomorrow" style="padding:0;background:none;display:inline;width:auto"><span class="ic">${ICONS.bell}</span></span><h3>Erinnerung am Vorabend</h3></div>
    <p class="muted" style="margin:0;font-size:14.5px">Lade die Erinnerungen in deinen Kalender (iPhone, Android, Outlook, Google). Du bekommst dann jeden Abend um 21:00 eine Meldung, was am nächsten Tag ansteht, auch wenn Tempomacher geschlossen ist.</p>
    <div class="row"><button class="btn blue small" data-act="ics" data-v="14">Nächste 2 Wochen</button><button class="btn ghost small" data-act="ics" data-v="all">Ganzer Plan</button></div>
    <p class="hint" style="margin:0">Der Plan wird alle zwei Wochen angepasst. Importiere die Datei darum am besten nach jeder Auswertung neu (nächste: ${fdate(nextEvalDate())}): Einträge mit demselben Datum werden in den meisten Kalendern ersetzt. ${r.at?`Zuletzt exportiert am ${fdate(r.at)}`:''}</p>
    ${ui.icsMsg?`<div class="adj">${esc(ui.icsMsg)}</div>`:''}</div>`;
}
