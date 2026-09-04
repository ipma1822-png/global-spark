// GLOBAL SPARK · SPARK WORLD GAMEIFICATION 06 · visual item slots
// Presentation only: no persistent inventory is created in this step.
(function(){
 const ITEMS=[
  {key:'shield',icon:'🛡️',name:'용기 방패',slot:'방패',min:50},
  {key:'sword',icon:'⚔️',name:'도전의 검',slot:'무기',min:100},
  {key:'helmet',icon:'⛑️',name:'수호 헬멧',slot:'헬멧',min:200},
  {key:'gloves',icon:'🥊',name:'성장 장갑',slot:'장갑',min:200},
  {key:'drone',icon:'🚁',name:'SPARK 드론',slot:'동료',min:400},
  {key:'cape',icon:'🦸',name:'히어로 망토',slot:'망토',min:400},
  {key:'book',icon:'📘',name:'지혜의 책',slot:'지혜',min:100},
  {key:'globe',icon:'🌍',name:'세계 불꽃',slot:'세계',min:700}
 ];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(state){const root=document.getElementById('itemSlots');if(!root||!state)return;const xp=Number(state.xp?.total||0);root.innerHTML=ITEMS.map(x=>{const open=xp>=x.min;return `<button type="button" class="item-slot ${open?'item-ready':'item-locked'}" data-item="${x.key}" aria-label="${esc(x.name)} ${open?'사용 가능':'잠김'}"><span class="item-slot-name">${esc(x.slot)}</span><span class="item-icon">${open?x.icon:'🔒'}</span><b>${esc(x.name)}</b><small>${open?'장착 준비':'🔒 '+x.min+' XP'}</small></button>`}).join('');root.querySelectorAll('.item-slot').forEach(el=>el.onclick=()=>{root.querySelectorAll('.item-slot').forEach(x=>x.classList.remove('item-peek'));el.classList.add('item-peek');setTimeout(()=>el.classList.remove('item-peek'),1000)})}
 document.addEventListener('spark-world:state',e=>render(e.detail));if(window.SPARK_WORLD_STATE)render(window.SPARK_WORLD_STATE);
 window.SPARK_WORLD_ITEMS={items:ITEMS};
})();