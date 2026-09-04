// GLOBAL SPARK · SPARK WORLD PHASE 9 · v2.21.0 · 세계 연결 확장
(function(){
 const NODES=[
  {key:'self',icon:'🔥',label:'나',min:0,copy:'나의 좋은 행동에서 시작해요.'},
  {key:'friend',icon:'🤝',label:'친구',min:25,copy:'친구와 좋은 영향을 나눠요.'},
  {key:'center',icon:'🏫',label:'센터',min:50,copy:'우리 센터의 불꽃을 함께 밝혀요.'},
  {key:'region',icon:'📍',label:'지역',min:100,copy:'우리 지역으로 선한 행동이 퍼져요.'},
  {key:'country',icon:'🇰🇷',label:'국가',min:200,copy:'나라를 밝히는 성장으로 이어져요.'},
  {key:'world',icon:'🌍',label:'세계',min:400,copy:'세계 친구들과 좋은 행동으로 연결돼요.'}
 ];
 const n=v=>Number(v||0),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function campaignDone(c){return n(c?.action_count||c?.actions)>0||c?.completed===true||c?.done===true}
 function hub(state){const campaigns=state?.campaigns||[],recent=state?.recent||[],xp=n(state?.xp?.total),done=campaigns.filter(campaignDone).length,active=campaigns.length-done,badges=(state?.badges||[]).length;return {xp,done,active,badges,recent:recent.length,campaigns}}
 function renderMap(state){const root=document.getElementById('worldMap');if(!root||!state)return;const xp=n(state.xp?.total),active=[...NODES].reverse().findIndex(x=>xp>=x.min),current=active<0?0:NODES.length-1-active;root.innerHTML=`<div class="world-map-track">${NODES.map((x,i)=>{const open=xp>=x.min,now=i===current;return `<div class="world-map-node ${open?'open':'locked'} ${now?'current':''}" data-world="${x.key}"><div class="world-map-orb"><span>${open?x.icon:'🔒'}</span></div><b>${x.label}</b><small>${open?(now?'지금 나의 세계':'연결됨'):x.min+' XP'}</small><p>${open?x.copy:'좋은 행동을 이어가면 열려요.'}</p></div>${i<NODES.length-1?`<div class="world-map-path ${xp>=NODES[i+1].min?'open':''}"><i></i></div>`:''}`}).join('')}</div><div class="world-map-message">${xp>=400?'🌍 나의 불꽃이 세계와 연결되었습니다!':'🚀 좋은 행동을 계속하면 나의 세계가 더 넓어집니다.'}</div>`}
 function renderHub(state){const board=document.querySelector('.world-map-board');if(!board||!state)return;let box=document.getElementById('worldHub');if(!box){box=document.createElement('div');box.id='worldHub';box.className='world-hub';board.appendChild(box)}const h=hub(state),campaignText=h.campaigns.length?`${h.done}개 완료 · ${h.active}개 도전 중`:'현재 참여 가능한 세계 도전을 기다리는 중';box.innerHTML=`<div class="world-hub-title"><div><small>🌐 SPARK WORLD 연결 허브</small><b>나의 작은 행동이 더 큰 세계로 이어져요</b></div><span>${h.xp} XP</span></div><div class="world-hub-grid"><article><span>🤝</span><small>친구와 함께</small><b>좋은 영향 나누기</b><em>친구 연결 기능은 다음 확장에 대비해 준비 중</em></article><article><span>🏫</span><small>SPARK 센터</small><b>센터와 함께 성장</b><em>센터 소속 정보가 연결되면 함께 표시됩니다</em></article><article><span>🌍</span><small>세계 공동도전</small><b>${esc(campaignText)}</b><em>실제 참여 가능한 캠페인 데이터 기준</em></article><article><span>🏅</span><small>나의 세계 기록</small><b>배지 ${h.badges}개 · 최근 실천 ${h.recent}개</b><em>순위는 실제 비교 데이터가 연결된 뒤 표시됩니다</em></article></div><div class="world-ranking-ready"><div><small>🏆 글로벌 랭킹</small><b>공정한 실제 데이터가 준비되면 공개됩니다</b></div><span>준비 중</span></div>`}
 function render(state){renderMap(state);renderHub(state)}
 document.addEventListener('spark-world:state',e=>render(e.detail));if(window.SPARK_WORLD_STATE)render(window.SPARK_WORLD_STATE);
 window.SPARK_WORLD_MAP={version:'9.0.0',nodes:NODES,render};
})();