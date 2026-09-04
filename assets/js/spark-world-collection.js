// GLOBAL SPARK · SPARK WORLD GAMEIFICATION 08 · badge & treasure collection
// Collection view is derived from existing badges + growth state. No new DB ownership model.
(function(){
 const TREASURES=[
  {key:'bag',min:0,icon:'🎒',name:'첫 모험 가방',story:'SPARK WORLD의 첫 발걸음'},
  {key:'cap',min:25,icon:'🧢',name:'불꽃 모자',story:'작은 불씨를 키운 증표'},
  {key:'shield',min:50,icon:'🛡️',name:'용기 방패',story:'좋은 행동을 이어간 용기'},
  {key:'shoes',min:100,icon:'👟',name:'도전 신발',story:'새로운 도전을 향한 발걸음'},
  {key:'key',min:200,icon:'🗝️',name:'황금 열쇠',story:'더 큰 성장 세계를 여는 열쇠'},
  {key:'crown',min:400,icon:'👑',name:'불꽃 왕관',story:'꾸준한 성장의 빛'},
  {key:'world',min:700,icon:'🌍',name:'세계 불꽃패',story:'세상과 함께 성장하는 증표'},
  {key:'legend',min:1000,icon:'🏆',name:'전설의 트로피',story:'천 번의 작은 빛이 만든 큰 성장'}
 ];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function badgeInfo(b,i){return {icon:b.icon||b.badge_icon||['🏅','⭐','🌟','🔥','💫'][i%5],name:b.name||b.badge_name||b.label||b.badge_code||'성장 배지',desc:b.description||b.reason||b.award_reason||'나의 성장으로 받은 특별한 배지'}}
 function render(state){if(!state)return;const xp=Number(state.xp?.total||0),root=document.getElementById('treasureGrid');if(root){root.innerHTML=TREASURES.map(t=>{const open=xp>=t.min;return `<button type="button" class="treasure collection-card ${open?'collected':'locked'}" data-treasure="${t.key}"><span class="collection-mark">${open?'✓':'🔒'}</span><div class="collection-icon">${open?t.icon:'❔'}</div><b>${esc(t.name)}</b><small>${open?esc(t.story):t.min+' XP에서 발견'}</small></button>`}).join('');root.querySelectorAll('.collection-card').forEach(el=>el.onclick=()=>{root.querySelectorAll('.collection-card').forEach(x=>x.classList.remove('collection-focus'));el.classList.add('collection-focus');setTimeout(()=>el.classList.remove('collection-focus'),1100)})}
  let shelf=document.getElementById('badgeCollection');if(!shelf){const section=document.getElementById('treasure');if(!section)return;shelf=document.createElement('div');shelf.id='badgeCollection';shelf.className='badge-collection';section.appendChild(shelf)}const badges=state.badges||[];shelf.innerHTML=`<div class="collection-title"><b>🏅 나의 성장 배지</b><span>${badges.length}개 수집</span></div>${badges.length?`<div class="badge-shelf">${badges.map((b,i)=>{const x=badgeInfo(b,i);return `<article class="badge-token"><span>${esc(x.icon)}</span><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></article>`}).join('')}</div>`:'<div class="empty-collection">아직 받은 성장 배지가 없어요.<br><b>현실에서 좋은 행동을 이어가면 새로운 배지가 찾아옵니다.</b></div>'}`}
 document.addEventListener('spark-world:state',e=>render(e.detail));if(window.SPARK_WORLD_STATE)render(window.SPARK_WORLD_STATE);window.SPARK_WORLD_COLLECTION={version:'8.0.0',treasures:TREASURES};
})();