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
  function renderFlames(recent){
    const growth=window.SPARK_GROWTH;
    const counts={GOOD:0,SAFE:0,EARTH:0,CHALLENGE:0,CITIZEN:0};
    recent.forEach(r=>{
      if(Number(r.net_xp)<=0)return;
      const code=growth.activityFlame[r.activity_type];
      if(code)counts[code]+=1;
    });
    $('flameGrid').innerHTML=Object.values(growth.flames).map(f=>`
      <article class="card flame-card ${counts[f.code]?'active':''}">
        <img src="${f.asset}" alt=""><strong>${f.code}</strong><small>${f.name}</small>
        <span class="flame-count">최근 ${counts[f.code]}회</span>
      </article>`).join('');
    const next=Object.keys(counts).find(code=>counts[code]===0);
    $('nextActionMessage').textContent=next
      ? `${growth.flames[next].name}을 깨울 수 있는 안전한 현실 행동을 찾아보세요.`
      : '5대 불꽃이 모두 빛나고 있어요. 오늘도 화면 밖에서 한 가지 실천을 이어가세요.';
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
      renderFlames(recent);
      const flame=$('sparkFlame'), title=$('growthTitle'), gm=$('growthMessage');
      const stage=window.SPARK_GROWTH.stageForXp(total);
      flame.src=stage.asset;flame.alt=`${stage.name} 성장 이미지`;
      if(total>=100){title.textContent='빛나는 SPARK 불꽃!';gm.textContent='현실의 꾸준한 실천이 강한 불꽃으로 성장했습니다.';}
      else if(total>=50){title.textContent='불꽃이 힘차게 자라고 있어요';gm.textContent='안전하고 따뜻한 실천이 계속 쌓이고 있습니다.';}
      else if(total>=25){title.textContent='SPARK 불꽃이 자라고 있어요';gm.textContent='현실의 꾸준한 실천이 멋진 성장으로 이어지고 있어요.';}
      else {title.textContent='첫 불꽃이 시작됐어요';gm.textContent='작은 행동 하나가 세상을 바꾸는 SPARK가 됩니다.';}
      $('myRecent').innerHTML=recent.length?recent.map(r=>{const code=window.SPARK_GROWTH.activityFlame[r.activity_type]||'GOOD';const f=window.SPARK_GROWTH.flames[code];return `<div class="recent-item"><div><b>${f.code} · ${r.label_ko}</b><small>${new Date(r.created_at).toLocaleString('ko-KR')}</small></div><div class="xp">${Number(r.net_xp)>0?'+':''}${r.net_xp} XP</div></div>`;}).join(''):'<p class="empty">아직 등록된 SPARK 활동이 없습니다.</p>';
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

    $('createParentShareBtn').onclick=async()=>{
      try{
        const r=await SparkData.createMemberShare($('memberSelect').value);
        const token=r?.token;
        if(!token) throw new Error('TOKEN_NOT_RETURNED');
        const u=new URL('parent-spark.html', location.href);
        u.searchParams.set('share',token);
        $('parentShareUrl').value=u.toString();
        $('copyParentShareBtn').disabled=false;
        toast('부모 공유링크를 만들었습니다.');
      }catch(e){console.error(e);toast('공유링크 생성에 실패했습니다.');}
    };
    $('revokeParentShareBtn').onclick=async()=>{
      if(!confirm('이 아이의 기존 부모 공유링크를 모두 해제할까요?'))return;
      try{
        await SparkData.revokeMemberShares($('memberSelect').value);
        $('parentShareUrl').value='';$('copyParentShareBtn').disabled=true;
        toast('기존 공유링크를 해제했습니다.');
      }catch(e){console.error(e);toast('공유링크 해제에 실패했습니다.');}
    };
    $('copyParentShareBtn').onclick=()=>copy($('parentShareUrl').value);
    await load(memberId);
  }catch(e){console.error(e);msg('회원 목록을 불러오지 못했습니다.');}
})();
