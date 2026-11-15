# Rule tests for the plan engine: a matrix of runners (level, goal distance, training days, coach style) must never break
# the training rules below. Prints violations; exits 1 if any.
exec(open('/tmp/claude-0/t/ocr/e2e.py').read().split("cases=")[0])
import sys,json
from playwright.sync_api import sync_playwright
JS=r"""()=>{const out=[],t=today();let n=0;
 const DAYS={3:[1,3,6],4:[1,3,5,6],5:[0,1,3,4,6],6:[0,1,2,3,5,6]};
 const REF={0:[5,33*60],1:[10,58*60],2:[10,47*60],3:[10,39*60]};
 for(const exp of[0,1,2,3])for(const dist of[5,10,21.0975,42.195])for(const nd of[3,4,5,6])for(const coach of['safe','bal','hard']){
  if(exp===0&&dist===42.195&&nd<4)continue;
  const km=[15,25,40,60][exp],prof={age:35,sex:'m',exp,ref:{dist:REF[exp][0],sec:REF[exp][1]},runs:nd,km,daysSel:DAYS[nd],longDay:6,raceName:'R',raceDist:dist,raceDate:addD(t,7*({5:12,10:14,21.0975:18,42.195:24}[dist]+2)),mode:'race',pace:[420,380,330,290][exp],hrMax:188,hrRest:52};
  try{S=newState(prof);S.healthOk=true;S.profile.coach=coach;regenerate()}catch(e){out.push(`${exp}/${dist}/${nd}/${coach}: build error ${e}`);continue}
  n++;const c=ctxFor(S),ep=mid2(c.pc.E),W=S.plan.weeks.filter(w=>w.monday>=monday(t)),tag=`exp${exp} ${dist}km ${nd}d ${coach}`;
  const isH=s=>s&&(s.quality||s.type==='race'||s.type==='mptest'||s.type==='test');
  let hist=[];
  W.forEach((w,i)=>{const run=w.days.filter(s=>s&&s.type!=='rest'&&s.type!=='alt'),km=run.reduce((a,s)=>a+(s.km||0),0);
   // R1 ramp between ordinary build weeks
   const ref=hist.length?Math.max(...hist.slice(-2)):0;if(hist.length&&!w.recovery&&['base','build','peak'].includes(w.phase)&&km>ref*1.15+2)out.push(`${tag} ${w.monday}: ramp ${ref.toFixed(1)}→${km.toFixed(1)}`);
   // R2 long run within the distance cap and 3 h
   const L=w.days.find(s=>s&&s.type==='long');if(L){const mx={5:16,10:20,21.0975:24,42.195:35}[dist];if(L.km>mx+.5)out.push(`${tag} ${w.monday}: long ${L.km} > ${mx}`);if(L.km*ep/60>185)out.push(`${tag} ${w.monday}: long ${L.km} km > 3 h`)}
   // R3 at most 2 hard sessions (+ race / test) per week, none in run-walk weeks
   const H=w.days.filter(s=>s&&s.quality&&s.type!=='race').length;if(H>2)out.push(`${tag} ${w.monday}: ${H} hard sessions`);
   // R4 no two hard days in a row when the week has room
   for(let d=0;d<6;d++)if(isH(w.days[d])&&isH(w.days[d+1])&&w.days.filter(Boolean).length<6&&w.days[d].type!=='race'&&w.days[d+1].type!=='race')out.push(`${tag} ${w.monday}: hard ${d}+${d+1}`);
   // R5 at least one day without running
   if(w.days.filter(s=>s&&s.type!=='rest'&&s.type!=='alt').length>6)out.push(`${tag} ${w.monday}: no rest day`);
   // R6 only planned training days are used
   w.days.forEach((s,d)=>{if(s&&s.type!=='rest'&&s.type!=='race'&&s.type!=='shakeout'&&!DAYS[nd].includes(d)&&s.type!=='alt'&&!(s.tag||'').startsWith('Erholung'))out.push(`${tag} ${w.monday}: session on day ${d} (${s.type})`)});
   if(['base','build','peak'].includes(w.phase)){if(!w.recovery)hist.push(km)}else hist=[]});
  // R7 taper below the peak
  const pk=Math.max(...W.filter(w=>w.phase==='peak').map(w=>w.days.filter(s=>s&&!s.optional).reduce((a,s)=>a+(s.km||0),0)),0),tp=W.filter(w=>w.phase==='taper').map(w=>w.days.filter(s=>s&&!s.optional&&s.type!=='race').reduce((a,s)=>a+(s.km||0),0));
  if(pk&&tp.length&&tp[tp.length-1]>pk*.8)out.push(`${tag}: last taper ${tp[tp.length-1]} vs peak ${pk}`);
 }
 return{n,out}}"""
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(locale='de-CH');ctx.route('https://cdn.jsdelivr.net/**',handler)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/out/tempomacher.html');pg.wait_for_timeout(300);pg.click('[data-act=demo]');pg.wait_for_timeout(300)
    r=pg.evaluate(JS)
    print('plans checked:',r['n'],'violations:',len(r['out']),'errors:',errs)
    for x in r['out'][:int(sys.argv[1]) if len(sys.argv)>1 else 40]:print('  ',x)
    sys.exit(1 if r['out'] or errs else 0)
