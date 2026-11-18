/* ---- optional: same profile on several devices. Username + password; data is encrypted on the device before upload ---- */
const CLOUD=(()=>{const c=window.TM_CLOUD;return c&&/^https:\/\//.test(c.url||'')&&(c.key||c.anonKey)?{url:c.url.trim().replace(/\/+$/,'').replace(/\/(rest|auth)\/v1$/,''),key:String(c.key||c.anonKey).trim()}:null})();
const isCloud=()=>!!(CLOUD&&CU&&(accounts().users[CU]||{}).cloud);
const USER_RE=/^[A-Za-zÀ-ÖØ-öø-ÿ0-9._-]{3,30}$/;
const ckKey=slug=>'startlinie.ck.'+slug;
function ckGet(slug=CU){try{return JSON.parse(lsGet(ckKey(slug))||ssGet(ckKey(slug))||'null')}catch(e){return null}}
function ckSet(slug,v,keep){const t=v?JSON.stringify(v):null;lsSet(ckKey(slug),keep?t:null);ssSet(ckKey(slug),keep?null:t)}
const b64=buf=>{let s='';const b=new Uint8Array(buf);for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function deriveKeys(user,pw){
  if(!window.crypto||!crypto.subtle)throw new Error('Dieser Browser kann die Daten nicht verschlüsseln. Bitte die Seite über https öffnen.');
  const enc=new TextEncoder(),base=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);
  const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode('tempomacher:v1:'+user.toLowerCase()),iterations:310000},base,512));
  return{k:b64(bits.slice(0,32)),v:Array.from(bits.slice(32),x=>x.toString(16).padStart(2,'0')).join('')}}
const aesKey=k=>crypto.subtle.importKey('raw',unb64(k),'AES-GCM',false,['encrypt','decrypt']);
async function encState(st,k){const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(k),new TextEncoder().encode(JSON.stringify(st)));return{v:1,iv:b64(iv),ct:b64(ct)}}
async function decState(e,k){if(!e)return null;const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(e.iv)},await aesKey(k),unb64(e.ct));return JSON.parse(new TextDecoder().decode(pt))}
async function rpc(fn,args){
  const h={apikey:CLOUD.key,'Content-Type':'application/json'};if(/^eyJ/.test(CLOUD.key))h.Authorization='Bearer '+CLOUD.key;
  let r;try{r=await fetch(CLOUD.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:h,body:JSON.stringify(args)})}
  catch(e){const x=new Error('Keine Verbindung zum Online-Speicher. Bitte Internetverbindung prüfen.');x.net=true;throw x}
  if(!r.ok){const x=new Error(r.status===429?'Zu viele Versuche. Bitte in ein paar Minuten nochmals versuchen.':'Der Online-Speicher antwortet nicht wie erwartet (Fehler '+r.status+'). Ist er eingerichtet (docs/CLOUD.md)?');x.net=r.status>=500;throw x}
  try{return await r.json()}catch(e){return null}}
const authErr=()=>{const e=new Error('auth');e.auth=true;return e};
async function cPull(slug=CU){const c=ckGet(slug),u=accounts().users[slug];if(!c||!u)throw authErr();
  const r=await rpc('tm_load',{p_user:u.user,p_verifier:c.v});if(r&&r.locked){const e=new Error('locked');e.net=true;throw e}if(!r)throw authErr();return{data:await decState(r.data,c.k)}}
async function cPush(st,slug=CU){const c=ckGet(slug),u=accounts().users[slug];if(!c||!u)throw authErr();st.uname=u.name;
  const ok=await rpc('tm_save',{p_user:u.user,p_verifier:c.v,p_data:await encState(st,c.k),p_updated:Math.round(st.updatedAt||Date.now())});if(ok===null){const e=new Error('locked');e.net=true;throw e}if(!ok)throw authErr()}
async function cDelete(slug=CU){const c=ckGet(slug),u=accounts().users[slug];if(c&&u)await rpc('tm_delete',{p_user:u.user,p_verifier:c.v})}
// several screenshots: each image is read on its own, then combined; the summary page (most labelled values, no lap table) wins
function mergeShots(rs){
  rs=rs.filter(Boolean);if(!rs.length)return null;
  const order=[...rs].sort((a,b)=>(b.lab-(b.rows>2?1:0))-(a.lab-(a.rows>2?1:0)));
  const m=Object.assign({},order[0]);m.sport=(rs.find(r=>r.sport&&r.sport!=='run')||rs.find(r=>r.sport)||{}).sport||null;if(m.speed==null){const r=rs.find(x=>x.speed);if(r)m.speed=r.speed}const altS=m.sport&&m.sport!=='run';
  for(const k of['date','km','mov','avgPace','avgHr','hrMax','gain'])if(m[k]==null){const r=order.find(x=>x[k]!=null&&(x.rows<=2||k==='date'||k==='avgHr'||k==='hrMax'));if(r)m[k]=r[k]}
  const lapImg=[...rs].sort((a,b)=>b.rows-a.rows)[0];
  // laps from another activity? different dates or a lap sum that does not fit the total: then ignore the laps
  const ds=[...new Set(rs.filter(r=>r.date&&(r.lab>=2||r.rows>=2)).map(r=>r.date))],sumKm=order[0].km;
  m.warn=[];if(lapImg!==order[0]&&lapImg.rows>=2&&rs.filter(r=>r.laps&&r.laps.length>=2).length<=1){
    if(lapImg.date&&order[0].date&&lapImg.date!==order[0].date)m.warn.push({k:'dates',a:order[0].date,b:lapImg.date});
    else if(lapImg.lapKm&&sumKm&&Math.abs(lapImg.lapKm-sumKm)/sumKm>.08)m.warn.push({k:'lapsum',a:sumKm,b:lapImg.lapKm})}
  const lapsOk=!m.warn.length;void ds;
  if(lapsOk){if(!m.iv&&lapImg.iv)m.iv=lapImg.iv;if(m.dec==null&&lapImg.dec!=null)m.dec=lapImg.dec;if(!m.splits&&lapImg.splits)m.splits=lapImg.splits}else{m.iv=order[0].iv||null;m.dec=order[0].dec??null;m.splits=order[0].splits||null}
  m.rows=Math.max(...rs.map(r=>r.rows));m.kw=(rs.find(r=>r.kw)||{}).kw||null;
  // interval tables over several screenshots (e.g. Garmin filters «Warm up», «Laufen», «Erholung», «Cool Down»)
  const LL=rs.map(r=>r.laps).filter(Boolean);if(LL.length&&!m.warn.some(w=>w.k==='dates')){const LA=lapAnalysis(LL);if(LA){m.iv=LA.iv;m.dec=null;
    if(LA.tot){if(m.km==null)m.km=LA.tot.km;if(m.mov==null||Math.abs(LA.tot.mov-m.mov)<=m.mov*.01)m.mov=LA.tot.mov;if(m.avgHr==null&&LA.tot.hr)m.avgHr=LA.tot.hr;if(m.hrMax==null&&LA.tot.hrMax)m.hrMax=LA.tot.hrMax}}}
  if(m.km==null){const r=rs.find(x=>x.km!=null);if(r)m.km=r.km}
  if(!altS&&m.mov&&m.km&&(m.mov/m.km<150||m.mov/m.km>1200))m.mov=null;
  if(!m.mov&&m.avgPace&&m.km)m.mov=Math.round(m.avgPace*m.km);
  if(m.mov&&m.km&&(!m.avgPace||Math.abs(m.avgPace-m.mov/m.km)>m.mov/m.km*.15))m.avgPace=m.mov/m.km;
  if(m.avgHr&&(m.avgHr<60||m.avgHr>220))m.avgHr=null;
  if(m.hrMax&&(m.hrMax>230||(m.avgHr&&m.hrMax<m.avgHr)))m.hrMax=null;
  return m}
