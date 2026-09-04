// GLOBAL SPARK · center multi-select bulk SPARK
(function(){
  const $=id=>document.getElementById(id),center=new URLSearchParams(location.search).get('center'),selected=new Set();
  const grid=$('memberGrid'),countEl=$('bulkCount'),allBtn=$('bulkSelectAll'),clearBtn=$('bulkClear'),bulkBtn=$('bulkRegisterBtn'),status=$('status');
  if(!center||!grid||!countEl||!allBtn||!clearBtn||!bulkBtn)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const toolbar=allBtn.parentElement;
  const search=document.createElement('input');
  search.id='bulkMemberSearch';search.type='search';search.placeholder='🔎 아이 이름·회원번호 검색';search.autocomplete='off';
  search.style.cssText='min-width:210px;flex:1 1 220px;background:#0d1526;color:#fff;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px 12px';
  const filter=document.createElement('select');
  filter.id='bulkMemberFilter';
  filter.innerHTML='<option value="all">전체 아이</option><option value="today">오늘 활동한 아이</option><option value="active7">7일 내 활동한 아이</option><option value="inactive7">7일 미활동 아이</option><option value="attention">확인 필요한 아이</option><option value="nolink">개인링크 없는 아이</option>';
  filter.style.cssText='min-width:170px;background:#0d1526;color:#fff;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px 12px';
  toolbar.insertBefore(search,allBtn);toolbar.insertBefore(filter,allBtn);
  allBtn.textContent='☑ 보이는 아이 전체 선택';

  const picked=document.createElement('div');
  picked.id='bulkPickedList';
  picked.style.cssText='display:none;width:100%;margin-top:4px;padding:10px 12px;border-radius:12px;background:#0d1526;border:1px solid rgba(255,159,28,.30);font-size:12px;line-height:1.8';
  toolbar.appendChild(picked);

  let stats=new Map();
  function cards(){return [...grid.querySelectorAll('.member-card')]}
  function nameFor(id){const b=grid.querySelector(`.member[data-id="${CSS.escape(id)}"]`);return b?.querySelector('b')?.textContent?.trim()||id}
  function drawPicked(){
    const ids=[...selected];
    if(!ids.length){picked.style.display='none';picked.textContent='';return}
    picked.style.display='block';
    picked.innerHTML='<b>선택된 아이</b> · '+ids.map(id=>`<button type="button" data-remove-id="${esc(id)}" title="선택 해제" style="display:inline-block;margin:3px 4px 0 0;padding:3px 8px;border-radius:999px;background:#ff9f1c16;color:#fff;border:1px solid #ff9f1c44;cursor:pointer">${esc(nameFor(id))} ×</button>`).join('');
  }
  function matchesFilter(id){
    const x=stats.get(id),f=filter.value;
    if(f==='all')return true;
    if(!x)return false;
    if(f==='today')return !!x.last_activity&&new Date(x.last_activity).toDateString()===new Date().toDateString();
    if(f==='active7')return !!x.last_activity&&(Date.now()-new Date(x.last_activity).getTime()<7*86400000);
    if(f==='inactive7')return !x.last_activity||(Date.now()-new Date(x.last_activity).getTime()>=7*86400000);
    if(f==='attention')return !!x.needs_attention;
    if(f==='nolink')return !x.link_active;
    return true;
  }
  function applyFilter(){
    const q=search.value.trim().toLowerCase();
    cards().forEach(card=>{const b=card.querySelector('.member[data-id]');if(!b)return;const hay=(b.textContent||'').toLowerCase(),okText=!q||hay.includes(q),okFilter=matchesFilter(b.dataset.id);card.hidden=!(okText&&okFilter)});
    sync(false);
  }
  function visibleMemberButtons(){return cards().filter(c=>!c.hidden).map(c=>c.querySelector('.member[data-id]')).filter(Boolean)}
  function sync(reapply=true){
    cards().forEach(card=>{const memberBtn=card.querySelector('.member[data-id]');if(!memberBtn)return;const id=memberBtn.dataset.id;let cb=card.querySelector('.bulk-check');if(!cb){cb=document.createElement('input');cb.type='checkbox';cb.className='bulk-check';cb.setAttribute('aria-label',`${memberBtn.querySelector('b')?.textContent||'회원'} 일괄 선택`);cb.dataset.bulkId=id;card.appendChild(cb)}cb.checked=selected.has(id);card.classList.toggle('bulk-picked',selected.has(id))});
    const visible=visibleMemberButtons().length;
    countEl.textContent=`${selected.size}명 선택 · ${visible}명 표시`;
    drawPicked();
    if(reapply)applyFilter();
  }
  async function loadStats(){try{const d=await SparkData.centerGrowthDashboard(center);stats=new Map((d.members||[]).map(x=>[x.id,x]));applyFilter()}catch(e){console.error(e);status.textContent='회원 상태 필터를 불러오지 못했습니다. 이름 검색과 개별 선택은 계속 사용할 수 있습니다.'}}

  search.addEventListener('input',applyFilter);filter.addEventListener('change',applyFilter);
  grid.addEventListener('change',e=>{const cb=e.target.closest('.bulk-check');if(!cb)return;cb.checked?selected.add(cb.dataset.bulkId):selected.delete(cb.dataset.bulkId);sync(false)});
  allBtn.onclick=()=>{visibleMemberButtons().forEach(b=>selected.add(b.dataset.id));sync(false)};
  clearBtn.onclick=()=>{selected.clear();sync(false)};
  picked.addEventListener('click',e=>{const chip=e.target.closest('[data-remove-id]');if(!chip)return;selected.delete(chip.dataset.removeId);sync(false)});

  bulkBtn.onclick=async()=>{
    const ids=[...selected];
    if(!ids.length){status.textContent='일괄 SPARK를 받을 아이를 체크해 주세요.';return}
    const activeRule=document.querySelector('#ruleGrid .rule.active');
    if(!activeRule){status.textContent='여러 아이에게 줄 좋은 행동을 먼저 선택해 주세요.';return}
    const activityType=activeRule.dataset.type,label=activeRule.querySelector('b')?.textContent||'선택한 활동';
    const xpText=activeRule.querySelector('small')?.textContent||'';
    const preview=ids.slice(0,12).map(nameFor).join(', ')+(ids.length>12?` 외 ${ids.length-12}명`:'');
    if(!confirm(`${ids.length}명에게 동시에 “${label}” ${xpText}를 기록할까요?\n\n대상: ${preview}\n\n선택한 아이 모두에게 같은 활동이 각각 1회 기록됩니다.`))return;
    bulkBtn.disabled=true;bulkBtn.textContent='🔥 일괄 등록 중…';
    try{
      const r=await SparkData.rpc('spark_center_bulk_register_activity',{p_center_code:center,p_member_ids:ids,p_activity_type:activityType,p_memo:$('activityMemo')?.value.trim()||''}),row=Array.isArray(r)?r[0]:r;
      status.textContent=`🔥 ${Number(row?.member_count||ids.length)}명에게 “${label}” 일괄 등록 완료 · 1인 +${Number(row?.xp_each||0)} XP`;
      selected.clear();sync(false);if($('activityMemo'))$('activityMemo').value='';setTimeout(()=>location.reload(),700);
    }catch(e){console.error(e);const m=String(e?.message||e);status.textContent=m.includes('TOO_MANY_MEMBERS')?'한 번에 최대 100명까지 선택할 수 있습니다.':m.includes('BATCH_MEMBER_INVALID')?'선택한 아이 중 현재 센터에서 사용할 수 없는 회원이 있습니다. 새로고침 후 다시 선택해 주세요.':'일괄 SPARK 등록에 실패했습니다.'}
    finally{bulkBtn.disabled=false;bulkBtn.textContent='🔥 선택한 아이들에게 일괄 SPARK'}
  };

  new MutationObserver(()=>{sync(false);applyFilter()}).observe(grid,{childList:true});
  sync(false);loadStats();
})();