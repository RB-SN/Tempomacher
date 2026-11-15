/* ---- efficiency on hilly runs ----
   Two corrections, by climbing per km (g = m/km):
   1) energy cost (Minetti et al. 2002, loop with as much up as down): 0.00005 × g², e.g. 25 m/km ≈ +3 %, 50 m/km ≈ +13 %
   2) heart rate: it rises quickly on climbs but falls back slowly; the average is higher than the energy cost explains:
      0.12 % per m/km above 5 m/km, at most 4 %, scaled by a personal factor learnt from your own flat and hilly easy runs.
   Below 5 m/km: no correction (GPS/barometer noise). Above 80 m/km (trail, mountain): no efficiency value. */
const hillG=l=>{const km=logKm(l),g=gainOf(l);return km&&g!=null?g/km:null};
function hillFactor(l,P){const g=hillG(l);if(g==null||g<5)return 1;if(g>80)return null;return 1+.00005*g*g+Math.min(.04,.0012*(g-5))*(P==null?hillP():P)}
const effSpeed=l=>!isIv(l)&&logType(l)!=='mptest'&&l.sec&&logKm(l)?logKm(l)*3600/l.sec:3600/l.pace; // km/h, as exact as possible
function effRaw(l){if(!l||!l.done||!l.pace||!l.hr)return null;const ty=logType(l);
  if(ty==='race'||ty==='hills'||isAlt(l))return null;const p=S.profile,mx=hrMax(p),rs=hrRest(p);if(l.hr<=rs+5||l.hr>mx)return null;
  return effSpeed(l)/((l.hr-rs)/(mx-rs))}
// personal factor for the heart-rate part: from at least 5 flat (< 10 m/km) and 5 hilly (20–80 m/km) easy runs of the last 180 days
let HPC=null;
function hillP(){const v=(S&&S.updatedAt)||0;if(HPC&&HPC.v===v)return HPC.P;let P=1;
  const t=today(),R=allRuns().filter(l=>l.done&&!isIv(l)&&['easy','long','recovery'].includes(logType(l))&&daysBetween(l.date,t)<=180).map(l=>({l,g:hillG(l),e:effRaw(l)})).filter(o=>o.g!=null&&o.e);
  const flat=R.filter(o=>o.g<10),hill=R.filter(o=>o.g>=20&&o.g<=80);
  if(flat.length>=5&&hill.length>=5){const med=a=>{const x=[...a].sort((p,q)=>p-q);return x[Math.floor(x.length/2)]};const fm=med(flat.map(o=>o.e));
    const est=hill.map(o=>{const base=1+.00005*o.g*o.g,hp=Math.min(.04,.0012*(o.g-5));return(fm/o.e-base)/hp});P=clamp(med(est),.5,1.5)}
  HPC={v,P,n:[flat.length,hill.length]};return P}
function effOf(l){
  if(!l||!l.done||!l.pace||!l.hr)return null;const ty=logType(l);
  if(ty==='race'||ty==='hills'||(l.s&&l.s.type==='alt'))return null;
  const p=S.profile,mx=hrMax(p),rs=hrRest(p);if(l.hr<=rs+5||l.hr>mx)return null;
  const v=effSpeed(l),hf=isIv(l)?1:hillFactor(l);if(hf==null)return null;return v*hf/((l.hr-rs)/(mx-rs));
}
