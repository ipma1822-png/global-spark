// GLOBAL SPARK · SPARK WORLD GAMEIFICATION 09 · quest presentation
// Presentation only. Existing campaign/mission actions remain authoritative.
(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function campaignDone(c){return Number(c?.action_count||0)>0||c?.completed===true||c?.done===true}
 function renderCampaigns(state){const root=document.getElementById('campaignList');if(!root||!state)return;const rows=state.campaigns||[];if(!rows.length)return;root.classList.add('quest-list');root.querySelectorAll('.campaign-card').forEach((card,i)=>{const c=rows[i];if(!c)return;const done=campaignDone(c),title=card.querySelector('h3'),meta=card.querySelector('.campaign-meta');card.classList.add('quest-card',done?'quest-complete':'quest-active');card.dataset.questState=done?'complete':'active';if(!card.querySelector('.quest-banner'))card.insertAdjacentHTML('afterbegin',`<div class="quest-banner"><span>${done?'🏆 QUEST CLEAR':'⚡ WORLD QUEST'}</span><b>${done?'실천 완료':'도전 중'}</b></div>`);if(title)title.classList.add('quest-title');if(meta)meta.classList.add('quest-flame');const btn=card.querySelector('.campaign-action');if(btn){btn.classList.add('quest-action');btn.textContent='⚔️ 퀘스트 실천 기록하기'}if(!card.querySelector('.quest-progress'))card.insertAdjacentHTML('beforeend',`<div class="quest-progress"><i style="width:${done?100:18}%"></i><span>${done?'100% · 실천 완료':'현실에서 실천하면 퀘스트 완료!'}</span></div>`)});}
 function renderMissionDeck(state){const host=document.getElementById('questDeck');if(!host)return;const badges=state?.badges||[],recent=state?.recent||[],flames=state?.flames||{};const activeKinds=Object.values(flames).filter(v=>Number(v)>0).length,total=Number(state?.xp?.total||0);const quests=[
  {icon:'🔥',name:'오늘의 첫 불꽃',desc:'좋은 행동을 하나 기록해 불꽃을 밝혀요.',done:recent.some(r=>Number(r.net_xp??r.xp??0)>0)},
  {icon:'🌈',name:'5대 불꽃 탐험',desc:'서로 다른 5대 불꽃을 하나씩 밝혀요.',done:activeKinds>=5,progress:`${activeKinds}/5 불꽃`},
  {icon:'⭐',name:'성장 모험',desc:'100 XP를 향해 한 걸음씩 성장해요.',done:total>=100,progress:`${Math.min(total,100)}/100 XP`},
  {icon:'🏅',name:'성장 배지 발견',desc:'꾸준한 실천으로 첫 성장 배지를 만나요.',done:badges.length>0,progress:badges.length?`${badges.length}개 발견`:'첫 배지 기다리는 중'}
 ];host.innerHTML=quests.map(q=>`<article class="mini-quest ${q.done?'quest-complete':'quest-active'}"><span class="mini-quest-icon">${q.icon}</span><div><small>${q.done?'QUEST CLEAR':'MY QUEST'}</small><b>${esc(q.name)}</b><p>${esc(q.desc)}</p><em>${esc(q.progress|| (q.done?'완료':'진행 중'))}</em></div><strong>${q.done?'✓':'›'}</strong></article>`).join('')}
 function render(state){renderCampaigns(state);renderMissionDeck(state)}
 document.addEventListener('spark-world:state',e=>setTimeout(()=>render(e.detail),0));if(window.SPARK_WORLD_STATE)setTimeout(()=>render(window.SPARK_WORLD_STATE),0);
 window.SPARK_WORLD_QUESTS={version:'9.0.0'};
})();