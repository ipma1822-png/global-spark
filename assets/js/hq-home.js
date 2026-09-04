// GLOBAL SPARK HQ HOME · v3.2.0
(function(){
 const $=id=>document.getElementById(id),menu=$('mobileMenu'),hamb=$('hamb'),close=$('mobileClose');
 function set(open){if(!menu)return;menu.classList.toggle('open',open);document.body.style.overflow=open?'hidden':'';hamb?.setAttribute('aria-expanded',String(open))}
 hamb?.addEventListener('click',()=>set(true));close?.addEventListener('click',()=>set(false));menu?.addEventListener('click',e=>{if(e.target===menu||e.target.closest('a'))set(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
})();