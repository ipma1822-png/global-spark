(async function(){
  const $=id=>document.getElementById(id);
  const token=new URLSearchParams(location.search).get('share');
  function fail(msg){
    $('parentName').textContent='공유링크를 확인해 주세요';
    $('parentMessage').textContent=msg;
    $('parentRecent').innerHTML='<p class="empty">표시할 수 있는 정보가 없습니다.</p>';
  }
  if(!token){fail('유효한 공유토큰이 없습니다.');return;}
  try{
    const d=await SparkData.getPublicShare(token);
    if(!d?.ok){fail('만료되었거나 해제된 공유링크입니다.');return;}
    $('parentName').textContent=d.display_name;
    $('parentXp').textContent=`${d.total_xp} XP`;
    $('parentLevel').textContent=`LEVEL ${d.level}`;
    const remain=Math.max(0,Number(d.next_level_xp)-Number(d.total_xp));
    $('parentNext').textContent=`다음 LEVEL까지 ${remain} XP`;
    const total=Number(d.total_xp||0);
    $('parentFlame').textContent=total>=100?'🔥🔥🔥':total>=50?'🔥🔥':'🔥';
    $('parentMessage').textContent=total>=50?'꾸준한 좋은 행동이 멋진 성장으로 이어지고 있어요.':'좋은 행동이 하나씩 나의 불꽃을 키우고 있어요.';
    const rows=Array.isArray(d.recent)?d.recent:[];
    $('parentRecent').innerHTML=rows.length?rows.map(r=>`<div class="recent-item"><div><b>🔥 ${r.label_ko}</b><small>${new Date(r.created_at).toLocaleString('ko-KR')}</small></div><div class="xp">+${r.xp} XP</div></div>`).join(''):'<p class="empty">아직 표시할 활동이 없습니다.</p>';
  }catch(e){console.error(e);fail('공유링크를 불러오지 못했습니다.');}
})();