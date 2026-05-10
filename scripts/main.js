/**
 * Project Networks — Anime.js Powered Interactions
 * Canvas particles · Stagger reveals · Text split · Mockup animation
 */
(function () {
  'use strict';

  /* =====================================================
     UTILITIES
     ===================================================== */

  /** Split element text into individual <span class="char"> elements */
  function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = text.split('').map(c =>
      c === ' '
        ? '<span class="char" style="display:inline-block;width:0.3em">&nbsp;</span>'
        : `<span class="char">${c}</span>`
    ).join('');
    return el.querySelectorAll('.char');
  }

  /* =====================================================
     PARTICLE CANVAS
     ===================================================== */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const MAX_DIST = 140;
    const COUNT = window.innerWidth < 768 ? 40 : 80;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function Particle() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.4 + 0.1;
    }

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    };

    resize();
    window.addEventListener('resize', function () {
      resize();
      particles = Array.from({ length: COUNT }, () => new Particle());
    });

    particles = Array.from({ length: COUNT }, () => new Particle());

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const strength = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${strength})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* =====================================================
     PRELOADER
     ===================================================== */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill      = document.querySelector('.preloader-fill');
    const label     = document.querySelector('.preloader-label');
    const pLogo     = document.querySelectorAll('.preloader-logo span');

    // Animate the P and N letters in
    anime({
      targets: pLogo,
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(150),
      easing: 'easeOutExpo',
      duration: 700,
      complete: function () {
        // Fade in label
        anime({ targets: label, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });
      }
    });

    // Animate progress bar
    let progress = 0;
    const interval = setInterval(function () {
      progress += Math.random() * 18 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (fill) fill.style.width = '100%';
        setTimeout(hidePreloader, 400);
      } else {
        if (fill) fill.style.width = progress + '%';
      }
    }, 80);

    function hidePreloader() {
      if (!preloader) return;
      preloader.classList.add('hidden');
      setTimeout(function () {
        preloader.style.display = 'none';
        initHero();
        initOrbAnimation();
      }, 650);
    }

    // Fallback: hide after 3.5s regardless
    setTimeout(function () {
      if (preloader && !preloader.classList.contains('hidden')) {
        hidePreloader();
      }
    }, 3500);
  }

  /* =====================================================
     GRADIENT ORB ANIMATION
     ===================================================== */
  function initOrbAnimation() {
    const orbs = document.querySelectorAll('.gradient-orb');

    orbs.forEach(function (orb, i) {
      // Fade in
      anime({ targets: orb, opacity: [0, 0.25], duration: 1500, easing: 'easeOutQuad' });

      // Continuous float
      anime({
        targets: orb,
        translateX: [
          { value: (i % 2 === 0 ? 60 : -60), duration: 8000 + i * 2000 },
          { value: 0, duration: 8000 + i * 2000 }
        ],
        translateY: [
          { value: (i % 2 === 0 ? -40 : 50), duration: 8000 + i * 2000 },
          { value: 0, duration: 8000 + i * 2000 }
        ],
        scale: [
          { value: 1.1, duration: 8000 + i * 2000 },
          { value: 0.9, duration: 8000 + i * 2000 }
        ],
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
        delay: i * 2000
      });
    });

    // Orb 3 loosely follows the mouse
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let orbX = mouseX, orbY = mouseY;
    const orb3 = document.querySelector('.orb-3');

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    (function trackMouse() {
      if (orb3) {
        orbX += (mouseX - orbX) * 0.03;
        orbY += (mouseY - orbY) * 0.03;
        orb3.style.left = orbX + 'px';
        orb3.style.top  = orbY + 'px';
      }
      requestAnimationFrame(trackMouse);
    })();
  }

  /* =====================================================
     HERO ENTRANCE ANIMATION
     ===================================================== */
  function initHero() {
    // Split the main title text
    const titleLine2 = document.querySelector('.split-text');
    if (titleLine2) splitChars(titleLine2);

    const tl = anime.timeline({ easing: 'easeOutExpo' });

    // Nav items
    tl.add({
      targets: '.nav-link',
      opacity: [0, 1],
      translateY: [-15, 0],
      delay: anime.stagger(60),
      duration: 600
    }, 0);

    // Hero badge
    tl.add({
      targets: '#hero-badge',
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 500,
      easing: 'easeOutBack'
    }, 300);

    // "Welcome to" line
    tl.add({
      targets: '.hero-line-1',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    }, 500);

    // Character stagger for "Project Networks"
    tl.add({
      targets: '.hero-line-2 .char',
      opacity: [0, 1],
      translateY: [60, 0],
      rotateX: [-90, 0],
      delay: anime.stagger(35),
      duration: 700,
      easing: 'easeOutBack'
    }, 650);

    // Subtitle
    tl.add({
      targets: '#hero-sub',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    }, 1300);

    // Description
    tl.add({
      targets: '#hero-desc',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    }, 1450);

    // Buttons
    tl.add({
      targets: '#hero-actions',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    }, 1600);

    // Stats
    tl.add({
      targets: '#hero-stats',
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 600
    }, 1750);
  }

  /* =====================================================
     NAVIGATION
     ===================================================== */
  function initNav() {
    const nav    = document.getElementById('main-nav');
    const toggle = document.getElementById('nav-toggle');
    const links  = document.getElementById('nav-links');

    // Site switcher dropdown
    const dropTrigger = document.getElementById('site-dropdown-trigger');
    const dropdown    = document.getElementById('site-dropdown');
    let dropTimer;

    if (dropTrigger && dropdown) {
      dropTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      const logoEl = dropTrigger.closest('.logo');
      if (logoEl) {
        logoEl.addEventListener('mouseenter', function () { clearTimeout(dropTimer); dropdown.classList.add('active'); });
        logoEl.addEventListener('mouseleave', function () { dropTimer = setTimeout(function () { dropdown.classList.remove('active'); }, 200); });
      }
      dropdown.addEventListener('mouseenter', function () { clearTimeout(dropTimer); });
      dropdown.addEventListener('mouseleave', function () { dropTimer = setTimeout(function () { dropdown.classList.remove('active'); }, 200); });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.logo') && !e.target.closest('.site-dropdown')) dropdown.classList.remove('active');
      });
    }

    // Scroll: glass nav
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Back to top visibility
      const btt = document.getElementById('backToTop');
      if (btt) {
        if (window.scrollY > 400) {
          btt.classList.add('visible');
        } else {
          btt.classList.remove('visible');
        }
      }

      updateActiveNav();
    }, { passive: true });

    // Mobile toggle
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', links.classList.contains('open'));
      });

      // Close on link click
      links.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          toggle.classList.remove('active');
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });

    // Back to top
    const btt = document.getElementById('backToTop');
    if (btt) {
      btt.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    document.querySelectorAll('section[id]').forEach(function (section) {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector('.nav-link[href="#' + id + '"]');
      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      }
    });
  }

  /* =====================================================
     SCROLL REVEAL (IntersectionObserver + Anime.js)
     ===================================================== */
  function initScrollReveal() {
    // Section reveals
    const sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          sectionObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal-section').forEach(function (el) {
      sectionObs.observe(el);
    });

    // Project cards stagger
    const cardObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.pcard');
          anime({
            targets: cards,
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.95, 1],
            delay: anime.stagger(140),
            duration: 700,
            easing: 'easeOutBack',
            complete: function () {
              cards.forEach(function (c) { c.classList.add('visible'); });
            }
          });
          cardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card-grid').forEach(function (el) { cardObs.observe(el); });

    // Launcher features stagger
    const lfObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.lf-item');
          anime({
            targets: items,
            opacity: [0, 1],
            translateX: [-24, 0],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutExpo',
            complete: function () {
              items.forEach(function (i) { i.classList.add('visible'); });
            }
          });
          lfObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const lf = document.getElementById('launcher-features');
    if (lf) lfObs.observe(lf);

    // Launcher mockup
    const mockupObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          initMockupAnimation();
          mockupObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const mockup = document.getElementById('launcher-mockup');
    if (mockup) mockupObs.observe(mockup);

    // How it works steps
    const hiwObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const steps  = entry.target.querySelectorAll('.hiw-step');
          const arrows = entry.target.querySelectorAll('.hiw-arrow');

          anime({
            targets: steps,
            opacity: [0, 1],
            translateY: [24, 0],
            scale: [0.95, 1],
            delay: anime.stagger(150),
            duration: 700,
            easing: 'easeOutBack',
            complete: function () {
              steps.forEach(function (s) { s.classList.add('visible'); });
            }
          });

          anime({
            targets: arrows,
            opacity: [0, 0.4],
            delay: anime.stagger(150, { start: 300 }),
            duration: 500,
            easing: 'easeOutQuad',
            complete: function () {
              arrows.forEach(function (a) { a.classList.add('visible'); });
            }
          });

          hiwObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const hiw = document.getElementById('how-it-works');
    if (hiw) hiwObs.observe(hiw);

    // Stats counter
    const statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          initCounters(entry.target);
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stats-section, .about-visual').forEach(function (el) {
      statsObs.observe(el);
    });

    // Tech badges & CTA
    const genObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target.querySelectorAll('.tech-badge'),
            opacity: [0, 1],
            scale: [0.8, 1],
            delay: anime.stagger(60),
            duration: 400,
            easing: 'easeOutBack'
          });
          genObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.tech-badges').forEach(function (el) { genObs.observe(el); });
  }

  /* =====================================================
     MOCKUP ANIMATION
     ===================================================== */
  function initMockupAnimation() {
    const mockup   = document.getElementById('launcher-mockup');
    if (!mockup) return;

    const tl = anime.timeline({ easing: 'easeOutExpo' });

    // Mockup slides in
    tl.add({
      targets: mockup,
      opacity: [0, 1],
      translateX: [60, 0],
      duration: 800,
      complete: function () { mockup.classList.add('visible'); }
    }, 0);

    // Section label
    tl.add({
      targets: '.mockup-section-label',
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 400
    }, 500);

    // Sidebar items stagger
    tl.add({
      targets: '.ms-item',
      opacity: [0, 1],
      translateX: [-12, 0],
      delay: anime.stagger(100),
      duration: 400
    }, 600);

    // Account row
    tl.add({
      targets: '.ms-account',
      opacity: [0, 1],
      duration: 400
    }, 900);

    // Pack card
    tl.add({
      targets: '.mockup-pack-card',
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 500,
      easing: 'easeOutBack',
      complete: function () {
        document.querySelector('.mockup-pack-card').style.transform = '';
      }
    }, 1000);

    // Progress bar
    tl.add({
      targets: '.mockup-progress-area',
      opacity: [0, 1],
      duration: 400
    }, 1400);

    tl.add({
      targets: '#mockup-progress-fill',
      width: ['0%', '100%'],
      duration: 1200,
      easing: 'easeInOutQuart'
    }, 1600);

    // Update badge
    tl.add({
      targets: '.mockup-update-badge',
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 400
    }, 2000);

    // Float tags
    tl.add({
      targets: ['.tag-1', '.tag-2', '.tag-3'],
      opacity: [0, 1],
      scale: [0.8, 1],
      delay: anime.stagger(200),
      duration: 500,
      easing: 'easeOutBack'
    }, 2000);

    // Float tags continuous animation
    anime({
      targets: '.mockup-float-tag',
      translateY: [-4, 4],
      duration: 2500,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(500)
    });
  }

  /* =====================================================
     COUNTER ANIMATION
     ===================================================== */
  function initCounters(container) {
    container.querySelectorAll('.stat-count[data-target], .av-num[data-target]').forEach(function (el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const obj = { val: 0 };
      anime({
        targets: obj,
        val: target,
        round: 1,
        duration: 2000,
        easing: 'easeInOutExpo',
        update: function () {
          el.textContent = Math.round(obj.val);
        }
      });
    });
  }

  /* =====================================================
     BUTTON RIPPLE
     ===================================================== */
  function initRipple() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const d = Math.max(btn.offsetWidth, btn.offsetHeight);
        const r = d / 2;
        ripple.style.cssText = [
          'width:' + d + 'px',
          'height:' + d + 'px',
          'left:' + (e.clientX - btn.getBoundingClientRect().left - r) + 'px',
          'top:'  + (e.clientY - btn.getBoundingClientRect().top  - r) + 'px',
          'position:absolute',
          'border-radius:50%',
          'pointer-events:none'
        ].join(';');
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });
  }

  /* =====================================================
     CARD MAGNETIC HOVER (subtle)
     ===================================================== */
  function initCardTilt() {
    document.querySelectorAll('.pcard, .av-card, .hiw-step').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dx    = (e.clientX - cx) / (rect.width  / 2);
        const dy    = (e.clientY - cy) / (rect.height / 2);
        const tiltX = dy * -5;
        const tiltY = dx * 5;

        anime({
          targets: card,
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 200,
          easing: 'easeOutQuad'
        });
      });

      card.addEventListener('mouseleave', function () {
        anime({
          targets: card,
          rotateX: 0,
          rotateY: 0,
          duration: 400,
          easing: 'easeOutElastic(1, 0.6)'
        });
      });
    });
  }

  /* =====================================================
     ICON PULSE ON HOVER
     ===================================================== */
  function initIconAnimations() {
    document.querySelectorAll('.lf-icon, .af-icon, .hiw-icon, .av-icon').forEach(function (icon) {
      icon.addEventListener('mouseenter', function () {
        anime({
          targets: icon,
          scale: [1, 1.12],
          duration: 300,
          easing: 'easeOutBack'
        });
      });
      icon.addEventListener('mouseleave', function () {
        anime({
          targets: icon,
          scale: [1.12, 1],
          duration: 400,
          easing: 'easeOutElastic(1, 0.5)'
        });
      });
    });
  }

  /* =====================================================
     INIT
     ===================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initPreloader();
    initNav();
    initScrollReveal();
    initRipple();
    initCardTilt();
    initIconAnimations();
  });

})();
