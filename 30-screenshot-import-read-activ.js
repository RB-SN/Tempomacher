/* ---- screenshot import: read activity values from OCR text ---- */
const SHOT_MON={jan:0,feb:1,'mär':2,mar:2,mrz:2,apr:3,mai:4,may:4,jun:5,jul:6,aug:7,sep:8,okt:9,oct:9,nov:10,dez:11,dec:11};
function shotDate(t,ref){
  const td=ref||today(),mk=(y,m,d)=>{if(!(m>=0&&m<=11&&d>=1&&d<=31))return null;if(y==null){y=+td.slice(0,4);const s=iso(new Date(y,m,d));if(s>td)y--}if(y<100)y+=2000;const s=iso(new Date(y,m,d));return s<=td&&s>=addD(td,-800)?s:null};
  let m;
  if(/\b(heute|today)\b/i.test(t))return td;
  if(/\b(gestern|yesterday)\b/i.test(t))return addD(td,-1);
  if((m=t.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/))){const r=mk(+m[3],+m[2]-1,+m[1]);if(r)return r}
  if((m=t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/))){const r=mk(+m[1],+m[2]-1,+m[3]);if(r)return r}
  if((m=t.match(/\b(\d{1,2})\.?\s+(jan|feb|mär|mar|mrz|apr|mai|may|jun|jul|aug|sep|okt|oct|nov|dez|dec)[a-zä]*\.?,?\s*(\d{4})?/i))){const r=mk(m[3]?+m[3]:null,SHOT_MON[m[2].toLowerCase()],+m[1]);if(r)return r}
  if((m=t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s*(\d{4})?/i))){const r=mk(m[3]?+m[3]:null,SHOT_MON[m[1].toLowerCase()],+m[2]);if(r)return r}
  return null;
}
const SHOT_LAB=[
  ['hrMax',/max(?:\.|imale?r?|imum)?\s*(?:hf|herzfrequenz|puls|heart\s*rate|hr)\b/i],
  ['mov',/bewegungszeit|moving\s*time|laufzeit|zeit\s+in\s+bewegung/i],
  ['time',/gesamtzeit|verstrichene\s*zeit|elapsed\s*time|trainingszeit|workout\s*time|dauer|duration|\bzeit\b|\btime\b/i],
  ['pace',/(?:ø|durchschn\w*\.?|avg\.?|average|mittl\w*)\s*(?:pace|tempo)|\bpace\b|\btempo\b/i],
  ['hr',/(?:ø|durchschn\w*\.?|avg\.?|average|mittl\w*)\s*(?:hf|herzfrequenz|puls|heart\s*rate|hr)|herzfrequenz|heart\s*rate|\bpuls\b|\bhf\b/i],
  ['gain',/gesamt\s*anstieg|anstieg|h[öo]?e?hen\s*(?:gewinn|meter|zunahme|unterschied)|aufstieg|elevation(?:\s*gain)?|elev\.?\s*gain|total\s*ascent|\bascent\b|\bh[öo]hen?\b(?!\s*(?:max|min))/i],
  ['speed',/geschwindigkeit|\bspeed\b/i],
  ['dist',/distanz|distance|strecke|entfernung/i]];
const SHOT_SKIP=/\b(max|maximal\w*|beste?|best|schnellste|fastest|min\.?)\b/i,SHOT_NOTOT=/\bzone\b|bereich|\brunde\b|\blap\b|\bsplit|zeit\s+in\s+(?!bewegung)|time\s+in\s+(?!motion)/i;
const shotNum=s=>+String(s).replace(/['’](?=\d{3}\b)/g,'').replace(',','.');
// value tokens in a line: times, paces, numbers with optional unit
function shotTokens(line){
  const out=[],re=/(\d{1,2}:\d{2}:\d{2})|(\d{1,2}[:'’]\d{2})(?:["”]|'')?(\s*(?:min)?\s*\/\s*(?:km|mi))?|((?:\d{1,3}(?:['’]\d{3})+|\d{1,5})(?:[.,]\d{1,2})?)\s*(km\s*\/\s*h|kmh|km|mi|m\b|hm|bpm|s\/min|spm|schläge|kcal)?/gi;
  let m;while((m=re.exec(line))){
    if(m[1])out.push({k:'t',v:parseDur(m[1]),i:m.index});
    else if(m[2]){const [a,b]=m[2].split(/[:'’]/).map(Number),sec=a*60+b;out.push({k:m[3]?'p':'ms',v:sec,i:m.index})}
    else if(m[4]){const u=(m[5]||'').toLowerCase();out.push({u,k:/^km\s*\/\s*h$|^kmh$/.test(u)?'kmh':u==='km'?'km':u==='mi'?'mi':u==='m'||u==='hm'?'m':/bpm|s\/min|schl/.test(u)?'bpm':u==='kcal'||u==='spm'?'x':'n',v:shotNum(m[4]),raw:m[4],i:m.index})}}
  return out;
}
function shotFit(key,tk){
  if(!tk)return null;const v=tk.v;
  if(key==='dist')return tk.k==='m'&&v>=100&&v<=20000&&!/[.,]\d$/.test(tk.raw||'')?v/1000:(tk.k==='km'||(tk.k==='n'&&/[.,]/.test(tk.raw)))&&v>=.3&&v<=500?v:tk.k==='mi'&&v>=.2&&v<=100?Math.round(v*1609.3)/1000:null;
  if(key==='mov'||key==='time')return(tk.k==='t'||tk.k==='ms')&&v>=120&&v<=30*3600?v:null;
  if(key==='pace')return(tk.k==='p'||tk.k==='ms')&&v>=120&&v<=900?v:null;
  if(key==='hrMax')return(tk.k==='bpm'||tk.k==='n')&&!/[.,]/.test(tk.raw)&&v>=90&&v<=230?v:null;
  if(key==='hr')return(tk.k==='bpm'||tk.k==='n')&&!/[.,]/.test(tk.raw)&&v>=60&&v<=220?v:null;
  if(key==='speed')return tk.k==='kmh'&&v>=2&&v<=90?v:null;
  if(key==='gain')return(tk.k==='m'||tk.k==='n')&&!/[.,]\d$/.test(tk.raw||'')&&v>=0&&v<=6000?v:null;
  return null;
}
