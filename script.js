/* ============================================================
   AURUM — Noctis Aurum
   script.js — GSAP + Three.js interactions
   ============================================================ */

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ------------------------------------------------------------
   Section scroll-margin (so #anchors land below the floating nav)
   ------------------------------------------------------------ */
document.querySelectorAll('section[id]').forEach(sec => {
  sec.style.scrollMarginTop = '110px';
});

/* ------------------------------------------------------------
   1. PRELOADER
   ------------------------------------------------------------ */
const preloader     = document.getElementById('preloader');
const preloaderFill  = document.getElementById('preloaderFill');
const preloaderCount = document.getElementById('preloaderCount');

let progress = { val: 0 };
const preloadTl = gsap.timeline({
  onComplete: () => {
    gsap.to(preloader, {
      autoAlpha: 0,
      duration: .9,
      ease: 'power2.inOut',
      onComplete: () => { preloader.style.display = 'none'; runHeroIntro(); }
    });
  }
});
preloadTl.to(progress, {
  val: 100,
  duration: 1.6,
  ease: 'power1.inOut',
  onUpdate: () => {
    const v = Math.round(progress.val);
    preloaderFill.style.width = v + '%';
    preloaderCount.textContent = v;
  }
});

/* ------------------------------------------------------------
   2. HERO INTRO TIMELINE (runs after preloader clears)
   ------------------------------------------------------------ */
function runHeroIntro(){
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('#particleCanvas', { opacity: 1, duration: 1.6 }, 0)
    .to('.nav', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0.1)
    .from('.hero__flower-stage', {
      opacity: 0, scale: .82, rotate: -6, duration: 1.6, ease: 'power3.out'
    }, 0.15)
    .from('.hero__panel--left', { opacity: 0, x: -40, duration: 1.1 }, 0.55)
    .from('.hero__panel--left .hero__facts li', { opacity: 0, y: 14, stagger: .08, duration: .7 }, 0.9)
    .from('.hero__panel--right', { opacity: 0, x: 40, duration: 1.1 }, 0.55)
    .from('.glance-card', { opacity: 0, x: 30, stagger: .1, duration: .7 }, 0.85)
    .from('.scroll-cue', { opacity: 0, y: 10, duration: .8 }, 1.2)
    .call(startFlowerLife);
}

/* ------------------------------------------------------------
   3. CONTINUOUS FLOWER LIFE — rotation + breathing
   ------------------------------------------------------------ */
function startFlowerLife(){
  const stage = document.getElementById('flowerStage');
  if (reduceMotion) return;

  // slow perpetual rotation
  gsap.to(stage, { rotate: 360, duration: 140, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });

  // breathing scale
  gsap.to(stage, {
    scale: 1.035,
    duration: 4.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });
}

/* ------------------------------------------------------------
   4. MOUSE PARALLAX — flower + particle camera
   ------------------------------------------------------------ */
const flowerParallax = document.getElementById('flowerParallax');
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth  - .5) * 2;
  mouseY = (e.clientY / window.innerHeight - .5) * 2;
});

gsap.ticker.add(() => {
  targetX += (mouseX - targetX) * 0.045;
  targetY += (mouseY - targetY) * 0.045;
  if (flowerParallax && !reduceMotion){
    flowerParallax.style.transform = `translate3d(${targetX * 18}px, ${targetY * 12}px, 0)`;
  }
});

/* ------------------------------------------------------------
   5. CUSTOM CURSOR
   ------------------------------------------------------------ */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch){
  let cx = 0, cy = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });

  gsap.ticker.add(() => {
    rx += (cx - rx) * 0.18;
    ry += (cy - ry) * 0.18;
    cursorDot.style.transform  = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
  });

  // Magnet effect
  document.querySelectorAll('[data-magnet]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('is-hover');
      gsap.to(el, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1, 0.4)' });
    });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: relX * 0.28, y: relY * 0.28, duration: .5, ease: 'power2.out' });
    });
  });
}

/* ------------------------------------------------------------
   6. THREE.JS AMBIENT PARTICLES
   ------------------------------------------------------------ */
