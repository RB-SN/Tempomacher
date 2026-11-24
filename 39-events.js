/* ---- events ---- */
document.addEventListener('click',e=>{if(ui.menu&&!e.target.closest('.umenu,.avatar')){ui.menu=false;renderHdr()}const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const f=ACT[el.dataset.act];if(f){e.preventDefault();f(el,e)}});
function setBind(el){
  const[root,key]=el.dataset.bind.split('.');const o=ui[root];if(!o)return;
  o[key]=el.type==='checkbox'?el.checked:(el.type==='range'?+el.value:el.value);
  if(key==='birth'){const a=ageFrom(o.birth);o.age=a||''}
  const live=el.dataset.live;
  if(live==='ref'){const x=$('#refLive');if(x)x.innerHTML=refLive(ui.ob)}
  if(live==='km'){const x=$('#kmVal');if(x)x.textContent=o.km+' km'}
  if(live==='pb'){const x=$('#pbLive');if(x)x.innerHTML=pbLive()}
  if(live==='prep'){const x=$('#prepLive');if(x)x.innerHTML=prepLive(ui.ob)}
  if(live==='goal'){const x=$('#goalLive');if(x)x.innerHTML=goalLive(ui.ob)}
  if(live==='alt'){const x=$('#altCalc');if(x)x.innerHTML=altCalc(ui.lf)}
  if(live==='rpe'){$('#rpeVal').textContent=o.rpe;const s=$('#rpeLbl');s.innerHTML=s.innerHTML.replace(/^[^<]*/,RPEL[o.rpe])}
  if(el.dataset.rerender)render();
}
document.addEventListener('change',e=>{const el=e.target,f=el&&el.dataset&&el.dataset.fmt;if(!f)return;let v=String(el.value||'').trim().replace(/\s+/g,'').replace(/[.,;]/g,':');
  if(f==='pace'&&/^\d{3,4}$/.test(v)&&!/^\d{1,2}$/.test(v))v=v.slice(0,-2)+':'+v.slice(-2);
  if(v!==el.value){el.value=v;if(el.dataset.bind)setBind(el)}});
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.bind&&e.target.type!=='checkbox'&&e.target.type!=='date')setBind(e.target)});
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.bind&&(e.target.type==='checkbox'||e.target.type==='date'))setBind(e.target);
  if(e.target.id==='rdW'){const v=pnum(e.target.value);S.profile.weight=v>=30&&v<=200?Math.round(v*10)/10:null;save();renderSheet();return}
  if(e.target.id==='lfGain'&&ui.lf&&ui.sheet&&ui.sheet.kind==='run'){const g=pnum(e.target.value);if(!Number.isNaN(g)&&g>=0&&g<=6000&&ui.lf.kind!=='alt'){ui.lf.elev=elevIdx(g);document.querySelectorAll('[data-act=lfSet][data-k=elev]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===ui.lf.elev)))}}});
async function onFiles(e){importFiles([...(e.target.files||[])])}
async function importFiles(files){if(!files.length||!S)return;
  const imgs=files.filter(isImg),file=files.find(f=>!isImg(f));ui.impShot=!!imgs.length&&!file;
  (ui.thumbs||[]).forEach(u=>{try{URL.revokeObjectURL(u)}catch(x){}});ui.thumbs=imgs.length&&!file?imgs.slice(0,4).map(f=>URL.createObjectURL(f)):null;
  ui.sheet={kind:'busy'};renderSheet();
  try{const a=imgs.length&&!file?await readShots(imgs):await readRuns(files.filter(f=>!isImg(f)));
    if(a.batch){openBatch(a.batch,a.lost);return}
    if(a.date>today())throw new Error('Das Datum der Aktivität liegt in der Zukunft.');openImport(a)}
  catch(err){ui.impErr=(err&&err.message)||'Die Datei konnte nicht gelesen werden.';ui.sheet={kind:'impErr'};renderSheet()}}
document.getElementById('fileIn').addEventListener('change',onFiles);
// faster import: paste a screenshot (Ctrl/Cmd+V) or drop files anywhere
document.addEventListener('paste',e=>{if(!S||!CU&&!S.demo)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
  const fs=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(isImg);if(!fs.length)return;e.preventDefault();ui.impFor=null;ui.altPick=null;importFiles(fs)});
document.addEventListener('dragover',e=>{if(S&&e.dataTransfer&&[...e.dataTransfer.types].includes('Files')){e.preventDefault();document.body.classList.add('dropping')}});
document.addEventListener('dragleave',e=>{if(!e.relatedTarget)document.body.classList.remove('dropping')});
document.addEventListener('drop',e=>{document.body.classList.remove('dropping');if(!S||!e.dataTransfer)return;const fs=[...e.dataTransfer.files];if(!fs.length)return;e.preventDefault();ui.impFor=null;ui.altPick=null;importFiles(fs)});
// shared from the watch app (Android: «Teilen» → Tempomacher): the service worker parks the files, the app picks them up
async function takeShared(){if(!/[?&]shared=1/.test(location.search)||!S||!('caches' in window))return;
  try{history.replaceState(null,'',location.pathname)}catch(x){}
  try{const c=await caches.open('tm-share'),ks=await c.keys(),fs=[];for(const k of ks){const r=await c.match(k);const b=await r.blob();fs.push(new File([b],decodeURIComponent(k.url.split('/').pop())||'shot.png',{type:b.type}));await c.delete(k)}
    if(fs.length){ui.impFor=null;ui.altPick=null;importFiles(fs)}}catch(x){}}
document.getElementById('shotIn').addEventListener('change',onFiles);
document.getElementById('gpxIn').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0],r=S&&S.races.find(x=>x.id===ui.courseFor);if(!f||!r)return;
  try{r.course=courseFromGpx(await f.text(),r.dist);ui.courseErr=null;save()}catch(err){ui.courseErr=err.message||String(err)}render()});
document.getElementById('bakIn').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f||!S)return;
  try{const j=JSON.parse(await f.text()),st=j&&j.state;if(!j||j.app!=='tempomacher'||!st||!st.profile||!st.plan)throw 0;
    ui.bak={state:st,exported:j.exported||Date.now(),n:Object.keys(st.logs||{}).length+(st.extra||[]).length};ui.bakMsg=''}
  catch(x){ui.bak=null;ui.bakMsg=T('Das ist keine gültige Tempomacher-Sicherung.','This is not a valid Pacemaker backup.')}render()});
document.addEventListener('submit',e=>{if(e.target.id==='authForm'){e.preventDefault();authSubmit()}else if(e.target.id==='pwForm'){e.preventDefault();pwChange()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.sheet){ui.sheet=null;renderSheet()}});
// swipe a sheet down to close it (only from its top, so scrolling inside keeps working)
{let y0=null,dy=0;const sh=document.getElementById('sheet');
  sh.addEventListener('touchstart',e=>{y0=sh.scrollTop<=0?e.touches[0].clientY:null;dy=0},{passive:true});
  sh.addEventListener('touchmove',e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0)sh.style.transform=`translateY(${dy}px)`;else{y0=null;sh.style.transform=''}},{passive:true});
  sh.addEventListener('touchend',()=>{if(y0!=null&&dy>90&&ui.sheet){ui.sheet=null;sh.style.transform='';renderSheet()}else sh.style.transform='';y0=null;dy=0})}

