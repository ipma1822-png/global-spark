// GLOBAL SPARK PHASE 2-2 · 화면 연출용 자산/분류 매핑
// 공식 디자인 교체 시 이 파일의 asset 경로와 SVG 파일만 바꾼다.
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
  const stages=[
    {min:0,key:'ember',name:'작은 불씨',asset:`${base}/levels/ember.svg`},
    {min:25,key:'growing',name:'자라는 불꽃',asset:`${base}/levels/growing.svg`},
    {min:50,key:'strong',name:'힘찬 불꽃',asset:`${base}/levels/strong.svg`},
    {min:100,key:'radiant',name:'빛나는 불꽃',asset:`${base}/levels/radiant.svg`}
  ];
  function stageForXp(xp){return stages.filter(s=>xp>=s.min).pop()||stages[0];}
  window.SPARK_GROWTH={flames,activityFlame,stages,stageForXp};
})();
