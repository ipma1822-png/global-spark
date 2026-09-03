(function(){
  const VERSION='v0.8.0';
  const behaviorDefs=[
    ['🏠','부모님 돕기','help_parents'],
    ['🤝','친구 배려','care_friend'],
    ['🧹','정리정돈','tidy'],
    ['✅','약속 지키기','keep_promise'],
    ['🏃','운동·도전','exercise_challenge'],
    ['📚','독서·학습','reading_learning'],
    ['💚','봉사·나눔','service_share'],
    ['🦁','용기 있는 행동','courage'],
    ['✨','기타 좋은 실천','other_good_action']
  ];
  let students=[], selectedStudent=null, selectedBehavior=null, pending=null, toastTimer;
  const $=id=>document.getElementById(id);

  function showToast(msg, ms=3000){
    clearTimeout(toastTimer);
    $('toast').textContent=msg; $('toast').hidden=false;
    toastTimer=setTimeout(()=>$('toast').hidden=true,ms);
  }
  function setConnection(text, ok=false){
    const el=$('connectionState'); el.textContent=text;
    el.classList.toggle('ok',!!ok);
  }
  function setBusy(flag){
    $('registerBtn').disabled=flag || !(selectedStudent&&selectedBehavior);
    $('confirmSave').disabled=flag;
    $('loginBtn').disabled=flag;
  }

  async function login(){
    const email=$('loginEmail').value.trim();
    const password=$('loginPassword').value;
    if(!email||!password){showToast('이메일과 비밀번호를 입력해 주세요.');return;}
    setBusy(true); setConnection('로그인 중…');
    try{
      await SparkData.signIn(email,password);
      $('loginPassword').value='';
      await enterCenter();
      showToast('🔥 SPARK CENTER에 연결되었습니다.');
    }catch(e){
      console.error(e);
      setConnection('로그인 실패');
      showToast('로그인에 실패했습니다. 지도자 계정을 확인해 주세요.',4200);
    }finally{setBusy(false);}
  }
  function logout(){
    SparkData.signOut();
    students=[]; selectedStudent=null; selectedBehavior=null;
    $('loginPanel').hidden=false; $('livePanel').hidden=true;
    setConnection('로그인 필요');
  }

  async function enterCenter(){
    if(!SparkData.isSignedIn()){
      $('loginPanel').hidden=false; $('livePanel').hidden=true;
      setConnection('로그인 필요'); return;
    }
    $('loginPanel').hidden=true; $('livePanel').hidden=false;
    setConnection('Supabase 연결 중…');
    try{
      students=await SparkData.getCenterMembers();
      setConnection(`실시간 DB 연결 · 회원 ${students.length}명`,true);
      renderStudents(); renderBehaviors(); updateSelection();
      await renderRecent();
    }catch(e){
      console.error(e);
      if(e.status===401 || String(e.message).includes('JWT')){
        logout(); showToast('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
      } else {
        setConnection('DB 연결 오류');
        showToast('센터 회원을 불러오지 못했습니다. v0.8.0 SQL 패치를 확인해 주세요.',4500);
      }
    }
  }

  function renderStudents(q=''){
    const grid=$('studentGrid'); grid.innerHTML='';
    students.filter(s=>s.display_name.includes(q.trim())).forEach(s=>{
      const b=document.createElement('button'); b.type='button';
      b.className='student-card'+(selectedStudent?.id===s.id?' selected':'');
      b.innerHTML=`<span class="avatar">${s.display_name.slice(-2)}</span><span><b>${s.display_name}</b><small>${s.member_code}</small></span>`;
      b.onclick=()=>{selectedStudent=s;renderStudents($('studentSearch').value);updateSelection();};
      grid.appendChild(b);
    });
    if(!grid.children.length) grid.innerHTML='<p class="empty">등록된 회원 또는 검색 결과가 없습니다.</p>';
  }
  function renderBehaviors(){
    const grid=$('behaviorGrid'); grid.innerHTML='';
    behaviorDefs.forEach(([icon,label,type])=>{
      const b=document.createElement('button'); b.type='button';
      b.className='behavior-btn'+(selectedBehavior?.type===type?' selected':'');
      b.innerHTML=`${icon}<br>${label}`;
      b.onclick=()=>{selectedBehavior={label,type};renderBehaviors();updateSelection();};
      grid.appendChild(b);
    });
  }
  function updateSelection(){
    $('selectedStudent').textContent=selectedStudent?selectedStudent.display_name:'선택 안 됨';
    $('selectedBehavior').textContent=selectedBehavior?selectedBehavior.label:'선택 안 됨';
    $('registerBtn').disabled=!(selectedStudent&&selectedBehavior);
  }
  function openConfirm(student,behavior,source='touch'){
    pending={student,behavior,source};
    $('confirmText').textContent=`${student.display_name} · ${behavior.label} · SPARK 활동 1건`;
    $('confirmModal').hidden=false;
  }
  function closeConfirm(){pending=null;$('confirmModal').hidden=true;}

  async function commit(){
    if(!pending)return;
    const p=pending;
    setBusy(true);
    try{
      const eventId=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`);
      const result=await SparkData.registerActivity({
        member_id:p.student.id,
        activity_type:p.behavior.type,
        memo:null,
        source_event_id:eventId
      });
      closeConfirm();
      const xp=result?.xp_awarded ?? 5;
      const total=result?.total_xp;
      showToast(`🔥 ${p.student.display_name} · ${p.behavior.label} · +${xp} XP${total!=null?` · 총 ${total} XP`:''}`,4200);
      selectedBehavior=null;renderBehaviors();updateSelection();
      await renderRecent();
    }catch(e){
      console.error(e);
      showToast('DB 등록에 실패했습니다. 로그인/권한/RPC 설치를 확인해 주세요.',4800);
    }finally{setBusy(false);}
  }

  async function renderRecent(){
    try{
      const rows=await SparkData.getCenterRecent(12);
      $('todayCount').textContent=`${rows.filter(r=>new Date(r.created_at).toDateString()===new Date().toDateString()).length}건`;
      $('undoBtn').disabled=!rows.some(r=>Number(r.net_xp)>0);
      const list=$('recentList');
      if(!rows.length){list.innerHTML='<p class="empty">아직 등록된 활동이 없습니다.</p>';return;}
      list.innerHTML=rows.map(r=>`<div class="recent-item"><div><b>🔥 ${r.display_name} · ${r.label_ko}</b><small>${new Date(r.created_at).toLocaleString('ko-KR')} · ${Number(r.net_xp)>0?'정상':'취소됨'}</small></div><div class="xp">${Number(r.net_xp)>0?'+':''}${r.net_xp} XP</div></div>`).join('');
    }catch(e){ console.warn(e); }
  }

  async function undo(){
    if(!confirm('마지막으로 등록한 본인 활동을 취소할까요? XP는 삭제하지 않고 반대 원장으로 기록됩니다.'))return;
    try{
      const r=await SparkData.undoLast();
      showToast(`↶ 마지막 활동 취소 · ${r?.reversed_xp ?? 0} XP 조정`);
      await renderRecent();
    }catch(e){
      console.error(e); showToast('취소할 수 있는 최근 활동이 없거나 권한이 없습니다.');
    }
  }

  function findBehavior(text){
    const aliases={
      help_parents:['부모님 돕기','부모님도와','부모 돕기','부모님 도움'],
      care_friend:['친구 배려','친구배려','친구 도움','친구도움'],
      tidy:['정리정돈','정리 정돈','정리'],
      keep_promise:['약속 지키기','약속지키기','약속'],
      exercise_challenge:['운동 도전','운동','도전'],
      reading_learning:['독서 학습','독서','학습','책읽기'],
      service_share:['봉사 나눔','봉사활동','봉사','나눔'],
      courage:['용기 있는 행동','용기있는행동','용기'],
      other_good_action:['좋은 실천','좋은 행동']
    };
    const found=Object.entries(aliases).find(([,words])=>words.some(w=>text.includes(w)))?.[0];
    if(!found)return null;
    const d=behaviorDefs.find(x=>x[2]===found);
    return {label:d[1],type:d[2]};
  }
  function parseVoice(text){
    const compact=text.replace(/\s/g,'');
    const s=students.find(st=>compact.includes(st.display_name.replace(/\s/g,'')));
    const b=findBehavior(text);
    if(s&&b){selectedStudent=s;selectedBehavior=b;renderStudents($('studentSearch').value);renderBehaviors();updateSelection();openConfirm(s,b,'voice');return true;}
    showToast('이름과 행동을 함께 인식하지 못했습니다. 다시 말해 주세요.');return false;
  }
  function startVoice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){showToast('Chrome/Edge의 음성 인식을 사용해 주세요.');return;}
    const r=new SR();r.lang='ko-KR';r.interimResults=false;r.maxAlternatives=1;
    $('voiceBtn').classList.add('listening');$('voiceBtn').textContent='🎙 듣고 있습니다…';
    r.onresult=e=>{const text=e.results[0][0].transcript;$('voiceHint').textContent=`인식: “${text}”`;parseVoice(text);};
    r.onerror=()=>showToast('음성 인식에 실패했습니다.');
    r.onend=()=>{$('voiceBtn').classList.remove('listening');$('voiceBtn').textContent='🎙 음성으로 등록';};
    r.start();
  }

  $('loginBtn').onclick=login;
  $('logoutBtn').onclick=logout;
  $('loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')login();});
  $('studentSearch').addEventListener('input',e=>renderStudents(e.target.value));
  $('clearSearch').onclick=()=>{$('studentSearch').value='';renderStudents('');};
  $('registerBtn').onclick=()=>openConfirm(selectedStudent,selectedBehavior,'touch');
  $('cancelConfirm').onclick=closeConfirm;$('confirmSave').onclick=commit;
  $('undoBtn').onclick=undo;$('voiceBtn').onclick=startVoice;
  $('confirmModal').addEventListener('click',e=>{if(e.target===$('confirmModal'))closeConfirm();});

  enterCenter();
})();