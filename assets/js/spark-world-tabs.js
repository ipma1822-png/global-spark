// GLOBAL SPARK · PHASE 11 · v2.23.0 · 5화면 모바일 내비게이션
(function(){
 const mobile=()=>matchMedia('(max-width:760px)').matches;
 const groups={
  top:['top','flames','treasure'],
  activitySection:['activitySection'],
  campaigns:['campaigns'],
  map:['map'],
  history:['history']
 };
 const all=[...new Set(Object.values(groups).flat())];
 function mark(){all.forEach(id=>document.getElementById(id)?.classList.add('world-section-page'));document.getElementById('items')?.classList.add('world-section-page');document.getElementById('road')?.classList.add('world-section-page')}
 function show(key,scroll=true){mark();const target=groups[key]?key:'top';if(!mobile()){all.forEach(id=>document.getElementById(id)?.classList.add('is-active'));return}all.forEach(id=>document.getElementById(id)?.classList.toggle('is-active',groups[target].includes(id)));document.querySelectorAll('.dock [data-go]').forEach(b=>b.classList.toggle('is-active',b.dataset.go===target));history.replaceState(null,'','#'+(target==='top'?'my-spark':target));if(scroll)scrollTo({top:0,behavior:'smooth'})}
 document.addEventListener('DOMContentLoaded',()=>{mark();const h=location.hash.slice(1),map={activitySection:'activitySection',campaigns:'campaigns',map:'map',history:'history','my-spark':'top'};show(map[h]||'top',false);document.querySelector('.dock')?.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b||!mobile())return;e.preventDefault();e.stopImmediatePropagation();show(b.dataset.go)} ,true);addEventListener('resize',()=>show('top',false))});
 window.SPARK_WORLD_TABS={version:'11.0.0',show};
})();