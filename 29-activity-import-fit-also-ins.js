/* ---- activity import: FIT (also inside Garmin's ZIP), GPX, TCX ---- */
const FIT_EPOCH=631065600;
function parseFIT(buf){
  const u8=new Uint8Array(buf),dv=new DataView(buf);
  if(u8.length<14||String.fromCharCode(u8[8],u8[9],u8[10],u8[11])!=='.FIT')throw new Error('Das ist keine gültige FIT-Datei.');
  const hs=u8[0],end=Math.min(hs+dv.getUint32(4,true),u8.length);let p=hs,lastTs=0;
  const defs={},recs=[],laps=[],sess=[];
  const BS={0:1,1:1,2:1,3:2,4:2,5:4,6:4,8:4,10:1,11:2,12:4,13:1};
  const INV={0:255,1:127,2:255,3:32767,4:65535,5:2147483647,6:4294967295,10:0,11:0,12:0,13:255};
  function rd(pos,bt,le){switch(bt){case 0:case 2:case 10:case 13:return u8[pos];case 1:return dv.getInt8(pos);case 3:return dv.getInt16(pos,le);case 4:case 11:return dv.getUint16(pos,le);
    case 5:return dv.getInt32(pos,le);case 6:case 12:return dv.getUint32(pos,le);case 8:return dv.getFloat32(pos,le);default:return null}}
  function readMsg(d){const m={};for(const[num,size,btr]of d.f){const bt=btr&0x1F;if(BS[bt]===size){const v=rd(p,bt,d.le);if(v!==INV[bt]&&v!==null&&!(bt===8&&!isFinite(v)))m[num]=v}p+=size}p+=d.ds;return m}
  function handle(g,m){
    if(m[253]!=null)lastTs=m[253];
    if(g===20&&m[253]!=null)recs.push({t:m[253]+FIT_EPOCH,d:m[5]!=null?m[5]/100:null,hr:m[3]||null,alt:m[78]!=null?m[78]/5-500:m[2]!=null?m[2]/5-500:null});
    else if(g===19)laps.push({start:m[2]!=null?m[2]+FIT_EPOCH:null,end:m[253]!=null?m[253]+FIT_EPOCH:null,tt:m[8]!=null?m[8]/1000:m[7]!=null?m[7]/1000:null,dist:m[9]!=null?m[9]/100:null,hr:m[15]||null,int:m[23]});
    else if(g===18)sess.push({start:m[2]!=null?m[2]+FIT_EPOCH:null,tt:m[8]!=null?m[8]/1000:null,dist:m[9]!=null?m[9]/100:null,hr:m[16]||null,asc:m[22]!=null?m[22]:null,sport:m[5]});
  }
  while(p<end){
    const hd=u8[p++];
    if(hd&0x80){const lt=(hd>>5)&3,off=hd&0x1F,d=defs[lt];if(!d)throw new Error('Die FIT-Datei ist beschädigt.');let ts=(lastTs&~0x1F)+off;if(off<(lastTs&0x1F))ts+=0x20;const m=readMsg(d);m[253]=ts;handle(d.g,m);continue}
    const lt=hd&0x0F;
    if(hd&0x40){const dev=hd&0x20;p++;const le=u8[p++]===0,g=dv.getUint16(p,le);p+=2;const n=u8[p++],f=[];for(let i=0;i<n;i++){f.push([u8[p],u8[p+1],u8[p+2]]);p+=3}
      let ds=0;if(dev){const nd=u8[p++];for(let i=0;i<nd;i++){ds+=u8[p+1];p+=3}}defs[lt]={g,le,f,ds};continue}
    const d=defs[lt];if(!d)throw new Error('Die FIT-Datei ist beschädigt.');handle(d.g,readMsg(d));
  }
  const s=sess[0]||{};
  const FS={1:'run',2:'bike',5:'swim',11:'hike',12:'xcski',15:'row',17:'hike',4:'elliptical',10:'other',13:'skitour'};
  return{recs,laps,total:{dist:s.dist,tt:s.tt,hr:s.hr,asc:s.asc,start:s.start},sport:s.sport==null?null:FS[s.sport]||'other'};
}
function xmlDoc(text){const d=new DOMParser().parseFromString(text,'application/xml');if(d.getElementsByTagName('parsererror').length)throw new Error('Die Datei konnte nicht gelesen werden.');return d}
const byLocal=(el,n)=>[...el.getElementsByTagName('*')].filter(x=>x.localName===n);
const firstLocal=(el,n)=>{for(const x of el.getElementsByTagName('*'))if(x.localName===n)return x;return null};
function haversine(a,b,c,d){const R=6371000,r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function parseGPX(text){
  const doc=xmlDoc(text),pts=byLocal(doc,'trkpt');if(!pts.length)throw new Error('In der GPX-Datei sind keine Trackpunkte.');
  let dist=0,prev=null;const recs=[];
  pts.forEach(pt=>{const la=+pt.getAttribute('lat'),lo=+pt.getAttribute('lon'),tm=firstLocal(pt,'time'),el=firstLocal(pt,'ele'),hr=firstLocal(pt,'hr');
    if(!tm)return;if(prev)dist+=haversine(prev[0],prev[1],la,lo);prev=[la,lo];
    recs.push({t:Date.parse(tm.textContent)/1000,d:dist,hr:hr?+hr.textContent:null,alt:el?+el.textContent:null})});
  if(!recs.length)throw new Error('Die GPX-Datei enthält keine Zeitangaben.');
  const ty=firstLocal(doc,'type');
  return{recs,laps:[],total:{},sport:ty?(sportOfText(ty.textContent)||(/run/i.test(ty.textContent)?'run':'other')):null};
}
function parseTCX(text){
  const doc=xmlDoc(text),recs=[],laps=[];
  byLocal(doc,'Trackpoint').forEach(tp=>{const tm=firstLocal(tp,'Time'),d=firstLocal(tp,'DistanceMeters'),a=firstLocal(tp,'AltitudeMeters'),hb=firstLocal(tp,'HeartRateBpm');
    if(!tm)return;recs.push({t:Date.parse(tm.textContent)/1000,d:d?+d.textContent:null,hr:hb&&firstLocal(hb,'Value')?+firstLocal(hb,'Value').textContent:null,alt:a?+a.textContent:null})});
  byLocal(doc,'Lap').forEach(lp=>{const st=Date.parse(lp.getAttribute('StartTime'))/1000,tt=firstLocal(lp,'TotalTimeSeconds'),ds=firstLocal(lp,'DistanceMeters'),hb=firstLocal(lp,'AverageHeartRateBpm'),it=firstLocal(lp,'Intensity');
    laps.push({start:st,tt:tt?+tt.textContent:null,dist:ds?+ds.textContent:null,hr:hb&&firstLocal(hb,'Value')?+firstLocal(hb,'Value').textContent:null,int:it?(it.textContent==='Resting'?1:0):null})});
  if(!recs.length)throw new Error('In der TCX-Datei sind keine Trackpunkte.');
  const ac=firstLocal(doc,'Activity'),sa=ac&&ac.getAttribute('Sport');
  return{recs,laps,total:{},sport:sa?(/run/i.test(sa)?'run':/bik/i.test(sa)?'bike':'other'):null};
}
async function unzipFirst(buf){
  const u8=new Uint8Array(buf),dv=new DataView(buf);let e=-1;
  for(let i=u8.length-22;i>=Math.max(0,u8.length-66000);i--)if(dv.getUint32(i,true)===0x06054b50){e=i;break}
  if(e<0)throw new Error('Die ZIP-Datei ist beschädigt.');
  let p=dv.getUint32(e+16,true);const n=dv.getUint16(e+10,true);
  for(let k=0;k<n;k++){
    if(dv.getUint32(p,true)!==0x02014b50)break;
    const method=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true);
    const name=new TextDecoder().decode(u8.subarray(p+46,p+46+nl));p+=46+nl+xl+cl;
    if(!/\.(fit|gpx|tcx)$/i.test(name))continue;
    const ds=off+30+dv.getUint16(off+26,true)+dv.getUint16(off+28,true),raw=u8.slice(ds,ds+cs);
    if(method===0)return{name,buf:raw.buffer};
    if(method!==8)throw new Error('Diese ZIP-Komprimierung wird nicht unterstützt. Bitte die ZIP-Datei entpacken und die Datei darin importieren.');
    if(typeof DecompressionStream==='undefined')throw new Error('Dein Browser kann ZIP-Dateien nicht öffnen. Bitte die ZIP-Datei entpacken und die Datei darin importieren.');
    const out=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();return{name,buf:out};
  }
  throw new Error('In der ZIP-Datei ist keine FIT-, GPX- oder TCX-Datei.');
}
