// GLOBAL SPARK · PHASE 3-18 · center multi-select bulk SPARK
(function(){
  const $=id=>document.getElementById(id),center=new URLSearchParams(location.search).get('center'),selected=new Set();
  const grid=$('memberGrid'),countEl=$('bulkCount'),allBtn=$('bulkSelectAll'),clearBtn=$('bulkClear'),bulkBtn=$('bulkRegisterBtn'),status=$('status');
  if(!center||!grid||!countEl||!allBtn||!clearBtn||!bulkBtn)return;

  function visibleMemberButtons(){return [...grid.querySelectorAll('.member[data-id]')].filter(b=>b.offsetParent!==null)}
  function sync(){
    grid.querySelectorAll('.member-card').forEach(card=>{const memberBtn=card.querySelector('.member[data-id]');if(!memberBtn)return;const id=memberBtn.dataset.id;let cb=card.querySelector('.bulk-check');if(!cb){cb=document.createElement('input');cb.type='checkbox';cb.className='bulk-check';cb.setAttribute('aria-label',`${memberBtn.querySelector('b')?.textContent||'회원'} 일괄 선택`);cb.dataset.bulkId=id;card.appendChild(cb)}cb.checked=selected.has(id);card.classList.toggle('bulk-picked',selected.has(id))});
    countEl.textContent=`${selected.size}명 선택`;
  }

  grid.addEventListener('change',e=>{const cb=e.target.closest('.bulk-check');if(!cb)return;cb.checked?selected.add(cb.dataset.bulkId):selected.delete(cb.dataset.bulkId);sync()});
  allBtn.onclick=()=>{visibleMemberButtons().forEach(b=>selected.add(b.dataset.id));sync()};
  clearBtn.onclick=()=>{selected.clear();sync()};

  bulkBtn.onclick=async()=>{
    const ids=[...selected];
    if(!ids.length){status.textContent='일괄 SPARK를 받을 아이를 체크해 주세요.';return}
    const activeRule=document.querySelector('#ruleGrid .rule.active');
    if(!activeRule){status.textContent='여러 아이에게 줄 좋은 행동을 먼저 선택해 주세요.';return}
    const activityType=activeRule.dataset.type,label=activeRule.querySelector('b')?.textContent||'선택한 활동';
    const xpText=activeRule.querySelector('small')?.textContent||'';
    if(!confirm(`${ids.length}명에게 동시에 “${label}” ${xpText}를 기록할까요?\n\n선택한 아이 모두에게 같은 활동이 각각 1회 기록됩니다.`))return;
    bulkBtn.disabled=true;bulkBtn.textContent='🔥 일괄 등록 중…';
    try{
      const r=await SparkData.rpc('spark_center_bulk_register_activity',{p_center_code:center,p_member_ids:ids,p_activity_type:activityType,p_memo:$('activityMemo')?.value.trim()||''}),row=Array.isArray(r)?r[0]:r;
      status.textContent=`🔥 ${Number(row?.member_count||ids.length)}명에게 “${label}” 일괄 등록 완료 · 1인 +${Number(row?.xp_each||0)} XP`;
      selected.clear();sync();
      if($('activityMemo'))$('activityMemo').value='';
      setTimeout(()=>location.reload(),700);
    }catch(e){console.error(e);const m=String(e?.message||e);status.textContent=m.includes('TOO_MANY_MEMBERS')?'한 번에 최대 100명까지 선택할 수 있습니다.':m.includes('BATCH_MEMBER_INVALID')?'선택한 아이 중 현재 센터에서 사용할 수 없는 회원이 있습니다. 새로고침 후 다시 선택해 주세요.':'일괄 SPARK 등록에 실패했습니다.'}
    finally{bulkBtn.disabled=false;bulkBtn.textContent='🔥 선택한 아이들에게 일괄 SPARK'}
  };

  new MutationObserver(sync).observe(grid,{childList:true,subtree:true});
  sync();
})();