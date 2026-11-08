(function () {
  function init() {
    var grid = document.getElementById('logsGrid');
    if (!grid) return;

    var basePath = grid.dataset.basepath || '/';
    var indexUrl = basePath + 'logs/index.json';

    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 10000);

    fetch(indexUrl, { signal: controller.signal })
      .then(function (r) {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) { renderLogs(data, basePath); })
      .catch(function (err) {
        clearTimeout(timeoutId);
        console.error('Failed to load logs index:', err);
        grid.innerHTML =
          '<div class="logs-empty">' +
            '<p class="logs-empty__title">Unable to load logs.</p>' +
            '<p>' + (err.name === 'AbortError' ? 'Request timed out.' : err.message) + '</p>' +
            '<button class="logs-retry-btn" onclick="location.reload()">Retry</button>' +
          '</div>';
      });
  }

  function renderLogs(data, basePath) {
    var notes = data.notes || [];
    var categories = data.categories || [];
    var grid = document.getElementById('logsGrid');
    var filtersEl = document.getElementById('logsCategoryFilters');
    var searchInput = document.getElementById('logs-search');
    var activeCategory = null;

    if (!grid) return;

    if (filtersEl && categories.length) {
      var allBtn = document.createElement('button');
      allBtn.className = 'logs-cat-btn active';
      allBtn.textContent = 'All';
      allBtn.dataset.cat = '';
      allBtn.addEventListener('click', function () {
        activeCategory = null;
        updateFilters();
        renderCards();
      });
      filtersEl.appendChild(allBtn);

      categories.forEach(function (cat) {
        var count = notes.filter(function (n) { return n.category === cat.slug; }).length;
        var btn = document.createElement('button');
        btn.className = 'logs-cat-btn';
        btn.dataset.cat = cat.slug;
        btn.innerHTML = cat.label + ' <span class="cat-count">' + count + '</span>';
        btn.addEventListener('click', function () {
          activeCategory = cat.slug;
          updateFilters();
          renderCards();
        });
        filtersEl.appendChild(btn);
      });
    }

    function updateFilters() {
      filtersEl.querySelectorAll('.logs-cat-btn').forEach(function (b) {
        var matches = (!activeCategory && !b.dataset.cat) || b.dataset.cat === activeCategory;
        b.classList.toggle('active', matches);
      });
    }

    function renderCards() {
      var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var filtered = notes.filter(function (n) {
        var catOk = !activeCategory || n.category === activeCategory;
        var textOk = !query ||
          n.title.toLowerCase().includes(query) ||
          (n.excerpt && n.excerpt.toLowerCase().includes(query)) ||
          (n.tags && n.tags.some(function (t) { return t.toLowerCase().includes(query); }));
        return catOk && textOk;
      });

      if (!filtered.length) {
        grid.innerHTML =
          '<div class="logs-empty">' +
            '<p class="logs-empty__title">No logs found.</p>' +
            '<p>Try a different search or category.</p>' +
          '</div>';
        return;
      }

      grid.innerHTML = '';
      filtered.forEach(function (note) {
        var card = document.createElement('a');
        card.className = 'log-card';
        var notePath = note.filename.replace(/\.md$/, '');
        card.href = basePath + 'logs/' + notePath + '/';

        if (note.cover) {
          var coverWrap = document.createElement('div');
          coverWrap.className = 'log-card__cover-wrap';
          var coverImg = document.createElement('img');
          coverImg.className = 'log-card__cover';
          coverImg.src = basePath + note.cover;
          coverImg.alt = '';
          coverImg.loading = 'lazy';
          coverWrap.appendChild(coverImg);
          card.appendChild(coverWrap);
        }

        var body = document.createElement('div');
        body.className = 'log-card__body';

        var catSpan = document.createElement('span');
        catSpan.className = 'log-card__category';
        catSpan.textContent = note.categoryLabel || note.category;
        body.appendChild(catSpan);

        var title = document.createElement('h3');
        title.className = 'log-card__title';
        title.textContent = note.title;
        body.appendChild(title);

        var excerpt = document.createElement('p');
        excerpt.className = 'log-card__excerpt';
        excerpt.textContent = note.excerpt || '';
        body.appendChild(excerpt);

        if (note.tags && note.tags.length) {
          var tagsDiv = document.createElement('div');
          tagsDiv.className = 'log-card__tags';
          note.tags.slice(0, 4).forEach(function (t) {
            var tag = document.createElement('span');
            tag.className = 'log-card__tag';
            tag.textContent = t;
            tagsDiv.appendChild(tag);
          });
          body.appendChild(tagsDiv);
        }

        var meta = document.createElement('div');
        meta.className = 'log-card__meta';
        var dateSpan = document.createElement('span');
        dateSpan.innerHTML = '<i class="far fa-calendar"></i> ' + note.date;
        meta.appendChild(dateSpan);
        if (note.readTime) {
          var timeSpan = document.createElement('span');
          timeSpan.innerHTML = '<i class="far fa-clock"></i> ' + note.readTime;
          meta.appendChild(timeSpan);
        }
        body.appendChild(meta);

        card.appendChild(body);
        grid.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', renderCards);
    }

    renderCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
