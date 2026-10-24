(function () {
  function init() {
    initPinkParticles();
  }

  function initPinkParticles() {
    var canvas = document.getElementById('about-pink-particles');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var w, h;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    var count = 22;
    var palette = [
      { h: 330, s: 70, l: 65 },
      { h: 340, s: 65, l: 60 },
      { h: 300, s: 50, l: 55 },
      { h: 320, s: 60, l: 58 },
      { h: 350, s: 55, l: 62 },
      { h: 290, s: 45, l: 52 }
    ];

    for (var i = 0; i < count; i++) {
      var c = palette[Math.floor(Math.random() * palette.length)];
      var isStar = Math.random() < 0.35;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: isStar ? 1.2 + Math.random() * 1.8 : 5 + Math.random() * 18,
        vx: (Math.random() - 0.5) * 0.08,
        vy: isStar ? -(0.05 + Math.random() * 0.08) : (Math.random() - 0.5) * 0.06,
        hue: c.h, sat: c.s, light: c.l,
        alpha: isStar ? 0.4 + Math.random() * 0.4 : 0.025 + Math.random() * 0.035,
        phase: Math.random() * Math.PI * 2,
        isStar: isStar
      });
    }

    var frame = 0;

    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r * 2) p.x = w + p.r;
        if (p.x > w + p.r * 2) p.x = -p.r;
        if (p.y < -p.r * 2) p.y = h + p.r;
        if (p.y > h + p.r * 2) p.y = -p.r;

        var pulse = p.alpha + Math.sin(frame * 0.008 + p.phase) * (p.isStar ? 0.15 : 0.01);

        if (p.isStar) {
          ctx.fillStyle = 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + pulse + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'hsla(' + p.hue + ',' + p.sat + '%,90%,' + (pulse * 0.5) + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad.addColorStop(0, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + (pulse * 1.4) + ')');
          grad.addColorStop(0.5, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + (pulse * 0.4) + ')');
          grad.addColorStop(1, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
