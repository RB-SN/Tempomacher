// actions for marking the work phase of an imported run (see 31b)
Object.assign(ACT,{
  mkOpen(){const a=ui.lf&&ui.lf.imp;if(!a||!a.ser)return;const R=a.iv&&a.iv.reps&&a.iv.reps.filter(r=>r.s!=null);
    ui.mk=R&&R.length?{a:R[0].s,b:R[R.length-1].e}:{a:Math.round(a.ser.T*.3/5)*5,b:Math.round(a.ser.T*.7/5)*5};renderSheet()},
  mkCancel(){ui.mk=null;renderSheet()},
  mkApply(){const f=ui.lf,a=f&&f.imp;if(!a||!a.ser||!ui.mk)return;a.iv=markIv(a.ser,ui.mk.a,ui.mk.b);mkAfter(f)},
  mkNone(){const f=ui.lf,a=f&&f.imp;if(!a)return;a.iv=null;mkAfter(f)}});
