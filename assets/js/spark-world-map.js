// GLOBAL SPARK · GAMEIFICATION 12 · personal-to-world growth map
(function(){
 const NODES=[
  {key:'self',icon:'🔥',label:'나',min:0,copy:'나의 좋은 행동에서 시작해요.'},
  {key:'friend',icon:'🤝',label:'친구',min:25,copy:'친구와 좋은 영향을 나눠요.'},
  {key:'center',icon:'🏫',label:'센터',min:50,copy:'우리 센터의 불꽃을 함께 밝혀요.'},
  {key:'region',icon:'📍',label:'지역',min:100,copy:'우리 지역으로 선한 행동이 퍼져요.'},
  {key:'country',icon:'🇰🇷',label:'국가',min:200,copy:'나라를 밝히는 성장으로 이어져요.'},
  {key:'world',icon:'🌍',label:'세계',min:400,copy:'세계 친구들과 좋은 행동으로 연결돼요.'}
 ];
 function render(state){const root=document.getElementById('worldMap');if(!root||!state)return;const xp=Number(state.xp?.total||0),active=[...NODES].reverse().findIndex(n=>xp>=n.min),current=active<0?0:NODES.length-1-active;root.innerHTML=`<div class="world-map-track">${NODES.map((n,i)=>{const open=xp>=n.min,now=i===current;return `<div class="world-map-node ${open?'open':'locked'} ${now?'current':''}" data-world="${n.key}"><div class="world-map-orb"><span>${open?n.icon:'🔒'}</span></div><b>${n.label}</b><small>${open?(now?'지금 나의 세계':'연결됨'):n.min+' XP'}</small><p>${open?n.copy:'좋은 행동을 이어가면 열려요.'}</p></div>${i<NODES.length-1?`<div class="world-map-path ${xp>=NODES[i+1].min?'open':''}"><i></i></div>`:''}`}).join('')}</div><div class="world-map-message">${xp>=400?'🌍 나의 불꽃이 세계와 연결되었습니다!':'🚀 좋은 행동을 계속하면 나의 세계가 더 넓어집니다.'}</div>`}
 document.addEventListener('spark-world:state',e=>render(e.detail));if(window.SPARK_WORLD_STATE)render(window.SPARK_WORLD_STATE);
 window.SPARK_WORLD_MAP={version:'12.0.0',nodes:NODES,render};
})();