// GLOBAL SPARK · SPARK WORLD PHASE 10 · v2.22.0 · integrated state adapter
// Existing ledger/mission/campaign engines remain authoritative.
(function(){
  const g=window.SPARK_GROWTH;
  if(!g)return;
  const FLAME_ORDER=['GOOD','SAFE','EARTH','CHALLENGE','CITIZEN'];
  const REWARDS=[
    {key:'adventure-bag',min:0,label:'첫 모험 가방',icon:'🎒'},
    {key:'flame-cap',min:25,label:'불꽃 모자',icon:'🧢'},
    {key:'courage-shield',min:50,label:'용기 방패',icon:'🛡️'},
    {key:'challenge-shoes',min:100,label:'도전 신발',icon:'👟'},
    {key:'gold-key',min:200,label:'황금 열쇠',icon:'🗝️'},
    {key:'flame-crown',min:400,label:'불꽃 왕관',icon:'👑'},
    {key:'world-emblem',min:700,label:'세계 불꽃패',icon:'🌍'},
    {key:'legend-trophy',min:1000,label:'전설의 트로피',icon:'🏆'}
  ];
  const n=v=>Number(v||0);
  function flameCounts(rows){const out=Object.fromEntries(FLAME_ORDER.map(k=>[k,0]));(rows||[]).forEach(r=>{if(n(r.net_xp??r.xp)>0){const k=r.flame_code||g.activityFlame[r.activity_type];if(out[k]!==undefined)out[k]++}});return out}
  function normalizedFlames(input){if(input?.flames&&typeof input.flames==='object')return Object.fromEntries(FLAME_ORDER.map(k=>[k,n(input.flames[k])]));return flameCounts(input?.recent)}
  function make(input={}){const total=n(input.total_xp),level=n(input.level)||Math.floor(total/100)+1,stage=g.stageForXp(total),next=g.nextStageForXp(total),idx=g.stageIndexForXp(total),counts=normalizedFlames(input),progress=next?Math.max(0,Math.min(100,((total-stage.min)/(next.min-stage.min))*100)):100;return Object.freeze({member:{id:input.id||'',name:input.name||'친구'},center:input.center||null,xp:{total,level,progress,toNext:next?Math.max(0,next.min-total):0},stage:{...stage,index:idx,next:next?{...next}:null},flames:counts,flameScope:input?.flames?'lifetime':'recent',rewards:REWARDS.map(x=>({...x,unlocked:total>=x.min})),recent:[...(input.recent||[])],badges:[...(input.badges||[])],campaigns:[...(input.campaigns||[])]})}
  function emit(state){window.SPARK_WORLD_STATE=state;document.dispatchEvent(new CustomEvent('spark-world:state',{detail:state}));return state}
  window.SPARK_WORLD_ENGINE={version:'10.0.0',flameOrder:FLAME_ORDER,rewards:REWARDS,make,emit};
})();