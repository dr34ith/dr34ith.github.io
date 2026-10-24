---
layout: page
icon: fas fa-user-astronaut
order: 5
---

<div id="galaxy-bg" aria-hidden="true">
  <div class="galaxy-nebula nebula-1"></div>
  <div class="galaxy-nebula nebula-2"></div>
  <div class="galaxy-nebula nebula-3"></div>
  <canvas id="starfield"></canvas>
</div>

<div class="about-gallery">

  <header class="about-gallery__intro fade-in-stagger delay-1">
    <span class="about-gallery__label">A personal archive</span>
    <h2>Hi, I'm Dreaith.</h2>
    <p>A creative soul who paints on canvas, explores life, and rides motorcycles. "NBSB" , but at least I know how to handle a clutch. (</p>
  </header>

  <section class="about-gallery__exhibit fade-in-stagger delay-2">
    <span class="about-gallery__label">01 / In practice</span>
    <p>Currently practicing to build solid foundation of self-confidence and self-trust. Lately, I've enjoyed the offensive side of security while solving PortSwigger labs, but I'm actively pushing myself to focus on the blue team perspective because I'm amazed by the field of DFIR. I believe that to defend a system effectively, you first need to know exactly how to break it.</p>
  </section>

  <div class="about-gallery__grid two-cols">
    <section class="about-gallery__exhibit fade-in-stagger delay-3">
      <span class="about-gallery__label">02 / Reflections</span>
      <p>Comparison and negative self-talk slow down my progress, but I want to remind myself every day that we are all unique and grow at our own pace. Learning is not a straight path; it can be a rocky road filled with challenges and setbacks. Most importantly, I don't want to forget to enjoy the journey, because life is more than just learning and achieving goals.</p>
    </section>

    <section class="about-gallery__exhibit fade-in-stagger delay-4">
      <span class="about-gallery__label">03 / Beyond the screen</span>
      <p>When I'm not deep in a lab environment, I'm usually surrounded by music or art. I'm a huge fan of bands, and I love spending my free time singing and playing the guitar.</p>
    </section>
  </div>

  <section class="bible-verse-box fade-in-stagger delay-5">
    <p style="font-style: italic; margin-bottom: 0.5rem; font-size: 1.1em; color: #e9ecef;">"God is within her, she will not fall; God will help her at break of day."</p>
    <span style="font-size: 0.85em; letter-spacing: 1px; text-transform: uppercase; color: #9b59b6; font-weight: 600;">Psalm 46:5</span>
  </section>


  <div class="about-cat" aria-hidden="true">
    <div class="about-cat__body">
      <div class="about-cat__ears">
        <div class="about-cat__ear about-cat__ear--left"></div>
        <div class="about-cat__ear about-cat__ear--right"></div>
      </div>
      <div class="about-cat__face">
        <div class="about-cat__eyes">
          <div class="about-cat__eye about-cat__eye--left"><div class="about-cat__pupil"></div></div>
          <div class="about-cat__eye about-cat__eye--right"><div class="about-cat__pupil"></div></div>
        </div>
        <div class="about-cat__nose"></div>
        <div class="about-cat__mouth"></div>
        <div class="about-cat__whiskers about-cat__whiskers--left">
          <span></span><span></span><span></span>
        </div>
        <div class="about-cat__whiskers about-cat__whiskers--right">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="about-cat__tail"></div>
    </div>
  </div>

  <canvas id="about-pink-particles" class="about-pink-particles" aria-hidden="true"></canvas>

</div>

<link rel="stylesheet" href="{{ '/assets/css/about-enhance.css' | relative_url }}">
<script src="{{ '/assets/js/about-enhance.js' | relative_url }}" defer></script>

<script>
(function () {
  var canvas = document.getElementById('starfield');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TINTS = ['255,255,255', '216,180,254', '147,197,253', '244,114,182'];
  var TWO_PI = Math.PI * 2;

  var w = 0, h = 0, dpr = 1;
  var stars = [], meteors = [];
  var lastMeteor = 0, rafId = null, running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (reduceMotion) drawFrame(0);
  }

  function buildStars() {
    var count = Math.max(70, Math.min(280, Math.round((w * h) / 8500)));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.25,
        base: Math.random() * 0.45 + 0.25,
        amp: Math.random() * 0.45,
        speed: Math.random() * 0.0016 + 0.0006,
        phase: Math.random() * TWO_PI,
        tint: TINTS[(Math.random() * TINTS.length) | 0],
        vy: Math.random() * 0.07 + 0.012,
        vx: (Math.random() - 0.5) * 0.05
      });
    }
  }

  function spawnMeteor() {
    var fromLeft = Math.random() > 0.4;
    meteors.push({
      x: fromLeft ? Math.random() * w * 0.45 - 80 : w + 80,
      y: Math.random() * h * 0.5,
      vx: fromLeft ? 5 + Math.random() * 3 : -(5 + Math.random() * 3),
      vy: 2.2 + Math.random() * 1.6,
      len: 90 + Math.random() * 120,
      life: 1
    });
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.base + Math.sin(t * s.speed + s.phase) * s.amp;
      if (a < 0.06) a = 0.06;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + s.tint + ',' + a.toFixed(3) + ')';
      ctx.arc(s.x, s.y, s.r, 0, TWO_PI);
      ctx.fill();

      if (!reduceMotion) {
        s.y += s.vy;
        s.x += s.vx;
        if (s.y - 3 > h) { s.y = -3; s.x = Math.random() * w; }
        if (s.x < -3) s.x = w + 3;
        else if (s.x > w + 3) s.x = -3;
      }
    }

    for (var j = meteors.length - 1; j >= 0; j--) {
      var m = meteors[j];
      var mag = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
      var tx = m.x - (m.vx / mag) * m.len;
      var ty = m.y - (m.vy / mag) * m.len;

      var grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,' + (0.9 * m.life).toFixed(3) + ')');
      grad.addColorStop(0.3, 'rgba(216,180,254,' + (0.5 * m.life).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(155,89,182,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.009;

      if (m.life <= 0 || m.x < -320 || m.x > w + 320 || m.y > h + 320) {
        meteors.splice(j, 1);
      }
    }

    if (!reduceMotion && t - lastMeteor > 4500 && Math.random() < 0.012) {
      lastMeteor = t;
      spawnMeteor();
    }
  }

  function loop(t) {
    if (!running) return;
    drawFrame(t);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  resize();
  start();

  // Rebuild only when the width changes, so mobile address-bar
  // show/hide (height-only resizes) doesn't make the stars flicker.
  var lastWidth = window.innerWidth;
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        resize();
      }
    }, 150);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });
})();
</script>
