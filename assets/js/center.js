(function(){
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const center=new URLSearchParams(location.search).get('center'); let members=[],rules=[],member=null,rule=null;
const pLabels={solo:'혼자',friends:'친구와',family:'가족과',center:'센터와',community:'지역사회와'};
if(!center){$('status').textContent='MY CENTER에서 센터를 선택해 주세요.';return;}
$('centerTitle').textContent=center+' · SPARK 입력';
function drawMembers(){$('memberGrid').innerHTML=members.filter(x=>x.active).map(x=>`<button class="member ${member===x.id?'active':''}" data-id="${x.id}"><b>${esc(x.display_name)}</b><small>${esc(x.member_code||'')}</small></button>`).join('')||'등록된 아이가 없습니다.'}
function drawRules(){$('ruleGrid').innerHTML=rules.map(x=>`<button class="rule ${rule===x.activity_type?'active':''}" data-type="${esc(x.activity_type)}"><b>${esc(x.label_ko)}</b><small>+${x.xp} XP</small></button>`).join('')}
async function recent(){try{const a=await SparkData.centerGetRecent(center,30);$('recentList').innerHTML=a.length?a.map(x=>`<div class="recent-item"><div><b>${esc(x.display_name)} · ${esc(x.label_ko)}</b><small>${new Date(x.created_at).toLocaleString('ko-KR')}</small></div><b>+${x.net_xp} XP</b></div>`).join(''):'최근 기록이 없습니다.'}catch(e){$('recentList').textContent='최근 기록을 불러오지 못했습니다.'}}
async function missions(){
 if(!member){$('missionList').innerHTML='<p class="empty">먼저 회원을 선택해 주세요.</p>';return;}
 $('missionList').innerHTML='<p class="empty">MISSION 불러오는 중…</p>';
 try{
  const rows=await SparkData.memberMissions(member);
  $('missionList').innerHTML=rows.length?rows.map(m=>`<article class="mission-card ${m.completed?'done':''}" data-id="${m.id}"><div class="mission-meta">${esc(m.flame_code)} · ${esc(m.target_label||'모두')} · ${esc(pLabels[m.participation_type]||m.participation_type)} · ${esc(m.difficulty)}</div><h3>${m.completed?'✅ ':''}${esc(m.title)}</h3><p>${esc(m.description)}</p>${m.safety_guide?`<p class="tiny">🛡 ${esc(m.safety_guide)}</p>`:''}${m.completed?'<span class="tiny">센터 확인 완료</span>':'<button class="secondary mission-done" type="button">✅ 현실 행동 완료 확인</button>'}</article>`).join(''):'<p class="empty">현재 공개된 MISSION이 없습니다.</p>';
 }catch(e){console.error(e);$('missionList').innerHTML='<p class="empty">MISSION을 불러오지 못했습니다.</p>';}
}
async function load(){try{[members,rules]=await Promise.all([SparkData.centerGetMembers(center),SparkData.centerGetRules()]);drawMembers();drawRules();recent()}catch(e){console.error(e);$('status').textContent=e?.status===401?'로그인 세션을 다시 확인해 주세요.':'센터 지도자 로그인과 권한을 확인해 주세요.';$('memberGrid').textContent='회원 목록을 불러오지 못했습니다.';}}
$('memberGrid').onclick=e=>{const b=e.target.closest('.member');if(b){member=b.dataset.id;drawMembers();missions()}};
$('ruleGrid').onclick=e=>{const b=e.target.closest('.rule');if(b){rule=b.dataset.type;drawRules()}};
$('missionList').onclick=async e=>{const b=e.target.closest('.mission-done');if(!b||!member)return;const card=b.closest('.mission-card');if(!confirm(`${selectedName()}의 MISSION 완료를 확인할까요?\n이번 단계에서는 XP가 추가되지 않습니다.`))return;b.disabled=true;try{await SparkData.confirmMission(member,card.dataset.id);$('status').textContent=`✅ ${selectedName()} MISSION 완료 확인`;await missions()}catch(err){console.error(err);$('status').textContent='MISSION 완료 확인에 실패했습니다.'}finally{b.disabled=false}};
function selectedName(){return members.find(x=>x.id===member)?.display_name||''}
function pop(xp){$('successName').textContent=selectedName();$('successXp').textContent='+'+xp+' XP';$('successPop').classList.add('show');setTimeout(()=>$('successPop').classList.remove('show'),1100)}
$('registerBtn').onclick=async()=>{if(!member||!rule){$('status').textContent='아이와 좋은 행동을 선택해 주세요.';return} try{const r=await SparkData.centerRegisterActivity(center,member,rule,$('activityMemo').value.trim());$('status').textContent=`🔥 ${selectedName()} +${r.xp} XP · 등록 완료`;pop(r.xp);$('activityMemo').value='';await recent()}catch(e){console.error(e);$('status').textContent='등록에 실패했습니다. 로그인/권한을 확인해 주세요.'}};
$('undoBtn').onclick=async()=>{if(!confirm('선택한 아이의 최근 SPARK 기록을 되돌릴까요?'))return;try{const r=await SparkData.centerUndoLast(center,member);$('status').textContent=`UNDO 완료 · -${r.reversed_xp} XP`;await recent()}catch(e){$('status').textContent='되돌릴 기록이 없습니다.'}};
$('voiceBtn').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$('status').textContent='이 브라우저는 음성 인식을 지원하지 않습니다.';return}const sr=new SR();sr.lang='ko-KR';sr.interimResults=false;$('status').textContent='🎙 말씀하세요. 예: 김민규 친구 배려';sr.onresult=e=>{const t=e.results[0][0].transcript.replace(/\s/g,'');const m=members.find(x=>t.includes(String(x.display_name).replace(/\s/g,'')));const rr=rules.find(x=>t.includes(String(x.label_ko).replace(/[·\s]/g,'')));if(m)member=m.id;if(rr)rule=rr.activity_type;drawMembers();drawRules();if(m)missions();$('status').textContent=(m&&rr)?`🎙 ${m.display_name} · ${rr.label_ko} 선택 완료 — SPARK 등록을 눌러주세요.`:'음성에서 아이 또는 행동을 찾지 못했습니다.'};sr.onerror=()=>{$('status').textContent='음성 인식을 다시 시도해 주세요.'};sr.start()};
load();
})();
