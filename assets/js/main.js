/* ===========================================================
   HOLLYWOOD CLINIC — main.js
   Scroll reveal, mobile menu, before/after slider, etc.
   =========================================================== */

(function () {
  'use strict';

  // ============ Scroll Reveal ============
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add('visible'));
  }

  // ============ Mobile Menu ============
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============ Treatments Submenu (desktop dropdown + mobile accordion) ============
  // Desktop: click button to toggle dropdown; close on outside click or Escape.
  document.querySelectorAll('.nav-submenu-wrapper').forEach((wrap) => {
    const btn = wrap.querySelector('.nav-submenu-toggle');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close when a submenu item is clicked
    wrap.querySelectorAll('.nav-submenu a').forEach((a) => {
      a.addEventListener('click', () => {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });
  // Outside click closes any open desktop submenu
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-submenu-wrapper.open').forEach((w) => {
      if (!w.contains(e.target)) {
        w.classList.remove('open');
        const tBtn = w.querySelector('.nav-submenu-toggle');
        if (tBtn) tBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-submenu-wrapper.open').forEach((w) => {
        w.classList.remove('open');
        const tBtn = w.querySelector('.nav-submenu-toggle');
        if (tBtn) tBtn.setAttribute('aria-expanded', 'false');
      });
    }
  });
  // Mobile accordion submenu
  document.querySelectorAll('.mobile-submenu-wrapper').forEach((wrap) => {
    const btn = wrap.querySelector('.mobile-submenu-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // ============ 2nd-level submenu (Body Shaping / Skin Rejuvenation) ============
  // Desktop: nested side-flyout — clicking a sub-sub toggle opens the nested panel.
  // Only one nested panel within the same parent submenu can be open at a time.
  document.querySelectorAll('.nav-subsubmenu-toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger the outside-click closer for the parent submenu
      const wrap = btn.parentElement; // .nav-subsubmenu-wrapper
      const wasOpen = wrap.classList.contains('open');
      // Close all sibling nested panels first
      const parentMenu = wrap.parentElement;
      if (parentMenu) {
        parentMenu.querySelectorAll('.nav-subsubmenu-wrapper.open').forEach((w) => {
          if (w !== wrap) {
            w.classList.remove('open');
            const tBtn = w.querySelector('.nav-subsubmenu-toggle');
            if (tBtn) tBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
      // Toggle this one
      if (wasOpen) {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        wrap.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Mobile: nested accordion — clicking a sub-sub toggle expands the nested items.
  document.querySelectorAll('.mobile-subsubmenu-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrap = btn.parentElement; // .mobile-subsubmenu-wrapper
      const isOpen = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // ============ Active Nav State ============
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const target = link.getAttribute('data-nav');
    if (target === path || (path === '' && target === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ============ Before / After Slider ============
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const before = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    if (!before || !handle) return;

    const isRTL = document.body.getAttribute('dir') === 'rtl';
    let dragging = false;

    function setPosition(pct) {
      pct = Math.max(5, Math.min(95, pct));
      handle.style.left = pct + '%';
      if (isRTL) {
        before.style.clipPath = `inset(0 0 0 ${pct}%)`;
      } else {
        before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      }
    }

    function moveFromEvent(clientX) {
      const rect = slider.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setPosition(pct);
    }

    slider.addEventListener('mousedown', (e) => {
      dragging = true;
      moveFromEvent(e.clientX);
      e.preventDefault();
    });
    slider.addEventListener('touchstart', (e) => {
      dragging = true;
      moveFromEvent(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => { if (dragging) moveFromEvent(e.clientX); });
    window.addEventListener('touchmove', (e) => { if (dragging) moveFromEvent(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });

    // Animate on first scroll-in
    const sliderIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !slider.dataset.animated) {
          slider.dataset.animated = 'true';
          let start = performance.now();
          const dur = 1800;
          function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            // ease in-out then settle around 30%
            const eased = t < 0.5
              ? 50 + (25 - 50) * (t * 2)
              : 25 + (75 - 25) * ((t - 0.5) * 2);
            const final = t < 1 ? eased : 35;
            setPosition(final);
            if (t < 1) requestAnimationFrame(tick);
          }
          setTimeout(() => requestAnimationFrame(tick), 300);
          sliderIO.unobserve(slider);
        }
      });
    }, { threshold: 0.4 });
    sliderIO.observe(slider);
  });

  // ============ Navbar shadow on scroll ============
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 20) {
        nav.style.boxShadow = '0 4px 20px -8px rgba(11,29,58,0.1)';
      } else {
        nav.style.boxShadow = '';
      }
      lastY = y;
    }, { passive: true });
  }
})();

/* ═══════════════════════════════════════════════════════════
   TESTIMONIAL SLIDESHOW — one at a time, auto-advancing
   ═══════════════════════════════════════════════════════════ */
(function () {
  function initSlideshow(root) {
    var track  = root.querySelector('[data-testimonial-track]');
    var prev   = root.querySelector('[data-testimonial-prev]');
    var next   = root.querySelector('[data-testimonial-next]');
    var dotsEl = root.querySelector('[data-testimonial-dots]');
    if (!track) return;

    var cards = Array.prototype.slice.call(track.children);
    if (cards.length <= 1) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      if (dotsEl) dotsEl.style.display = 'none';
      return;
    }

    var index = 0;
    var autoplayMs = parseInt(root.getAttribute('data-autoplay-ms'), 10) || 6000;
    var timer = null;
    var isHover = false;

    // Build dots
    if (dotsEl) {
      dotsEl.innerHTML = '';
      cards.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'testimonial-dot';
        dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', function () { goTo(i, true); });
        dotsEl.appendChild(dot);
      });
    }

    function isRTL() { return document.body.getAttribute('dir') === 'rtl'; }

    function applyTransform() {
      var pct = index * 100;
      track.style.transform = 'translateX(' + (isRTL() ? '' : '-') + pct + '%)';
    }

    function updateDots() {
      if (!dotsEl) return;
      var ds = dotsEl.querySelectorAll('.testimonial-dot');
      for (var i = 0; i < ds.length; i++) {
        if (i === index) ds[i].setAttribute('aria-current', 'true');
        else ds[i].removeAttribute('aria-current');
      }
    }

    function goTo(i, userTriggered) {
      index = (i + cards.length) % cards.length;
      applyTransform();
      updateDots();
      if (userTriggered) restartAutoplay();
    }

    function nextSlide() { goTo(index + 1); }
    function prevSlide() { goTo(index - 1); }

    function startAutoplay() {
      stopAutoplay();
      if (autoplayMs > 0) {
        timer = setInterval(function () {
          if (!isHover && !document.hidden) nextSlide();
        }, autoplayMs);
      }
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (prev) prev.addEventListener('click', function () { prevSlide(); restartAutoplay(); });
    if (next) next.addEventListener('click', function () { nextSlide(); restartAutoplay(); });

    root.addEventListener('mouseenter', function () { isHover = true; });
    root.addEventListener('mouseleave', function () { isHover = false; });
    root.addEventListener('focusin', function () { isHover = true; });
    root.addEventListener('focusout', function () { isHover = false; });

    // Keyboard support
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { isRTL() ? nextSlide() : prevSlide(); restartAutoplay(); }
      if (e.key === 'ArrowRight') { isRTL() ? prevSlide() : nextSlide(); restartAutoplay(); }
    });

    // Touch swipe support (mobile)
    var startX = 0, deltaX = 0, swiping = false;
    track.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      deltaX = 0;
      swiping = true;
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!swiping || e.touches.length !== 1) return;
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (!swiping) return;
      swiping = false;
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) { isRTL() ? prevSlide() : nextSlide(); }
        else            { isRTL() ? nextSlide() : prevSlide(); }
        restartAutoplay();
      }
    });

    // Re-apply transform when language switches (RTL flips direction)
    var langObserver = new MutationObserver(function () { applyTransform(); });
    langObserver.observe(document.body, { attributes: true, attributeFilter: ['dir'] });

    // Init
    applyTransform();
    updateDots();
    startAutoplay();
  }

  function initAll() {
    var roots = document.querySelectorAll('[data-testimonial-slideshow]');
    Array.prototype.forEach.call(roots, initSlideshow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  /* ═══════════════════════════════════════════════════════════════
     ANIMATION SYSTEM — 6 JS-driven enhancements
     ═══════════════════════════════════════════════════════════════ */

  // Respect user's motion preference — bail out entirely if reduced
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isTouch() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  /* ─── #1 Hero stagger reveal — applied to page-hero sections only ─── */
  /* (The home .hero already uses manual .fade-up d1/d2/d3 chains.) */
  function initHeroStagger() {
    if (prefersReduced) return;
    var heroes = document.querySelectorAll('.page-hero');
    heroes.forEach(function (hero) {
      var inner = hero.querySelector('.container') || hero;
      // Skip if any child already has fade-up (avoid double-animation)
      if (inner.querySelector(':scope > .fade-up')) return;
      inner.classList.add('anim-hero-stagger');
      requestAnimationFrame(function () {
        inner.classList.add('played');
      });
    });
  }

  /* ─── #2 Gold line draw-in — animate .lux-line when in view ─── */
  function initLuxLines() {
    if (prefersReduced) {
      document.querySelectorAll('.lux-line').forEach(function (l) { l.classList.add('drawn'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.lux-line').forEach(function (l) { l.classList.add('drawn'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.lux-line').forEach(function (l) { io.observe(l); });
  }

  /* ─── #3 Number count-up — any element with [data-count-to] ─── */
  function initCountUp() {
    var els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count-to')) || 0;
        var suffix = el.getAttribute('data-count-suffix') || '';
        var fmt = el.getAttribute('data-count-format') || (target >= 10000 ? 'k' : 'comma');
        el.textContent = formatCount(target, fmt) + suffix;
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  function formatCount(n, fmt) {
    n = Math.round(n);
    if (fmt === 'k') {
      // 100000 → "100K", 1500 → "1.5K"
      if (n >= 1000) {
        var k = n / 1000;
        return (k >= 100 ? Math.round(k) : (Math.round(k * 10) / 10)) + 'K';
      }
      return n.toString();
    }
    if (n >= 1000) return n.toLocaleString();
    return n.toString();
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';
    var fmt = el.getAttribute('data-count-format') || (target >= 10000 ? 'k' : 'comma');
    var duration = parseInt(el.getAttribute('data-count-duration'), 10) || 1600;
    var start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var current = target * eased;
      el.textContent = formatCount(current, fmt) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatCount(target, fmt) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ─── #6 Service-card stagger — auto-stagger fade-up inside grids ─── */
  function initStaggerGrids() {
    var grids = document.querySelectorAll('.grid');
    grids.forEach(function (grid) {
      var cards = grid.querySelectorAll(':scope > .fade-up');
      if (cards.length < 3) return; // not worth staggering
      cards.forEach(function (card, i) {
        // Only add stagger class if no manual delay class is present
        if (!/\bd[1-6]\b/.test(card.className)) {
          card.classList.add('stagger-' + Math.min(i + 1, 8));
        }
      });
    });
  }

  /* ─── #7 Parallax on hero background (animates background-position) ─── */
  function initHeroParallax() {
    if (prefersReduced) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    // Reduce parallax strength on mobile (less motion sickness risk)
    var isMobile = window.innerWidth < 768;
    var strength = isMobile ? 0.15 : 0.3;
    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      // Only update when hero is visible-ish
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      var offset = -rect.top * strength;
      hero.style.backgroundPosition = 'center calc(50% + ' + offset + 'px)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ─── #18 Before/After auto-demo on first view ─── */
  function initBeforeAfterAutoDemo() {
    if (prefersReduced) return;
    if (!('IntersectionObserver' in window)) return;
    var sliders = document.querySelectorAll('.ba-slider');
    if (!sliders.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var slider = entry.target;
        // Skip if already auto-demoed or being interacted with
        if (slider.classList.contains('auto-demo') || slider.classList.contains('demo-done')) return;
        if (slider.dataset.userInteracted === '1') return;
        slider.classList.add('auto-demo');
        // After animation completes, mark done & remove class so user interaction takes over
        setTimeout(function () {
          slider.classList.remove('auto-demo');
          slider.classList.add('demo-done');
        }, 2300);
        io.unobserve(slider);
      });
    }, { threshold: 0.6 });
    sliders.forEach(function (s) {
      // If user touches the slider, mark it so auto-demo won't fire
      ['mousedown', 'touchstart'].forEach(function (ev) {
        s.addEventListener(ev, function () { s.dataset.userInteracted = '1'; }, { once: true, passive: true });
      });
      io.observe(s);
    });
  }

  /* ─── #19 Cursor-follow glow on hero (desktop, no-touch only) ─── */
  function initCursorGlow() {
    if (prefersReduced) return;
    if (isTouch()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var heroes = document.querySelectorAll('.hero');
    heroes.forEach(function (hero) {
      // Only add to the home page hero, not other section heroes
      if (!hero.classList.contains('hero')) return;
      var glow = document.createElement('div');
      glow.className = 'hero-cursor-glow';
      // Ensure hero is positioned
      var computed = window.getComputedStyle(hero);
      if (computed.position === 'static') hero.style.position = 'relative';
      hero.appendChild(glow);
      hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top  = (e.clientY - rect.top)  + 'px';
      });
    });
  }

  /* ─── #20 Scroll progress bar ─── */
  function initScrollProgress() {
    if (prefersReduced) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('div');
    fill.className = 'scroll-progress-fill';
    bar.appendChild(fill);
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (window.pageYOffset / docHeight) * 100 : 0;
      fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ─── #16 Smooth scroll polish — offset for sticky navbar ─── */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navbar = document.querySelector('.navbar');
      var offset = navbar ? navbar.offsetHeight + 12 : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ─── Bootstrapping — run after DOM is ready ─── */
  function initAnimations() {
    initLuxLines();
    initCountUp();
    initStaggerGrids();
    initHeroParallax();
    initBeforeAfterAutoDemo();
    initCursorGlow();
    initScrollProgress();
    initSmoothScroll();
    // Hero stagger runs slightly delayed so layout / fonts are settled
    setTimeout(initHeroStagger, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

})();