(function initParticles(){
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  const count = window.innerWidth < 700 ? 220 : 520;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++){
    positions[i * 3]     = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // small soft circular sprite drawn on a canvas texture
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = spriteCanvas.height = 64;
  const sctx = spriteCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(240,217,168,1)');
  grad.addColorStop(0.4, 'rgba(201,168,117,0.55)');
  grad.addColorStop(1, 'rgba(201,168,117,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 64, 64);
  const sprite = new THREE.CanvasTexture(spriteCanvas);

  const material = new THREE.PointsMaterial({
    size: 0.11,
    map: sprite,
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let pMouseX = 0, pMouseY = 0;
  window.addEventListener('mousemove', (e) => {
    pMouseX = (e.clientX / window.innerWidth  - .5);
    pMouseY = (e.clientY / window.innerHeight - .5);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate(){
    requestAnimationFrame(animate);
    points.rotation.y += 0.00035;
    points.rotation.x += 0.00012;
    camera.position.x += (pMouseX * 2.4 - camera.position.x) * 0.02;
    camera.position.y += (-pMouseY * 1.6 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
})();

/* ------------------------------------------------------------
   7. NAVBAR — active link + mobile menu
   ------------------------------------------------------------ */
const navLinks   = document.querySelectorAll('.nav__link, .mobile-menu a');
const burger     = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('is-open');
  mobileMenu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', false);
  });
});

document.querySelectorAll('section[id]').forEach(sec => {
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 45%',
    end: 'bottom 45%',
    onToggle: (self) => {
      if (self.isActive){
        navLinks.forEach(l => l.classList.toggle('is-active', l.dataset.section === sec.id));
      }
    }
  });
});

/* ------------------------------------------------------------
   8. SCROLL-TRIGGERED REVEALS
   ------------------------------------------------------------ */
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  if (el.closest('.hero')) return; // hero panels are handled by runHeroIntro()
  gsap.fromTo(el, { autoAlpha: 0, y: 34 }, {
    autoAlpha: 1, y: 0, duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});

// stagger collection cards
gsap.utils.toArray('.collection__grid .bloom-card').forEach((card, i) => {
  gsap.fromTo(card, { autoAlpha: 0, y: 50 }, {
    autoAlpha: 1, y: 0, duration: .9, delay: (i % 3) * 0.08,
    ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 90%' }
  });
});

// story mini flower gentle float + rotation on scroll
if (!reduceMotion){
  gsap.to('.story__mini-flower', {
    rotate: 360, duration: 60, repeat: -1, ease: 'none', transformOrigin: '50% 50%'
  });
  gsap.fromTo('.story__visual', { y: 40 }, {
    y: -40, ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });
}

/* ------------------------------------------------------------
   9. SMOOTH ANCHOR SCROLL
   ------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id.length < 2) { e.preventDefault(); return; } // bare "#" placeholder (social icons)
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    gsap.to(window, { scrollTo: top, duration: 1.1, ease: 'power3.inOut' });
  });
});

/* ------------------------------------------------------------
   10. BACK TO TOP
   ------------------------------------------------------------ */
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ------------------------------------------------------------
   11. CONTACT FORM (front-end only — no backend wired up)
   ------------------------------------------------------------ */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = contactForm.fullName.value.trim();
  const email = contactForm.email.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailOk){
    formNote.textContent = 'Please enter your name and a valid email address.';
    gsap.fromTo(formNote, { x: -4 }, { x: 4, duration: .06, repeat: 5, yoyo: true, clearProps: 'x' });
    return;
  }

  formNote.textContent = `Thank you, ${name.split(' ')[0]} — your request has been noted. We reply within two evenings.`;
  contactForm.reset();
});

if (!isTouch){
  document.querySelectorAll('.bloom-card__media').forEach(media => {
    media.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
    media.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
  });
}

/* Refresh ScrollTrigger once everything (fonts/images) has settled */
window.addEventListener('load', () => ScrollTrigger.refresh());
