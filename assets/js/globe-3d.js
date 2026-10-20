/* ==========================================================================
   Novix — scroll-driven 3D
   A node globe that assembles out of scattered points as the section is
   scrolled through, then turns under its own momentum. Raw WebGL: a
   perspective camera, two buffers and a shader that interpolates each node
   between its scattered and its spherical position.

   It is purely additive — the section reads normally without it, and the
   canvas removes itself on any failure.
   ========================================================================== */
(function () {
  'use strict';

  var host = document.querySelector('[data-globe]');
  if (!host) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  canvas.className = 'globe-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  var gl = null;
  try {
    var o = { alpha: true, antialias: true, depth: true, premultipliedAlpha: false,
              powerPreference: 'low-power' };
    gl = canvas.getContext('webgl', o) || canvas.getContext('experimental-webgl', o);
  } catch (e) { gl = null; }
  if (!gl) return;

  /* ---- shape library ------------------------------------------------------
     Every form is the same N points rearranged, so any shape can morph into
     any other by interpolating position. */
  var N = 220;

  function rnd(seed) { var x = Math.sin(seed * 12.9898) * 43758.5453123; return x - Math.floor(x); }

  var SHAPES = {
    /* A wide shell the points converge in from. */
    scatter: function (i, out) {
      var a = rnd(i * 1.7) * Math.PI * 2;
      var b = Math.acos(2 * rnd(i * 3.1) - 1);
      var d = 2.6 + rnd(i * 5.3) * 3.4;
      out[0] = Math.sin(b) * Math.cos(a) * d;
      out[1] = Math.cos(b) * d * 0.75;
      out[2] = Math.sin(b) * Math.sin(a) * d;
    },
    sphere: function (i, out) {
      var g = Math.PI * (3 - Math.sqrt(5));
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var t = g * i;
      out[0] = Math.cos(t) * r; out[1] = y; out[2] = Math.sin(t) * r;
    },
    torus: function (i, out) {
      var u = (i / N) * Math.PI * 2 * 7;
      var v = (i / N) * Math.PI * 2 * 17;
      var R = 0.98, r = 0.38;
      out[0] = (R + r * Math.cos(v)) * Math.cos(u);
      out[1] = r * Math.sin(v);
      out[2] = (R + r * Math.cos(v)) * Math.sin(u);
    },
    helix: function (i, out) {
      var t = i / (N - 1);
      var strand = i % 2 === 0 ? 0 : Math.PI;
      var a = t * Math.PI * 6 + strand;
      out[0] = Math.cos(a) * 0.62;
      out[1] = (t - 0.5) * 2.5;
      out[2] = Math.sin(a) * 0.62;
    },
    lattice: function (i, out) {
      var side = 6;                      /* 6 x 6 x 6 = 216, padded to N */
      var k = i % (side * side * side);
      var x = k % side, y = Math.floor(k / side) % side, z = Math.floor(k / (side * side));
      out[0] = (x / (side - 1) - 0.5) * 2.0;
      out[1] = (y / (side - 1) - 0.5) * 2.0;
      out[2] = (z / (side - 1) - 0.5) * 2.0;
    },
    wave: function (i, out) {
      var side = 15;
      var x = i % side, z = Math.floor(i / side);
      var u = x / (side - 1) - 0.5, v = z / (side - 1) - 0.5;
      out[0] = u * 2.6;
      out[1] = Math.sin(u * 7) * Math.cos(v * 7) * 0.42;
      out[2] = v * 2.6;
    }
  };

  function build(name) {
    var fn = SHAPES[name] || SHAPES.sphere;
    var arr = new Float32Array(N * 3);
    var tmp = [0, 0, 0];
    for (var i = 0; i < N; i++) {
      fn(i, tmp);
      arr[i * 3] = tmp[0]; arr[i * 3 + 1] = tmp[1]; arr[i * 3 + 2] = tmp[2];
    }
    return arr;
  }

  /* Shapes come from the host: data-globe="scatter,sphere,torus". */
  var names = (host.getAttribute('data-globe') || '').split(',')
    .map(function (x) { return x.trim(); }).filter(function (x) { return SHAPES[x]; });
  if (names.length < 2) names = ['scatter', 'sphere'];

  var forms = names.map(build);
  var sphere = forms[forms.length - 1];     /* last form defines the edges */
  var scatter = forms[0];

  /* Edges between near neighbours of the final form. */
  var edges = [];
  for (var pI = 0; pI < N; pI++) {
    var best = [];
    for (var q = 0; q < N; q++) {
      if (q === pI) continue;
      var dx = sphere[pI * 3] - sphere[q * 3];
      var dy = sphere[pI * 3 + 1] - sphere[q * 3 + 1];
      var dz = sphere[pI * 3 + 2] - sphere[q * 3 + 2];
      best.push([dx * dx + dy * dy + dz * dz, q]);
    }
    best.sort(function (m, n) { return m[0] - n[0]; });
    for (var k = 0; k < 3; k++) {
      var j = best[k][1];
      if (pI < j) edges.push(pI, j);
    }
  }
  var edgeIdx = new Uint16Array(edges);

  /* ---- shaders ----------------------------------------------------------- */
  var VERT = [
    'attribute vec3 aSphere;',
    'attribute vec3 aScatter;',
    'uniform mat4 uProj;',
    'uniform mat4 uView;',
    'uniform float uProg;',
    'uniform float uSize;',
    'varying float vFade;',
    'void main(){',
    '  vec3 pos = mix(aScatter, aSphere, uProg);',
    '  vec4 mv = uView * vec4(pos, 1.0);',
    '  gl_Position = uProj * mv;',
    '  float z = -mv.z;',
    '  gl_PointSize = uSize * (3.2 / max(z, 0.1));',
    '  vFade = clamp((6.6 - z) / 3.2, 0.18, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'uniform vec3 uColor;',
    'uniform float uAlpha;',
    'uniform float uRound;',
    'varying float vFade;',
    'void main(){',
    '  float a = uAlpha * vFade;',
    '  if (uRound > 0.5) {',
    '    vec2 c = gl_PointCoord - 0.5;',
    '    float d = length(c);',
    '    if (d > 0.5) discard;',
    '    a *= smoothstep(0.5, 0.18, d);',
    '  }',
    '  gl_FragColor = vec4(uColor, a);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  function buf(data, target, Type) {
    var b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return b;
  }
  var bSphere = buf(sphere, gl.ARRAY_BUFFER);     /* "to" of the current pair */
  var bScatter = buf(scatter, gl.ARRAY_BUFFER);   /* "from" of the current pair */
  var bEdges = buf(edgeIdx, gl.ELEMENT_ARRAY_BUFFER);

  var curSeg = -1;
  function setSegment(seg) {
    if (seg === curSeg) return;
    curSeg = seg;
    gl.bindBuffer(gl.ARRAY_BUFFER, bScatter);
    gl.bufferData(gl.ARRAY_BUFFER, forms[seg], gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bSphere);
    gl.bufferData(gl.ARRAY_BUFFER, forms[Math.min(seg + 1, forms.length - 1)], gl.DYNAMIC_DRAW);
  }

  var aSphere = gl.getAttribLocation(prog, 'aSphere');
  var aScatter = gl.getAttribLocation(prog, 'aScatter');
  gl.enableVertexAttribArray(aSphere);
  gl.enableVertexAttribArray(aScatter);

  var U = {};
  ['uProj', 'uView', 'uProg', 'uSize', 'uColor', 'uAlpha', 'uRound'].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  /* ---- matrices ---------------------------------------------------------- */
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  /* View = translate back, then rotate the model on Y and X. */
  function view(rx, ry, dist) {
    var cx = Math.cos(rx), sx = Math.sin(rx);
    var cy = Math.cos(ry), sy = Math.sin(ry);
    /* Rx * Ry, column-major, with -dist on Z. */
    return new Float32Array([
      cy, sx * sy, -cx * sy, 0,
      0, cx, sx, 0,
      sy, -sx * cy, cx * cy, 0,
      0, 0, -dist, 1
    ]);
  }

  /* ---- colour ------------------------------------------------------------ */
  var color = [0.05, 0.75, 0.26];
  function readColor() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();
    var m = v.match(/^#([0-9a-f]{6})$/i);
    if (!m) return;
    var n = parseInt(m[1], 16);
    color = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  readColor();
  new MutationObserver(readColor).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] });

  /* ---- loop -------------------------------------------------------------- */
  host.appendChild(canvas);
  host.classList.add('has-globe');

  var W = 1, H = 1, proj = null, dead = false, raf = null, running = false;
  var progress = reduce ? 1 : 0, spin = 0, last = 0, frames = 0, sampled = 0, slow = 0;

  function resize() {
    var r = host.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H;
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    gl.viewport(0, 0, W, H);
    proj = perspective(0.95, r.width / Math.max(1, r.height), 0.1, 60);
  }

  function teardown() {
    dead = true;
    if (raf) cancelAnimationFrame(raf);
    host.classList.remove('has-globe');
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  function draw(now) {
    if (dead) return;
    /* Give the page time to settle before judging the frame rate: the first
       seconds are load, layout and the entrance animations, which are not
       what this canvas costs. Then sample a window and only bail if most of
       it was genuinely slow. */
    if (last) {
      frames++;
      if (frames > 120) {
        sampled++;
        if (now - last > 34) slow++;
        if (sampled === 120 && slow > 90) { teardown(); return; }
      }
    }
    last = now;

    if (!reduce) spin += 0.0022;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    /* Walk the chain of forms: pick the pair progress currently sits
       between, and ease within that segment. */
    var segs = Math.max(1, forms.length - 1);
    var sp = Math.min(progress, 0.99999) * segs;
    var seg = Math.floor(sp);
    var localT = sp - seg;
    setSegment(seg);

    var eased = localT * localT * (3 - 2 * localT);
    var assembled = progress * progress * (3 - 2 * progress);
    gl.uniformMatrix4fv(U.uProj, false, proj);
    gl.uniformMatrix4fv(U.uView, false, view(-0.33 + assembled * 0.12, spin, 4.6));
    gl.uniform1f(U.uProg, eased);
    gl.uniform3fv(U.uColor, color);

    gl.bindBuffer(gl.ARRAY_BUFFER, bSphere);
    gl.vertexAttribPointer(aSphere, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bScatter);
    gl.vertexAttribPointer(aScatter, 3, gl.FLOAT, false, 0, 0);

    /* Edges only once the shell has formed enough to read as structure. */
    gl.uniform1f(U.uRound, 0);
    gl.uniform1f(U.uAlpha, Math.max(0, assembled - 0.2) / 0.8 * 0.75);
    gl.uniform1f(U.uSize, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bEdges);
    gl.drawElements(gl.LINES, edgeIdx.length, gl.UNSIGNED_SHORT, 0);

    gl.uniform1f(U.uRound, 1);
    gl.uniform1f(U.uAlpha, 0.65 + assembled * 0.35);
    gl.uniform1f(U.uSize, (6.5 + assembled * 3.0) * Math.min(window.devicePixelRatio || 1, 2));
    gl.drawArrays(gl.POINTS, 0, N);

    raf = requestAnimationFrame(draw);
  }

  function start() { if (!running && !dead) { running = true; raf = requestAnimationFrame(draw); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  resize();
  start();

  window.addEventListener('resize', function () {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 200);
  });
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0 }).observe(host);
  }
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); teardown(); });

  /* The scroll driver lives in main.js, where GSAP is. */
  window.__novixGlobe = {
    set: function (p) { if (!reduce) progress = Math.max(0, Math.min(1, p)); },
    alive: function () { return !dead; }
  };
}());
