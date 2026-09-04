// GLOBAL SPARK · SPARK WORLD PHASE 7 · v2.19.0 · 7단계 캐릭터 성장
(function(){
  const base='assets/spark';
  const flames={
    GOOD:{code:'GOOD',name:'착한 불꽃',asset:`${base}/flames/good.svg`},
    SAFE:{code:'SAFE',name:'안전 불꽃',asset:`${base}/flames/safe.svg`},
    EARTH:{code:'EARTH',name:'환경 불꽃',asset:`${base}/flames/earth.svg`},
    CHALLENGE:{code:'CHALLENGE',name:'도전 불꽃',asset:`${base}/flames/challenge.svg`},
    CITIZEN:{code:'CITIZEN',name:'함께 불꽃',asset:`${base}/flames/citizen.svg`}
  };
  const activityFlame={
    care_friend:'GOOD',help_parents:'GOOD',keep_promise:'GOOD',other_good_action:'GOOD',
    service_share:'CITIZEN',tidy:'CITIZEN',environment_care:'EARTH',
    exercise_challenge:'CHALLENGE',reading_learning:'CHALLENGE',courage:'SAFE'
  };
  // PHASE 7은 기존 XP 판정값을 건드리지 않고 캐릭터 성장 정체성과 화면 연출만 정식화한다.
  const stages=[
    {min:0,key:'ember',code:'SPARKY',name:'SPARKY',nameKo:'스파키',subtitle:'작은 불씨가 깨어난 시작의 불꽃',asset:`${base}/levels/ember.svg`},
    {min:25,key:'growing',code:'FLARO',name:'FLARO',nameKo:'플라로',subtitle:'빛을 키우며 세상을 바라보는 불꽃',asset:`${base}/levels/growing.svg`},
    {min:50,key:'strong',code:'GUARDIAN',name:'GUARDIAN',nameKo:'가디언',subtitle:'나와 친구를 지키는 든든한 불꽃',asset:`${base}/levels/strong.svg`},
    {min:100,key:'radiant',code:'CHAMPION',name:'CHAMPION',nameKo:'챔피언',subtitle:'도전을 즐기며 한계를 넘는 불꽃',asset:`${base}/levels/radiant.svg`},
    {min:200,key:'fighter',code:'MASTER',name:'MASTER',nameKo:'마스터',subtitle:'좋은 행동을 꾸준히 이끄는 성장의 불꽃',asset:`${base}/levels/fighter.svg`},
    {min:400,key:'hero',code:'LEGEND',name:'LEGEND',nameKo:'레전드',subtitle:'주변에 선한 영향력을 퍼뜨리는 큰 불꽃',asset:`${base}/levels/hero.svg`},
    {min:700,key:'global-leader',code:'LIGHT',name:'LIGHT',nameKo:'라이트',subtitle:'세상을 밝히는 GLOBAL SPARK의 빛',asset:`${base}/levels/global-leader.svg`}
  ];
  function stageForXp(xp){return stages.filter(s=>Number(xp||0)>=s.min).pop()||stages[0];}
  function stageIndexForXp(xp){return Math.max(0,stages.findIndex(s=>s.key===stageForXp(xp).key));}
  function nextStageForXp(xp){const idx=stageIndexForXp(xp);return stages[idx+1]||null;}
  window.SPARK_GROWTH={version:'7.0.0',flames,activityFlame,stages,stageForXp,stageIndexForXp,nextStageForXp};
})();
