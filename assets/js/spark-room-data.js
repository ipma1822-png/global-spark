// GLOBAL SPARK · loginless kid-link adapter v2.7.0
(function(){
  const cfg=window.SPARK_CONFIG||{};
  async function kidRpc(name,payload={}){
    if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)throw new Error('SPARK_CONFIG_NOT_READY');
    const base=cfg.supabaseUrl.replace(/\/$/,'');
    const res=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+cfg.supabaseAnonKey,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)});
    const text=await res.text();let body=null;try{body=text?JSON.parse(text):null}catch(_){body=text}
    if(!res.ok){const e=new Error(typeof body==='string'?body:JSON.stringify(body));e.status=res.status;e.body=body;throw e}return body;
  }
  if(!window.SparkData)window.SparkData={};
  window.SparkData.getKidDashboard=token=>kidRpc('spark_kid_room',{p_token:token});
  window.SparkData.registerKidActivity=(token,activityType,memo='')=>kidRpc('spark_kid_register_activity',{p_token:token,p_activity_type:activityType,p_memo:memo});
})();
