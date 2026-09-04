// GLOBAL SPARK · 아이 불꽃방 v2.7.1
(async function(){
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const kidToken=params.get('kid')||'';
  const memberId=params.get('member')||'';
  const centerCode=params.get('center')||'';
  const centerMode=!!(memberId&&centerCode&&window.SparkData?.isSignedIn?.());
  let selected='', dashboard=null, rules=[];
  const growth=window.SPARK_GROWTH;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function setStatus(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',!!error)}
  function formatTime(v){try{return new Date(v).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(_){return ''}}
  function renderGrowth(total,level){
    const stage=growth.stageForXp(total),next=growth.nextStageForXp(total);
    $('character').src=stage.asset+'?v=271';
    $('xp').textContent=total+' XP';$('level').textContent='LEVEL '+level;
    $('next').textContent=next?Math.max(0,next.min-total)+' XP':'최고 단계';
    const levelStart=(Math.max(1,level)-1)*100,pct=Math.max(0,Math.min(100,total-levelStart));$('bar').style.width=pct+'%';
  }
  function renderRules(){
    $('actions').innerHTML=rules.map(r=>`<button type="button" class="action ${selected===r.activity_type?'selected':''}" data-type="${esc(r.activity_type)}"><strong>${esc(r.label_ko)}</strong><span>+${Number(r.xp||0)} XP · ${esc(r.flame_code||'SPARK')}</span></button>`).join('')||'<p class="help">지금 선택할 수 있는 활동이 없습니다.</p>';
  }
  function renderRecent(rows){
    $('recent').innerHTML=rows?.length?rows.map(r=>`<div class="recent-item"><div><b>${esc(r.label_ko||r.activity_type||'SPARK 활동')}</b><small>${formatTime(r.created_at)}</small></div><span class="plus">+${Number(r.net_xp||r.xp||0)} XP</span></div>`).join(''):'<p class="help">아직 기록이 없어요. 첫 불꽃을 밝혀보세요!</p>';
  }
  async function reloadPublic(){
    dashboard=await SparkData.getKidDashboard(kidToken);
    const d=Array.isArray(dashboard)?dashboard[0]:dashboard;
    if(!d)throw new Error('KID_LINK_NOT_FOUND');
    $('hello').textContent=(d.display_name||'친구')+'의 불꽃방';
    $('welcome').textContent='좋은 행동을 기록하고 나의 불꽃을 키워보세요!';
    renderGrowth(Number(d.total_xp||0),Number(d.level||1));
    renderRecent(d.recent||[]);
    rules=Array.isArray(d.rules)?d.rules:[];renderRules();
  }
  async function reloadCenter(){
    const [summary,recentRows,ruleRows]=await Promise.all([
      SparkData.getMemberSummary(memberId),
      SparkData.getMemberRecent(memberId,20),
      SparkData.centerGetRules()
    ]);
    const d=Array.isArray(summary)?summary[0]:summary;
    if(!d)throw new Error('MEMBER_NOT_FOUND');
    $('hello').textContent=(d.display_name||'친구')+'의 불꽃방';
    $('welcome').textContent='센터에서 내 불꽃을 확인하고 오늘의 좋은 행동을 바로 기록할 수 있어요!';
    renderGrowth(Number(d.total_xp||0),Number(d.level||1));
    renderRecent(Array.isArray(recentRows)?recentRows:[]);
    rules=Array.isArray(ruleRows)?ruleRows:[];renderRules();
  }
  async function reload(){return centerMode?reloadCenter():reloadPublic()}
  if(!centerMode&&!kidToken){$('hello').textContent='개인 링크가 필요해요';$('welcome').textContent='관장님이 보내준 내 SPARK 링크로 들어와 주세요.';$('activitySection').classList.add('hidden');$('recent').innerHTML='<p class="help">개인 링크로 들어오면 내 점수와 기록이 보여요.</p>';return}
  $('actions').onclick=e=>{const b=e.target.closest('.action');if(!b)return;selected=b.dataset.type;renderRules();$('submit').disabled=false;setStatus('좋아요! 이제 내 불꽃에 기록해 보세요.')};
  $('submit').onclick=async()=>{
    if(!selected)return;
    const btn=$('submit');btn.disabled=true;setStatus('🔥 불꽃에 기록하는 중…');
    try{
      const r=centerMode
        ? await SparkData.centerRegisterActivity(centerCode,memberId,selected,$('memo').value.trim())
        : await SparkData.registerKidActivity(kidToken,selected,$('memo').value.trim());
      const row=Array.isArray(r)?r[0]:r;
      setStatus(`🎉 바로 반영됐어요! +${Number(row?.xp||0)} XP`);
      $('memo').value='';selected='';await reload();
    }catch(e){console.error(e);setStatus(centerMode?'기록하지 못했어요. 센터 로그인 상태를 확인해 주세요.':'기록하지 못했어요. 링크가 맞는지 관장님께 알려 주세요.',true)}
    finally{btn.disabled=!selected}
  };
  try{await reload();setStatus(centerMode?'센터에서 아이 이름을 눌러 들어왔습니다. 오늘 한 일을 골라 주세요.':'오늘 한 일을 하나 골라 주세요.')}catch(e){console.error(e);$('hello').textContent='불꽃방을 열 수 없어요';$('welcome').textContent=centerMode?'센터 로그인 또는 회원 권한을 확인해 주세요.':'링크가 만료되었거나 아직 준비되지 않았어요.';$('activitySection').classList.add('hidden');$('recent').innerHTML=`<p class="help error">${centerMode?'센터 화면으로 돌아가 다시 열어 주세요.':'관장님께 새 개인 링크를 받아 주세요.'}</p>`}
})();
