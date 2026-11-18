/* ---- boot ---- */
(function boot(){
  const acc=accounts();let slug=ssGet(SESS)||lsGet(SESS);
  if(slug&&!acc.users[slug])slug=null;
  if(!Object.keys(acc.users).length&&lsGet(LEGACY)){ui.auth={mode:'create',name:'',pw:'',pw2:'',keep:true,err:'',legacy:true}}
  if(slug){CU=slug;S=loadLocal();if(S)weeklyCheck()}
  render();if(CU)connect();setTimeout(takeShared,400);
})();
