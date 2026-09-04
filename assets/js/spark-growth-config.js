// GLOBAL SPARK PHASE 2-6 · v2.6.0 · 화면 연출용 자산/분류 매핑
// 공식 디자인 교체 시 이 파일의 asset 경로와 정적 자산만 바꾼다.
(function(){
  const base='assets/spark';
  const flames={
    GOOD:{code:'GOOD',name:'선한 불꽃',asset:`${base}/flames/good.svg`},
    SAFE:{code:'SAFE',name:'안전 불꽃',asset:`${base}/flames/safe.svg`},
    EARTH:{code:'EARTH',name:'환경 불꽃',asset:`${base}/flames/earth.svg`},
    CHALLENGE:{code:'CHALLENGE',name:'도전 불꽃',asset:`${base}/flames/challenge.svg`},
    CITIZEN:{code:'CITIZEN',name:'시민 불꽃',asset:`${base}/flames/citizen.svg`}
  };
  const activityFlame={
    care_friend:'GOOD',help_parents:'GOOD',keep_promise:'GOOD',other_good_action:'GOOD',
    service_share:'CITIZEN',tidy:'CITIZEN',
    exercise_challenge:'CHALLENGE',reading_learning:'CHALLENGE',courage:'SAFE'
  };
  // LEVEL 계산은 기존 정책을 그대로 사용하고, 아래 구간은 MY SPARK의 시각적 성장단계만 결정한다.
  const stages=[
    {min:0,key:'ember',name:'불씨',subtitle:'시작의 불꽃',asset:`${base}/levels/ember.svg`},
    {min:25,key:'growing',name:'초롱이',subtitle:'관찰의 불꽃',asset:`${base}/levels/growing.svg`},
    {min:50,key:'strong',name:'열린이',subtitle:'도전의 불꽃',asset:`${base}/levels/strong.svg`},
    {min:100,key:'radiant',name:'스파키',subtitle:'성장의 불꽃',asset:`${base}/levels/radiant.svg`},
    {min:200,key:'fighter',name:'파이터',subtitle:'리더의 불꽃',asset:`${base}/levels/fighter.svg`},
    {min:400,key:'hero',name:'히어로',subtitle:'책임의 불꽃',asset:`${base}/levels/hero.svg`},
    {min:700,key:'global-leader',name:'글로벌 리더',subtitle:'세상을 밝히는 큰 불꽃',asset:`${base}/levels/global-leader.svg`}
  ];
  function stageForXp(xp){return stages.filter(s=>Number(xp||0)>=s.min).pop()||stages[0];}
  function stageIndexForXp(xp){return Math.max(0,stages.findIndex(s=>s.key===stageForXp(xp).key));}
  function nextStageForXp(xp){const idx=stageIndexForXp(xp);return stages[idx+1]||null;}
  window.SPARK_GROWTH={flames,activityFlame,stages,stageForXp,stageIndexForXp,nextStageForXp};
})();
