(function(){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const qs=new URLSearchParams(location.search), center=qs.get('center');
 let members=[],rules=[],selectedMember=null,selectedRule=null;
 if(!center){$('centerTitle').textContent='센터번호가 없습니다';$('flashMsg').textContent='MY CENTER에서 다시 들어와 주세요.';return;}
 $('centerTitle').textContent=`${center} · SPARK 입력`;
 $('manageMembersLink').href=`center-members.html?center=${encodeURIComponent(center)}`;
 function renderMembers(){
   $('memberGrid').innerHTML=members.filter(m=>m.active).map(m=>`<button class="member-btn ${selectedMember===m.id?'active':''}" data-id="${m.id}"><b>${esc(m.display_name)}</b><br><small>${esc(m.member_code||'')}</small></button>`).join('')||'<p class="empty">재원 아이가 없습니다.</p>';
 }
 function renderRules(){
   $('ruleGrid').innerHTML=rules.map(r=>`<button class="rule-btn ${selectedRule===r.activity_type?'active':''}" data-type="${esc(r.activity_type)}"><b>${esc(r.label_ko)}</b><br><small>+${r.xp} XP</small></button>`).join('');
 }
 async function loadRecent(){
   try{
     const rows=await SparkData.centerGetRecent(center,20);
     $('recentList').innerHTML=rows.length?rows.map(r=>`<div class="recent-item"><div><b>${esc(r.display_name)} · ${esc(r.label_ko)}</b><small>${new Date(r.created_at).toLocaleString('ko-KR')}</small></div><div>+${r.net_xp} XP</div></div>`).join(''):'<p class="empty">최근 활동이 없습니다.</p>';
   }catch(e){console.error(e);$('recentList').innerHTML='<p class="empty">최근 활동을 불러오지 못했습니다.</p>';}
 }
 async function load(){
   try{
     [members,rules]=await Promise.all([SparkData.centerGetMembers(center),SparkData.centerGetRules()]);
     renderMembers();renderRules();await loadRecent();
   }catch(e){console.error(e);$('flashMsg').textContent='이 센터에 대한 지도자 권한을 확인해 주세요.';}
 }
 $('memberGrid').onclick=e=>{const b=e.target.closest('.member-btn');if(!b)return;selectedMember=b.dataset.id;renderMembers();};
 $('ruleGrid').onclick=e=>{const b=e.target.closest('.rule-btn');if(!b)return;selectedRule=b.dataset.type;renderRules();};
 $('registerBtn').onclick=async()=>{
   if(!selectedMember||!selectedRule){$('flashMsg').textContent='아이와 좋은 행동을 선택해 주세요.';return;}
   try{
     const r=await SparkData.centerRegisterActivity(center,selectedMember,selectedRule,$('activityMemo').value.trim());
     $('flashMsg').textContent=`🔥 +${r.xp} XP · SPARK 등록 완료`;
     $('activityMemo').value='';await loadRecent();
     setTimeout(()=>{$('flashMsg').textContent='';},2200);
   }catch(e){console.error(e);$('flashMsg').textContent='등록에 실패했습니다. 권한과 선택값을 확인해 주세요.';}
 };
 $('undoBtn').onclick=async()=>{
   if(!confirm('이 센터의 가장 최근 SPARK 기록을 되돌릴까요?'))return;
   try{const r=await SparkData.centerUndoLast(center,selectedMember);$('flashMsg').textContent=`UNDO 완료 · -${r.reversed_xp} XP`;await loadRecent();}
   catch(e){console.error(e);$('flashMsg').textContent='되돌릴 기록이 없거나 권한이 없습니다.';}
 };
 load();
})();