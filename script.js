/* =========================================================
   AAYUSH — PORTFOLIO SCRIPT
   1. Preloader
   2. Custom cursor
   3. Particle field (canvas, GPU-friendly)
   4. Navbar scroll state + mobile menu
   5. Typing animation
   6. Scroll reveal (IntersectionObserver)
   7. Animated counters
   8. Ripple micro-interaction
   9. 3D tilt on cards
   10. Contact form (client-side only)
   11. Misc (year, back-to-top, clock, scroll indicator)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  const loaderProgress = document.getElementById('loaderProgress');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.style.overflow = '';
        playHeroIntro();
      }, 300);
    }
    loaderProgress.style.width = progress + '%';
  }, 180);
  document.body.style.overflow = 'hidden';

  /* ---------- 2. CUSTOM CURSOR ---------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorGlow = document.getElementById('cursorGlow');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!isTouch) {
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });
    (function animateGlow() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateGlow);
    })();

    document.querySelectorAll('a, button, .skill-card, .project-card, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.style.transform += ' scale(2.2)');
      el.addEventListener('mouseleave', () => {});
    });
  }

  /* ---------- 3. PARTICLE FIELD ---------- */
  const canvas = document.getElementById('particleField');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const PARTICLE_COUNT = window.innerWidth < 768 ? 45 : 90;
  const colors = ['#a78bfa', '#c4b5fd', '#8b5cf6', '#d8b46a'];

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }
  initParticles();

  let pointerX = W / 2, pointerY = H / 2;
  window.addEventListener('mousemove', (e) => { pointerX = e.clientX; pointerY = e.clientY; });

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;

      // gentle attraction toward pointer
      const dx = pointerX - p.x, dy = pointerY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        p.x -= dx * 0.0018;
        p.y -= dy * 0.0018;
      }

      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    }

    // faint connecting lines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#a78bfa';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---------- 4. NAVBAR ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 600);
  });

  const navBurger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  navBurger.addEventListener('click', () => {
    navBurger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navBurger.classList.remove('active');
    mobileMenu.classList.remove('open');
  }));

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 5. TYPING ANIMATION ---------- */
  const typedTextEl = document.getElementById('typedText');
  const roles = ['Discord Bot Developer', 'Graphic Designer', 'Brand Identity Designer', 'Creative Thinker'];
  let roleIndex = 0, charIndex = 0, deleting = false;

  function typeLoop() {
    const current = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      typedTextEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      charIndex--;
      typedTextEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 35 : 65);
  }
  setTimeout(typeLoop, 900);

  /* ---------- 6. SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-line, .skill-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  function playHeroIntro() {
    document.querySelectorAll('.hero .reveal-line, .hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), 150 + i * 120);
    });
  }

  /* ---------- 7. ANIMATED COUNTERS ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const duration = 1600;
        const startTime = performance.now();
        function tick(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.round(target * eased);
          el.textContent = current;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- 8. RIPPLE MICRO-INTERACTION ---------- */
  document.querySelectorAll('.ripple').forEach(el => {
    el.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-fx';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      this.classList.add('is-bouncing');
      setTimeout(() => ripple.remove(), 700);
      setTimeout(() => this.classList.remove('is-bouncing'), 350);
    });
  });

  /* ---------- 9. 3D TILT ---------- */
  const tiltEls = document.querySelectorAll('[data-tilt]');
  if (!isTouch) {
    tiltEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- 10. CONTACT FORM ---------- */
  const form = document.getElementById('contactForm');
  const formBtnText = document.getElementById('formBtnText');
  const formNote = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formBtnText.textContent = 'Sending...';
    setTimeout(() => {
      formBtnText.textContent = 'Send message';
      formNote.textContent = 'Thanks — your message details are ready. Connect this form to your email service to receive it.';
      form.reset();
    }, 1000);
  });

  /* ---------- 11. MISC ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  const mmClock = document.getElementById('mmClock');
  function updateClock() {
    if (!mmClock) return;
    const now = new Date();
    mmClock.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 30000);

  document.getElementById('scrollIndicator').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });

});
