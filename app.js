const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
const progress=document.getElementById('globalProgress');
const scenes=[...document.querySelectorAll('[data-motion-scene]')];
const navLinks=[...document.querySelectorAll('.chapter-nav a')];
const toast=document.getElementById('toast');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf=0, soundOn=false, audioCtx=null;

function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1800)}
function tone(freq=480,d=.055){if(!soundOn)return;try{audioCtx||=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.018,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+d);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+d)}catch{}}

function beatOpacity(p,at){const enter=clamp((p-at)/.10);const leave=at>.78?1:clamp((1-p)/.07);return Math.min(enter,leave)}
function update(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${max?clamp(scrollY/max)*100:0}%`;
  let active=null,best=Infinity;
  for(const scene of scenes){
    const rect=scene.getBoundingClientRect();
    const travel=Math.max(1,scene.offsetHeight-innerHeight);
    const p=clamp(-rect.top/travel);
    scene.style.setProperty('--p',p.toFixed(4));
    const stage=scene.querySelector('.sticky-stage');
    const art=scene.querySelector('.scene-media img,.scene-poster');
    if(art&&!reduceMotion){
      const dir=scene.dataset.direction;
      const dx=dir==='right'?(p-.5)*34:dir==='left'?(0.5-p)*34:0;
      const dy=dir==='up'?(0.5-p)*28:(p-.5)*8;
      const scale=1.015+p*.055;
      art.style.setProperty('--art-x',`${dx}px`);art.style.setProperty('--art-y',`${dy}px`);art.style.setProperty('--art-scale',scale.toFixed(3));
    }
    scene.querySelectorAll('.beat').forEach(el=>{
      const at=parseFloat(el.dataset.at||'.2');
      const o=reduceMotion?1:beatOpacity(p,at);
      el.style.opacity=o.toFixed(3);
      if(o>.08)el.classList.add('is-on');else el.classList.remove('is-on');
    });
    const distance=Math.abs(rect.top+rect.height/2-innerHeight/2);
    if(distance<best){best=distance;active=scene.id}
    if(stage)stage.style.setProperty('--local-progress',p.toFixed(3));
  }
  navLinks.forEach(a=>a.classList.toggle('active',a.dataset.id===active));
  raf=0;
}
function requestUpdate(){if(!raf)raf=requestAnimationFrame(update)}
addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);update();

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>tone(410,.04)));
const soundBtn=document.getElementById('soundToggle');soundBtn?.addEventListener('click',()=>{soundOn=!soundOn;soundBtn.querySelector('b').textContent=soundOn?'ON':'OFF';tone(620,.08);showToast(soundOn?'Sonido suave activado':'Sonido desactivado')});

document.querySelectorAll('#scienceButtons button').forEach((btn,i)=>btn.addEventListener('click',()=>{document.querySelectorAll('#scienceButtons button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.getElementById('scienceOutput').textContent=btn.dataset.copy;tone(520+i*70,.06)}));

const form=document.getElementById('predictionForm'),input=document.getElementById('predictionInput'),result=document.getElementById('predictionResult');
try{const saved=localStorage.getItem('evolucion-prediccion-v2');if(saved){input.value=saved;result.textContent=`“${saved}”`}}catch{}
form?.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value){showToast('Escribe primero una predicción.');return}try{localStorage.setItem('evolucion-prediccion-v2',value)}catch{}result.textContent=`“${value}”`;showToast('Tu viñeta quedó guardada.');tone(720,.09)});

addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const ids=scenes.map(s=>s.id);let idx=ids.indexOf(navLinks.find(a=>a.classList.contains('active'))?.dataset.id);if(e.key==='ArrowDown'||e.key==='ArrowRight'){idx=Math.min(ids.length-1,Math.max(0,idx+1));document.getElementById(ids[idx])?.scrollIntoView({behavior:reduceMotion?'auto':'smooth'})}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){idx=Math.max(0,idx-1);document.getElementById(ids[idx])?.scrollIntoView({behavior:reduceMotion?'auto':'smooth'})}});