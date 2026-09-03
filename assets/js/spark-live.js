(function(){
  const $=id=>document.getElementById(id);
  async function load(){
    $('refreshLiveBtn').disabled=true;
    try{
      const d=await SparkData.getPublicLive();
      $('liveToday').textContent=d.today_count||0;
      $('liveWeek').textContent=d.week_count||0;
      $('liveCenters').textContent=d.active_centers||0;
      $('liveXp').textContent=d.total_xp||0;
      const rows=Array.isArray(d.centers)?d.centers:[];
      $('centerLiveBoard').innerHTML=rows.length?rows.map(r=>`
        <div class="live-row">
          <div><b>🔥 ${r.center_name}</b><small>${r.region_name||''} · 오늘 ${r.today_count} SPARK · 이번 주 ${r.week_count} SPARK</small></div>
          <div class="live-xp">${r.total_xp} XP</div>
        </div>`).join(''):'<p class="empty">아직 공개할 센터 활동이 없습니다.</p>';
    }catch(e){
      console.error(e);
      $('centerLiveBoard').innerHTML='<p class="empty">SPARK LIVE 데이터를 불러오지 못했습니다.</p>';
    }finally{$('refreshLiveBtn').disabled=false;}
  }
  $('refreshLiveBtn').onclick=load;
  load();
})();