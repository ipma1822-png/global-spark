// GLOBAL SPARK · SPARK WORLD v2.8.0
(async function(){
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const kidToken=params.get('kid')||'';
  const memberId=params.get('member')||'';
  const centerCode=params.get('center')||'';
  const centerMode=!!(memberId&&centerCode&&window.SparkData?.isSignedIn?.());
  let selected='', dashboard=null, rules=[], lastRecent=[];
  const growth=window.SPARK_GROWTH;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function setStatus(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',!!error)}
  function formatTime(v){try{return new Date(v).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(_){return ''}}
  function ping(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const a=new C(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.setValueAtTime(660,a.currentTime);o.frequency.exponentialRampToValueAtTime(1040,a.currentTime+.16);g.gain.setValueAtTime(.055,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.28);o.start();o.stop(a.currentTime+.3)}catch(_){}}
  function renderGrowth(total,level){
    const stage=growth.stageForXp(total),next=growth.nextStageForXp(total),idx=growth.stageIndexForXp(total);
    $('character').src=stage.asset+'?v=280';
    $('xp').textContent=total+' XP';$('level').textContent='LEVEL '+level;
    $('next').textContent=next?Math.max(0,next.min-total)+' XP':'최고 단계';
    $('stageChip').textContent=`🔥 나의 불꽃 · ${stage.name}`;
    $('nextStageLabel').textContent=next?`다음: ${next.name}`:'최고 단계 달성!';
    const floor=stage.min,ceil=next?.min??Math.max(floor+100,total),pct=next?Math.max(0,Math.min(100,((total-floor)/(ceil-floor))*100)):100;$('bar').style.width=pct+'%';
    renderRoad(total,idx);
    renderTreasures(total);
  }
  function renderRoad(total,idx){
    $('growthRoad').innerHTML=growth.stages.map((s,i)=>`<div class="stage ${i<idx?'done':''} ${i===idx?'current':''}"><img src="${esc(s.asset)}?v=280" alt="${esc(s.name)}"><b>${esc(s.name)}</b><small>${s.min} XP부터</small></div>`).join('');
  }
  function renderTreasures(total){
    const items=[
      {xp:0,icon:'🎒',name:'첫 모험 가방'},
      {xp:25,icon:'🧢',name:'불꽃 모자'},
      {xp:50,icon:'🛡️',name:'용기 방패'},
      {xp:100,icon:'👟',name:'도전 신발'},
      {xp:200,icon:'🗝️',name:'황금 열쇠'},
      {xp:400,icon:'👑',name:'불꽃 왕관'},
      {xp:700,icon:'🌍',name:'세계 불꽃패'},
      {xp:1000,icon:'🏆',name:'전설의 트로피'}
    ];
    $('treasureGrid').innerHTML=items.map(x=>`<div class="treasure ${total<x.xp?'locked':''}"><div class="icon">${total>=x.xp?x.icon:'🔒'}</div><b>${esc(x.name)}</b><small>${total>=x.xp?'열림!':x.xp+' XP에 열림'}</small></div>`).join('');
  }
  function renderFlames(rows){
    const counts={GOOD:0,SAFE:0,EARTH:0,CHALLENGE:0,CITIZEN:0};
    (rows||[]).forEach(r=>{const code=growth.activityFlame[r.activity_type]||'GOOD';if(Number(r.net_xp??r.xp??0)>0)counts[code]=(counts[code]||0)+1});
    const order=['GOOD','SAFE','EARTH','CHALLENGE','CITIZEN'];
    $('flameGrid').innerHTML=order.map(code=>{const f=growth.flames[code];return `<div class="flame-card"><img src="${esc(f.asset)}?v=280" alt="${esc(f.name)}"><b>${esc(f.name)}</b><strong>${counts[code]||0}</strong></div>`}).join('');
  }
  function renderRules(){
    $('actions').innerHTML=rules.map(r=>`<button type="button" class="action ${selected===r.activity_type?'selected':''}" data-type="${esc(r.activity_type)}"><strong>${esc(r.label_ko)}</strong><span>+${Number(r.xp||0)} XP · ${esc(growth.flames[r.flame_code]?.name||'불꽃')}</span></button>`).join('')||'<p class="help">지금 선택할 수 있는 활동이 없습니다.</p>';
  }
  function renderRecent(rows){
    lastRecent=rows||[];renderFlames(lastRecent);
    $('recent').innerHTML=rows?.length?rows.map(r=>`<div class="recent-item"><div><b>${esc(r.label_ko||r.activity_type||'SPARK 활동')}</b><small>${formatTime(r.created_at)}</small></div><span class="plus">${Number(r.net_xp??r.xp??0)>=0?'+':''}${Number(r.net_xp??r.xp??0)} XP</span></div>`).join(''):'<p class="help" style="padding:14px">아직 기록이 없어요. 첫 불꽃을 밝혀보세요!</p>';
  }
  function celebrate(xp,name){$('celebrateName').textContent=name||'멋진 행동!';$('celebrateXp').textContent='+'+xp+' XP';$('celebrate').classList.add('show');ping();setTimeout(()=>$('celebrate').classList.remove('show'),1350)}
  async function reloadPublic(){
    dashboard=await SparkData.getKidDashboard(kidToken);
    const d=Array.isArray(dashboard)?dashboard[0]:dashboard;
    if(!d)throw new Error('KID_LINK_NOT_FOUND');
    $('hello').textContent=(d.display_name||'친구')+'의 SPARK WORLD';
    $('welcome').textContent='현실에서 한 좋은 행동이 이 세계의 불꽃과 보물을 성장시켜요!';
    renderGrowth(Number(d.total_xp||0),Number(d.level||1));
    renderRecent(d.recent||[]);
    rules=Array.isArray(d.rules)?d.rules:[];renderRules();
  }
  async function reloadCenter(){
    const [summary,recentRows,ruleRows]=await Promise.all([
      SparkData.getMemberSummary(memberId),SparkData.getMemberRecent(memberId,20),SparkData.centerGetRules()
    ]);
    const d=Array.isArray(summary)?summary[0]:summary;
    if(!d)throw new Error('MEMBER_NOT_FOUND');
    $('hello').textContent=(d.display_name||'친구')+'의 SPARK WORLD';
    $('welcome').textContent='센터에서 내 불꽃 세계를 보고 오늘의 좋은 행동도 바로 기록할 수 있어요!';
    renderGrowth(Number(d.total_xp||0),Number(d.level||1));
    renderRecent(Array.isArray(recentRows)?recentRows:[]);
    rules=Array.isArray(ruleRows)?ruleRows:[];renderRules();
  }
  async function reload(){return centerMode?reloadCenter():reloadPublic()}
  document.querySelector('.dock').onclick=e=>{const b=e.target.closest('button[data-go]');if(!b)return;document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth',block:'start'})};
  if(!centerMode&&!kidToken){$('hello').textContent='개인 링크가 필요해요';$('welcome').textContent='관장님이 보내준 내 SPARK 링크로 들어와 주세요.';$('activitySection').classList.add('hidden');$('recent').innerHTML='<p class="help" style="padding:14px">개인 링크로 들어오면 내 점수와 기록이 보여요.</p>';renderGrowth(0,1);renderFlames([]);return}
  $('actions').onclick=e=>{const b=e.target.closest('.action');if(!b)return;selected=b.dataset.type;renderRules();$('submit').disabled=false;setStatus('좋아요! 이제 내 불꽃을 키워볼까요?')};
  $('submit').onclick=async()=>{
    if(!selected)return;
    const chosen=rules.find(r=>r.activity_type===selected);const btn=$('submit');btn.disabled=true;setStatus('🔥 내 불꽃 세계에 기록하는 중…');
    try{
      const r=centerMode?await SparkData.centerRegisterActivity(centerCode,memberId,selected,$('memo').value.trim()):await SparkData.registerKidActivity(kidToken,selected,$('memo').value.trim());
      const row=Array.isArray(r)?r[0]:r;const xp=Number(row?.xp||chosen?.xp||0);
      setStatus(`🎉 성공! +${xp} XP · 내 세계가 더 밝아졌어요!`);celebrate(xp,chosen?.label_ko||'멋진 행동!');
      $('memo').value='';selected='';await reload();
    }catch(e){console.error(e);setStatus(centerMode?'기록하지 못했어요. 센터 로그인 상태를 확인해 주세요.':'기록하지 못했어요. 링크가 맞는지 관장님께 알려 주세요.',true)}
    finally{btn.disabled=!selected}
  };
  try{await reload();setStatus(centerMode?'센터에서 내 SPARK WORLD를 열었습니다. 오늘의 도전을 골라 보세요!':'오늘의 도전을 하나 골라 보세요!')}catch(e){console.error(e);$('hello').textContent='SPARK WORLD를 열 수 없어요';$('welcome').textContent=centerMode?'센터 로그인 또는 회원 권한을 확인해 주세요.':'링크가 만료되었거나 아직 준비되지 않았어요.';$('activitySection').classList.add('hidden');$('recent').innerHTML=`<p class="help error" style="padding:14px">${centerMode?'센터 화면으로 돌아가 다시 열어 주세요.':'관장님께 새 개인 링크를 받아 주세요.'}</p>`;renderGrowth(0,1);renderFlames([])}
})();
