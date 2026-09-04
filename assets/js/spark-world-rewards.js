// GLOBAL SPARK · GAMEIFICATION 10 · reward animation layer
(function(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function root(){let r=document.getElementById('rewardFx');if(r)return r;r=document.createElement('div');r.id='rewardFx';r.className='reward-fx';r.setAttribute('aria-hidden','true');document.body.appendChild(r);return r}
 function burst(opts={}){const r=root(),icon=opts.icon||'🔥',xp=Number(opts.xp||0),title=opts.title||'불꽃이 더 밝아졌어요!';r.innerHTML=`<div class="reward-flash"></div><div class="reward-burst"><div class="reward-ring"></div><div class="reward-icon">${icon}</div><b>${title}</b>${xp?`<strong>+${xp} XP</strong>`:''}</div>`;if(!reduce){for(let i=0;i<18;i++){const s=document.createElement('i');s.className='reward-particle';s.textContent=i%3===0?'★':i%3===1?'✦':'🔥';s.style.setProperty('--a',(i*20)+'deg');s.style.setProperty('--d',(90+(i%5)*18)+'px');r.appendChild(s)}}r.classList.remove('show');void r.offsetWidth;r.classList.add('show');setTimeout(()=>{r.classList.remove('show');r.innerHTML=''},1500)}
 function reveal(kind,name,icon){const r=root();r.innerHTML=`<div class="reward-flash"></div><div class="reward-reveal"><small>${kind||'NEW REWARD'}</small><div>${icon||'🎁'}</div><b>${name||'새로운 보상 발견!'}</b><span>✨ 새롭게 열렸어요!</span></div>`;r.classList.remove('show');void r.offsetWidth;r.classList.add('show');setTimeout(()=>{r.classList.remove('show');r.innerHTML=''},1900)}
 window.SPARK_WORLD_REWARDS={version:'10.0.0',burst,reveal};
 document.addEventListener('spark-world:reward',e=>burst(e.detail||{}));
})();