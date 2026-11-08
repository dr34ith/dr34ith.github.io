document.addEventListener('DOMContentLoaded', function () {
  initStarfield('starfield');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (!reduceMotion && !coarsePointer) {
    // Parallax the whole backdrop (not the individual .galaxy-nebula layers,
    // which already have their own CSS keyframe transform animation) against
    // the hero content, for a simple layered-depth effect.
    var galaxyBg = document.getElementById('galaxy-bg');
    var heroContent = document.querySelector('.landing-hero__content');

    document.addEventListener('mousemove', function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      var ny = (e.clientY / window.innerHeight - 0.5) * 2;

      if (galaxyBg) {
        galaxyBg.style.transform = 'translate3d(' + (nx * 10) + 'px,' + (ny * 10) + 'px,0)';
      }

      if (heroContent) {
        heroContent.style.transform = 'translate3d(' + (nx * -6) + 'px,' + (ny * -6) + 'px,0)';
      }
    });
  }

  var typed = document.querySelector('[data-landing-type]');
  if (!typed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var messages = ['whoami', 'Dreaith', 'still learning'];
  var messageIndex = 0;
  var characterIndex = 0;
  var deleting = false;

  function tick() {
    var message = messages[messageIndex];

    if (!deleting) {
      characterIndex += 1;
      typed.textContent = message.slice(0, characterIndex);

      if (characterIndex === message.length) {
        deleting = true;
        window.setTimeout(tick, 1400);
        return;
      }

      window.setTimeout(tick, 70);
      return;
    }

    characterIndex -= 1;
    typed.textContent = message.slice(0, characterIndex);

    if (characterIndex === 0) {
      deleting = false;
      messageIndex = (messageIndex + 1) % messages.length;
      window.setTimeout(tick, 300);
      return;
    }

    window.setTimeout(tick, 35);
  }

  tick();
});
