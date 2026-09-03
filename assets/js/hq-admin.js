(function(){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={new:'신규',reviewing:'검토중',approved:'승인',rejected:'거절'};
 async function load(){
   $('requestList').innerHTML='<p class="empty">불러오는 중…</p>';
   try{
     const rows=await SparkData.hqGetCenterInterests($('statusFilter').value);
     $('requestList').innerHTML=rows.length?rows.map(r=>`
       <article class="req" data-id="${r.id}">
         <div class="req-head"><div><span class="status">${labels[r.status]||r.status}</span><h3>${esc(r.organization_name)}</h3><small>${new Date(r.created_at).toLocaleString('ko-KR')}</small></div><div>${esc(r.center_type)}</div></div>
         <div class="req-meta">
           <div><b>지역</b><br>${esc(r.region_name)}</div>
           <div><b>담당자</b><br>${esc(r.contact_name)} · ${esc(r.contact_phone)}</div>
           <div><b>이메일</b><br>${esc(r.contact_email||'-')}</div>
         </div>
         ${r.message?`<p>${esc(r.message)}</p>`:''}
         ${r.review_note?`<p class="tiny">본부 메모: ${esc(r.review_note)}</p>`:''}
         <div class="actions">
           <input class="review-note" placeholder="본부 메모 (선택)">
           <button class="secondary act" data-action="reviewing">검토중</button>
           <button class="primary act" data-action="approved">승인</button>
           <button class="secondary act" data-action="rejected">거절</button>
         </div>
       </article>`).join(''):'<p class="empty">해당 신청이 없습니다.</p>';
   }catch(e){console.error(e);$('requestList').innerHTML='<p class="empty">본부 권한이 없거나 데이터를 불러오지 못했습니다.</p>';}
 }
 $('hqLoginBtn').onclick=async()=>{
   try{
     await SparkData.signIn($('hqEmail').value.trim(),$('hqPassword').value);
     $('loginBox').hidden=true;$('adminBox').hidden=false;await load();
   }catch(e){console.error(e);$('hqLoginMsg').textContent='로그인 또는 본부 관리자 권한을 확인해 주세요.';}
 };
 $('refreshRequestsBtn').onclick=load;
 $('statusFilter').onchange=load;
 $('requestList').addEventListener('click',async e=>{
   const btn=e.target.closest('.act'); if(!btn)return;
   const card=btn.closest('.req'); const note=card.querySelector('.review-note').value.trim();
   if(!confirm(`이 신청을 '${btn.textContent}' 상태로 변경할까요?`))return;
   btn.disabled=true;
   try{
     if(btn.dataset.action==='approved'){
       const r=await SparkData.hqApproveAndCreateCenter(card.dataset.id,note);
       alert(`승인 완료! 공식 센터번호: ${r.center_code}`);
     }else{
       await SparkData.hqReviewCenterInterest(card.dataset.id,btn.dataset.action,note);
     }
     await load();
   }catch(err){console.error(err);alert('처리에 실패했습니다. 본부 관리자 권한 또는 신청 상태를 확인해 주세요.');}
   finally{btn.disabled=false;}
 });
 if(SparkData.isSignedIn()){ $('loginBox').hidden=true;$('adminBox').hidden=false;load(); }

 $('assignLeaderBtn').onclick=async()=>{
   const code=$('leaderCenterCode').value.trim(), email=$('leaderEmail').value.trim();
   if(!code||!email){$('leaderAssignMsg').textContent='센터번호와 지도자 이메일을 입력해 주세요.';return;}
   try{
     const r=await SparkData.hqAssignCenterLeader(code,email);
     $('leaderAssignMsg').textContent=`🔥 연결 완료 · ${r.center_code} · ${r.email}`;
   }catch(err){console.error(err);$('leaderAssignMsg').textContent='연결 실패: Auth에 해당 이메일 사용자가 있는지 확인해 주세요.';}
 };
})();