// first name + two digits, only names that are still free
async function userSuggest(base){
  let fn=(String(base).split(/[\s._\-0-9]+/).find(Boolean)||'Laeufer').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g,'');if(fn.length<2)fn='Laeufer';
  fn=fn.charAt(0).toUpperCase()+fn.slice(1).toLowerCase();
  const out=[],tried=new Set();
  for(let i=0;i<10&&out.length<3;i++){const n=10+Math.floor(Math.random()*90),c=fn+n;if(tried.has(c))continue;tried.add(c);
    try{if(await rpc('tm_available',{p_user:c}))out.push(c)}catch(e){break}}
  return out}
// which entries a version holds (kept after each sync as the common base for the next one)
const syncKeys=st=>st?{logs:Object.keys(st.logs||{}),extra:(st.extra||[]).map(x=>x.id),pbs:(st.pbs||[]).map(x=>x.id),races:(st.races||[]).map(x=>x.id),shoes:(st.shoes||[]).map(x=>x.id)}:null;
// combine two versions edited on different devices (three-way): the newer version wins for settings, entries are joined;
// an entry that existed at the last sync and is missing on one side was deleted there and stays deleted.
// Without a base (first sync after the update) nothing counts as deleted, so no run is ever lost.
function mergeState(L,R,base){
  const newer=(R.updatedAt||0)>(L.updatedAt||0),B=JSON.parse(JSON.stringify(newer?R:L)),O=newer?L:R;
  // newer entry wins; entries without a time stamp take their version's time; a completed run beats a not-done marker
  // unless that marker is a deliberate later decision; a race keeps its result if only one side has it
  const tB=B.updatedAt||0,tO=O.updatedAt||0,isB=x=>B.logs&&Object.values(B.logs).includes(x)||[].concat(B.extra||[],B.pbs||[],B.races||[],B.shoes||[]).includes(x);
  const pick=(a,b)=>{const ta=a.at||(isB(a)?tB:tO),tb=b.at||(isB(b)?tB:tO);
    if(a.done===true&&b.done===false&&!(b.reason&&b.reason!=='alt'&&tb>ta))return a;if(b.done===true&&a.done===false&&!(a.reason&&a.reason!=='alt'&&ta>tb))return b;
    const w=ta>=tb?a:b,l=w===a?b:a;if(l.res&&!w.res)return{...w,res:l.res};return w},gone=(k,key,inB,inO)=>base&&base[k]&&base[k].includes(key)&&(!inB||!inO);
  B.logs=B.logs||{};const lk=new Set([...Object.keys(B.logs),...Object.keys(O.logs||{})]);
  lk.forEach(k=>{const b=B.logs[k],o=(O.logs||{})[k];if(gone('logs',k,b,o)){delete B.logs[k];return}B.logs[k]=b&&o?pick(b,o):b||o});
  B.checkins=B.checkins||{};Object.keys(O.checkins||{}).forEach(k=>{if(!B.checkins[k])B.checkins[k]=O.checkins[k]});
  const un=(f)=>{const a=B[f]||[],b=O[f]||[],m=new Map(a.map(x=>[x.id,x])),ob=new Map(b.map(x=>[x.id,x]));
    ob.forEach((x,id)=>{m.set(id,m.has(id)?pick(m.get(id),x):x)});return[...m.values()].filter(x=>!gone(f,x.id,a.some(y=>y.id===x.id),ob.has(x.id)))};
  B.extra=un('extra');B.pbs=un('pbs');B.races=un('races');if(B.shoes||O.shoes)B.shoes=un('shoes');
  B.updatedAt=Date.now();return B}
let syncBusy=false,syncAgain=false,pushT=null;
function setSync(s){sync=s;try{renderHdr()}catch(e){}}
async function cSync(){
  if(!isCloud()||(S&&S.demo))return;
  if(syncBusy){syncAgain=true;return}
  syncBusy=true;clearTimeout(pushT);pushT=null;setSync('busy');const slug=CU;
  try{
    const{data:R}=await cPull(slug);if(slug!==CU)return;
    const acc=accounts(),u=acc.users[slug],base=u.synced||0;let changed=false;
    // three-way decision against the last synced version: changed only remotely → take it; only locally → push;
    // on both sides → merge (never push a local version over remote entries it has not seen)
    const rT=R?R.updatedAt||0:0,lT=S?S.updatedAt||0:0,rCh=!!R&&rT>base&&rT!==lT,lCh=!!S&&lT>base&&rT!==lT;
    if(R&&!S){S=R;saveLocal();changed=true}
    else if(rCh){const M=mergeState(S,R,u.bk||null),add=JSON.stringify(syncKeys(M))!==JSON.stringify(syncKeys(R));S=M;saveLocal();if(lCh||add)await cPush(S,slug);changed=true}
    else if(S&&(lCh||!R))await cPush(S,slug);
    u.synced=S?S.updatedAt||0:0;u.bk=syncKeys(S);saveAccounts(acc);setSync('ok');
    if(changed){if(S)weeklyCheck();if(!ui.sheet)render();else renderHdr()}
  }catch(e){setSync(e&&e.auth?'auth':'off')}
  finally{syncBusy=false;if(syncAgain){syncAgain=false;cSync()}}
}
function schedulePush(){if(!isCloud())return;clearTimeout(pushT);pushT=setTimeout(cSync,1200)}
document.addEventListener('visibilitychange',()=>{if(!isCloud())return;if(document.visibilityState==='visible')cSync();else if(pushT)cSync()});
window.addEventListener('online',()=>{if(isCloud())cSync()});
// an open, visible window (laptop) also checks for news from other devices: on focus and every 60 s
window.addEventListener('focus',()=>{if(isCloud())cSync()});
setInterval(()=>{if(isCloud()&&document.visibilityState==='visible'&&!pushT)cSync()},60000);
const cloudSlugOf=user=>{const a=accounts(),l=user.toLowerCase();return Object.keys(a.users).find(k=>a.users[k].cloud&&a.users[k].user===l)||null};
async function cloudLogin(name,pw,keep){
  const A=ui.auth,err=m=>{A.err=m;A.busy=false;render()};
  A.busy=true;A.err='';render();
  const known=cloudSlugOf(name);
  try{const keys=await deriveKeys(name,pw);let r;
    try{r=await rpc('tm_load',{p_user:name,p_verifier:keys.v})}
    catch(e){ // offline: a profile already on this device can still be opened
      const u=known&&accounts().users[known];
      if(e.net&&u&&u.hash===pwHash(u.salt,pw)){ckSet(known,keys,keep);ui.auth=null;startSession(known,keep);return}
      throw e}
    if(r&&r.locked)return err(T(`Zu viele Fehlversuche. Das Konto ist zum Schutz ${r.minutes>1?r.minutes+' Minuten':'1 Minute'} gesperrt.`,`Too many failed attempts. The account is locked for ${r.minutes>1?r.minutes+' minutes':'1 minute'} for protection.`));
    if(!r)return err('Benutzername oder Passwort stimmt nicht.');
    const slug=known||'c-'+slugOf(name),acc=accounts(),old=acc.users[slug]||{},salt=old.salt||uid()+uid();
    const R=await decState(r.data,keys.k);
    acc.users[slug]=Object.assign(old,{name:(R&&R.uname)||old.name||name,user:name.toLowerCase(),cloud:true,salt,hash:pwHash(salt,pw),at:old.at||Date.now()});let local=null;try{local=JSON.parse(lsGet('startlinie.u.'+slug)||'null')}catch(e){}
    if(R&&(!local||(R.updatedAt||0)>=(local.updatedAt||0))){lsSet('startlinie.u.'+slug,JSON.stringify(R));acc.users[slug].synced=R.updatedAt||0}
    saveAccounts(acc);ckSet(slug,keys,keep);ui.auth=null;startSession(slug,keep)}
  catch(e){err(e.message)}}
