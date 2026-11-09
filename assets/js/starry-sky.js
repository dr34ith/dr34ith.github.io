/* Starry-night inspired background: swirling clouds, glowing stars, a moon.
   One fixed canvas. Heavy shapes are drawn once into cached bitmaps;
   each frame only blits them and moves a few sprites (no blur/filters). */
(function () {
  // Posts get a plain dark background for reading; no sky there.
  if (document.body.classList.contains('post-page')) return;
  // Writeups + Logs list pages use the lightweight CSS background instead of the canvas.
  if (document.querySelector('#post-list, .logs-page, .logs-article')) return;
  var canvas = document.createElement('canvas');
  canvas.id = 'starry-sky';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var glow = !!document.querySelector('.archives-page, .about-gallery');
  var orbSprites = [], orbs = [], ribbon = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0, dpr = 1;
  var swirl = null, glowSprites = [], glows = [], strokesLayer = null, moon = null, sprites = [], stars = [], meteors = [], eddies = [], nextMeteor = 0.8;
  var raf = 0, last = 0, t = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeSprite(size, rgb) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var h2 = size / 2;
    var grad = g.createRadialGradient(h2, h2, 0, h2, h2, h2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.16, 'rgba(' + rgb + ',0.95)');
    grad.addColorStop(0.5, 'rgba(' + rgb + ',0.2)');
    grad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    if (size >= 40) {
      // painted concentric rings like Van Gogh's stars
      g.lineWidth = Math.max(1.2, size / 22);
      g.strokeStyle = 'rgba(190,240,200,0.4)';
      g.beginPath(); g.arc(h2, h2, size * 0.26, 0, 6.283); g.stroke();
      g.strokeStyle = 'rgba(150,215,255,0.28)';
      g.beginPath(); g.arc(h2, h2, size * 0.38, 0, 6.283); g.stroke();
    }
    return c;
  }

  var PALETTE = ['96,165,250', '56,189,248', '147,197,253', '186,230,253', '250,240,200'];
  var DEEP = ['37,99,235', '30,64,175', '59,130,246', '20,30,110'];
  var YELLOW = ['253,224,71', '250,204,21', '255,240,170'];
  var WHITE = ['255,255,255', '241,245,255'];
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  // mix yellow/white into a colour choice some of the time
  function tint(rgb, py, pw) {
    var r = Math.random();
    return r < py ? pick(YELLOW) : (r < py + pw ? pick(WHITE) : rgb);
  }

  function stroke(g, x, y, ang, len, wid, rgb, alpha) {
    var dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
    g.strokeStyle = 'rgba(' + rgb + ',' + alpha.toFixed(2) + ')';
    g.lineWidth = wid;
    g.beginPath();
    g.moveTo(x - dx, y - dy);
    g.quadraticCurveTo(x + dy * 0.25, y - dx * 0.25, x + dx, y + dy);
    g.stroke();
  }

  // Flowing wave bands made of short brush dashes (painted once)
  function buildSwirl() {
    var sw = Math.max(w, 900) * 2, sh = Math.max(h, 700);
    var c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    var g = c.getContext('2d');
    g.lineCap = 'round';
    for (var band = 0; band < 4; band++) {
      var baseY = sh * (0.16 + band * 0.24);
      var amp = rand(50, 100), len = rand(0.9, 1.4), phase = rand(0, 6.28);
      var thick = rand(34, 56);
      for (var x = 0; x < sw; x += 7) {
        for (var k = 0; k < 2; k++) {
          var across = rand(-thick, thick);
          var cy = baseY + Math.sin(x / (200 * len) + phase) * amp + Math.sin(x / 90 + phase * 2) * 9;
          var slope = Math.atan2(Math.cos(x / (200 * len) + phase) * amp / (200 * len), 1);
          var pool = Math.abs(across) < thick * 0.35 ? PALETTE : DEEP;
          stroke(g, x, cy + across, slope + rand(-0.15, 0.15), rand(11, 20), rand(2.4, 4.2),
                 tint(pool[(Math.random() * pool.length) | 0], 0.1, 0.1), rand(0.1, 0.32));
        }
      }
    }
    swirl = c;
  }

  // Extra short "chopped" dashes across the whole sky, following a swirling flow field
  function buildStrokes() {
    var sw = Math.max(w, 900) * 2, sh = Math.max(h, 700);
    var c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    var g = c.getContext('2d');
    g.lineCap = 'round';
    var centers = [], i, j;
    for (i = 0; i < 8; i++) centers.push({ x: rand(0, sw), y: rand(0, sh), d: i % 2 ? -1 : 1 });
    var count = w < 700 ? 1100 : 2400;
    for (i = 0; i < count; i++) {
      var x = rand(0, sw), y = rand(0, sh);
      var fx = Math.cos(y / 140) * 0.6, fy = Math.sin(x / 170) * 0.6;
      for (j = 0; j < centers.length; j++) {
        var cx = x - centers[j].x, cy = y - centers[j].y;
        var d2 = cx * cx + cy * cy + 1500;
        var wgt = 90000 / d2, inv = 1 / Math.sqrt(d2);
        fx += -cy * inv * wgt * centers[j].d;
        fy += cx * inv * wgt * centers[j].d;
      }
      var ang = Math.atan2(fy, fx);
      var roll = Math.random(), rgb, al;
      if (roll < 0.45)      { rgb = Math.random() < 0.5 ? pick(PALETTE) : pick(DEEP); al = rand(0.2, 0.5); }
      else if (roll < 0.75) { rgb = pick(WHITE); al = rand(0.18, 0.42); }
      else                  { rgb = pick(YELLOW); al = rand(0.18, 0.35); }
      stroke(g, x, y, ang, rand(8, 16), rand(2, 3.5), rgb, al);
    }
    strokesLayer = c;
  }

  // Dense short-stroke swirls following a spiral flow (like the painting). Cached, then spun live.
  function buildEddies() {
    eddies = [];
    var spots = [[0.14, 0.24], [0.4, 0.14], [0.64, 0.3], [0.88, 0.22], [0.24, 0.58], [0.52, 0.66], [0.82, 0.55], [0.16, 0.88], [0.46, 0.92], [0.8, 0.85]];
    spots.forEach(function (sp, i) {
      var R = i % 4 === 1 ? rand(95, 135) : rand(55, 95);
      var size = Math.ceil(R * 2.7);
      var c = document.createElement('canvas');
      c.width = c.height = size;
      var g = c.getContext('2d');
      g.translate(size / 2, size / 2);
      g.lineCap = 'round';
      var dir = i % 2 ? -1 : 1, turns = rand(2.4, 3.2);
      var maxA = turns * 6.283, kk = R / maxA, strokes = Math.round(R * 17);
      for (var n = 0; n < strokes; n++) {
        var a = Math.pow(Math.random(), 0.8) * maxA;
        var spread = rand(-1, 1) * (6 + a * kk * 0.18);
        var r = a * kk + spread + 4;
        var ang = dir * a;
        var px = Math.cos(ang) * r * 1.12, py = Math.sin(ang) * r;
        var dx = kk * Math.cos(ang) - r * Math.sin(ang) * dir;
        var dy = kk * Math.sin(ang) + r * Math.cos(ang) * dir;
        var tan = Math.atan2(dy, dx);
        var t01 = r / R;
        var rgb, al;
        if (t01 < 0.32)      { rgb = Math.random() < 0.5 ? '250,240,200' : '186,230,253'; al = rand(0.3, 0.6); }
        else if (t01 < 0.65) { rgb = PALETTE[(Math.random() * 4) | 0]; al = rand(0.25, 0.5); }
        else                 { rgb = DEEP[(Math.random() * DEEP.length) | 0]; al = rand(0.25, 0.55); }
        if (Math.random() < 0.07) { rgb = '15,20,80'; al = 0.5; }
        else rgb = tint(rgb, 0.08, 0.08);
        var fade = 1 - Math.max(0, t01 - 0.8) * 4;
        stroke(g, px, py, tan, rand(9, 17) + t01 * 4, rand(2.2, 4), rgb, al * Math.max(fade, 0));
      }
      eddies.push({
        bmp: c, size: size, x: sp[0], y: sp[1], rot: rand(0, 6.28), spd: dir * rand(0.12, 0.24),
        ax: rand(25, 55), ay: rand(15, 40), fx: rand(0.08, 0.16), fy: rand(0.07, 0.14), ph: rand(0, 6.28),
        pulse: rand(0.3, 0.6)
      });
    });
  }

  function buildMoon() {
    var size = 260;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var halo = g.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    halo.addColorStop(0, 'rgba(255,236,150,0.55)');
    halo.addColorStop(0.35, 'rgba(255,220,120,0.18)');
    halo.addColorStop(1, 'rgba(255,220,120,0)');
    g.fillStyle = halo; g.fillRect(0, 0, size, size);
    // concentric halo rings
    for (var i = 0; i < 3; i++) {
      g.beginPath(); g.arc(size / 2, size / 2, 46 + i * 22, 0, 6.283);
      g.strokeStyle = 'rgba(255,230,140,' + (0.22 - i * 0.06) + ')'; g.lineWidth = 3; g.stroke();
    }
    // crescent
    g.fillStyle = '#ffe98a';
    g.beginPath(); g.arc(size / 2, size / 2, 34, 0, 6.283); g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(size / 2 + 14, size / 2 - 6, 30, 0, 6.283); g.fill();
    g.globalCompositeOperation = 'source-over';
    moon = c;
  }


  // Soft, truly blurry violet glow lights (medium size), painted once with an eased falloff
  function buildGlows() {
    var tints = ['139,92,246', '167,139,250', '192,132,252'];
    glowSprites = tints.map(function (rgb) {
      var size = 256, c = document.createElement('canvas');
      c.width = c.height = size;
      var g = c.getContext('2d');
      var grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (var i = 0; i <= 12; i++) {
        var u = i / 12;
        grad.addColorStop(u, 'rgba(' + rgb + ',' + (Math.pow(1 - u, 1.8) * 1).toFixed(3) + ')');
      }
      g.fillStyle = grad; g.fillRect(0, 0, size, size);
      return c;
    });
    // [anchorX, anchorY] as fractions of the screen; spread over margins, header, lower area, centre
    var anchors = [[0.1, 0.25], [0.92, 0.2], [0.85, 0.75], [0.15, 0.82], [0.5, 0.45]];
    glows = anchors.map(function (a, i) {
      return {
        ax: a[0], ay: a[1], d: rand(420, 560), spr: i % 3,
        px: rand(0, 6.28), py: rand(0, 6.28),
        fx: 6.283 / rand(22, 45), fy: 6.283 / rand(20, 40),
        rx: rand(0.1, 0.2), ry: rand(0.08, 0.16),
        pa: rand(0, 6.28), fa: 6.283 / rand(7, 12), a: rand(0.75, 1)
      };
    });
  }

  // Big violet light washes (wide, soft, no visible edge) + diagonal light beams
  function buildOrbs() {
    var tints = ['124,58,237', '168,85,247', '217,70,239'];
    orbSprites = tints.map(function (rgb) {
      var W = 512, H = 320, c = document.createElement('canvas');
      c.width = W; c.height = H;
      var g = c.getContext('2d');
      g.translate(W / 2, H / 2); g.scale(1, H / W);
      var grad = g.createRadialGradient(0, 0, 0, 0, 0, W / 2);
      grad.addColorStop(0, 'rgba(' + rgb + ',0.85)');
      grad.addColorStop(0.45, 'rgba(' + rgb + ',0.4)');
      grad.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = grad; g.fillRect(-W / 2, -W / 2, W, W);
      return c;
    });
    var anchors = [[0.1, 0.2], [0.9, 0.35], [0.15, 0.8], [0.88, 0.88]];
    orbs = anchors.map(function (a, i) {
      return {
        ax: a[0], ay: a[1], r: rand(240, 380), spr: i % 3,
        px: rand(0, 6.28), py: rand(0, 6.28), sx: rand(0.04, 0.09), sy: rand(0.03, 0.07),
        dx: rand(0.08, 0.16), dy: rand(0.06, 0.12), pa: rand(0, 6.28), sa: rand(0.4, 0.65)
      };
    });
    var rc = document.createElement('canvas');
    rc.width = 360; rc.height = 8;
    var rg = rc.getContext('2d');
    var lg = rg.createLinearGradient(0, 0, 360, 0);
    lg.addColorStop(0, 'rgba(168,85,247,0)');
    lg.addColorStop(0.5, 'rgba(196,140,255,0.6)');
    lg.addColorStop(1, 'rgba(168,85,247,0)');
    rg.fillStyle = lg; rg.fillRect(0, 0, 360, 8);
    ribbon = rc;
  }

  function build() {
    sprites = [makeSprite(24, '255,236,150'), makeSprite(40, '255,224,130'), makeSprite(64, '186,230,253'), makeSprite(48, '196,181,253')];
    var count = Math.round(Math.min(110, (w * h) / 16000));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: rand(0, w), y: rand(0, h * 0.85),
        s: Math.random() < 0.15 ? 2 : (Math.random() < 0.5 ? 1 : 0),
        v: rand(2, 9), p: rand(0, 6.28), f: rand(0.6, 1.6)
      });
    }
    buildSwirl();
    buildStrokes();
    buildEddies();
    buildMoon();
    if (glow) { buildOrbs(); buildGlows(); }
  }

  var lastW = 0, lastH = 0;
  function resize() {
    if (lastW && Math.abs(window.innerWidth - lastW) < 40 && Math.abs(window.innerHeight - lastH) < 160) return;
    lastW = window.innerWidth; lastH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    draw(0);
  }

  function draw(dt) {
    if (!swirl || !strokesLayer) return;
    t += dt;
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#070d2b');
    sky.addColorStop(0.45, '#0f2159');
    sky.addColorStop(1, '#14408a');
    ctx.globalAlpha = 1;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // drifting swirl layer, two passes for parallax
    var sw = swirl.width;
    var o1 = (t * 6) % sw, o2 = (t * 3 + sw / 2) % sw;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(swirl, -o1, 0, sw, swirl.height);
    ctx.drawImage(swirl, sw - o1, 0, sw, swirl.height);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(swirl, -o2, h * 0.08, sw, swirl.height);
    ctx.drawImage(swirl, sw - o2, h * 0.08, sw, swirl.height);
    var o3 = (sw - (t * 4) % sw) % sw;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(strokesLayer, -o3, 0, sw, strokesLayer.height);
    ctx.drawImage(strokesLayer, sw - o3, 0, sw, strokesLayer.height);

    // spinning, drifting, breathing eddies (small Starry Night swirls)
    ctx.globalAlpha = 0.9;
    for (var e = 0; e < eddies.length; e++) {
      var ed = eddies[e];
      var ex = ed.x * w + Math.sin(t * ed.fx + ed.ph) * ed.ax;
      var ey = ed.y * h + Math.cos(t * ed.fy + ed.ph) * ed.ay;
      var sc = 1 + Math.sin(t * ed.pulse + ed.ph) * 0.08;
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ed.rot + t * ed.spd);
      ctx.scale(sc, sc);
      ctx.drawImage(ed.bmp, -ed.size / 2, -ed.size / 2);
      ctx.restore();
    }

    // moon
    var mp = 0.85 + Math.sin(t * 0.6) * 0.1;
    ctx.globalAlpha = mp;
    var ms = Math.min(220, w * 0.22);
    ctx.drawImage(moon, w - ms * 0.75, h * 0.62, ms, ms);

    // violet light washes + sweeping beams (cached bitmaps, additive)
    if (glow) {
      ctx.globalCompositeOperation = 'lighter';
      for (var o = 0; o < orbs.length; o++) {
        var ob = orbs[o];
        var ox = ob.ax * w + Math.sin(t * ob.sx + ob.px) * w * ob.dx;
        var oy = ob.ay * h + Math.sin(t * ob.sy + ob.py) * h * ob.dy;
        ctx.globalAlpha = ob.sa * (0.65 + 0.35 * Math.sin(t * 0.45 + ob.pa));
        ctx.drawImage(orbSprites[ob.spr], ox - ob.r, oy - ob.r * 0.62, ob.r * 2, ob.r * 1.25);
      }
      for (var k = 0; k < 2; k++) {
        var bx = ((t * (22 + k * 9) + k * 520) % (w + 1200)) - 600;
        ctx.save();
        ctx.translate(bx, h * 0.5);
        ctx.rotate(-0.5);
        ctx.globalAlpha = 0.18 - k * 0.05;
        ctx.drawImage(ribbon, -(70 + k * 30), -h * 1.3, 140 + k * 60, h * 2.6);
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'lighter';
      // moving blurry glow lights
      for (var gi = 0; gi < glows.length; gi++) {
        var gl = glows[gi];
        var gx = gl.ax * w + Math.sin(t * gl.fx + gl.px) * w * gl.rx;
        var gy = gl.ay * h + Math.sin(t * gl.fy + gl.py) * h * gl.ry;
        ctx.globalAlpha = gl.a * (0.75 + 0.25 * Math.sin(t * gl.fa + gl.pa));
        ctx.drawImage(glowSprites[gl.spr], gx - gl.d / 2, gy - gl.d / 2, gl.d, gl.d);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // stars
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var x = (st.x + t * st.v) % (w + 40) - 20;
      var tw = 0.55 + 0.45 * Math.sin(t * st.f + st.p);
      var sp = sprites[st.s], sz = sp.width * (st.s === 2 ? 1.0 : 0.8);
      ctx.globalAlpha = tw;
      ctx.drawImage(sp, x - sz / 2, st.y - sz / 2, sz, sz);
    }

    // shooting stars (pool)
    if (!reduce) {
      nextMeteor -= dt;
      if (nextMeteor <= 0 && meteors.length < 4) {
        var count = Math.random() < 0.25 ? 2 : 1;
        for (var m = 0; m < count; m++) {
          meteors.push({
            x: rand(w * 0.05, w * 0.8), y: rand(0, h * 0.4), life: 0,
            dur: rand(0.7, 1.2), ang: rand(0.25, 0.6), speed: rand(380, 620), tail: rand(120, 220)
          });
        }
        nextMeteor = rand(1.5, 3.5);
      }
      for (var q = meteors.length - 1; q >= 0; q--) {
        var me = meteors[q];
        me.life += dt;
        var kk = me.life / me.dur;
        if (kk >= 1) { meteors.splice(q, 1); continue; }
        var dx = Math.cos(me.ang), dy = Math.sin(me.ang);
        var hx = me.x + dx * me.speed * me.life, hy = me.y + dy * me.speed * me.life;
        var tg = ctx.createLinearGradient(hx, hy, hx - dx * me.tail, hy - dy * me.tail);
        tg.addColorStop(0, 'rgba(255,248,200,1)');
        tg.addColorStop(0.3, 'rgba(253,224,71,0.65)');
        tg.addColorStop(1, 'rgba(250,204,21,0)');
        var fade = kk < 0.15 ? kk / 0.15 : 1 - (kk - 0.15) / 0.85;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = tg; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - dx * me.tail, hy - dy * me.tail); ctx.stroke();
        ctx.drawImage(sprites[1], hx - 16, hy - 16, 32, 32);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    draw(dt);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (reduce || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 200);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  // Build after first paint so the page itself shows up immediately, then fade the sky in.
  function boot() {
    try { resize(); } catch (err) { if (window.console) console.warn('starry-sky:', err); return; }
    start();
    requestAnimationFrame(function () { canvas.classList.add('is-ready'); });
  }
  function later() {
    if (window.requestIdleCallback) window.requestIdleCallback(boot, { timeout: 600 });
    else setTimeout(boot, 50);
  }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later);
})();
