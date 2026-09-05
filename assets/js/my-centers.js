// GLOBAL SPARK · MY CENTER · GS-16 · v3.68.0
(function(){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function load(){
   try{
     const rows=await SparkData.getMyCenters();
     $('mcLogin').hidden=true;$('mcPanel').hidden=false;
     $('mcList').innerHTML=rows.length?rows.map(c=>`<article class="c"><small>${esc(c.center_code)}</small><h3>🔥 ${esc(c.name)}</h3><p>${esc(c.region_name||'')} · ${esc(c.role)}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn primary" href="center-mobile-home.html?center=${encodeURIComponent(c.center_code)}">📱 성장기지 모바일 HOME</a><a class="btn secondary" href="growth-base-manual.html?center=${encodeURIComponent(c.center_code)}">📘 운영 매뉴얼</a><a class="btn secondary" href="official-growth-base-package.html?center=${encodeURIComponent(c.center_code)}">🎖 공식 성장기지 패키지</a><a class="btn secondary" href="group-spark.html?center=${encodeURIComponent(c.center_code)}">👥 그룹 SPARK</a><a class="btn secondary" href="center-approvals.html?center=${encodeURIComponent(c.center_code)}">✅ 빠른 승인</a><a class="btn secondary" href="center-operations.html?center=${encodeURIComponent(c.center_code)}">📊 센터 실전 운영판</a><a class="btn secondary" href="center-level.html?center=${encodeURIComponent(c.center_code)}">🏅 LEVEL · 운영평가</a><a class="btn secondary" href="center-certificate.html?center=${encodeURIComponent(c.center_code)}">📜 공식인증서 · QR</a><a class="btn secondary" href="center.html?center=${encodeURIComponent(c.center_code)}">센터 직접 입력</a><a class="btn secondary" href="center-self.html?center=${encodeURIComponent(c.center_code)}">✍️ 아이 직접기록 관리</a></div></article>`).join(''):'<p class="empty">연결된 SPARK CENTER가 없습니다.</p>';
   }catch(e){console.error(e);$('mcMsg').textContent='센터 정보를 불러오지 못했습니다.';}
 }
 $('mcLoginBtn').onclick=async()=>{try{await SparkData.signIn($('mcEmail').value.trim(),$('mcPassword').value);await load();}catch(e){$('mcMsg').textContent='로그인 정보를 확인해 주세요.';}};
 if(SparkData.isSignedIn())load();
})();