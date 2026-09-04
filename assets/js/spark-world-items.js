// GLOBAL SPARK · SPARK WORLD GAMEIFICATION 07 · item unlock rules
// Derived read-only unlock state. No persistent inventory/economy is created here.
(function(){
 const ITEMS=[
  {key:'shield',icon:'🛡️',name:'용기 방패',slot:'방패',rule:{xp:50},why:'50 XP 달성'},
  {key:'sword',icon:'⚔️',name:'도전의 검',slot:'무기',rule:{xp:100,flame:'CHALLENGE',count:1},why:'100 XP + 도전불꽃 1회'},
  {key:'book',icon:'📘',name:'지혜의 책',slot:'지혜',rule:{xp:100,flame:'GOOD',count:1},why:'100 XP + 착한불꽃 1회'},
  {key:'helmet',icon:'⛑️',name:'수호 헬멧',slot:'헬멧',rule:{xp:200,flame:'SAFE',count:1},why:'200 XP + 안전불꽃 1회'},
  {key:'gloves',icon:'🥊',name:'성장 장갑',slot:'장갑',rule:{xp:200,flames:3},why:'200 XP + 서로 다른 불꽃 3종'},
  {key:'drone',icon:'🚁',name:'SPARK 드론',slot:'동료',rule:{xp:400,flame:'EARTH',count:1},why:'400 XP + 환경불꽃 1회'},
  {key:'cape',icon:'🦸',name:'히어로 망토',slot:'망토',rule:{xp:400,flames:5},why:'400 XP + 5대 불꽃 모두 밝히기'},
  {key:'globe',icon:'🌍',name:'세계 불꽃',slot:'세계',rule:{xp:700,campaign:true},why:'700 XP + 세계 캠페인 참여'}
 ];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const flameCount=(state,key)=>Number(state?.flames?.[key]||0);
 function campaignDone(state){return (state?.campaigns||[]).some(c=>Number(c.action_count||c.actions||0)>0||c.completed===true||c.done===true)}
 function unlocked(item,state){const r=item.rule,xp=Number(state?.xp?.total||0);if(xp<Number(r.xp||0))return false;if(r.flame&&flameCount(state,r.flame)<Number(r.count||1))return false;if(r.flames){const kinds=Object.values(state?.flames||{}).filter(v=>Number(v)>0).length;if(kinds<r.flames)return false}if(r.campaign&&!campaignDone(state))return false;return true}
 function progress(item,state){const r=item.rule,xp=Number(state?.xp?.total||0),parts=[];parts.push(`${Math.min(xp,r.xp)}/${r.xp} XP`);if(r.flame)parts.push(`${flameCount(state,r.flame)}/${r.count||1} ${r.flame}`);if(r.flames)parts.push(`${Object.values(state?.flames||{}).filter(v=>Number(v)>0).length}/${r.flames} 불꽃`);if(r.campaign)parts.push(campaignDone(state)?'캠페인 ✓':'캠페인 필요');return parts.join(' · ')}
 function render(state){const root=document.getElementById('itemSlots');if(!root||!state)return;root.innerHTML=ITEMS.map(x=>{const open=unlocked(x,state);return `<button type="button" class="item-slot ${open?'item-ready item-unlocked':'item-locked'}" data-item="${x.key}" aria-label="${esc(x.name)} ${open?'해제됨':'잠김'}"><span class="item-slot-name">${esc(x.slot)}</span><span class="item-icon">${open?x.icon:'🔒'}</span><b>${esc(x.name)}</b><small>${open?'✨ 해제됨':esc(x.why)}</small><em class="item-progress">${esc(progress(x,state))}</em></button>`}).join('');root.querySelectorAll('.item-slot').forEach(el=>el.onclick=()=>{root.querySelectorAll('.item-slot').forEach(x=>x.classList.remove('item-peek'));el.classList.add('item-peek');setTimeout(()=>el.classList.remove('item-peek'),1000)})}
 document.addEventListener('spark-world:state',e=>render(e.detail));if(window.SPARK_WORLD_STATE)render(window.SPARK_WORLD_STATE);
 window.SPARK_WORLD_ITEMS={version:'7.0.0',items:ITEMS,unlocked};
})();