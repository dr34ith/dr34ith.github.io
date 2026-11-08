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
    if (!active) {
      active = true;
      dot.classList.add('is-active');
    }
  });

  document.addEventListener('mouseleave', function () {
    active = false;
    dot.classList.remove('is-active');
  });

  function loop() {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
