(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var dot = document.createElement('div');
  dot.className = 'cursor-trail-dot';
  document.body.appendChild(dot);

  var targetX = window.innerWidth / 2;
  var targetY = window.innerHeight / 2;
  var x = targetX;
  var y = targetY;
  var active = false;

  document.addEventListener('mousemove', function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
    kick();
    if (!active) {
      active = true;
      dot.classList.add('is-active');
    }
  });

  document.addEventListener('mouseleave', function () {
    active = false;
    dot.classList.remove('is-active');
  });

  var running = false;
  function loop() {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1) {
      requestAnimationFrame(loop);
    } else {
      running = false;
    }
  }
  function kick() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

})();
