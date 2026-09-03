(function(){
  const key='globalSpark.activities.v020';
  try{
    const rows=JSON.parse(localStorage.getItem(key)||'[]');
    const today=new Date().toISOString().slice(0,10);
    const count=rows.filter(r=>r.date===today).length;
    const el=document.getElementById('todaySpark');
    if(el) el.textContent=String(count);
  }catch(e){}
})();
