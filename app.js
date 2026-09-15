const progressBar = document.getElementById('progressBar');
const soundButton = document.getElementById('soundButton');
const toast = document.getElementById('toast');
const sections = [...document.querySelectorAll('.chapter')];
const timelineLinks = [...document.querySelectorAll('.timeline a')];
const reveals = [...document.querySelectorAll('.reveal')];
let soundEnabled = false;
let audioContext = null;

// Keep the chapter illustrations crisp and responsive without another dependency.
document.querySelectorAll('.scene-art').forEach(img => {
  Object.assign(img.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform .8s cubic-bezier(.2,.8,.2,1), filter .8s ease'
  });
});

function updateProgress() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
  progressBar.style.width = `${ratio * 100}%`;
}

function setActiveChapter(id) {
  timelineLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === id);
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.16 });
reveals.forEach(el => revealObserver.observe(el));

const chapterObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActiveChapter(visible.target.id);
}, { rootMargin: '-30% 0px -45% 0px', threshold: [0.05, 0.2, 0.4] });
sections.forEach(section => chapterObserver.observe(section));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2100);
}

function tone(frequency = 440, duration = 0.08, type = 'sine') {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.04, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (_) {}
}

soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.textContent = soundEnabled ? '🔊' : '🔇';
  soundButton.setAttribute('aria-label', soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos');
  if (soundEnabled) {
    tone(520, 0.11);
    setTimeout(() => tone(660, 0.11), 90);
    showToast('Sonidos suaves activados');
  } else {
    showToast('Sonidos desactivados');
  }
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => tone(420, 0.06));
});

document.querySelector('.discover')?.addEventListener('click', () => {
  tone(520, 0.09);
  showToast('Recolectar, cazar y pescar fueron estrategias esenciales para conseguir alimento.');
});

const growButton = document.getElementById('growButton');
growButton?.addEventListener('click', () => {
  const stage = growButton.closest('.field-stage');
  stage.classList.toggle('grown');
  const grown = stage.classList.contains('grown');
  const art = stage.querySelector('.scene-art');
  if (art) {
    art.style.transform = grown ? 'scale(1.055)' : 'scale(1)';
    art.style.filter = grown ? 'saturate(1.12) brightness(1.04)' : 'none';
  }
  growButton.textContent = grown ? '🌾 ¡Cosecha lista!' : '🌱 Hacer crecer el cultivo';
  tone(grown ? 660 : 460, 0.1);
  showToast(grown ? 'La agricultura permitió producir y almacenar alimentos.' : 'El cultivo vuelve a comenzar.');
});

document.querySelectorAll('#nutritionWheel button').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('nutritionInfo').textContent = button.dataset.info;
    tone(560 + Math.random() * 120, 0.07);
  });
});

const futureInput = document.getElementById('futureInput');
const futureButton = document.getElementById('futureButton');
const futureResult = document.getElementById('futureResult');

function readPrediction() {
  try { return localStorage.getItem('prediccion-alimentos-futuro'); }
  catch (_) { return null; }
}

function savePrediction(value) {
  try { localStorage.setItem('prediccion-alimentos-futuro', value); return true; }
  catch (_) { return false; }
}

futureButton?.addEventListener('click', () => {
  const value = futureInput.value.trim();
  if (!value) {
    futureResult.textContent = 'Primero escribe tu predicción 👀';
    tone(260, 0.1, 'triangle');
    return;
  }
  const saved = savePrediction(value);
  futureResult.textContent = saved
    ? `Predicción guardada: “${value}”`
    : `Tu predicción: “${value}”`;
  tone(640, 0.12);
  setTimeout(() => tone(800, 0.12), 100);
});

const savedPrediction = readPrediction();
if (savedPrediction && futureInput && futureResult) {
  futureInput.value = savedPrediction;
  futureResult.textContent = `Tu predicción anterior: “${savedPrediction}”`;
}

function parallax() {
  const y = window.scrollY;
  document.querySelectorAll('.hero-food').forEach((el, index) => {
    const speed = 0.04 + index * 0.018;
    el.style.translate = `0 ${y * speed}px`;
  });

  const seedBridge = document.querySelector('.seed-bridge');
  if (seedBridge) {
    const rect = seedBridge.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
    const stem = seedBridge.querySelector('.stem');
    const seed = seedBridge.querySelector('.seed');
    stem.style.transform = `scaleY(${Math.max(.08, progress)})`;
    seed.style.transform = `translateY(${40 - progress * 48}px) rotate(${8 - progress * 8}deg)`;
  }
}

let rafPending = false;
function onScroll() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    updateProgress();
    parallax();
    rafPending = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
parallax();

requestAnimationFrame(() => {
  document.querySelector('.hero .reveal')?.classList.add('visible');
});
