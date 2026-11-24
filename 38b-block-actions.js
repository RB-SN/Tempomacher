// actions for marking the work phase of an imported run (see 31b)
Object.assign(ACT,{
  mkOpen(el){const a=ui.lf&&ui.lf.imp;if(!a||!a.ser)return;
    if(el&&el.dataset&&el.dataset.v==='core'){const c=ui.lf.core;ui.mk=c&&c.a!=null?{a:c.a,b:c.b,core:true}:{a:Math.round(a.ser.T*.2/5)*5,b:Math.round(a.ser.T*.8/5)*5,core:true};renderSheet();return}
    const R=a.iv&&a.iv.reps&&a.iv.reps.filter(r=>r.s!=null);
    ui.mk=R&&R.length?{a:R[0].s,b:R[R.length-1].e}:{a:Math.round(a.ser.T*.3/5)*5,b:Math.round(a.ser.T*.7/5)*5};renderSheet()},
  mkCancel(){ui.mk=null;renderSheet()},
  mkApply(){const f=ui.lf,a=f&&f.imp;if(!a||!a.ser||!ui.mk)return;
    if(ui.mk.core){const sp=f.spec||{kind:f.type==='race'?'race':'test'},st=serStat(a.ser,ui.mk.a,ui.mk.b),c={kind:sp.kind,how:'mark',a:st.a,b:st.b,km:st.km,sec:st.sec,hr:st.hr};
      if(sp.km&&(sp.kind==='race'||sp.kind==='test')&&Math.abs(st.km/sp.km-1)<=.05)c.km=sp.km;if(sp.kind==='race'||sp.kind==='test')c.h1=halfAt(a.ser,st.a,st.b);
      ui.mkCore=c;partsPrefill(f);ui.mk=null;ui.lfErr='';renderSheet();return}a.iv=markIv(a.ser,ui.mk.a,ui.mk.b);mkAfter(f)},
  mkNone(){const f=ui.lf,a=f&&f.imp;if(!a)return;a.iv=null;mkAfter(f)},
  addFileAct(){addFilePick()}});
// threshold from the watch (profile)
Object.assign(ACT,{
  wthrEdit(){const w=S.profile.watchThr;ui.wthr=w?{...w}:{date:today()};ui.wthrErr='';render()},
  wthrCancel(){ui.wthr=null;ui.wthrErr='';render()},
  wthrDel(){delete S.profile.watchThr;save();render();toast(T('Schwelle der Uhr entfernt.','Watch threshold removed.'))},
  wthrSave(){const v=id=>(document.getElementById(id)||{}).value||'',hr=Math.round(+v('wtHr')),ps=v('wtPace').trim(),pc=ps?parsePace(ps):null,d=v('wtDate')||today();
    ui.wthr={hr:hr||'',pace:pc||null,date:d};
    if(!(hr>=110&&hr<=215)){ui.wthrErr=T('Bitte einen Schwellenpuls zwischen 110 und 215 eintragen.','Please enter a threshold heart rate between 110 and 215.');render();return}
    if(ps&&!(pc>=150&&pc<=480)){ui.wthrErr=T('Das Tempo bitte als min:sek pro km, z. B. 4:05.','Please enter the pace as min:sec per km, e.g. 4:05.');render();return}
    if(d>today()){ui.wthrErr=T('Das Datum darf nicht in der Zukunft liegen.','The date can’t be in the future.');render();return}
    S.profile.watchThr={hr,pace:pc||null,date:d};ui.wthr=null;ui.wthrErr='';save();render();toast(T('Schwelle der Uhr gespeichert.','Watch threshold saved.'))}});
