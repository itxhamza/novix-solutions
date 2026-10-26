/* ==========================================================================
   Novix Solutions — site behaviour
   Progressive enhancement only: every page works with JS disabled.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Theme: dark only ----------------------------------------------- */
  root.setAttribute('data-theme', 'dark');

  /* ----- Anchor scrolling ------------------------------------------------
     The page scrolls natively, exactly like an ordinary website — no wheel
     hijacking, no momentum layer. In-page anchor jumps are eased with the
     platform's own smooth scroll (and jump instantly under reduced motion). */
  function scrollToTarget(target, offset) {
    var y = typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + window.scrollY + (offset || 0);
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var toTop = e.target.closest && e.target.closest('[data-to-top]');
    if (toTop) { e.preventDefault(); scrollToTarget(0); return; }
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    scrollToTarget(el, -84);
    /* Keyboard users must land on the target, not just see it. */
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });

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

  function finalValue(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;
    return { target: target, suffix: suffix, decimals: decimals,
             text: target.toFixed(decimals) + suffix };
  }

  /* Run the count. The final figure is already on screen before this, so a
     counter that is never triggered still reads correctly. */
  function runCount(el) {
    var f = finalValue(el);
    var write = function (v) { el.textContent = v.toFixed(f.decimals) + f.suffix; };

    if (hasGSAP) {
      var proxy = { v: 0 };
      gsap.to(proxy, {
        v: f.target, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { write(proxy.v); },
        onComplete: function () { el.textContent = f.text; }
      });
      return;
    }
    var started = null;
    function frame(now) {
      if (started === null) started = now;
      var p = Math.min((now - started) / 1500, 1);
      write(f.target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame); else el.textContent = f.text;
    }
    requestAnimationFrame(frame);
  }

  /* Counters are triggered by IntersectionObserver rather than ScrollTrigger:
     a ScrollTrigger refresh mid-flight can revert a `once` trigger and leave
     the number stranded at zero. */
  function startCounters() {
    counters.forEach(function (el) { el.textContent = finalValue(el).text; });
    if (reduceMotion) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        runCount(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  if (reduceMotion) {
    /* Show everything, animate nothing. */
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('[data-hero]').forEach(function (el) { el.style.opacity = 1; });
    setBarHeights();
    startCounters();

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

    /* Decode effect: letters resolve out of noise. Used on the small
       labels, where it reads as a system settling rather than decoration. */
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*';
    function scramble(el, duration) {
      var final = el.textContent;
      var letters = final.split('');
      var state = { p: 0 };
      return gsap.to(state, {
        p: 1, duration: duration || 0.9, ease: 'power2.out',
        onUpdate: function () {
          var reveal = Math.floor(state.p * letters.length * 1.25);
          el.textContent = letters.map(function (ch, i) {
            if (ch === ' ' || i < reveal) return ch;
            return GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }).join('');
        },
        onComplete: function () { el.textContent = final; }
      });
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
      var tl = gsap.timeline({ paused: true });
      window.__novixHero = tl;
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
      window.__novixHeroReady = true;
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
      if (eyebrow) {
        t.fromTo(eyebrow, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5 }, 0.05);
        t.add(scramble(eyebrow, 0.8), 0.1);
      }
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

      /* The strip runs faster the harder the page is being scrolled, and
         eases back to its resting speed when the scrolling stops. */
      if (window.ScrollTrigger && !reduceMotion) {
        var settle = null;
        ScrollTrigger.create({
          trigger: marquee, start: 'top bottom', end: 'bottom top',
          onUpdate: function (self) {
            var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 1400, 2.6);
            gsap.to(loop, { timeScale: boost, duration: 0.25, overwrite: true });
            clearTimeout(settle);
            settle = setTimeout(function () {
              gsap.to(loop, { timeScale: 1, duration: 0.7, overwrite: true });
            }, 180);
          }
        });
      }
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

    /* --- Scroll drives the 3D assembly ----------------------------------
       The globe module owns the rendering; this only feeds it progress.
       If WebGL never came up there is nothing to drive, and the section
       still reads as a normal split layout. */
    (function globeScroll() {
      var stage = document.querySelector('[data-globe]');
      var globe = window.__novixGlobe;
      if (!stage || !globe || !globe.alive()) return;

      var state = { p: 0 };
      gsap.to(state, {
        p: 1, ease: 'none',
        onUpdate: function () { globe.set(state.p); },
        scrollTrigger: {
          /* A long runway: the convergence is the point, so it has to span
             enough scroll to actually be watched rather than arrive done.
             Fully formed by the time the section is centred, so the final
             shape is seen in place rather than on the way out. */
          trigger: stage,
          start: 'top bottom',
          end: 'center center',
          scrub: 0.8
        }
      });
    }());

    /* The Work and Process sections scroll normally — no pinning, no
       sideways scroll-jacking. Their scroll-in reveals are handled above. */

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

    /* --- Section backgrounds: slow parallax drift + AI motif life -------- */
    document.querySelectorAll('.sbg').forEach(function (layer, i) {
      // Each layer drifts at its own rate as the section passes through.
      gsap.fromTo(layer, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: {
          trigger: layer.parentElement,
          start: 'top bottom', end: 'bottom top', scrub: 0.6
        }
      });
    });

    /* Synapses pulse along their length; neurons breathe. */
    document.querySelectorAll('.sbg-synapse path').forEach(function (path, i) {
      var len = path.getTotalLength ? path.getTotalLength() : 0;
      if (!len) return;
      gsap.set(path, { strokeDasharray: len * 0.22 + ' ' + len });
      gsap.fromTo(path, { strokeDashoffset: len * 0.6 }, {
        strokeDashoffset: -len * 0.6, duration: 3 + (i % 7) * 0.5,
        ease: 'none', repeat: -1, delay: (i % 11) * 0.22
      });
    });

    document.querySelectorAll('.sbg-neuron circle').forEach(function (dot, i) {
      gsap.to(dot, {
        opacity: 0.22, scale: 0.78, transformOrigin: 'center',
        duration: 1.4 + (i % 5) * 0.35, repeat: -1, yoyo: true,
        ease: 'sine.inOut', delay: (i % 9) * 0.18
      });
    });

    /* Latent-space points settle into their clusters. */
    document.querySelectorAll('.sbg-embed circle').forEach(function (dot, i) {
      gsap.from(dot, {
        scale: 0, transformOrigin: 'center', duration: 0.6, delay: (i % 20) * 0.03,
        ease: 'back.out(2)', scrollTrigger: ST(dot.closest('.sbg').parentElement, 'top 85%')
      });
    });

    /* Attention weights and token stream flicker like live inference. */
    document.querySelectorAll('.sbg-cell rect').forEach(function (cell, i) {
      gsap.to(cell, {
        opacity: '+=0.18', duration: 1 + (i % 6) * 0.3, repeat: -1, yoyo: true,
        ease: 'sine.inOut', delay: (i % 17) * 0.11
      });
    });

    /* Radar and orbit rings turn slowly. */
    document.querySelectorAll('.sbg-ring, .sbg-orbit').forEach(function (ring, i) {
      gsap.to(ring, { rotation: i % 2 ? -360 : 360, transformOrigin: 'center',
                      duration: 180 + i * 40, repeat: -1, ease: 'none' });
    });

    /* Contours and waves breathe horizontally. */
    document.querySelectorAll('.sbg-wave path, .sbg-topo path').forEach(function (path, i) {
      gsap.to(path, { x: (i % 2 ? -1 : 1) * 46, duration: 9 + i * 1.3,
                      repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });

    /* --- Chrome: chart, progress, parallax, tilt -------------------------- */
    if (bars.length) {
      // The chart lives in the hero. Rest state is applied first and the
      // start state is withheld until the tween actually runs, so the bars
      // can never be stranded at zero height if it is delayed or never
      // plays — a ScrollTrigger here would resolve its start above the top
      // of the page and never receive a crossing event at all.
      gsap.set(bars, { scaleY: 1, transformOrigin: 'bottom' });
      gsap.fromTo(bars, { scaleY: 0 },
        { scaleY: 1, duration: 0.8, stagger: 0.05, delay: 0.4, immediateRender: false });
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

    startCounters();

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

    }
    startCounters();
    document.querySelectorAll('[data-hero]').forEach(function (el) { el.style.opacity = 1; });
  }

  /* ----- Live neural field -----------------------------------------------
     A canvas of drifting nodes that link to their neighbours and energise
     around the pointer. It replaces the static SVG constellation only once
     it is actually running, so the SVG remains the fallback. Paused when
     off-screen or when the tab is hidden. */
  (function neural() {
    var hero = document.querySelector('.hero');
    if (!hero || reduceMotion) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'neural-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    hero.insertBefore(canvas, hero.firstChild);
    hero.classList.add('has-neural');

    var w = 0, h = 0, dpr = 1, nodes = [], raf = null, running = false;
    var pointer = { x: -9999, y: -9999, on: false };
    var ink = { node: '14,191,67', link: '14,191,67' };

    function readInk() {
      var cs = getComputedStyle(document.documentElement);
      var b = (cs.getPropertyValue('--brand') || '#0ebf43').trim();
      var m = b.match(/^#([0-9a-f]{6})$/i);
      if (m) {
        var n = parseInt(m[1], 16);
        ink.node = ink.link = [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
      }
    }

    function resize() {
      var r = hero.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.min(90, Math.round((w * h) / 16000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.3 + Math.random() * 1.9
        });
      }
    }

    var LINK = 132, PULL = 170;

    var painted = 0;
    function frame(now) {
      /* The link pass is O(n^2) per frame; 30fps is plenty for drift. */
      if (now - painted < 32) { raf = requestAnimationFrame(frame); return; }
      painted = now;
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b2, dx, dy, d;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;

        if (pointer.on) {
          dx = pointer.x - a.x; dy = pointer.y - a.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < PULL && d > 0.1) {
            a.x += (dx / d) * (1 - d / PULL) * 0.7;
            a.y += (dy / d) * (1 - d / PULL) * 0.7;
          }
        }
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b2 = nodes[j];
          dx = a.x - b2.x; dy = a.y - b2.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          ctx.strokeStyle = 'rgba(' + ink.link + ',' + (0.2 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.stroke();
        }

        var near = 0;
        if (pointer.on) {
          dx = pointer.x - a.x; dy = pointer.y - a.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < PULL) {
            near = 1 - d / PULL;
            ctx.strokeStyle = 'rgba(' + ink.link + ',' + (0.3 * near).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + ink.node + ',' + (0.3 + near * 0.55).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + near * 1.6, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    readInk();
    resize();
    start();

    window.addEventListener('resize', function () {
      clearTimeout(resize._t);
      resize._t = setTimeout(function () { resize(); }, 180);
    });
    window.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.on = pointer.x > -60 && pointer.x < w + 60 && pointer.y > -60 && pointer.y < h + 60;
    }, { passive: true });
    hero.addEventListener('mouseleave', function () { pointer.on = false; });
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(hero);
    }
    new MutationObserver(readInk).observe(document.documentElement,
      { attributes: true, attributeFilter: ['data-theme'] });
  }());

  /* ----- Load sequence + page transitions --------------------------------
     First visit in a session gets the full sequence; later navigations get a
     fast curtain lift, so moving around the site never feels gated. Every
     exit path is covered: window.load, a hard timeout, and a CSS failsafe
     that clears the overlay even if this script dies. */
  (function sequence() {
    var loader = document.getElementById('loader');
    var curtain = document.getElementById('curtain');
    var panels = curtain ? curtain.querySelectorAll('i') : [];

    function startHero() {
      if (window.__novixHero) window.__novixHero.play();
    }

    function finish() {
      if (loader) loader.classList.add('is-done');
      if (curtain) curtain.classList.add('is-idle');
      startHero();
    }

    if (!loader || reduceMotion || !hasGSAP) {
      if (loader) loader.classList.add('is-done');
      if (curtain) curtain.classList.add('is-idle');
      startHero();
      return;
    }

    var SEEN = 'novix-seen';
    var seen = false;
    try { seen = sessionStorage.getItem(SEEN) === '1'; } catch (e) {}
    try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}

    /* Lift the curtain, then hand over to the hero. */
    function lift(delay) {
      gsap.set(panels, { scaleY: 1, transformOrigin: '50% 100%' });
      gsap.to(panels, {
        scaleY: 0, duration: 0.5, ease: 'power4.inOut', stagger: 0.035,
        delay: delay || 0,
        onStart: function () {
          if (loader) gsap.to(loader, { opacity: 0, duration: 0.28,
            onComplete: function () { loader.classList.add('is-done'); } });
        },
        onComplete: function () {
          curtain.classList.add('is-idle');
          startHero();
        }
      });
    }

    if (seen) {
      /* Returning within the session: skip the counter entirely. */
      loader.classList.add('is-done');
      lift(0);
    } else {
      var mark = loader.querySelector('.loader__mark');
      var ring = loader.querySelector('.loader__ring');
      var bar = loader.querySelector('.loader__bar i');
      var pct = loader.querySelector('.loader__pct');
      var counter = { v: 0 };
      var done = false;

      gsap.from(mark, { scale: 0.7, opacity: 0, duration: 0.7, ease: 'power3.out' });
      gsap.to(ring, { rotation: 360, duration: 6, repeat: -1, ease: 'none' });

      var progress = gsap.to(counter, {
        v: 92, duration: 0.85, ease: 'power1.out',
        onUpdate: function () {
          var n = Math.round(counter.v);
          if (pct) pct.textContent = n;
          if (bar) gsap.set(bar, { scaleX: n / 100 });
        }
      });

      var complete = function () {
        if (done) return;
        done = true;
        progress.kill();
        gsap.to(counter, {
          v: 100, duration: 0.25, ease: 'power2.out',
          onUpdate: function () {
            var n = Math.round(counter.v);
            if (pct) pct.textContent = n;
            if (bar) gsap.set(bar, { scaleX: n / 100 });
          },
          onComplete: function () {
            gsap.to(loader.querySelector('.loader__box'),
              { scale: 1.06, opacity: 0, duration: 0.3, ease: 'power2.in' });
            lift(0.08);
          }
        });
      };

      /* Don't gate on `load`: it waits for the ad script and CDN fonts,
         which has nothing to do with the page being ready to look at. */
      if (document.readyState === 'complete') setTimeout(complete, 250);
      else window.addEventListener('DOMContentLoaded', function () { setTimeout(complete, 250); });
      setTimeout(complete, 900);
    }

    /* --- Page transitions ------------------------------------------------
       Links keep working normally: the click is only intercepted for plain
       same-origin navigations, and the browser follows through even if the
       animation never completes. */
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey ||
          e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' ||
          a.hasAttribute('download') || /^(mailto|tel):/.test(href)) return;
      var url;
      try { url = new URL(a.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;

      e.preventDefault();
      var navigated = false;
      var go = function () {
        if (navigated) return;
        navigated = true;
        location.href = a.href;
      };
      curtain.classList.remove('is-idle');
      gsap.set(panels, { scaleY: 0, transformOrigin: '50% 0%' });
      gsap.to(panels, {
        scaleY: 1, duration: 0.32, ease: 'power3.inOut', stagger: 0.025,
        onComplete: go
      });
      /* If the tween is interrupted, still navigate. */
      setTimeout(go, 700);
    });

    /* Absolute failsafe: the hero is hidden until its timeline plays, so it
       must never depend on the sequence completing. */
    setTimeout(startHero, 5000);

    /* Coming back via bfcache must not leave the curtain down. */
    window.addEventListener('pageshow', function (ev) {
      if (!ev.persisted) return;
      gsap.set(panels, { scaleY: 0 });
      curtain.classList.add('is-idle');
      if (loader) loader.classList.add('is-done');
    });
  }());

  /* ----- Custom cursor ---------------------------------------------------
     A tracking reticle with a trailing spark field. Built only for a fine
     pointer with motion allowed, and the native cursor is hidden only once
     ours exists — so touch, a failed script and JS-off all keep the real
     cursor. */
  (function cursor() {
    var fine = window.matchMedia('(pointer: fine)').matches &&
               window.matchMedia('(hover: hover)').matches;
    if (!fine || reduceMotion || !hasGSAP) return;

    var layer = document.createElement('div');
    layer.className = 'cursor-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.opacity = '0';

    var SPARKS = 5;
    var sparks = [];
    for (var i = 0; i < SPARKS; i++) {
      var sp = document.createElement('div');
      sp.className = 'cur cur-spark';
      sp.style.opacity = (0.3 - i * 0.05).toFixed(2);
      // Sized in px, not via the `scale` property: GSAP resets
      // translate/rotate/scale when it takes over an element's transform.
      var d = 5 - i * 0.7;
      sp.style.width = sp.style.height = d.toFixed(1) + 'px';
      sp.style.margin = (-d / 2).toFixed(2) + 'px 0 0 ' + (-d / 2).toFixed(2) + 'px';
      layer.appendChild(sp);
      sparks.push(sp);
    }
    var ring = document.createElement('div');
    var dot = document.createElement('div');
    ring.className = 'cur cur-ring';
    dot.className = 'cur cur-dot';
    layer.appendChild(ring);
    layer.appendChild(dot);
    document.body.appendChild(layer);
    root.classList.add('has-cursor');

    var qx = [], qy = [];
    var setters = [
      [gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' }),
       gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' })],
      [gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' }),
       gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' })]
    ];
    sparks.forEach(function (sp, i) {
      setters.push([
        gsap.quickTo(sp, 'x', { duration: 0.5 + i * 0.13, ease: 'power2' }),
        gsap.quickTo(sp, 'y', { duration: 0.5 + i * 0.13, ease: 'power2' })
      ]);
    });

    var shown = false;
    window.addEventListener('mousemove', function (e) {
      if (!shown) { shown = true; gsap.to(layer, { opacity: 1, duration: 0.3 }); }
      setters.forEach(function (pair) { pair[0](e.clientX); pair[1](e.clientY); });
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      gsap.to(layer, { opacity: 0, duration: 0.25 });
      shown = false;
    });

    /* The reticle keeps scanning. */
    gsap.to(ring, { rotation: 360, duration: 9, repeat: -1, ease: 'none' });

    /* State by what is under the pointer. */
    var WIDE = '.card--hover, .work-card, .quote, .price-card, .step, .member';
    var TEXTY = 'input, textarea, select';
    var TAP = 'a, button, summary, [role="button"], .faq__item summary, label.check';

    /* Luminance of the nearest painted background, so the reticle can
       invert over dark fills (the brand button, dark surfaces) instead of
       disappearing into them. */
    /* getComputedStyle hands back two different shapes, and they do not share
       a scale: rgb()/rgba() give 0-255 channels, while anything built with
       color-mix() comes back as color(srgb r g b / a) with 0-1 channels.
       The footer's background is a color-mix, so reading it as 0-255 made
       white (1 1 1) look like near-black and turned the cursor white on a
       white footer. */
    function channels(bg) {
      var open = bg.indexOf('(');
      if (open < 0) return null;
      var inner = bg.slice(open + 1, bg.lastIndexOf(')'));
      var isColorFn = bg.lastIndexOf('color(', 0) === 0;
      if (isColorFn) inner = inner.replace(/^\s*[a-z0-9-]+\s+/i, '');
      var parts = inner.split('/');
      var nums = (parts[0].match(/[\d.]+/g) || []).map(parseFloat);
      if (nums.length < 3) return null;
      var a = 1;
      if (parts.length > 1) {
        a = parseFloat(parts[1]);
        if (parts[1].indexOf('%') !== -1) a /= 100;
      } else if (nums.length > 3) {
        a = nums[3];
      }
      var k = isColorFn ? 1 : 1 / 255;
      return { r: nums[0] * k, g: nums[1] * k, b: nums[2] * k, a: isNaN(a) ? 1 : a };
    }

    function onDark(el) {
      for (var n = el; n && n !== document.documentElement; n = n.parentElement) {
        var c = channels(getComputedStyle(n).backgroundColor);
        if (!c) continue;
        if (c.a < 0.5) continue;
        var lin = [c.r, c.g, c.b].map(function (v) {
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] < 0.3;
      }
      return false;
    }

    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (!t.closest) return;
      root.classList.toggle('cur-text', !!t.closest(TEXTY));
      root.classList.toggle('cur-active', !!t.closest(TAP));
      root.classList.toggle('cur-wide', !t.closest(TAP) && !!t.closest(WIDE));
      root.classList.toggle('cur-on-dark', onDark(t));
    });

    document.addEventListener('mousedown', function () {
      root.classList.add('cur-down');
      gsap.to(ring, { scale: 0.82, duration: 0.18 });
    });
    document.addEventListener('mouseup', function () {
      root.classList.remove('cur-down');
      gsap.to(ring, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
    });

    /* Magnetic pull: primary actions lean toward the pointer. */
    document.querySelectorAll('.btn--primary, .icon-btn, .social').forEach(function (el) {
      el.classList.add('magnetic');
      var mx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      var my = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      /* Vertical pull is kept much weaker than horizontal, and capped: a
         button sitting next to another one has a shared line, and a few
         pixels of drift off it reads as a misaligned row rather than as a
         magnet. Sideways there is no line to break. */
      function clamp(v, lim) { return v < -lim ? -lim : (v > lim ? lim : v); }
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        mx(clamp((e.clientX - (r.left + r.width / 2)) * 0.18, 14));
        my(clamp((e.clientY - (r.top + r.height / 2)) * 0.10, 3));
      });
      el.addEventListener('mouseleave', function () { mx(0); my(0); });
    });
  }());

  /* ----- Card spotlight --------------------------------------------------
     A soft brand glow tracks the pointer across hoverable cards. One
     delegated listener, fine pointer only, purely additive: the CSS keeps
     the glow invisible until a pointer is actually over a card. */
  (function cardSpotlight() {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card--hover');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }());

  /* ----- Project filter --------------------------------------------------
     Chips hide cards by class, so the grid is correct with or without GSAP;
     when GSAP is there the surviving cards settle in rather than snap. */
  (function projectFilter() {
    var bar = document.querySelector('.filter-bar');
    var grid = document.getElementById('showcase');
    if (!bar || !grid) return;
    var cards = [].slice.call(grid.querySelectorAll('.work-card'));
    var empty = document.querySelector('.showcase__empty');

    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var want = chip.getAttribute('data-filter');

      [].forEach.call(bar.querySelectorAll('.chip'), function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      var shown = [];
      cards.forEach(function (card) {
        /* data-plat is a token list: a product that is both a site and an
           app belongs under both chips. */
        var plats = (card.getAttribute('data-plat') || '').split(' ');
        var keep = want === 'all' || plats.indexOf(want) !== -1;
        card.classList.toggle('is-out', !keep);
        if (keep) shown.push(card);
      });
      if (empty) empty.hidden = shown.length > 0;

      if (window.gsap && !reduceMotion) {
        gsap.fromTo(shown, { opacity: 0, y: 14 }, {
          opacity: 1, y: 0, duration: 0.45, ease: 'power3.out',
          stagger: 0.04, overwrite: true, clearProps: 'transform'
        });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }());

  /* ----- Project cards: tilt toward the pointer, wipe in on arrival ------
     Both are additive. The tilt only ever exists while a fine pointer is
     over a card, and the wipe's start state is set from script, so a card
     is fully visible and square without any of this. */
  (function cardDepth() {
    if (!hasGSAP || reduceMotion) return;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var cards = document.querySelectorAll('.work-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var shot = card.querySelector('.shot');

      /* Wipe the screenshot up from its own bottom edge as the card lands,
         a beat behind the card's own reveal. */
      if (shot && window.ScrollTrigger) {
        gsap.fromTo(shot,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: { trigger: card, start: 'top 86%', once: true }
          });
      }

      if (!fine) return;
      card.classList.add('has-tilt');
      /* Per-element perspective, so no ancestor needs a rule for this to
         read as depth rather than a flat skew. */
      gsap.set(card, { transformPerspective: 1400 });

      var rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
      var ly = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3' });

      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        /* -1..1 from the card's centre, then a couple of degrees either way:
           enough to catch the light, not enough to make the text swim. */
        var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        rx(-ny * 3.2);
        ry(nx * 3.6);
        ly(-6);
      });
      card.addEventListener('mouseleave', function () { rx(0); ry(0); ly(0); });
    });
  }());

  /* ----- Diagrams draw themselves ----------------------------------------
     Connectors are stroked in as the figure is scrolled through, then the
     boxes arrive. The dash offset is set from script, so with GSAP absent
     the diagram is simply already drawn. */
  (function drawDiagram() {
    if (!hasGSAP || !window.ScrollTrigger) return;
    document.querySelectorAll('[data-draw]').forEach(function (fig) {
      var links = fig.querySelectorAll('.dg-link');
      var nodes = fig.querySelectorAll('.dg-node');
      if (!links.length) return;
      if (reduceMotion) return;

      links.forEach(function (path) {
        var len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodes, { opacity: 0, y: 14 });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: fig, start: 'top 78%', end: 'bottom 62%', scrub: 0.7 }
      });
      tl.to(links, { strokeDashoffset: 0, ease: 'none', stagger: 0.05 }, 0)
        .to(nodes, { opacity: 1, y: 0, ease: 'power2.out', stagger: 0.035 }, 0.1);
    });
  }());

  /* ----- Scrub-lit sentences ---------------------------------------------
     A [data-scrub] sentence is split into words that come up from dim to
     full as the line is scrolled through. The dim start is applied from
     script, never from the stylesheet, so a reader without GSAP gets the
     sentence fully lit rather than a paragraph at 22% opacity. */
  (function scrubText() {
    if (!hasGSAP || !window.ScrollTrigger) return;
    var blocks = document.querySelectorAll('[data-scrub]');
    if (!blocks.length) return;

    blocks.forEach(function (el) {
      if (el.querySelector('.scrub-w')) return;
      /* Rebuild the text as words without touching any inline markup: these
         sentences are plain text by contract. */
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      var spans = words.map(function (w, i) {
        var sp = document.createElement('span');
        sp.className = 'scrub-w';
        sp.textContent = w;
        el.appendChild(sp);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        return sp;
      });

      if (reduceMotion) return;
      gsap.set(spans, { opacity: 0.2 });
      gsap.to(spans, {
        opacity: 1,
        ease: 'none',
        stagger: { amount: 0.9 },
        scrollTrigger: {
          /* Driven by the block the line sits in, not the line itself: a
             three-line sentence is too short to give the lighting a runway,
             and it finished before the section was even centred. */
          trigger: el.closest('.statement, .section, .page-hero') || el,
          start: 'top 72%',
          end: 'bottom 52%',
          scrub: 0.6
        }
      });
    });
  }());

  /* ----- Statement band: opens to full bleed ------------------------------
     The padding that insets the panel and the radius that rounds it are
     scrubbed to zero together, so the panel appears to widen into the
     window rather than slide. Both rest at their open values in CSS, so
     without GSAP the band is simply a rounded panel. */
  (function statementBleed() {
    if (!hasGSAP || !window.ScrollTrigger || reduceMotion) return;
    var wrap = document.querySelector('.statement-wrap');
    var panel = wrap && wrap.querySelector('.statement');
    if (!panel || window.innerWidth <= 640) return;

    gsap.to(wrap, {
      paddingInline: 0, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'center 58%', scrub: 0.7 }
    });
    gsap.to(panel, {
      borderRadius: 0, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'center 58%', scrub: 0.7 }
    });
  }());

  /* ----- Header takes the dark palette over a dark band ------------------- */
  (function headerOverDark() {
    if (!hasGSAP || !window.ScrollTrigger) return;
    var header = document.querySelector('.header');
    var bands = document.querySelectorAll('.statement-sec');
    if (!header || !bands.length) return;
    var over = 0;
    bands.forEach(function (band) {
      ScrollTrigger.create({
        trigger: band,
        start: 'top 76px',
        end: 'bottom 76px',
        onToggle: function (self) {
          over += self.isActive ? 1 : -1;
          if (over < 0) over = 0;
          header.classList.toggle('is-on-dark', over > 0);
        }
      });
    });
  }());

  /* ----- Section artwork drifts behind its content ------------------------
     Each section's background sits on its own, slower track, which gives the
     page depth without moving anything anyone is reading. */
  (function backgroundParallax() {
    if (!hasGSAP || !window.ScrollTrigger || reduceMotion) return;
    if (window.matchMedia('(max-width: 760px)').matches) return;
    document.querySelectorAll('.sbg__svg').forEach(function (art) {
      var sec = art.closest('.section, .page-hero, .hero, .statement-sec');
      if (!sec) return;
      gsap.fromTo(art, { yPercent: -7 }, {
        yPercent: 7, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.9 }
      });
    });
  }());

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
