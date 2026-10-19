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

  applyTheme(root.getAttribute('data-theme') || 'dark');

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

  /* ----- Scroll reveal -------------------------------------------------- */
  var revealables = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-visible'); }, delay);
        revealer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ----- Count-up stats ------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;

    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var started = null;
    var duration = 1500;

    function frame(now) {
      if (started === null) started = now;
      var p = Math.min((now - started) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(countUp);
    } else {
      var counterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          counterObs.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { counterObs.observe(el); });
    }
  }

  /* ----- Chart bars (hero mock) ----------------------------------------- */
  document.querySelectorAll('.chart i').forEach(function (bar, i) {
    var h = bar.getAttribute('data-h') || '50';
    bar.style.height = h + '%';
    bar.style.animationDelay = (i * 0.07) + 's';
  });

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
