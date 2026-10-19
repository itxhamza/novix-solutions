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

    var claimed = new Set();
    var claim = function (el) { claimed.add(el); };
    var ST = function (trigger, start) {
      return { trigger: trigger, start: start || 'top 85%', once: true };
    };

    /* --- Type animation ------------------------------------------------
       Wrap each word in a clipping span so lines can rise into view. Only
       text nodes are replaced, so nested markup (<br>, the gradient span)
       survives, and the readable text is unchanged for selection and
       screen readers. */
    function splitWords(el) {
      if (el.dataset.splitDone) return el.querySelectorAll('.word > i');
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);

      texts.forEach(function (node) {
        if (!node.nodeValue.trim()) return;
        var frag = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }
          var word = document.createElement('span');
          var inner = document.createElement('i');
          word.className = 'word';
          inner.textContent = chunk;
          word.appendChild(inner);
          frag.appendChild(word);
        });
        node.parentNode.replaceChild(frag, node);
      });
      el.dataset.splitDone = '1';
      return el.querySelectorAll('.word > i');
    }

    function riseWords(el, trigger, pos) {
      var words = splitWords(el);
      if (!words.length) return null;
      return gsap.fromTo(words, { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.03, ease: 'power4.out',
          scrollTrigger: trigger ? ST(trigger) : undefined }, pos);
    }

    /* --- Hero ----------------------------------------------------------- */
    var heroEls = [].slice.call(document.querySelectorAll('[data-hero]'));
    var heroHeading = document.querySelector('h1[data-hero][data-split]');
    if (heroEls.length) {
      var rest = heroEls.filter(function (e) { return e !== heroHeading; });
      var tl = gsap.timeline({ delay: 0.15 });
      if (heroHeading) {
        gsap.set(heroHeading, { opacity: 1 });
        tl.fromTo(splitWords(heroHeading), { yPercent: 110 },
          { yPercent: 0, duration: 1, stagger: 0.045, ease: 'power4.out' }, 0.1);
      }
      tl.fromTo(rest, { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.09 }, 0)
        .from('.console', { y: 44, opacity: 0, scale: 0.97, duration: 1 }, 0.35)
        .from('.float-card', { y: 16, opacity: 0, duration: 0.6, stagger: 0.12 }, 0.9);
      heroEls.forEach(claim);
    }

    /* --- Section headings ------------------------------------------------ */
    document.querySelectorAll('.section-head, .page-hero').forEach(function (head) {
      gsap.set(head, { opacity: 1, y: 0 });
      claim(head);
      var eyebrow = head.querySelector('.eyebrow');
      var heading = head.querySelector('[data-split]');
      var lede = head.querySelector('p');
      var crumbs = head.querySelector('.crumbs');
      var t = gsap.timeline({ scrollTrigger: ST(head) });
      [eyebrow, crumbs, heading, lede].forEach(claim);
      if (crumbs) t.fromTo(crumbs, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0);
      if (eyebrow) t.fromTo(eyebrow, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5 }, 0.05);
      if (heading) {
        gsap.set(heading, { opacity: 1 });
        t.fromTo(splitWords(heading), { yPercent: 110 },
          { yPercent: 0, duration: 0.9, stagger: 0.03, ease: 'power4.out' }, 0.2);
      }
      if (lede) t.fromTo(lede, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.45);
    });

    /* Any remaining split heading (e.g. inside a split layout). */
    document.querySelectorAll('[data-split]').forEach(function (h) {
      if (claimed.has(h) || h.dataset.splitDone) return;
      gsap.set(h, { opacity: 1 });
      claim(h);
      riseWords(h, h);
    });

    /* --- Marquee: a seamless GSAP loop, paused on hover ------------------ */
    var track = document.querySelector('.marquee__track');
    if (track) {
      var loop = gsap.to(track, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
      var marquee = track.closest('.marquee');
      marquee.addEventListener('mouseenter', function () { gsap.to(loop, { timeScale: 0, duration: 0.4 }); });
      marquee.addEventListener('mouseleave', function () { gsap.to(loop, { timeScale: 1, duration: 0.4 }); });
    }

    /* --- Card grids: stagger in, then the icons pop ---------------------- */
    document.querySelectorAll('.grid').forEach(function (grid) {
      // Work cards have their own richer timeline below; don't animate twice.
      var items = [].slice.call(grid.querySelectorAll(':scope > [data-reveal]'))
        .filter(function (el) { return !el.classList.contains('work-card'); });
      if (!items.length) return;
      items.forEach(claim);
      var t = gsap.timeline({ scrollTrigger: ST(grid, 'top 82%') });
      t.fromTo(items, { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, stagger: 0.08 });
      var icons = grid.querySelectorAll('.icon-tile svg, .member__photo, .quote__stars svg');
      if (icons.length) {
        t.from(icons, { scale: 0.4, opacity: 0, duration: 0.5, stagger: 0.04,
                        ease: 'back.out(2)' }, '-=0.55');
      }
    });

    /* --- Stat band -------------------------------------------------------- */
    document.querySelectorAll('.stat-band').forEach(function (band) {
      claim(band);
      gsap.fromTo(band, { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, scrollTrigger: ST(band) });
      gsap.from(band.querySelectorAll('.stat'), {
        opacity: 0, y: 18, duration: 0.6, stagger: 0.09, scrollTrigger: ST(band)
      });
    });

    /* --- Process: the pipeline draws, then the steps land ---------------- */
    var rail = document.querySelector('.process-rail');
    var steps = document.querySelector('.steps');
    if (steps) {
      var stepItems = steps.querySelectorAll(':scope > [data-reveal]');
      stepItems.forEach(claim);
      var pt = gsap.timeline({ scrollTrigger: ST(steps, 'top 80%') });
      if (rail) {
        claim(rail);
        gsap.set(rail, { opacity: 1 });
        var live = rail.querySelector('.pipeline__live');
        var nodes = rail.querySelectorAll('.pipeline__node');
        if (live) {
          var len = live.getTotalLength();
          pt.fromTo(live, { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0);
        }
        if (nodes.length) {
          pt.from(nodes, { scale: 0, transformOrigin: 'center',
                           duration: 0.45, stagger: 0.3, ease: 'back.out(2.4)' }, 0.15);
        }
      }
      pt.fromTo(stepItems, { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, 0.2);
      pt.from(steps.querySelectorAll('.step__num'), {
        scale: 0.3, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(2.2)'
      }, 0.35);
    }

    /* --- Work cards: the illustration assembles itself ------------------- */
    document.querySelectorAll('.work-card').forEach(function (card) {
      claim(card);
      var t = gsap.timeline({ scrollTrigger: ST(card, 'top 84%') });
      t.fromTo(card, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0);
      t.from(card.querySelectorAll('.il-rise > *'), {
        y: 14, opacity: 0, duration: 0.5, stagger: 0.05
      }, 0.2);
      t.from(card.querySelectorAll('.il-float, .il-stack > *, .il-pins > *'), {
        y: 12, opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.06, ease: 'back.out(1.6)'
      }, 0.35);
      t.from(card.querySelectorAll('.il-pop'), {
        scale: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(3)'
      }, 0.6);

      card.querySelectorAll('.il-draw').forEach(function (path, i) {
        // Dashed strokes already use stroke-dasharray for their pattern,
        // so draw only the solid ones and fade the dashed ones in.
        if (path.getAttribute('stroke-dasharray')) {
          t.from(path, { opacity: 0, duration: 0.6 }, 0.4 + i * 0.1);
          return;
        }
        var len = path.getTotalLength ? path.getTotalLength() : 0;
        if (!len) return;
        t.fromTo(path, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, 0.3 + i * 0.12);
      });
    });

    /* --- FAQ -------------------------------------------------------------- */
    document.querySelectorAll('.faq').forEach(function (faq) {
      var items = faq.querySelectorAll(':scope > [data-reveal]');
      if (!items.length) return;
      items.forEach(claim);
      gsap.fromTo(items, { x: -18, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.07, scrollTrigger: ST(faq, 'top 82%') });
    });

    /* --- CTA band --------------------------------------------------------- */
    document.querySelectorAll('.cta').forEach(function (cta) {
      claim(cta);
      var t = gsap.timeline({ scrollTrigger: ST(cta, 'top 82%') });
      t.fromTo(cta, { opacity: 0, scale: 0.97, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8 });
      t.from(cta.querySelectorAll('.pill, .btn, .cta__note'), {
        y: 16, opacity: 0, duration: 0.5, stagger: 0.08
      }, '-=0.45');
    });

    /* --- Footer ----------------------------------------------------------- */
    var footer = document.querySelector('.footer__grid');
    if (footer) {
      gsap.from(footer.children, {
        y: 24, opacity: 0, duration: 0.6, stagger: 0.09,
        scrollTrigger: ST(footer, 'top 92%')
      });
    }

    /* --- Anything not claimed by a section ------------------------------- */
    revealables.forEach(function (el) {
      if (claimed.has(el)) return;
      gsap.to(el, {
        y: 0, opacity: 1, duration: 0.85,
        delay: (parseInt(el.getAttribute('data-reveal-delay') || '0', 10)) / 1000,
        scrollTrigger: ST(el, 'top 88%')
      });
    });

    /* --- Chrome: chart, progress, parallax, tilt -------------------------- */
    if (bars.length) {
      gsap.from(bars, {
        scaleY: 0, transformOrigin: 'bottom', duration: 0.8, stagger: 0.05,
        scrollTrigger: ST('.chart', 'top 90%')
      });
    }

    var progress = document.querySelector('.scroll-progress span');
    if (progress) {
      gsap.to(progress, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      });
    }

    var panel = document.querySelector('.console');
    if (panel && window.innerWidth > 1040) {
      gsap.to(panel, {
        y: -46, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
      });
    }

    var visual = document.querySelector('.hero__visual');
    if (visual && panel && window.matchMedia('(pointer: fine)').matches) {
      var rx = gsap.quickTo(panel, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(panel, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      gsap.set(panel, { transformPerspective: 1100 });
      visual.addEventListener('mousemove', function (e) {
        var r = visual.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - 0.5) * -6);
        ry(((e.clientX - r.left) / r.width - 0.5) * 6);
      });
      visual.addEventListener('mouseleave', function () { rx(0); ry(0); });
    }

    counters.forEach(countUp);

    /* Webfonts change metrics after load, which moves every trigger. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
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
