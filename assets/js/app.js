(async function(){
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value??0);};
  try{
    const data=await window.SparkData.getPublicLive();
    set('todaySpark',data.today_count);
    set('activeCenters',data.active_centers);
    set('totalSparkXp',data.total_xp);
  }catch(e){
    console.error('GLOBAL SPARK LIVE summary unavailable',e);
  }
})();
