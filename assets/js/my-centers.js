// GLOBAL SPARK · PHASE 3-12 · v3.12.0
(function(){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function load(){
   try{
     const rows=await SparkData.getMyCenters();
     $('mcLogin').hidden=true;$('mcPanel').hidden=false;
     $('mcList').innerHTML=rows.length?rows.map(c=>`<article class="c"><small>${esc(c.center_code)}</small><h3>🔥 ${esc(c.name)}</h3><p>${esc(c.region_name||'')} · ${esc(c.role)}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn primary" href="center-operations.html?center=${encodeURIComponent(c.center_code)}">📊 센터 실전 운영판</a><a class="btn secondary" href="center.html?center=${encodeURIComponent(c.center_code)}">센터 직접 입력</a><a class="btn secondary" href="center-self.html?center=${encodeURIComponent(c.center_code)}">✍️ 아이 직접기록 관리</a></div></article>`).join(''):'<p class="empty">연결된 SPARK CENTER가 없습니다.</p>';
   }catch(e){console.error(e);$('mcMsg').textContent='센터 정보를 불러오지 못했습니다.';}
 }
 $('mcLoginBtn').onclick=async()=>{try{await SparkData.signIn($('mcEmail').value.trim(),$('mcPassword').value);await load();}catch(e){$('mcMsg').textContent='로그인 정보를 확인해 주세요.';}};
 if(SparkData.isSignedIn())load();
})();