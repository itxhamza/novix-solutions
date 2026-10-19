/* ==========================================================================
   Novix Solutions — site behaviour
   Progressive enhancement only: every page works with JS disabled.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Theme ---------------------------------------------------------- */
  var THEME_KEY = 'novix-theme';

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      store(THEME_KEY, next);
    });
  });

  applyTheme(root.getAttribute('data-theme') || 'light');

  /* ----- Sticky header -------------------------------------------------- */
  var header = document.querySelector('.header');

  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 12);
    var top = document.querySelector('.to-top');
    if (top) top.classList.toggle('is-visible', window.scrollY > 560);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Mobile drawer -------------------------------------------------- */
  var drawer = document.querySelector('.drawer');
  var openers = document.querySelectorAll('[data-drawer-open]');
  var closers = document.querySelectorAll('[data-drawer-close]');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('is-locked', open);
    openers.forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    if (open) {
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    }
  }

  openers.forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  closers.forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });

  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) setDrawer(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 880 && drawer && drawer.classList.contains('is-open')) setDrawer(false);
  });

  /* ----- Motion: GSAP when available, IntersectionObserver as fallback ---- */
  var revealables = document.querySelectorAll('[data-reveal]');
  var counters = document.querySelectorAll('[data-count]');
  var bars = document.querySelectorAll('.chart i');
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  function setBarHeights() {
    bars.forEach(function (bar) {
      bar.style.height = (bar.getAttribute('data-h') || '50') + '%';
    });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;

    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    if (hasGSAP) {
      var proxy = { v: 0 };
      gsap.to(proxy, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: function () { el.textContent = proxy.v.toFixed(decimals) + suffix; }
      });
      return;
    }
    var started = null;
    function frame(now) {
      if (started === null) started = now;
      var p = Math.min((now - started) / 1500, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    /* Show everything, animate nothing. */
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('[data-hero]').forEach(function (el) { el.style.opacity = 1; });
    setBarHeights();
    counters.forEach(countUp);

  } else if (hasGSAP) {
    root.classList.add('gsap');
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out' });
    setBarHeights();

    /* Hero: one entrance timeline, staggered by role. */
    var hero = document.querySelectorAll('[data-hero]');
    if (hero.length) {
      /* fromTo, not from: CSS already sets these to opacity 0, so a plain
         .from() would animate back to 0 and leave the hero invisible. */
      gsap.timeline({ delay: 0.15 })
        .fromTo(hero,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, stagger: 0.09 })
        .from('.console', { y: 40, opacity: 0, scale: 0.97, duration: 1 }, '-=0.6')
        .from('.float-card', { y: 16, opacity: 0, duration: 0.6, stagger: 0.12 }, '-=0.45');
    }

    /* Reveals: siblings inside one grid animate together as a stagger. */
    var grouped = new Set();
    document.querySelectorAll('.grid, .steps, .faq, .stat-band').forEach(function (group) {
      var items = group.querySelectorAll(':scope > [data-reveal]');
      if (items.length < 2) return;
      items.forEach(function (i) { grouped.add(i); });
      gsap.to(items, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.09,
        scrollTrigger: { trigger: group, start: 'top 82%', once: true }
      });
    });

    revealables.forEach(function (el) {
      if (grouped.has(el)) return;
      gsap.to(el, {
        y: 0, opacity: 1, duration: 0.85,
        delay: (parseInt(el.getAttribute('data-reveal-delay') || '0', 10)) / 1000,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* Chart bars grow in sequence. */
    if (bars.length) {
      gsap.from(bars, {
        scaleY: 0, transformOrigin: 'bottom', duration: 0.8, stagger: 0.05,
        scrollTrigger: { trigger: '.chart', start: 'top 90%', once: true }
      });
    }

    /* Scroll progress. */
    var progress = document.querySelector('.scroll-progress span');
    if (progress) {
      gsap.to(progress, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      });
    }

    /* Gentle parallax on the hero console as the page scrolls. */
    var console_ = document.querySelector('.console');
    if (console_ && window.innerWidth > 1040) {
      gsap.to(console_, {
        y: -46, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
      });
    }

    /* Pointer tilt — small enough to feel like depth, not a toy. */
    var visual = document.querySelector('.hero__visual');
    if (visual && console_ && window.matchMedia('(pointer: fine)').matches) {
      var rx = gsap.quickTo(console_, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(console_, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      gsap.set(console_, { transformPerspective: 1100 });
      visual.addEventListener('mousemove', function (e) {
        var r = visual.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - 0.5) * -6);
        ry(((e.clientX - r.left) / r.width - 0.5) * 6);
      });
      visual.addEventListener('mouseleave', function () { rx(0); ry(0); });
    }

    counters.forEach(countUp);
    ScrollTrigger.refresh();

  } else {
    /* No GSAP (CDN blocked or failed): fall back to IntersectionObserver. */
    setBarHeights();
    bars.forEach(function (bar, i) { bar.style.animationDelay = (i * 0.07) + 's'; });

    if (!('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
      counters.forEach(countUp);
    } else {
      var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          setTimeout(function () { el.classList.add('is-visible'); },
                     parseInt(el.getAttribute('data-reveal-delay') || '0', 10));
          revealer.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealables.forEach(function (el) { revealer.observe(el); });

      var counterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          counterObs.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { counterObs.observe(el); });
    }
    document.querySelectorAll('[data-hero]').forEach(function (el) { el.style.opacity = 1; });
  }

  /* ----- FAQ: one open at a time ---------------------------------------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ----- Contact form validation ---------------------------------------- */
  var form = document.querySelector('[data-validate]');

  if (form) {
    var status = form.querySelector('.form__status');

    var fail = function (field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.add('has-error');
      var slot = wrap.querySelector('.field__error');
      if (slot) slot.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    };

    var clear = function (field) {
      var wrap = field.closest('.field');
      if (wrap) wrap.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
    };

    form.querySelectorAll('.input, .textarea, .select').forEach(function (field) {
      field.addEventListener('input', function () { clear(field); });
      field.addEventListener('change', function () { clear(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      form.querySelectorAll('[required]').forEach(function (field) {
        clear(field);
        var value = (field.value || '').trim();

        if (field.type === 'checkbox') {
          if (!field.checked) { fail(field, 'Please confirm to continue.'); ok = false; }
          return;
        }
        if (!value) {
          fail(field, 'This field is required.');
          ok = false;
          return;
        }
        if (field.type === 'email' && !emailRe.test(value)) {
          fail(field, 'Enter a valid email address.');
          ok = false;
          return;
        }
        if (field.tagName === 'TEXTAREA' && value.length < 20) {
          fail(field, 'Please add a little more detail (20+ characters).');
          ok = false;
        }
      });

      if (!ok) {
        var firstError = form.querySelector('.has-error .input, .has-error .textarea, .has-error .select');
        if (firstError) firstError.focus();
        return;
      }

      // No backend on GitHub Pages — hand the enquiry to the user's mail client.
      var get = function (name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? (el.value || '').trim() : '';
      };

      var lines = [
        'Name: ' + get('name'),
        'Email: ' + get('email'),
        'Company: ' + (get('company') || '—'),
        'Service: ' + (get('service') || '—'),
        'Budget: ' + (get('budget') || '—'),
        '',
        get('message')
      ];

      var mailto = 'mailto:hello@novixsolutions.com'
        + '?subject=' + encodeURIComponent('New project enquiry — ' + (get('name') || 'Website'))
        + '&body=' + encodeURIComponent(lines.join('\n'));

      if (status) {
        status.classList.add('is-visible');
        status.setAttribute('role', 'status');
      }

      window.location.href = mailto;
      form.reset();
    });
  }

  /* ----- Footer year ---------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
}());
