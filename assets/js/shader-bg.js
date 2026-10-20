/* ==========================================================================
   Novix — WebGL backdrop
   A domain-warped noise field in the brand greens: slow drifting filaments
   that brighten around the pointer and shift with scroll. Raw WebGL rather
   than a 3D library, because this is one fullscreen quad and a fragment
   shader — a library would outweigh the whole site.

   It only ever enhances: the CSS ambient gradient stays underneath and is
   revealed again if WebGL is missing, the context is lost, or the frame
   budget is not being met.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var VERT = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec2 uMouse;',
    'uniform float uScroll;',
    'uniform float uMouseOn;',
    'uniform vec3 uBg;',
    'uniform vec3 uInk;',
    'uniform vec3 uGlow;',

    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }',

    'float noise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
    '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',

    'float fbm(vec2 p){',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uRes.xy;',
    '  float ar = uRes.x / uRes.y;',
    '  vec2 p = vec2(uv.x * ar, uv.y);',
    '  float t = uTime * 0.04;',

    /* Two rounds of domain warping give the field its filament structure. */
    '  vec2 q = vec2(fbm(p * 2.1 + t), fbm(p * 2.1 + vec2(5.2, 1.3) - t));',
    '  vec2 r = vec2(fbm(p * 2.1 + 3.4 * q + vec2(1.7, 9.2) + t * 1.2),',
    '                fbm(p * 2.1 + 3.4 * q + vec2(8.3, 2.8) - t * 0.8));',
    '  float f = fbm(p * 2.1 + 3.0 * r + uScroll * 0.22);',

    /* Amplitudes are deliberately low: this is atmosphere behind text, not
       a pattern. The vein band is wide so filaments read as soft glow
       rather than hard edges. */
    '  float body = smoothstep(0.38, 0.86, f);',
    '  float vein = smoothstep(0.50, 0.57, f) - smoothstep(0.57, 0.64, f);',

    '  vec3 col = uBg;',
    '  col = mix(col, uInk, body * 0.055);',
    '  col = mix(col, uGlow, vein * 0.085);',

    '  vec2 m = vec2(uMouse.x * ar, uMouse.y);',
    '  float d = distance(p, m);',
    '  col += uGlow * exp(-d * 4.2) * 0.05 * uMouseOn;',

    '  float vig = smoothstep(1.30, 0.20, length(uv - 0.5));',
    '  col = mix(uBg, col, vig * 0.92 + 0.08);',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var canvas = document.createElement('canvas');
  canvas.className = 'shader-bg';
  canvas.setAttribute('aria-hidden', 'true');

  var gl = null;
  try {
    var opts = { alpha: false, antialias: false, depth: false, stencil: false,
                 powerPreference: 'low-power', failIfMajorPerformanceCaveat: false };
    gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
  } catch (e) { gl = null; }
  if (!gl) return;

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['uRes', 'uTime', 'uMouse', 'uScroll', 'uMouseOn', 'uBg', 'uInk', 'uGlow'].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  document.body.appendChild(canvas);
  root.classList.add('has-shader');

  /* ---- colour, read from the live theme ---------------------------------- */
  function rgb(value, fallback) {
    var m = String(value).trim().match(/^#([0-9a-f]{6})$/i);
    if (!m) return fallback;
    var n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function readTheme() {
    var cs = getComputedStyle(root);
    var bg = rgb(cs.getPropertyValue('--bg'), [0.04, 0.05, 0.06]);
    var brand = rgb(cs.getPropertyValue('--brand'), [0.05, 0.75, 0.26]);
    gl.uniform3fv(U.uBg, bg);
    gl.uniform3fv(U.uInk, brand);
    gl.uniform3fv(U.uGlow, brand);
  }
  readTheme();
  new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---- sizing: rendered below device resolution, it is a soft backdrop --- */
  var scale = window.innerWidth < 900 ? 0.42 : 0.52;
  function resize() {
    var w = Math.max(1, Math.round(window.innerWidth * scale));
    var h = Math.max(1, Math.round(window.innerHeight * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uRes, w, h);
  }
  resize();

  var mouse = [0.5, 0.5], mouseOn = 0, scroll = 0, raf = null, running = false;
  var started = 0, frames = 0, slow = 0, dead = false;

  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  function teardown() {
    dead = true;
    stop();
    root.classList.remove('has-shader');
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  var last = 0;
  function frame(now) {
    if (dead) return;
    if (!started) started = now;

    /* Budget guard: if the field cannot hold a reasonable frame rate on this
       device, drop it and let the CSS gradient take over. The first second
       is skipped — page load, the entrance timeline and the loader all
       compete for frames, and judging the shader on those would drop it on
       machines that handle it fine. */
    if (last) {
      frames++;
      if (frames > 60) {
        if (now - last > 34) slow++;
        if (frames === 180 && slow > 84) { teardown(); return; }
      }
    }
    last = now;

    gl.uniform1f(U.uTime, (now - started) / 1000);
    gl.uniform1f(U.uScroll, scroll);
    gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
    gl.uniform1f(U.uMouseOn, mouseOn);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running && !dead) { running = true; raf = requestAnimationFrame(frame); } }
  start();

  window.addEventListener('resize', function () {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 200);
  });
  window.addEventListener('mousemove', function (e) {
    mouse[0] = e.clientX / window.innerWidth;
    mouse[1] = 1 - e.clientY / window.innerHeight;
    mouseOn = 1;
  }, { passive: true });
  document.addEventListener('mouseleave', function () { mouseOn = 0; });
  window.addEventListener('scroll', function () {
    var max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    scroll = window.scrollY / max;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  /* A lost context must not leave a frozen canvas over the page. */
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); teardown(); });
}());
