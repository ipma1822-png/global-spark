// GLOBAL SPARK · loginless kid-link adapter · GB-03 approval flow
(function(){
  const cfg=window.SPARK_CONFIG||{};
  async function kidRpc(name,payload={}){
    if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)throw new Error('SPARK_CONFIG_NOT_READY');
    const base=cfg.supabaseUrl.replace(/\/$/,'');
    const res=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+cfg.supabaseAnonKey,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)});
    const text=await res.text();let body=null;try{body=text?JSON.parse(text):null}catch(_){body=text}
    if(!res.ok){const e=new Error(typeof body==='string'?body:JSON.stringify(body));e.status=res.status;e.body=body;throw e}return body;
  }
  if(!window.SparkData)window.SparkData={};
  window.SparkData.getKidDashboard=token=>kidRpc('spark_kid_room',{p_token:token});
  window.SparkData.registerKidActivity=(token,activityType,memo='',actorType='kid')=>kidRpc('spark_submit_activity_for_review',{p_token:token,p_activity_type:activityType,p_memo:memo,p_actor_type:actorType});
  window.SparkData.getKidCampaigns=token=>kidRpc('spark_kid_campaigns',{p_token:token});
  window.SparkData.completeKidCampaignAction=(token,campaignId,memo='')=>kidRpc('spark_kid_complete_campaign_action',{p_token:token,p_campaign_id:campaignId,p_memo:memo});

  // GB-03: replace legacy immediate-XP self-record button with approval-queue submission.
  setTimeout(()=>{
    const p=new URLSearchParams(location.search),token=p.get('kid')||'',actor=(p.get('as')==='parent'?'parent':'kid');
    const btn=document.getElementById('submit'),memo=document.getElementById('memo'),status=document.getElementById('status'),actions=document.getElementById('actions');
    if(!btn||!token||!actions)return;
    const note=document.querySelector('.self-note');
    if(note)note.innerHTML=actor==='parent'?'부모님이 아이의 성장행동을 기록합니다. <b>성장기지 확인 후 SPARK가 확정됩니다.</b>':'행동을 기록하면 <b>성장기지 확인 후 SPARK가 확정됩니다.</b>';
    btn.textContent=actor==='parent'?'👨‍👩‍👧 성장행동 확인 요청':'🔥 성장기지에 확인 요청';
    btn.onclick=async()=>{
      const selected=actions.querySelector('.action.selected')?.dataset.type||'';
      if(!selected)return;
      btn.disabled=true;if(status)status.textContent='성장기지에 확인 요청을 보내는 중…';
      try{
        await window.SparkData.registerKidActivity(token,selected,memo?.value.trim()||'',actor);
        if(memo)memo.value='';
        actions.querySelectorAll('.action.selected').forEach(x=>x.classList.remove('selected'));
        if(status)status.textContent='✅ 기록을 보냈어요! 성장기지 선생님이 확인하면 SPARK가 확정됩니다.';
        btn.textContent='✅ 승인대기 등록 완료';
        setTimeout(()=>{btn.textContent=actor==='parent'?'👨‍👩‍👧 성장행동 확인 요청':'🔥 성장기지에 확인 요청';btn.disabled=true},1400);
      }catch(e){
        const m=String(e?.message||e);
        if(status)status.textContent=m.includes('DAILY_PENDING_LIMIT')?'오늘 보낼 수 있는 확인 요청 수에 도달했어요.':m.includes('TOO_FAST_REPEAT')?'같은 행동을 방금 보냈어요. 잠시 뒤 다시 해주세요.':'확인 요청을 보내지 못했습니다.';
        btn.disabled=false;
      }
    };
  },0);
})();