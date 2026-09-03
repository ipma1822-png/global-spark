(async function(){
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  let memberId=params.get('member');
  let members=[];
  let toastTimer;

  function toast(t){
    clearTimeout(toastTimer);$('toast').textContent=t;$('toast').hidden=false;
    toastTimer=setTimeout(()=>$('toast').hidden=true,2500);
  }
  function msg(t){$('myRecent').innerHTML=`<p class="empty">${t}</p>`;}
  function buildUrl(id){
    const u=new URL(location.href);u.searchParams.set('member',id);return u.toString();
  }
  async function copy(text){
    try{await navigator.clipboard.writeText(text);toast('링크를 복사했습니다.');}
    catch(_){$('shareUrl').select();document.execCommand('copy');toast('링크를 복사했습니다.');}
  }
  function setBadges(total){
    const items=[];
    if(total>=5)items.push('🔥 첫 SPARK');
    if(total>=25)items.push('✨ 꾸준한 시작');
    if(total>=50)items.push('🌱 성장 중');
    if(total>=100)items.push('🚀 LEVEL UP');
    $('badgeRow').innerHTML=(items.length?items:['🌟 첫 좋은 행동을 기다리고 있어요']).map(x=>`<span class="badge-chip">${x}</span>`).join('');
  }
  async function load(id){
    memberId=id;
    const u=new URL(location.href);u.searchParams.set('member',id);history.replaceState(null,'',u);
    $('shareUrl').value=u.toString();
    try{
      const summary=await SparkData.getMemberSummary(id);
      const recent=await SparkData.getMemberRecent(id,20);
      $('memberName').textContent=summary.display_name;
      $('xp').textContent=`${summary.total_xp} XP`;
      $('level').textContent=`LEVEL ${summary.level}`;
      const total=Number(summary.total_xp||0);
      const level=Number(summary.level||1);
      const levelStart=(level-1)*100;
      const next=Number(summary.next_level_xp||level*100);
      const remain=Math.max(0,next-total);
      $('next').textContent=`다음 LEVEL까지 ${remain} XP`;
      const pct=Math.max(0,Math.min(100,((total-levelStart)/100)*100));
      $('progressBar').style.width=pct+'%';
      $('progressText').textContent=`현재 LEVEL 진행률 ${Math.round(pct)}% · ${remain} XP 남음`;
      setBadges(total);
      $('myRecent').innerHTML=recent.length?recent.map(r=>`<div class="recent-item"><div><b>🔥 ${r.label_ko}</b><small>${new Date(r.created_at).toLocaleString('ko-KR')}</small></div><div class="xp">${Number(r.net_xp)>0?'+':''}${r.net_xp} XP</div></div>`).join(''):'<p class="empty">아직 등록된 SPARK 활동이 없습니다.</p>';
    }catch(e){console.error(e);msg('MY SPARK 데이터를 불러오지 못했습니다.');}
  }

  if(!SparkData.isSignedIn()){
    $('memberName').textContent='지도자 로그인이 필요합니다';
    $('memberSelect').disabled=true;$('copyLinkBtn').disabled=true;$('shareCopyBtn').disabled=true;
    msg('먼저 SPARK CENTER에서 로그인해 주세요.');return;
  }
  try{
    members=await SparkData.getCenterMembers();
    if(!members.length){msg('등록된 회원이 없습니다.');return;}
    $('memberSelect').innerHTML=members.map(m=>`<option value="${m.id}">${m.display_name} · ${m.member_code}</option>`).join('');
    if(!memberId || !members.some(m=>m.id===memberId))memberId=members[0].id;
    $('memberSelect').value=memberId;
    $('memberSelect').onchange=e=>load(e.target.value);
    $('copyLinkBtn').onclick=()=>copy(buildUrl($('memberSelect').value));
    $('shareCopyBtn').onclick=()=>copy($('shareUrl').value);
    await load(memberId);
  }catch(e){console.error(e);msg('회원 목록을 불러오지 못했습니다.');}
})();