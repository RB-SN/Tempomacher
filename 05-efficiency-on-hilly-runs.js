/* ---- efficiency on hilly runs ----
   Two corrections, by climbing per km (g = m/km):
   1) energy cost (Minetti et al. 2002, loop with as much up as down): 0.00005 × g², e.g. 25 m/km ≈ +3 %, 50 m/km ≈ +13 %
   2) heart rate: it rises quickly on climbs but falls back slowly; the average is higher than the energy cost explains:
      0.12 % per m/km above 5 m/km, at most 4 %, scaled by a personal factor learnt from your own flat and hilly easy runs.
   Below 5 m/km: no correction (GPS/barometer noise). Above 80 m/km (trail, mountain): no efficiency value. */
const hillG=l=>{const km=logKm(l),g=gainOf(l);return km&&g!=null?g/km:null};
function hillFactor(l,P){const g=hillG(l);if(g==null||g<5)return 1;if(g>80)return null;return 1+.00005*g*g+Math.min(.04,.0012*(g-5))*(P==null?hillP():P)}
const effSpeed=l=>!isIv(l)&&!isBlk(l)&&logType(l)!=='mptest'&&l.sec&&logKm(l)?logKm(l)*3600/l.sec:3600/l.pace; // km/h, as exact as possible
function effRaw(l){l=effL(l);if(!l||!l.done||!l.pace||!l.hr||effGroup(l)!=='base')return null;const ty=logType(l);
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
/* Three kinds of efficiency (speed per share of the heart-rate reserve), each compared only within itself:
   base = easy, long and recovery runs (whole run, elevation-adjusted): the aerobic trend;
   thr  = tempo run and threshold intervals, block or work phases only;
   mp   = marathon-pace run and race-pace test, block or test section only.
   VO2max intervals, fartlek, hills, races: none (heart rate lags behind short reps; pace, evenness and effort say more). */
const EFF_BASE=new Set(['easy','long','recovery']),EFF_THR=new Set(['tempo','cruise']),EFF_MP=new Set(['mpace','mptest']);
function effGroup(l){if(!l||(l.s&&l.s.type==='alt')||l.kind==='alt'||l.sport)return null;const ty=logType(l);return EFF_BASE.has(ty)?'base':EFF_THR.has(ty)?'thr':EFF_MP.has(ty)?'mp':null}
// are pace and heart rate those of the block? intervals: work phases; race-pace test: test section; tempo/marathon pace: imported block or entered as block (from 3.2.1)
const blkData=l=>isIv(l)||logType(l)==='mptest'||!!(l.blk||l.wsec||(l.impSum&&l.impSum.iv));
function effBlk(l){const g=effGroup(l);if((g!=='thr'&&g!=='mp')||!l.done||!l.pace||!l.hr||!blkData(l))return null;
  const p=S.profile,mx=hrMax(p),rs=hrRest(p);if(l.hr<=rs+5||l.hr>mx)return null;return 3600/l.pace/((l.hr-rs)/(mx-rs))}
const effAny=l=>effOf(l)||effBlk(l);
const effName=g=>g==='thr'?T('Schwellen-Effizienz','Threshold efficiency'):g==='mp'?T('Marathontempo-Effizienz','Marathon-pace efficiency'):T('Effizienz','Efficiency');
function effOf(l){l=effL(l);
  if(!l||!l.done||!l.pace||!l.hr||effGroup(l)!=='base')return null;const ty=logType(l);
  if(ty==='race'||ty==='hills'||(l.s&&l.s.type==='alt'))return null;
  const p=S.profile,mx=hrMax(p),rs=hrRest(p);if(l.hr<=rs+5||l.hr>mx)return null;
  const v=effSpeed(l),hf=isIv(l)?1:hillFactor(l);if(hf==null)return null;return v*hf/((l.hr-rs)/(mx-rs));
}
