(async function(){
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  let memberId=params.get('member');

  function msg(t){$('myRecent').innerHTML=`<p class="empty">${t}</p>`;}
  if(!SparkData.isSignedIn()){
    $('memberName').textContent='지도자 로그인이 필요합니다';
    msg('먼저 SPARK CENTER에서 로그인해 주세요.');
    return;
  }
  try{
    if(!memberId){
      const members=await SparkData.getCenterMembers();
      if(!members.length){msg('등록된 회원이 없습니다.');return;}
      memberId=members[0].id;
    }
    const summary=await SparkData.getMemberSummary(memberId);
    const recent=await SparkData.getMemberRecent(memberId,10);
    $('memberName').textContent=summary.display_name;
    $('xp').textContent=`${summary.total_xp} XP`;
    $('level').textContent=`LEVEL ${summary.level}`;
    const remain=Math.max(0,Number(summary.next_level_xp)-Number(summary.total_xp));
    $('next').textContent=`다음 LEVEL까지 ${remain} XP`;
    $('myRecent').innerHTML=recent.length?recent.map(r=>`<div class="recent-item"><div><b>🔥 ${r.label_ko}</b><small>${new Date(r.created_at).toLocaleString('ko-KR')}</small></div><div class="xp">${Number(r.net_xp)>0?'+':''}${r.net_xp} XP</div></div>`).join(''):'<p class="empty">아직 등록된 SPARK 활동이 없습니다.</p>';
  }catch(e){
    console.error(e); msg('MY SPARK 데이터를 불러오지 못했습니다.');
  }
})();