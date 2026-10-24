(function () {
  function init() {
    document.body.classList.add('writeup-active');
    buildOutline();
    initActiveTracking();
    initMobileToc();
    initRedParticles();
  }

  function slugCount(map, base) {
    if (!map.has(base)) { map.set(base, 0); return base; }
    var n = map.get(base) + 1;
    map.set(base, n);
    return base + '-' + n;
  }

  function buildOutline() {
    var nav = document.getElementById('writeup-toc-nav');
    var content = document.querySelector('article.post-article .content');
    if (!nav || !content) return;

    var headings = Array.from(content.querySelectorAll('h2, h3'))
      .filter(function (h) { return !h.hasAttribute('data-toc-skip'); });

    if (headings.length < 2) {
      var panel = document.getElementById('writeup-toc-panel');
      if (panel) panel.style.display = 'none';
      return;
    }

    var usedIds = new Map();
    var list = document.createElement('ul');
    list.className = 'wtoc-list';
    var currentH2Item = null;
    var currentSubList = null;

    headings.forEach(function (heading) {
      if (!heading.id) {
        var base = heading.textContent.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        heading.id = slugCount(usedIds, base || 'section');
      }

      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.className = 'wtoc-link';
      a.textContent = heading.textContent.trim();
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(heading.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + heading.id);
        }
        closeMobileDrawer();
      });

      var li = document.createElement('li');
      li.className = 'wtoc-item';
      li.appendChild(a);

      if (heading.tagName === 'H2') {
        list.appendChild(li);
        currentH2Item = li;
        currentSubList = null;
      } else {
        if (!currentH2Item) { list.appendChild(li); return; }
        if (!currentSubList) {
          currentSubList = document.createElement('ul');
          currentSubList.className = 'wtoc-list wtoc-sub';
          currentH2Item.appendChild(currentSubList);
        }
        currentSubList.appendChild(li);
      }
    });

    nav.appendChild(list);
  }

  function initActiveTracking() {
    var nav = document.getElementById('writeup-toc-nav');
    var content = document.querySelector('article.post-article .content');
    if (!nav || !content) return;

    var headings = Array.from(content.querySelectorAll('h2, h3'))
      .filter(function (h) { return !h.hasAttribute('data-toc-skip'); });
    if (headings.length < 2) return;

    var links = nav.querySelectorAll('.wtoc-link');
    var linkMap = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      linkMap[id] = link;
    });

    var currentActive = null;

    var observer = new IntersectionObserver(function (entries) {
      var visible = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.push(entry);
        }
      });

      if (visible.length > 0) {
        visible.sort(function (a, b) {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });
        setActive(visible[0].target.id);
      }
    }, {
      rootMargin: '-80px 0px -65% 0px',
      threshold: 0
    });

    headings.forEach(function (h) { observer.observe(h); });

    function setActive(id) {
      if (currentActive === id) return;
      currentActive = id;

      links.forEach(function (l) { l.classList.remove('active'); });

      if (linkMap[id]) {
        linkMap[id].classList.add('active');
        var panel = document.getElementById('writeup-toc-panel');
        if (panel && linkMap[id].offsetTop > panel.clientHeight * 0.6) {
          panel.scrollTo({ top: linkMap[id].offsetTop - 80, behavior: 'smooth' });
        }
      }

      var mobileLinks = document.querySelectorAll('.writeup-mobile-toc-drawer .wtoc-link');
      mobileLinks.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    }
  }

  var mobileDrawerOpen = false;

  function initMobileToc() {
    var nav = document.getElementById('writeup-toc-nav');
    if (!nav || !nav.querySelector('.wtoc-link')) return;

    var toggle = document.createElement('button');
    toggle.className = 'writeup-mobile-toc-toggle';
    toggle.setAttribute('aria-label', 'Table of contents');
    toggle.innerHTML = '<i class="fa-solid fa-list-ul"></i>';

    var overlay = document.createElement('div');
    overlay.className = 'writeup-mobile-toc-overlay';

    var drawer = document.createElement('div');
    drawer.className = 'writeup-mobile-toc-drawer';

    var header = document.createElement('div');
    header.className = 'wtoc-drawer-header';
    header.innerHTML = '<span class="wtoc-drawer-title">On This Page</span>' +
      '<button class="wtoc-drawer-close" aria-label="Close">&times;</button>';
    drawer.appendChild(header);

    var cloned = nav.cloneNode(true);
    cloned.removeAttribute('id');
    drawer.appendChild(cloned);

    cloned.querySelectorAll('.wtoc-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          closeMobileDrawer();
          setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + id);
          }, 150);
        }
      });
    });

    document.body.appendChild(toggle);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    toggle.addEventListener('click', function () {
      if (mobileDrawerOpen) { closeMobileDrawer(); }
      else { openMobileDrawer(); }
    });
    overlay.addEventListener('click', closeMobileDrawer);
    header.querySelector('.wtoc-drawer-close').addEventListener('click', closeMobileDrawer);

    function openMobileDrawer() {
      mobileDrawerOpen = true;
      overlay.classList.add('visible');
      drawer.classList.add('visible');
      toggle.style.display = 'none';
    }
  }

  function closeMobileDrawer() {
    mobileDrawerOpen = false;
    var overlay = document.querySelector('.writeup-mobile-toc-overlay');
    var drawer = document.querySelector('.writeup-mobile-toc-drawer');
    var toggle = document.querySelector('.writeup-mobile-toc-toggle');
    if (overlay) overlay.classList.remove('visible');
    if (drawer) drawer.classList.remove('visible');
    if (toggle && window.innerWidth < 1200) toggle.style.display = '';
  }

  function initRedParticles() {
    var wrapper = document.getElementById('main-wrapper');
    if (!wrapper) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'writeup-particles-canvas';
    wrapper.insertBefore(canvas, wrapper.firstChild);

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    var count = 18;
    var palette = [
      { h: 350, s: 50, l: 28 },
      { h: 355, s: 45, l: 25 },
      { h: 0, s: 40, l: 30 },
      { h: 345, s: 42, l: 26 },
      { h: 5, s: 38, l: 22 },
      { h: 340, s: 48, l: 32 }
    ];

    for (var i = 0; i < count; i++) {
      var c = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 4 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.1,
        hue: c.h, sat: c.s, light: c.l,
        alpha: 0.03 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2
      });
    }

    var frame = 0;
    var w = window.innerWidth;
    var h = window.innerHeight;
    window.addEventListener('resize', function () { w = window.innerWidth; h = window.innerHeight; });

    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r * 2) p.x = w + p.r * 2;
        if (p.x > w + p.r * 2) p.x = -p.r * 2;
        if (p.y < -p.r * 2) p.y = h + p.r * 2;
        if (p.y > h + p.r * 2) p.y = -p.r * 2;

        var pulse = p.alpha + Math.sin(frame * 0.007 + p.phase) * 0.012;

        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + (pulse * 1.5) + ')');
        grad.addColorStop(0.5, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + (pulse * 0.5) + ')');
        grad.addColorStop(1, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
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
