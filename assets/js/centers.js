(function(){
  const $=id=>document.getElementById(id);
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  async function search(){
    $('centerSearchBtn').disabled=true;
    try{
      const rows=await SparkData.findPublicCenters($('centerQuery').value.trim());
      $('centerResults').innerHTML=rows.length?rows.map(c=>`
        <article class="center-card">
          <div class="center-code">${esc(c.center_code)}</div>
          <h3>🔥 ${esc(c.name)}</h3>
          <div>${esc(c.region_name||'')}</div>
          <small>${esc(c.center_type||'SPARK CENTER')} · ${esc(c.country_code||'')}</small>
        </article>`).join(''):'<p class="empty">검색 결과가 없습니다.</p>';
    }catch(e){console.error(e);$('centerResults').innerHTML='<p class="empty">센터 정보를 불러오지 못했습니다.</p>';}
    finally{$('centerSearchBtn').disabled=false;}
  }
  $('centerSearchBtn').onclick=search;
  $('centerQuery').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search();}});
  $('joinForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const payload={
      p_organization_name:f.get('organization_name'),
      p_center_type:f.get('center_type'),
      p_region_name:f.get('region_name'),
      p_contact_name:f.get('contact_name'),
      p_contact_phone:f.get('contact_phone'),
      p_contact_email:f.get('contact_email')||null,
      p_message:f.get('message')||null
    };
    const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;
    try{
      const r=await SparkData.submitCenterInterest(payload);
      $('joinMessage').textContent='🔥 참여 신청이 접수되었습니다. GLOBAL SPARK 본부에서 확인 후 안내드립니다.';
      e.currentTarget.reset();
    }catch(err){console.error(err);$('joinMessage').textContent='신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.';}
    finally{btn.disabled=false;}
  });
  search();
})();