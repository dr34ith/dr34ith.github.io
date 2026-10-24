(function () {
  function init() {
    document.body.classList.add('logs-page-active');
    removeDuplicateToc();
    initReadingProgress();
    initOutline();
    initCodeCopyButtons();
    initMobileToc();
    initImageCaptions();
    initNodeVisualization();
  }

  function removeDuplicateToc() {
    var content = document.querySelector('.logs-article__content');
    if (!content) return;

    var children = content.children;
    var i = 0;
    var tocStarted = false;
    var toRemove = [];

    while (i < children.length) {
      var el = children[i];
      var text = (el.textContent || '').trim().toLowerCase();

      if (!tocStarted) {
        if ((el.tagName === 'NAV' || el.tagName === 'DIV') && el.querySelector('ol, ul') &&
            text.indexOf('contents') === 0) {
          toRemove.push(el);
          i++;
          continue;
        }
        if ((el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'STRONG') &&
            (text === 'contents' || text === 'table of contents')) {
          tocStarted = true;
          toRemove.push(el);
          i++;
          continue;
        }
      }

      if (tocStarted) {
        if (el.tagName === 'OL' || el.tagName === 'UL') {
          var links = el.querySelectorAll('a[href^="#"]');
          if (links.length > 0) {
            toRemove.push(el);
            tocStarted = false;
            i++;
            continue;
          }
        }
        tocStarted = false;
      }

      i++;
    }

    toRemove.forEach(function (el) {
      el.classList.add('logs-duplicate-toc');
    });
  }

  function initReadingProgress() {
    var bar = document.getElementById('log-reading-progress');
    if (!bar) return;

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function initOutline() {
    var content = document.querySelector('.logs-article__content');
    if (!content) return;

    var headings = Array.from(content.querySelectorAll('h2, h3'))
      .filter(function (h) {
        return !h.hasAttribute('data-toc-skip') && !h.closest('.logs-duplicate-toc');
      });

    if (headings.length < 2) {
      var wrapper = document.getElementById('log-outline-wrapper');
      if (wrapper) wrapper.style.display = 'none';
      return;
    }

    var usedIds = {};
    headings.forEach(function (h) {
      if (!h.id) {
        var base = h.textContent.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        if (!base) base = 'section';
        if (usedIds[base] !== undefined) {
          usedIds[base]++;
          h.id = base + '-' + usedIds[base];
        } else {
          usedIds[base] = 0;
          h.id = base;
        }
      }
    });

    var desktopList = document.getElementById('log-outline-list');
    var mobileList = document.getElementById('log-outline-list-mobile');

    [desktopList, mobileList].forEach(function (list) {
      if (!list) return;
      var currentTopLi = null;
      var currentSubList = null;

      headings.forEach(function (heading) {
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.className = 'log-outline-link';
        link.textContent = heading.textContent.trim();
        link.dataset.target = heading.id;

        var li = document.createElement('li');
        li.appendChild(link);

        if (heading.tagName === 'H2') {
          list.appendChild(li);
          currentTopLi = li;
          currentSubList = null;
        } else {
          if (!currentTopLi) {
            list.appendChild(li);
            return;
          }
          if (!currentSubList) {
            currentSubList = document.createElement('ol');
            currentSubList.className = 'log-outline-sublist';
            currentTopLi.appendChild(currentSubList);
          }
          currentSubList.appendChild(li);
        }
      });
    });

    var wrapper = document.getElementById('log-outline-wrapper');
    if (wrapper) wrapper.classList.remove('invisible');

    initActiveTracking(headings);
  }

  function initActiveTracking(headings) {
    if (!headings.length || !('IntersectionObserver' in window)) return;

    var allLinks = document.querySelectorAll('.log-outline-link');
    var activeId = null;

    var observer = new IntersectionObserver(function (entries) {
      var visible = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.push(entry.target);
        }
      });

      if (visible.length > 0) {
        visible.sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });
        var topmost = visible[0];
        if (topmost.id !== activeId) {
          activeId = topmost.id;
          allLinks.forEach(function (link) {
            link.classList.toggle('active', link.dataset.target === activeId);
          });
        }
      }
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(function (h) { observer.observe(h); });
  }

  function initCodeCopyButtons() {
    var codeBlocks = document.querySelectorAll('.logs-article__content div.highlight, .logs-article__content pre > code');

    codeBlocks.forEach(function (block) {
      var pre = block.tagName === 'CODE' ? block.parentElement : block.querySelector('pre');
      if (!pre) pre = block;

      var wrapper = pre.closest('div.highlight') || pre;
      if (wrapper.querySelector('.logs-code-copy')) return;

      wrapper.style.position = 'relative';
      var btn = document.createElement('button');
      btn.className = 'logs-code-copy';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = '<i class="far fa-copy"></i>';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.textContent || '';
        navigator.clipboard.writeText(text).then(function () {
          btn.innerHTML = '<i class="fas fa-check"></i>';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.innerHTML = '<i class="far fa-copy"></i>';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
      wrapper.appendChild(btn);
    });
  }

  function initMobileToc() {
    var toggle = document.getElementById('log-toc-mobile-toggle');
    var dropdown = document.getElementById('log-toc-mobile-dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      dropdown.classList.toggle('open', !expanded);
      toggle.querySelector('.logs-toc-chevron').classList.toggle('rotated', !expanded);
    });

    dropdown.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('open');
        toggle.querySelector('.logs-toc-chevron').classList.remove('rotated');
      }
    });
  }

  function initImageCaptions() {
    var images = document.querySelectorAll('.logs-article__content img');
    images.forEach(function (img) {
      if (img.alt && img.alt.length > 3 && !img.closest('.logs-cover')) {
        var parent = img.parentElement;
        if (parent && parent.tagName === 'P') {
          parent.classList.add('logs-img-wrap');
        }
      }
    });
  }

  function initNodeVisualization() {
    var canvas = document.getElementById('logNodesCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    var W = rect.width;
    var H = rect.height;

    var tagEls = document.querySelectorAll('.logs-tag-pill');
    var labels = [];
    tagEls.forEach(function (el) {
      var t = el.textContent.trim();
      if (t && labels.indexOf(t) === -1) labels.push(t);
    });

    var categoryEl = document.querySelector('.logs-meta__badge');
    var catLabel = categoryEl ? categoryEl.textContent.trim() : '';
    if (catLabel && labels.indexOf(catLabel) === -1) labels.unshift(catLabel);

    if (labels.length < 2) {
      labels = ['this log', 'knowledge', 'notes', 'security', 'learning'];
    }

    var nodeCount = Math.min(labels.length + 2, 9);
    var nodes = [];
    var pad = 28;

    for (var i = 0; i < nodeCount; i++) {
      nodes.push({
        x: pad + Math.random() * (W - pad * 2),
        y: pad + Math.random() * (H - pad * 2),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: i === 0 ? 5 : (3 + Math.random() * 2),
        label: labels[i] || '',
        hue: 260 + Math.random() * 40
      });
    }

    var edges = [];
    for (var j = 1; j < nodes.length; j++) {
      var from = j <= 3 ? 0 : Math.floor(Math.random() * j);
      edges.push([from, j]);
    }
    for (var k = 0; k < 2 && nodes.length > 3; k++) {
      var a = Math.floor(Math.random() * nodes.length);
      var b = Math.floor(Math.random() * nodes.length);
      if (a !== b) edges.push([a, b]);
    }

    var frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);

      nodes.forEach(function (n) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < pad || n.x > W - pad) n.vx *= -1;
        if (n.y < pad || n.y > H - pad) n.vy *= -1;
        n.x = Math.max(pad, Math.min(W - pad, n.x));
        n.y = Math.max(pad, Math.min(H - pad, n.y));
      });

      edges.forEach(function (e) {
        var na = nodes[e[0]];
        var nb = nodes[e[1]];
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      nodes.forEach(function (n, idx) {
        var pulse = 1 + Math.sin(frame * 0.02 + idx) * 0.15;
        var glowR = n.r * 3 * pulse;

        var glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        glow.addColorStop(0, 'rgba(' + hslToRgb(n.hue) + ', 0.25)');
        glow.addColorStop(1, 'rgba(' + hslToRgb(n.hue) + ', 0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(' + n.hue + ', 70%, 72%)';
        ctx.fill();

        if (n.label && idx < 5) {
          ctx.font = '9px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(210, 200, 235, 0.5)';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + n.r + 12);
        }
      });

      requestAnimationFrame(draw);
    }

    function hslToRgb(h) {
      var s = 0.6, l = 0.7;
      var c = (1 - Math.abs(2 * l - 1)) * s;
      var x = c * (1 - Math.abs((h / 60) % 2 - 1));
      var m = l - c / 2;
      var r1, g1, b1;
      if (h < 60) { r1 = c; g1 = x; b1 = 0; }
      else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
      else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
      else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
      else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
      else { r1 = c; g1 = 0; b1 = x; }
      return Math.round((r1 + m) * 255) + ',' + Math.round((g1 + m) * 255) + ',' + Math.round((b1 + m) * 255);
    }

    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