async function cloudCreate(name,pw,keep){
  const A=ui.auth,err=m=>{A.err=m;A.busy=false;render()};
  A.busy=true;A.err='';A.sugg=null;render();
  try{const keys=await deriveKeys(name,pw);
    const ok=await rpc('tm_register',{p_user:name,p_verifier:keys.v,p_data:null,p_updated:0});
    if(!ok){A.sugg=await userSuggest(name);return err(`Der Benutzername «${name}» ist schon vergeben. Wähle einen anderen${A.sugg.length?', zum Beispiel:':'.'}`)}
    const slug='c-'+slugOf(name),acc=accounts(),salt=uid()+uid();
    acc.users[slug]={name,user:name.toLowerCase(),cloud:true,salt,hash:pwHash(salt,pw),at:Date.now(),synced:0};
    const legacy=lsGet(LEGACY);if(legacy&&Object.keys(acc.users).length===1){lsSet('startlinie.u.'+slug,legacy);lsSet(LEGACY,null)}
    saveAccounts(acc);ckSet(slug,keys,keep);ui.auth=null;startSession(slug,keep)}
  catch(e){err(e.message)}}
// move a profile that so far lives only on this device online
async function cloudUpgrade(){
  const f=ui.cu,err=m=>{f.err=m;f.busy=false;render()};const name=String(f.user||'').trim();
  if(!USER_RE.test(name))return err('Benutzername: 3–30 Zeichen, nur Buchstaben, Zahlen, Punkt, Binde- oder Unterstrich, ohne Leerzeichen.');
  if(String(f.pw).length<8)return err('Das Passwort braucht für die Nutzung auf allen Geräten mindestens 8 Zeichen.');
  if(f.pw!==f.pw2)return err('Die beiden Passwörter stimmen nicht überein.');
  f.busy=true;f.err='';f.sugg=null;render();
  try{const keys=await deriveKeys(name,f.pw);const st=S?Object.assign(S,{updatedAt:Date.now(),uname:name}):null;
    const ok=await rpc('tm_register',{p_user:name,p_verifier:keys.v,p_data:st?await encState(st,keys.k):null,p_updated:st?Math.round(st.updatedAt):0});
    if(!ok){f.sugg=await userSuggest(name);return err(`Der Benutzername «${name}» ist schon vergeben. Wähle einen anderen${f.sugg.length?', zum Beispiel:':'.'}`)}
    const acc=accounts(),u=acc.users[CU],salt=uid()+uid();
    Object.assign(u,{name,user:name.toLowerCase(),cloud:true,salt,hash:pwHash(salt,f.pw),synced:st?st.updatedAt:0});saveAccounts(acc);
    ckSet(CU,keys,!!lsGet(SESS));if(S)saveLocal();ui.cu=null;setSync('ok');render()}
  catch(e){err(e.message)}}
// change password: old one is checked, data is encrypted again with the new key; other devices must sign in again
async function pwChange(){
  const f=ui.pwc,err=m=>{f.err=m;f.busy=false;render()};if(f.busy)return;
  const acc=accounts(),u=acc.users[CU];if(!u)return;const cloud=isCloud(),min=cloud?8:4;
  if(!f.old||!f.n1)return err(T('Bitte altes und neues Passwort eingeben.','Please enter your old and new password.'));
  if(String(f.n1).length<min)return err(T(`Das neue Passwort braucht mindestens ${min} Zeichen.`,`The new password needs at least ${min} characters.`));
  if(f.n1!==f.n2)return err(T('Die beiden neuen Passwörter stimmen nicht überein.','The two new passwords do not match.'));
  if(f.n1===f.old)return err(T('Das neue Passwort muss anders sein als das alte.','The new password must be different from the old one.'));
  f.busy=true;f.err='';render();
  try{
    if(!cloud){if(u.hash!==pwHash(u.salt,f.old))return err(T('Das alte Passwort stimmt nicht.','The old password is wrong.'))}
    else{
      const oldK=await deriveKeys(u.user,f.old),c=ckGet();
      if(c&&c.v!==oldK.v)return err(T('Das alte Passwort stimmt nicht.','The old password is wrong.'));
      const nk=await deriveKeys(u.user,f.n1);clearTimeout(pushT);pushT=null;
      if(S&&!S.demo){S.updatedAt=Date.now();S.uname=u.name;saveLocal()}
      let r;try{r=await rpc('tm_change',{p_user:u.user,p_verifier:oldK.v,p_new_verifier:nk.v,p_data:S?await encState(S,nk.k):null,p_updated:S?Math.round(S.updatedAt):0})}
      catch(e){if(/404/.test(e.message))return err(T('Für diese Funktion muss der Online-Speicher einmal aktualisiert werden: In Supabase im SQL Editor den Inhalt von docs/sql/supabase-setup.sql nochmals ausführen.','The online storage needs a one-time update for this: run docs/sql/supabase-setup.sql again in the Supabase SQL editor.'));throw e}
      if(r===null)return err(T('Zu viele Fehlversuche. Das Konto ist vorübergehend gesperrt. Bitte später nochmals versuchen.','Too many failed attempts. The account is temporarily locked. Please try again later.'));
      if(!r)return err(T('Das alte Passwort stimmt nicht.','The old password is wrong.'));
      ckSet(CU,nk,!!lsGet(SESS));u.synced=S?S.updatedAt:0}
    const salt=uid()+uid();u.salt=salt;u.hash=pwHash(salt,f.n1);saveAccounts(acc);
    ui.pwc={done:true};if(cloud)setSync('ok');render()}
  catch(e){err(e.message)}}
