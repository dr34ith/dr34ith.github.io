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

/* ---- Landing extras: progress bar, sticky nav, spotlight, tilt, magnetic buttons, counters, terminal ---- */
document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = !window.matchMedia('(pointer: coarse)').matches;

  // Scroll progress + sticky nav state
  var bar = document.querySelector('.landing-progress span');
  var nav = document.querySelector('.landing-nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cursor spotlight
  var spot = document.querySelector('.landing-spotlight');
  if (spot && fine && !reduce) {
    window.addEventListener('mousemove', function (e) {
      spot.style.setProperty('--mx', e.clientX + 'px');
      spot.style.setProperty('--my', e.clientY + 'px');
      spot.classList.add('is-on');
    }, { passive: true });
  }

  // Tilt + glow on cards
  if (fine && !reduce) {
    document.querySelectorAll('.landing-track').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--cx', (x * 100) + '%');
        card.style.setProperty('--cy', (y * 100) + '%');
        card.style.transform = 'perspective(700px) rotateX(' + ((0.5 - y) * 8) + 'deg) rotateY(' + ((x - 0.5) * 8) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll('.landing-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // Count-up stats
  var counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce || target === 0) { el.textContent = target; return; }
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(countUp);
  }

  // Terminal boot sequence
  var term = document.querySelector('[data-term] code');
  if (term) {
    var lines = [
      ['$ ', 'whoami', 'cmd'],
      ['dreaith, a student still learning', '', 'ok'],
      ['$ ', 'ls ./notes', 'cmd'],
      ['writeups/  logs/  reports/', '', 'dim'],
      ['$ ', 'cat goals.txt', 'cmd'],
      ['keep learning, keep documenting', '', 'ok']
    ];
    if (reduce) {
      term.innerHTML = lines.map(function (l) {
        return '<span class="t-' + l[2] + '">' + l[0] + l[1] + '</span>';
      }).join('\n');
      return;
    }
    var li = 0, ci = 0, cur = null;
    function type() {
      if (li >= lines.length) return;
      var l = lines[li], full = l[0] + l[1];
      if (ci === 0) {
        cur = document.createElement('span');
        cur.className = 't-' + l[2];
        term.appendChild(cur);
      }
      var isCmd = l[2] === 'cmd';
      if (!isCmd) { cur.textContent = full; ci = full.length; } else { ci += 1; cur.textContent = full.slice(0, ci); }
      if (ci >= full.length) {
        term.appendChild(document.createTextNode('\n'));
        li += 1; ci = 0;
        setTimeout(type, isCmd ? 350 : 500);
      } else {
        setTimeout(type, 55);
      }
    }
    setTimeout(type, 1200);
  }
});
