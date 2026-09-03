(function(){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function load(){
   try{
     const rows=await SparkData.getMyCenters();
     $('mcLogin').hidden=true;$('mcPanel').hidden=false;
     $('mcList').innerHTML=rows.length?rows.map(c=>`<article class="c"><small>${esc(c.center_code)}</small><h3>🔥 ${esc(c.name)}</h3><p>${esc(c.region_name||'')} · ${esc(c.role)}</p><a class="btn primary" href="center.html?center=${encodeURIComponent(c.center_code)}">센터 운영 시작</a></article>`).join(''):'<p class="empty">연결된 SPARK CENTER가 없습니다.</p>';
   }catch(e){console.error(e);$('mcMsg').textContent='센터 정보를 불러오지 못했습니다.';}
 }
 $('mcLoginBtn').onclick=async()=>{try{await SparkData.signIn($('mcEmail').value.trim(),$('mcPassword').value);await load();}catch(e){$('mcMsg').textContent='로그인 정보를 확인해 주세요.';}};
 if(SparkData.isSignedIn())load();
})();