function pwCard(){
  const u=accounts().users[CU];if(!u||(S&&S.demo))return'';const f=ui.pwc,cloud=isCloud();
  if(!f||f.done)return`<div class="card stack" style="gap:10px"><h3>${T('Passwort','Password')}</h3>
    ${f&&f.done?`<div class="adj" style="margin:0"><b>${T('Passwort geändert ✓','Password changed ✓')}</b>${cloud?'<br>'+T('Auf deinen anderen Geräten meldest du dich einmal mit dem neuen Passwort an.','Sign in once with the new password on your other devices.'):''}</div>`
      :`<p class="muted" style="margin:0;font-size:14.5px">${T('Nimm ein Passwort, das du sonst nirgends verwendest. Am einfachsten lässt du es vom Browser vorschlagen.','Use a password you use nowhere else. The easiest is to let your browser suggest one.')}</p>`}
    <button class="btn small ghost" style="align-self:flex-start" data-act="pwOpen">${T('Passwort ändern','Change password')}</button></div>`;
  const min=cloud?8:4;
  return`<form class="card stack" style="gap:12px" id="pwForm" autocomplete="on"><h3>${T('Passwort ändern','Change password')}</h3>
    <input type="text" name="username" autocomplete="username" value="${esc(u.name)}" hidden readonly>
    <div class="field"><label for="pwOld">${T('Aktuelles Passwort','Current password')}</label><input class="input" id="pwOld" type="password" autocomplete="current-password" value="${esc(f.old||'')}" data-bind="pwc.old"></div>
    <div class="field"><label for="pwN1">${T(`Neues Passwort (mind. ${min} Zeichen)`,`New password (at least ${min} characters)`)}</label><input class="input" id="pwN1" type="password" autocomplete="new-password" value="${esc(f.n1||'')}" data-bind="pwc.n1"></div>
    <div class="field"><label for="pwN2">${T('Neues Passwort wiederholen','Repeat new password')}</label><input class="input" id="pwN2" type="password" autocomplete="new-password" value="${esc(f.n2||'')}" data-bind="pwc.n2"></div>
    ${cloud?`<p class="hint" style="margin:0">${T('Deine Daten werden mit dem neuen Passwort neu verschlüsselt. Auf anderen Geräten meldest du dich danach einmal neu an.','Your data is encrypted again with the new password. On other devices you sign in again once.')}</p>`:''}
    ${f.err?`<div class="err">${esc(f.err)}</div>`:''}
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="pwCancel">${T('Abbrechen','Cancel')}</button><button type="submit" class="btn primary" data-act="pwSave" ${f.busy?'disabled':''}>${f.busy?T('Einen Moment …','One moment …'):T('Passwort ändern','Change password')}</button></div></form>`}
function accCard(){
  const u=accounts().users[CU]||{};
  if(u.cloud)return`<div class="card stack" style="gap:10px"><h3>Konto & Geräte</h3><p class="muted" style="margin:0;font-size:14.5px">Benutzername <b>${esc(u.name)}</b>. Melde dich auf Handy oder Laptop mit diesem Benutzernamen und deinem Passwort an, dann hast du überall dasselbe Profil. Die Daten werden verschlüsselt gespeichert und automatisch abgeglichen.</p>
    <div class="row" style="gap:10px;align-items:center"><button class="btn small ghost" data-act="syncNow">Jetzt synchronisieren</button><button class="btn small ghost" data-act="mergeNow">${T('Mit Konto zusammenführen','Merge with account')}</button><span class="hint">${sync==='ok'?'Synchronisiert ✓':sync==='busy'?'Synchronisiere …':sync==='auth'?'Anmeldung abgelaufen, bitte neu anmelden.':'Offline. Wird nachgeholt, sobald eine Verbindung besteht.'}</span></div></div>`;
  if(!CLOUD)return'';
  const f=ui.cu;
  if(!f)return`<div class="card stack" style="gap:10px"><h3>Konto & Geräte</h3><p class="muted" style="margin:0;font-size:14.5px">Dieses Profil ist nur auf diesem Gerät gespeichert. Mit einem Benutzernamen kannst du es auch auf dem Handy oder Laptop nutzen; Plan und Einträge werden übernommen.</p><button class="btn small blue" style="align-self:flex-start" data-act="cuOpen">Auf allen Geräten nutzen</button></div>`;
  return`<div class="card stack" style="gap:12px"><h3>Auf allen Geräten nutzen</h3>
    <div class="field"><label for="cuUser">Benutzername</label><input class="input" id="cuUser" autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(f.user||'')}" data-bind="cu.user"></div>
    ${f.sugg&&f.sugg.length?`<div class="seg">${f.sugg.map(x=>`<button type="button" class="opt" data-act="cuPick" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:''}
    <div class="field"><label for="cuPw">Passwort (mind. 8 Zeichen)</label><input class="input" id="cuPw" type="password" autocomplete="new-password" value="${esc(f.pw||'')}" data-bind="cu.pw"></div>
    <div class="field"><label for="cuPw2">Passwort wiederholen</label><input class="input" id="cuPw2" type="password" autocomplete="new-password" value="${esc(f.pw2||'')}" data-bind="cu.pw2"></div>
    <p class="hint" style="margin:0">Auf dem anderen Gerät meldest du dich danach mit diesem Benutzernamen und Passwort an. Die Daten werden mit deinem Passwort verschlüsselt. Ohne Passwort lassen sie sich nicht wiederherstellen.</p>
    ${f.err?`<div class="err">${esc(f.err)}</div>`:''}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="cuCancel">Abbrechen</button><button class="btn primary" data-act="cuSave" ${f.busy?'disabled':''}>${f.busy?'Einen Moment …':'Übernehmen'}</button></div></div>`;
}

function startSession(slug,keep){ui.icsMsg='';ui.pwc=null;CU=slug;ssSet(SESS,slug);lsSet(SESS,keep?slug:null);const a=accounts();a.last=slug;saveAccounts(a);
  S=loadLocal();sync='local';docRef=null;ui.tab='home';ui.ob=null;ui.sheet=null;if(S)weeklyCheck();render();connect();setTimeout(()=>{if(typeof takeShared==='function')takeShared()},600)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.menu){ui.menu=false;renderHdr();const a=document.querySelector('.avatar');if(a)a.focus()}});
