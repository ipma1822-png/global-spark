(function(){
  const VERSION='v0.3.0';
  const STORE='globalSpark.activities.v030';
  const students=[
    {id:'KM001',name:'김민규',group:'계명태권도'},
    {id:'KM002',name:'김나라',group:'계명태권도'},
    {id:'KM003',name:'박준서',group:'계명태권도'},
    {id:'KM004',name:'김우리',group:'계명태권도'},
    {id:'KM005',name:'이서윤',group:'계명태권도'},
    {id:'KM006',name:'정도윤',group:'계명태권도'}
  ];
  const behaviors=[
    ['🏠','부모님 돕기'],['🤝','친구 배려'],['🧹','정리정돈'],['✅','약속 지키기'],['🏃','운동·도전'],['📚','독서·학습'],['💚','봉사·나눔'],['🦁','용기 있는 행동'],['✨','기타 좋은 실천']
  ];
  const XP=5;
  let selectedStudent=null, selectedBehavior=null, pending=null;
  const $=id=>document.getElementById(id);
  const load=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(e){return[]}};
  const save=rows=>localStorage.setItem(STORE,JSON.stringify(rows));
  const today=()=>new Date().toISOString().slice(0,10);

  function renderStudents(q=''){
    const grid=$('studentGrid'); grid.innerHTML='';
    students.filter(s=>s.name.includes(q.trim())).forEach(s=>{
      const b=document.createElement('button'); b.type='button'; b.className='student-card'+(selectedStudent?.id===s.id?' selected':'');
      b.innerHTML=`<span class="avatar">${s.name.slice(-2)}</span><span><b>${s.name}</b><small>${s.id}</small></span>`;
      b.onclick=()=>{selectedStudent=s; renderStudents($('studentSearch').value); updateSelection();};
      grid.appendChild(b);
    });
    if(!grid.children.length) grid.innerHTML='<p class="empty">검색 결과가 없습니다.</p>';
  }
  function renderBehaviors(){
    const grid=$('behaviorGrid'); grid.innerHTML='';
    behaviors.forEach(([icon,name])=>{
      const b=document.createElement('button'); b.type='button'; b.className='behavior-btn'+(selectedBehavior===name?' selected':''); b.innerHTML=`${icon}<br>${name}`;
      b.onclick=()=>{selectedBehavior=name; renderBehaviors(); updateSelection();}; grid.appendChild(b);
    });
  }
  function updateSelection(){
    $('selectedStudent').textContent=selectedStudent?selectedStudent.name:'선택 안 됨';
    $('selectedBehavior').textContent=selectedBehavior||'선택 안 됨';
    $('registerBtn').disabled=!(selectedStudent&&selectedBehavior);
  }
  function renderRecent(){
    const rows=load(); const todayRows=rows.filter(r=>r.date===today());
    $('todayCount').textContent=`${todayRows.length}건`; $('undoBtn').disabled=!rows.length;
    const list=$('recentList');
    if(!rows.length){list.innerHTML='<p class="empty">아직 등록된 활동이 없습니다.</p>';return;}
    list.innerHTML=rows.slice(-8).reverse().map(r=>`<div class="recent-item"><div><b>🔥 ${r.studentName} · ${r.behavior}</b><small>${new Date(r.createdAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})} · ${r.center}</small></div><div class="xp">+${r.xp} XP</div></div>`).join('');
  }
  function openConfirm(student,behavior,source='touch'){
    pending={student,behavior,source}; $('confirmText').textContent=`${student.name} · ${behavior} · SPARK 활동 1건`; $('confirmModal').hidden=false;
  }
  function closeConfirm(){pending=null;$('confirmModal').hidden=true;}
  function commit(){
    if(!pending) return;
    const rows=load();
    rows.push({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),studentId:pending.student.id,studentName:pending.student.name,behavior:pending.behavior,xp:XP,source:pending.source,center:'계명태권도',date:today(),createdAt:new Date().toISOString(),version:VERSION});
    save(rows); const name=pending.student.name, behavior=pending.behavior; closeConfirm(); renderRecent(); showToast(`🔥 ${name} · ${behavior} · +${XP} XP`);
    selectedBehavior=null; renderBehaviors(); updateSelection();
  }
  function undo(){
    const rows=load(); if(!rows.length)return; const last=rows.pop(); save(rows); renderRecent(); showToast(`↶ ${last.studentName} · ${last.behavior} 등록을 취소했습니다.`);
  }
  let toastTimer;
  function showToast(msg){clearTimeout(toastTimer);$('toast').textContent=msg;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,2600)}
  function findBehavior(text){
    const aliases={
      '부모님 돕기':['부모님 돕기','부모님도와','부모 돕기','부모님 도움'],
      '친구 배려':['친구 배려','친구배려','친구 도움','친구도움'],
      '정리정돈':['정리정돈','정리 정돈','정리'],
      '약속 지키기':['약속 지키기','약속지키기','약속'],
      '운동·도전':['운동 도전','운동','도전'],
      '독서·학습':['독서 학습','독서','학습','책읽기'],
      '봉사·나눔':['봉사 나눔','봉사활동','봉사','나눔'],
      '용기 있는 행동':['용기 있는 행동','용기있는행동','용기'],
      '기타 좋은 실천':['좋은 실천','좋은 행동']
    };
    return Object.entries(aliases).find(([,words])=>words.some(w=>text.includes(w)))?.[0]||null;
  }
  function parseVoice(text){
    const s=students.find(st=>text.replace(/\s/g,'').includes(st.name.replace(/\s/g,'')));
    const b=findBehavior(text);
    if(s&&b){selectedStudent=s;selectedBehavior=b;renderStudents($('studentSearch').value);renderBehaviors();updateSelection();openConfirm(s,b,'voice');return true}
    showToast('이름과 행동을 함께 인식하지 못했습니다. 다시 말해 주세요.'); return false;
  }
  function startVoice(){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){showToast('이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome/Edge를 사용해 주세요.');return}
    const r=new SpeechRecognition(); r.lang='ko-KR'; r.interimResults=false; r.maxAlternatives=1;
    $('voiceBtn').classList.add('listening'); $('voiceBtn').textContent='🎙 듣고 있습니다…'; $('voiceHint').textContent='이름과 행동을 말씀해 주세요.';
    r.onresult=e=>{const text=e.results[0][0].transcript; $('voiceHint').textContent=`인식: “${text}”`; parseVoice(text)};
    r.onerror=()=>showToast('음성 인식에 실패했습니다. 다시 시도해 주세요.');
    r.onend=()=>{$('voiceBtn').classList.remove('listening');$('voiceBtn').textContent='🎙 음성으로 등록'};
    r.start();
  }
  $('studentSearch').addEventListener('input',e=>renderStudents(e.target.value));
  $('clearSearch').onclick=()=>{$('studentSearch').value='';renderStudents('')};
  $('registerBtn').onclick=()=>openConfirm(selectedStudent,selectedBehavior,'touch');
  $('cancelConfirm').onclick=closeConfirm; $('confirmSave').onclick=commit; $('undoBtn').onclick=undo; $('voiceBtn').onclick=startVoice;
  $('confirmModal').addEventListener('click',e=>{if(e.target===$('confirmModal'))closeConfirm()});
  renderStudents(); renderBehaviors(); updateSelection(); renderRecent();
})();
