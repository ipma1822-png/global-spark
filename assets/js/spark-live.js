(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pLabels={solo:'혼자',friends:'친구와',family:'가족과',center:'센터와',community:'지역사회와'};
  async function load(){
    $('refreshLiveBtn').disabled=true;
    try{
      const [d,missions]=await Promise.all([SparkData.getPublicLive(),SparkData.publicMissions(6)]);
      $('liveToday').textContent=d.today_count||0;$('liveWeek').textContent=d.week_count||0;$('liveCenters').textContent=d.active_centers||0;$('liveXp').textContent=d.total_xp||0;
      const rows=Array.isArray(d.centers)?d.centers:[];
      $('centerLiveBoard').innerHTML=rows.length?rows.map(r=>`<div class="live-row"><div><b>🔥 ${esc(r.center_name)}</b><small>${esc(r.region_name||'')} · 오늘 ${r.today_count} SPARK · 이번 주 ${r.week_count} SPARK</small></div><div class="live-xp">${r.total_xp} XP</div></div>`).join(''):'<p class="empty">아직 공개할 센터 활동이 없습니다.</p>';
      $('publicMissionList').innerHTML=missions.length?missions.map(m=>`<article class="public-mission"><div><span class="flame-tag">${esc(m.flame_code)}</span><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p>${m.safety_guide?`<small>🛡 ${esc(m.safety_guide)}</small>`:''}</div><div><b>${esc(m.target_label||'모두')}</b><small>${esc(pLabels[m.participation_type]||m.participation_type)} · ${esc(m.difficulty)}</small></div></article>`).join(''):'<p class="empty">현재 공개된 MISSION이 없습니다.</p>';
    }catch(e){console.error(e);$('centerLiveBoard').innerHTML='<p class="empty">SPARK LIVE 데이터를 불러오지 못했습니다.</p>';$('publicMissionList').innerHTML='<p class="empty">MISSION을 불러오지 못했습니다.</p>';}finally{$('refreshLiveBtn').disabled=false;}
  }
  $('refreshLiveBtn').onclick=load;load();
})();