function logout(){ui.menu=false;clearTimeout(saveT);if(S&&!S.demo)saveLocal();if(isCloud()){const slug=CU;if(pushT&&S&&!S.demo){clearTimeout(pushT);pushT=null;cPush(S,slug).catch(()=>{}).finally(()=>ckSet(slug,null))}else ckSet(slug,null)}CU=null;S=null;docRef=null;ssSet(SESS,null);lsSet(SESS,null);ui.sheet=null;ui.auth={mode:'login',name:accounts().last?accounts().users[accounts().last].name:'',pw:'',pw2:'',keep:false,err:''};render()}
async function authSubmit(){
  const A=ui.auth,name=String(A.name).trim(),slug=slugOf(name),acc=accounts();
  const err=m=>{A.err=m;render()};
  if(A.busy)return;
  if(CLOUD&&A.mode==='login'){const loc=acc.users[slug];
    if(!(loc&&!loc.cloud&&loc.hash===pwHash(loc.salt,A.pw))){if(!name||!A.pw)return err('Bitte Benutzername und Passwort eingeben.');return cloudLogin(name,A.pw,A.keep)}}
  if(CLOUD&&A.mode==='create'){
    if(!USER_RE.test(name))return err('Benutzername: 3–30 Zeichen, nur Buchstaben, Zahlen, Punkt, Binde- oder Unterstrich, ohne Leerzeichen.');
    if(String(A.pw).length<8)return err('Das Passwort braucht mindestens 8 Zeichen.');
    if(A.pw!==A.pw2)return err('Die beiden Passwörter stimmen nicht überein.');
    return cloudCreate(name,A.pw,A.keep)}
  if(name.length<2)return err('Bitte einen Namen mit mindestens 2 Zeichen eingeben.');
  if(String(A.pw).length<4)return err('Das Passwort braucht mindestens 4 Zeichen.');
  if(A.mode==='create'){
    if(acc.users[slug])return err('Diesen Namen gibt es auf diesem Gerät schon. Melde dich an oder wähle einen anderen Namen.');
    if(A.pw!==A.pw2)return err('Die beiden Passwörter stimmen nicht überein.');
    const salt=uid()+uid();acc.users[slug]={name,salt,hash:pwHash(salt,A.pw),at:Date.now()};
    const legacy=lsGet(LEGACY);if(legacy&&Object.keys(acc.users).length===1){lsSet('startlinie.u.'+slug,legacy);lsSet(LEGACY,null)}
    saveAccounts(acc);ui.auth=null;startSession(slug,A.keep);return;
  }
  let u=acc.users[slug];
  if(!u)return err('Kein Konto mit diesem Namen auf diesem Gerät. Erstelle unter «Neues Konto» eines.');
  if(u.hash!==pwHash(u.salt,A.pw))return err('Das Passwort stimmt nicht.');
  ui.auth=null;startSession(slug,A.keep);
}

function goalCard(){
  const f=ui.gf,g=curGoal(),m=mainRace(S),t=today(),fi=fitInfo(S.profile);
  if(f)return`<div class="card stack" style="gap:14px" id="goalCard"><h3>${T('Ziel ändern','Change goal')}</h3>${goalFormHTML(f,'gf')}
    ${f.goalMode==='race'?`<p class="hint" style="margin:0">${T('Rennen trägst du unter «Rennen» ein und wählst dort «Eigener Vorbereitungsplan».','Add races under «Races» and choose «Dedicated training plan» there.')}</p>`:''}
    ${ui.gfErr?`<div class="err">${esc(ui.gfErr)}</div>`:''}<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="gfCancel">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="gfSave">${f.goalMode==='race'?T('Zu den Rennen','Go to races'):T('Übernehmen','Apply')}</button></div></div>`;
  const txt=S.plan.mode==='fit'?T(`Fit werden & bleiben: Ziel-Umfang ${fi.km} km pro Woche (≈ ${fi.min} min), danach Erhalt.`,`Get & stay fit: target volume ${fi.km} km per week (≈ ${fi.min} min), then maintenance.`)
    :g?T(`${esc(g.name)} · Zieltest am ${fdate(g.date)}`,`${esc(g.name)} · goal test on ${fdate(g.date)}`)
    :m&&m.date>=t?T(`Rennen: ${esc(m.name)} am ${fdate(m.date)}`,`Race: ${esc(m.name)} on ${fdate(m.date)}`):T('Kein aktives Ziel. Der Plan hält deine Form.','No active goal. The plan keeps your form.');
  return`<div class="card stack" style="gap:10px" id="goalCard"><div class="spread"><h3>${T('Dein Ziel','Your goal')}</h3><button class="btn small ghost" data-act="goalOpen">${T('Ändern','Change')}</button></div><p class="muted" style="margin:0;font-size:14.5px">${txt}</p>${(()=>{const r=g||(m&&m.date>=t?m:null),k=courseOf(r);return k?courseChip(r)+`<p class="hint" style="margin:0">${k.note}</p>`:''})()}</div>`;
}

function zoneTools(){const M=S.profile.zonesManual;
  return`${M?`<div class="adj" style="margin-top:10px">${T('Von dir angepasst. Angepasste Werte bleiben fix; die automatische Anpassung gilt nur noch für Zonen ohne eigene Werte.','Adjusted by you. Adjusted values stay fixed; automatic calibration only applies to zones without your own values.')}</div>`:''}
  <div class="row" style="margin-top:10px"><button class="btn small ghost" data-act="zfOpen">${T('Zonen anpassen','Adjust zones')}</button>${M?`<button class="btn small ghost" data-act="zfReset">${T('Auf berechnete Werte zurücksetzen','Reset to calculated values')}</button>`:''}</div>`}
function zoneEditHTML(c){const f=ui.zf,zn={Z1:T('Regeneration','Recovery'),Z2:T('Grundlage','Base'),Z3:'Marathon',Z4:T('Schwelle','Threshold'),Z5:'VO₂max'};
  const inp=(k,ph)=>`<input class="input" style="width:100%;min-width:0;padding-inline:8px" inputmode="${/p\d$/.test(k)?'decimal':'numeric'}" ${/p\d$/.test(k)?'data-fmt="pace"':''} placeholder="${ph}" value="${esc(f[k])}" data-bind="zf.${k}">`;
  return`<div class="card stack" style="gap:12px" id="zoneCard"><h3>${T('Zonen anpassen','Adjust zones')}</h3>
    <p class="hint" style="margin:0">${T('Vorgeschlagen sind die aktuell berechneten Werte. Puls in Schlägen pro Minute, Pace als min:sek pro km. Pace-Felder kannst du leer lassen, dann rechnet die App sie weiter selbst.','The currently calculated values are pre-filled. Heart rate in beats per minute, pace as min:sec per km. Leave pace fields empty to keep them calculated.')}</p>
    <div class="zedit">${['Z1','Z2','Z3','Z4','Z5'].map(z=>`<div class="zrow"><div class="zrow-h"><span class="pill zp ${z}">${z}</span> <span class="muted" style="font-size:13px">${zn[z]}</span></div>
      <div class="zrow-f"><span class="zl">♥</span>${inp(z+'h0',T('von','from'))}<span>–</span>${inp(z+'h1',T('bis','to'))}</div>
      <div class="zrow-f"><span class="zl">/km</span>${inp(z+'p0','4:30')}<span>–</span>${inp(z+'p1','5:00')}</div></div>`).join('')}</div>
    <p class="hint" style="margin:0">${T('Die Obergrenze der Pulszone ist bei passenden Einheiten dein Pulsdeckel.','The upper heart-rate limit of a zone is your heart-rate cap for suitable sessions.')}</p>
    ${ui.zfErr?`<div class="err">${esc(ui.zfErr)}</div>`:''}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="zfCancel">${T('Abbrechen','Cancel')}</button><button class="btn primary" data-act="zfSave">${T('Speichern','Save')}</button></div></div>`}
