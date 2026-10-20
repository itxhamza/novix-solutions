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

  /* ---- geometry ---------------------------------------------------------- */
  var N = 220;
  var sphere = new Float32Array(N * 3);
  var scatter = new Float32Array(N * 3);
  var golden = Math.PI * (3 - Math.sqrt(5));

  function rand(seed) { var x = Math.sin(seed) * 43758.5453123; return x - Math.floor(x); }

  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var rr = Math.sqrt(Math.max(0, 1 - y * y));
    var th = golden * i;
    sphere[i * 3] = Math.cos(th) * rr;
    sphere[i * 3 + 1] = y;
    sphere[i * 3 + 2] = Math.sin(th) * rr;

    /* Scattered start: a wide shell the nodes converge in from. */
    var a = rand(i * 1.7) * Math.PI * 2;
    var b = Math.acos(2 * rand(i * 3.1) - 1);
    var d = 2.6 + rand(i * 5.3) * 3.4;
    scatter[i * 3] = Math.sin(b) * Math.cos(a) * d;
    scatter[i * 3 + 1] = Math.cos(b) * d * 0.75;
    scatter[i * 3 + 2] = Math.sin(b) * Math.sin(a) * d;
  }

  /* Edges between near neighbours on the sphere. */
  var edges = [];
  for (var p = 0; p < N; p++) {
    var best = [];
    for (var q = 0; q < N; q++) {
      if (q === p) continue;
      var dx = sphere[p * 3] - sphere[q * 3];
      var dy = sphere[p * 3 + 1] - sphere[q * 3 + 1];
      var dz = sphere[p * 3 + 2] - sphere[q * 3 + 2];
      best.push([dx * dx + dy * dy + dz * dz, q]);
    }
    best.sort(function (m, n) { return m[0] - n[0]; });
    for (var k = 0; k < 3; k++) {
      var j = best[k][1];
      if (p < j) edges.push(p, j);
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
  var bSphere = buf(sphere, gl.ARRAY_BUFFER);
  var bScatter = buf(scatter, gl.ARRAY_BUFFER);
  var bEdges = buf(edgeIdx, gl.ELEMENT_ARRAY_BUFFER);

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
  var progress = reduce ? 1 : 0, spin = 0, last = 0, frames = 0, slow = 0;

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
    if (last) {
      frames++;
      if (now - last > 34) slow++;
      if (frames === 90 && slow > 50) { teardown(); return; }
    }
    last = now;

    if (!reduce) spin += 0.0022;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    var eased = progress * progress * (3 - 2 * progress);
    gl.uniformMatrix4fv(U.uProj, false, proj);
    gl.uniformMatrix4fv(U.uView, false, view(-0.33 + eased * 0.12, spin, 4.6));
    gl.uniform1f(U.uProg, eased);
    gl.uniform3fv(U.uColor, color);

    gl.bindBuffer(gl.ARRAY_BUFFER, bSphere);
    gl.vertexAttribPointer(aSphere, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bScatter);
    gl.vertexAttribPointer(aScatter, 3, gl.FLOAT, false, 0, 0);

    /* Edges only once the shell has formed enough to read as structure. */
    gl.uniform1f(U.uRound, 0);
    gl.uniform1f(U.uAlpha, Math.max(0, eased - 0.2) / 0.8 * 0.75);
    gl.uniform1f(U.uSize, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bEdges);
    gl.drawElements(gl.LINES, edgeIdx.length, gl.UNSIGNED_SHORT, 0);

    gl.uniform1f(U.uRound, 1);
    gl.uniform1f(U.uAlpha, 0.65 + eased * 0.35);
    gl.uniform1f(U.uSize, (6.5 + eased * 3.0) * Math.min(window.devicePixelRatio || 1, 2));
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
