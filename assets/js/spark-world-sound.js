// GLOBAL SPARK · GAMEIFICATION 13 · Web Audio sound effects
// No external audio files. Audio starts only after a user gesture and respects mute preference.
(function(){
 let ctx=null,enabled=localStorage.getItem('sparkWorldSound')!=='off',armed=false;
 const AC=window.AudioContext||window.webkitAudioContext;
 function context(){if(!AC)return null;if(!ctx)ctx=new AC();if(ctx.state==='suspended')ctx.resume();return ctx}
 function tone(freq=440,dur=.12,type='sine',gain=.06,delay=0){if(!enabled||!armed)return;const c=context();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.03)}
 function success(){tone(523,.11,'triangle',.05);tone(659,.13,'triangle',.055,.08);tone(784,.18,'sine',.06,.17)}
 function quest(){tone(392,.1,'square',.035);tone(523,.12,'triangle',.05,.08);tone(659,.13,'triangle',.055,.16);tone(1047,.28,'sine',.065,.26)}
 function reward(){tone(659,.12,'triangle',.05);tone(831,.14,'triangle',.055,.08);tone(988,.18,'sine',.06,.17);tone(1319,.3,'sine',.055,.27)}
 function levelup(){[392,523,659,784,1047,1319].forEach((f,i)=>tone(f,.18,i<2?'triangle':'sine',.055,i*.09))}
 function click(){tone(330,.055,'sine',.025)}
 function play(name){({success,quest,reward,levelup,click}[name]||success)()}
 function arm(){armed=true;context();document.removeEventListener('pointerdown',arm,true);document.removeEventListener('keydown',arm,true)}
 document.addEventListener('pointerdown',arm,true);document.addEventListener('keydown',arm,true);
 document.addEventListener('spark-world:sound',e=>play(e.detail?.type||'success'));
 document.addEventListener('click',e=>{if(e.target.closest('.dock button,.action,.item-slot,.flame-card'))click()});
 function set(v){enabled=!!v;localStorage.setItem('sparkWorldSound',enabled?'on':'off');updateButton();if(enabled){armed=true;context();success()}}
 function updateButton(){const b=document.getElementById('soundToggle');if(b){b.textContent=enabled?'🔊':'🔇';b.title=enabled?'효과음 끄기':'효과음 켜기';b.setAttribute('aria-label',b.title)}}
 document.addEventListener('DOMContentLoaded',()=>{updateButton();document.getElementById('soundToggle')?.addEventListener('click',()=>set(!enabled))});
 window.SPARK_WORLD_SOUND={version:'13.0.0',play,set,get enabled(){return enabled}};
})();