function renderLogin(){
  const A=ui.auth,acc=accounts(),names=Object.entries(acc.users),create=A.mode==='create';
  if(A.forgot){const u=acc.users[slugOf(A.name)];
    return`<div class="auth stack" style="gap:16px"><h1 class="ob-h">Passwort vergessen</h1>
      <p class="muted" style="margin:0">Das Passwort ist nur auf diesem Gerät gespeichert und kann nicht wiederhergestellt werden. Du kannst das Profil löschen und neu beginnen. Dabei gehen Plan, Einträge und Bestleistungen dieses Profils verloren.</p>
      ${u?`<div class="card stack" style="gap:10px"><div><b>${esc(u.name)}</b></div>${A.delAsk?`<button class="btn danger" data-act="authDel">Profil «${esc(u.name)}» endgültig löschen</button>`:`<button class="btn ghost" data-act="authDelAsk">Profil löschen</button>`}</div>`:'<p class="hint">Gib zuerst oben beim Anmelden deinen Namen ein.</p>'}
      <button class="link" data-act="authBack">Zurück zur Anmeldung</button></div>`}
  return`<div class="auth stack" style="gap:18px">
    ${langSw()}<div class="authart">${shoeSVG()}${trailSVG(6,6,'var(--line)','var(--line)')}</div>
    <div><div class="label">Tempomacher · dein Lauf-Coach</div><h1 class="ob-h" style="margin-top:6px">${create?'Schuhe schnüren, Konto erstellen':'Willkommen zurück'}</h1></div>
    <div class="auth-tabs"><button data-act="authMode" data-v="login" aria-pressed="${!create}">Anmelden</button><button data-act="authMode" data-v="create" aria-pressed="${create}">Neues Konto</button></div>
    ${!create&&names.length?`<div class="field"><span class="flabel">Profile auf diesem Gerät</span><div class="seg">${names.map(([k,u])=>`<button type="button" class="opt" data-act="authPick" data-v="${esc(u.name)}" aria-pressed="${slugOf(A.name)===k}">${esc(u.name)}</button>`).join('')}</div></div>`:''}
    <form class="stack" style="gap:14px" id="authForm">
      <div class="field"><label for="authName">${CLOUD?'Benutzername':'Name'}</label><input class="input" id="authName" autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(A.name)}" data-bind="auth.name"></div>
      ${A.sugg&&A.sugg.length&&create?`<div class="seg">${A.sugg.map(x=>`<button type="button" class="opt" data-act="authSugg" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:''}
      <div class="field"><label for="authPw">Passwort</label><input class="input" id="authPw" type="password" autocomplete="${create?'new-password':'current-password'}" value="${esc(A.pw)}" data-bind="auth.pw"></div>
      ${create?`<div class="field"><label for="authPw2">Passwort wiederholen</label><input class="input" id="authPw2" type="password" autocomplete="new-password" value="${esc(A.pw2)}" data-bind="auth.pw2"></div>`:''}
      <label class="row" style="font-size:14.5px;gap:8px"><input type="checkbox" id="authKeep" ${A.keep?'checked':''} data-bind="auth.keep"> Angemeldet bleiben</label>
      ${A.err?`<div class="err">${esc(A.err)}</div>`:''}
      <button class="btn primary block" type="submit" ${A.busy?'disabled':''}>${A.busy?'Einen Moment …':create?'Konto erstellen':'Anmelden'}</button>
    </form>
    ${A.legacy&&create?'<div class="adj">Auf diesem Gerät gibt es schon einen Plan. Er wird automatisch in dein neues Konto übernommen.</div>':''}
    <div class="spread">${create?'<span></span>':'<button class="link" data-act="authForgot">Passwort vergessen?</button>'}<button class="link" data-act="demo">Beispiel ansehen</button></div>
    ${CLOUD?'<p class="hint" style="margin:0">Mit Benutzername und Passwort meldest du dich auf Handy und Laptop mit demselben Profil an. Deine Daten werden auf dem Gerät mit deinem Passwort verschlüsselt, bevor sie gespeichert werden; lesen kann sie nur, wer das Passwort kennt. Darum gibt es kein «Passwort vergessen»: am besten im Passwort-Manager speichern. Im Profil kannst du zusätzlich jederzeit eine Sicherungsdatei herunterladen.</p></div>':'<p class="hint" style="margin:0">Jede Person hat ein eigenes Profil mit eigenem Plan. Alle Daten bleiben nur auf diesem Gerät und in diesem Browser. Auf einem anderen Gerät startet Tempomacher leer.</p></div>'}`;
}
(async()=>{if(!window.claude||!window.claude.use)return;try{dlNS=await window.claude.use('downloads')}catch(e){dlNS=null}})();
(async()=>{if(!window.claude||!window.claude.use)return;try{sampleFn=await window.claude.use('sample')}catch(e){sampleFn=null}if(sampleFn)render()})();

function newState(o){
  const cur=monday(today()),start=dow(today())>=4?addD(cur,7):cur;
  const race=o.mode==='fit'?null:o.mode==='goal'?{id:uid(),name:goalName(o.raceDist,o.goal),date:o.raceDate,dist:o.raceDist,goal:o.goal||null,rel:'high',plan:'own',prio:'A',adapt:true,virtual:true}:{id:uid(),name:o.raceName.trim()||`${fk(o.raceDist)}-km-Lauf`,date:o.raceDate,dist:o.raceDist,goal:o.goal||null,rel:'high',plan:'own',prio:'A',adapt:true};
  return{v:2,demo:false,profile:{age:o.age,birth:o.birth||null,sex:o.sex,exp:o.exp,ref:o.ref,runs:o.runs,km:o.km,days:o.daysSel.length,daysSel:o.daysSel,longDay:o.longDay,hrMax:o.hrMax||null,hrRest:o.hrRest||null,pace:o.pace||null,fitMin:o.fitMin||null},
    races:race?[race]:[],adapt:{vdotAdj:0,volFactor:1,lastEval:cur,history:[]},plan:{mode:o.mode||'race',startMonday:start,mainId:race?race.id:null,weeks:[],rw:o.exp===0||(o.exp===1&&o.km<10)?{stage:o.exp===0&&o.km<5?0:o.km<10?1:2}:null},checkins:{},logs:{},extra:[],pbs:o.ref?[{id:'p0',dist:o.ref.dist,sec:o.ref.sec,date:today(),name:'Referenzzeit beim Start'}]:[],updatedAt:Date.now()};
}
function makeDemo(){
  const t=today(),cur=monday(t),start=addD(cur,-42);
  const st={v:2,demo:true,profile:{age:34,sex:'m',exp:2,ref:{dist:10,sec:47*60+30},runs:4,km:32,days:4,daysSel:[1,3,5,6],longDay:6,hrMax:188,hrRest:54},
    races:[{id:'a1',name:'Herbst-Halbmarathon',date:addD(cur,7*10+6),dist:21.1,goal:105*60,rel:'high',plan:'own',prio:'A',adapt:true},
      {id:'b1',name:'Stadtlauf 10 km',date:addD(cur,7*3+5),dist:10,goal:null,rel:'mid',plan:'taper',prio:'B',adapt:true}],
    adapt:{vdotAdj:0,volFactor:1,lastEval:start,history:[]},plan:{startMonday:start,mainId:'a1',weeks:[]},checkins:{},logs:{},extra:[],updatedAt:1};
  const prev=S;S=st;setPrep(true);regenerate();
  let seed=11;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  for(let dte=start;dte<t;dte=addD(dte,1)){
    const s=planSession(dte);if(!s||s.type==='rest')continue;
    if(rnd()<.07){st.logs[dte]={s,done:false,at:1};continue}
    const wk=daysBetween(start,dte)/7,E=RPE[s.type]||[3,5];
    if(s.type==='alt'){st.logs[dte]={s,done:true,km:0,dur:45,hr:118,rpe:3,at:1};continue}
    const base=s.pace?mid2(s.pace):mid2(ctxFor(st).pc.E);
    const hrT=s.quality&&s.hr?mid2(s.hr):141,late=wk>=4&&s.quality?.975:1;
    st.logs[dte]={s,done:true,interval:s.interval,pace:Math.round((s.quality?base*late:mid2(ctxFor(st).pc.E))*(1.03-.006*wk+(rnd()-.5)*.02)),
      hr:Math.round(hrT+(rnd()-.5)*5),elev:s.interval?null:Math.floor(rnd()*2),rpe:Math.round(mid2(E)),at:1};
    {const L=st.logs[dte];L.type=rtOfPlan(s.type);L.km=s.km;L.src=rnd()<.7?'fit':'manual';if(s.interval)L.reps=5+Math.floor(rnd()*3);
     if(s.type==='long'){L.km=r05(Math.max(s.km+3,15.5+wk*.4));if(L.km>15)L.dec=Math.round((8.2-.75*wk+(rnd()-.5)*1.2)*10)/10}}
    st.checkins[dte]={pain:0,feel:rnd()<.5?1:0,at:1};
  }
  st.pbs=[{id:'p1',dist:10,sec:49*60+30,date:addD(t,-330),name:'Silvesterlauf'},{id:'p2',dist:10,sec:47*60+30,date:addD(t,-45),name:'Stadtlauf'},{id:'p3',dist:5,sec:23*60+10,date:addD(t,-220),name:'Parkrun'},{id:'p4',dist:5,sec:22*60+5,date:addD(t,-70),name:'Parkrun'},{id:'p5',dist:21.0975,sec:6720,date:addD(t,-260),name:'Frühlings-Halbmarathon'},{id:'p6',dist:21.0975,sec:6450,date:addD(t,-120),name:'Seelauf'},{id:'p7',dist:15,sec:76*60,date:addD(t,-160),name:'Bergsprint 15 km'}];
  st.extra.push({id:'x1',date:addD(cur,-4),s:{type:'alt',title:'Velo',km:0,zone:'Z2'},done:true,km:0,dur:70,hr:125,rpe:4,at:1});
  for(let m=start;addD(m,14)<=cur;m=addD(m,14)){const r=evaluateWeek(m,2);r.at=1;r.seen=addD(m,14)!==blockStartOf(cur)||cur!==blockStartOf(cur);applyEval(r)}
  st.adapt.lastEval=cur;regenerate();
  S=prev;return st;
}

/* ============ UI state ============ */
const ui={tab:'home',trainView:'log',sheet:null,ob:null,ci:{pain:null,sleep:null,legs:null,rhr:''},shoeF:{name:'',km0:'',lim:'700'},lf:null,rf:null,pf:null,lab:null,skip:{reason:null},auth:null,pbView:'pace',openW:{},coach:{text:'',busy:false,err:''},resetAsk:false,obErr:''};
function freshOb(){return{step:0,age:'',birth:'',sex:'',exp:null,refOn:true,refDist:10,refCustom:'',rh:'',rm:'',rs:'',hrMax:'',hrRest:'',runs:3,km:20,over150:false,kmBig:160,
  raceName:'',raceDist:'',raceCustom:'',raceDate:'',gh:'',gm:'',gs:'',daysSel:[],longDay:null,pace:'',goalMode:null,healthOk:false,gDist:10,gCustom:'',gType:'finish',gp:'',gDate:'',fitMin:null}}

/* ============ running graphics ============ */
const FOOT='M5.5 0C8.6 0 10 3.4 10 7.2c0 3.2-1.2 5.3-1.7 7.2-.3 1.3.1 2.6-.3 4.2-.5 2-3.9 2.2-4.5.2-.4-1.3.2-2.6-.2-4.3C2.6 12.7 1 10.4 1 7.2 1 3.3 2.4 0 5.5 0z';
// footprints walking to the right; the first `on` prints are filled
function trailSVG(n,on,col,off){let s='';for(let i=0;i<n;i++){const x=4+i*27,y=i%2?19:3;
  s+=`<path d="${FOOT}" transform="translate(${x+21} ${y}) rotate(90) scale(.86)" fill="${i<on?col:off}"/>`}
  return`<svg class="trail" viewBox="0 0 ${n*27+4} 30" preserveAspectRatio="xMinYMid meet" aria-hidden="true">${s}</svg>`}
const FLAG=`<svg class="flag" viewBox="0 0 26 30" aria-hidden="true"><rect x="2" y="1" width="2.4" height="29" rx="1.2" fill="currentColor"/>
  <g transform="translate(4.4 2)">${[0,1,2,3].map(r=>[0,1,2,3].map(c=>`<rect x="${c*5}" y="${r*4}" width="5" height="4" fill="${(r+c)%2?'#fff':'#0E1B1B'}"/>`).join('')).join('')}</g></svg>`;
// stadium track (oval lanes) used as hero background
const TRACK=`<svg class="trackbg" viewBox="0 0 320 200" aria-hidden="true">${[0,1,2,3,4].map(i=>`<rect x="${20+i*14}" y="${20+i*14}" width="${280-i*28}" height="${160-i*28}" rx="${80-i*14}" fill="none" stroke="#fff" stroke-width="1.6" opacity="${.22-i*.03}"/>`).join('')}
  <line x1="140" y1="6" x2="140" y2="76" stroke="#fff" stroke-width="2" opacity=".25" stroke-dasharray="4 4"/></svg>`;
// side-view running shoe with laces (original drawing)
function shoeSVG(cls){return`<svg class="${cls||'shoe'}" viewBox="0 0 220 110" aria-hidden="true">
  <g stroke-linecap="round" fill="none" stroke="var(--hot)" stroke-width="4" opacity=".85"><path d="M2 52h26"/><path d="M8 64h22"/><path d="M0 76h24"/></g>
  <path d="M30 88c-2 8 4 12 14 12h150c12 0 18-4 16-12z" fill="var(--ink)"/>
  <path d="M28 78h176c5 0 8 4 6 10H32c-5 0-6-6-4-10z" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>
  <path d="M34 78c0-20 6-34 20-40l28-8c10-3 15-13 24-16l12-3c8-1 13 4 18 11 12 16 32 28 56 32 16 3 22 10 20 24z" fill="var(--band)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
  <path d="M54 38c4-12 16-18 30-16" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
  <path d="M70 66c30-4 62-10 92-8" fill="none" stroke="var(--hot)" stroke-width="5" stroke-linecap="round"/>
  <path d="M84 72c26-3 52-6 80-5" fill="none" stroke="var(--band-muted)" stroke-width="3" stroke-linecap="round"/>
  ${[[106,16],[116,24],[126,33],[136,42]].map(([x,y])=>`<circle cx="${x}" cy="${y+6}" r="2.6" fill="var(--surface)"/>`).join('')}
  <path d="M104 24l14 6M114 31l-10 2M116 30l12 8M126 38l-12 2M128 39l12 9" stroke="var(--surface)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M106 22c-8-14-22-12-20-4s14 6 20 4c10-8 26-10 22-2s-16 6-22 2" fill="none" stroke="var(--hot)" stroke-width="2.6" stroke-linecap="round"/>
</svg>`}
// onboarding progress drawn as shoe eyelets with a lace crossing the completed steps
function laceSVG(n,done){const W=300,x=i=>14+i*(W-28)/(n-1);let s='';
  for(let i=0;i<n-1;i++){const on=i<done;s+=`<path d="M${x(i)} 7L${x(i+1)} 23M${x(i)} 23L${x(i+1)} 7" stroke="${on?'var(--hot)':'var(--line)'}" stroke-width="${on?3:2}" stroke-linecap="round"/>`}
  for(let i=0;i<n;i++)s+=`<circle cx="${x(i)}" cy="7" r="4.5" fill="var(--surface)" stroke="${i<=done?'var(--blue)':'var(--line)'}" stroke-width="2.4"/><circle cx="${x(i)}" cy="23" r="4.5" fill="var(--surface)" stroke="${i<=done?'var(--blue)':'var(--line)'}" stroke-width="2.4"/>`;
  return`<svg class="lace" viewBox="0 0 ${W} 30" aria-hidden="true">${s}</svg>`}

/* ============ rendering ============ */
const ICONS={
  home:'<svg viewBox="0 0 24 24"><path d="M4 11l8-6.5 8 6.5V20h-5v-5h-6v5H4z"/></svg>',
  train:'<svg viewBox="0 0 24 24"><path d="M2.5 17.5V11l3-4h2.5l1.5 2.5 3.5-1 3.5 3.5 4 1c1 .3 1.5 1.2 1.5 2.2v2.3z"/><path d="M2.5 20.5h19M10 9.5l1 1.5M12.5 9l1 1.5"/></svg>',

  races:'<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  form:'<svg viewBox="0 0 24 24"><path d="M3 18l5-6 4 3 7-9"/><path d="M15 6h4v4"/></svg>',
  me:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>'
};
const opt=(act,k,v,label,cur,cls='',dis=false)=>`<button type="button" class="opt ${cls}" data-act="${act}" data-k="${k}" data-v="${v}" aria-pressed="${String(cur)===String(v)}" ${dis?'disabled':''}>${label}</button>`;
function renderHdr(){
  const syncT=!isCloud()?'auf diesem Gerät':sync==='busy'?'synchronisiere …':sync==='ok'?'synchronisiert ✓':sync==='auth'?'<button class="link" data-act="logout">Bitte neu anmelden</button>':'offline, wird nachgeholt';
  const u=CU&&accounts().users[CU];
  $('#hdr').innerHTML=`<div class="hdr-in"><div class="word"><span class="logo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 6l6 6-6 6" style="stroke:var(--band-muted)"/><path d="M12 6l6 6-6 6" style="stroke:var(--hot)"/></svg></span>Tempomacher</div>
    <div class="hdr-meta">${S&&S.demo?`<button class="demo-chip" data-act="leaveDemo">${T('Beispiel beenden','End example')}</button>`:''}${u||(S&&S.demo)?`<button class="avatar ${ui.tab==='me'?'on':''}" data-act="menu" aria-haspopup="menu" aria-expanded="${!!ui.menu}" aria-label="${T('Konto','Account')}${u?': '+esc(u.name):''}"><span>${u?esc(String(u.name).trim().charAt(0).toUpperCase()||'?'):'B'}</span>${isCloud()?`<i class="sync ${sync}" title="${syncT.replace(/<[^>]*>/g,'')}"></i>`:''}</button>`:fdate(today())}</div>
    ${ui.menu?`<div class="umenu" role="menu"><div class="um-h"><b>${u?esc(u.name):T('Beispiel','Example')}</b><span>${u?(isCloud()?syncT.replace(/<[^>]*>/g,''):T('Nur auf diesem Gerät','On this device only')):T('Beispielprofil','Example profile')}</span></div>
      <button role="menuitem" data-act="tab" data-v="me">${ICONS.me}${T('Profil','Profile')}</button>
      <button role="menuitem" data-act="tools" data-v="calc"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4"/></svg>${T('Rechner','Calculators')}</button>
      <button role="menuitem" data-act="tools" data-v="learn"><svg viewBox="0 0 24 24"><path d="M4 5c3-1 5-1 8 1 3-2 5-2 8-1v13c-3-1-5-1-8 1-3-2-5-2-8-1z"/><path d="M12 6v13"/></svg>${T('Wissen','Knowledge')}</button>
      ${u?`<button role="menuitem" class="out" data-act="logout"><svg viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>${T('Abmelden','Sign out')}</button>`:`<button role="menuitem" class="out" data-act="leaveDemo"><svg viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>${T('Beispiel beenden','End example')}</button>`}</div>`:''}</div>`;
}
function renderTabs(){
  const t=$('#tabs');if(!S||(!CU&&!S.demo)){t.hidden=true;return}t.hidden=false;
  const tabs=[['home','Übersicht'],['train','Training'],['form',T('Fortschritt','Progress')],['races',T('Ziele','Goals')]];
  t.innerHTML=`<div class="in">${tabs.map(([k,l])=>`<button data-act="tab" data-v="${k}" ${ui.tab===k?'aria-current="page"':''}>${ICONS[k]}${l}</button>`).join('')}</div>`;
}
function render(){try{renderInner();addInfo($('#app'))}catch(e){showFatal((e&&e.stack)||e)}}
const APP_VER='3.4.0';
const footer=()=>`<footer class="copy">© ${new Date().getFullYear()} Ramon Betschart. Alle Rechte vorbehalten.<br><span style="opacity:.7">Version ${APP_VER}</span></footer>`;
function renderInner(){
  if(S)migrate();
  const app=$('#app');renderHdr();
  if(!CU&&!(S&&S.demo)){if(!ui.auth)ui.auth={mode:Object.keys(accounts().users).length?'login':'create',name:'',pw:'',pw2:'',keep:false,err:''};app.innerHTML=renderLogin()+footer();renderTabs();renderSheet();return}
  if(!S){if(!ui.ob)ui.ob=freshOb();app.innerHTML=renderOnboarding()+footer()}
  else{app.classList.toggle('enter',lastView!==ui.tab);lastView=ui.tab;app.innerHTML=({home:renderHome,train:renderTrain,form:renderForm,races:renderRaces,me:renderMe}[ui.tab]||renderHome)()+footer()}
  renderTabs();renderSheet();
}
let lastView='';

