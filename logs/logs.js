/* ============================================================
   LOGS - markdown-powered digital garden (Quartz/Obsidian style)

   TO ADD A NEW NOTE:
   1. Create a new file inside /logs, e.g. /logs/2026-08-01-my-note.md
   2. Give it frontmatter + markdown body:

        ---
        title: My note title
        date: 2026-08-01
        tags: [tag-one, tag-two]
        categories: [optional, grouping]
        cover: logs/assets/your-image.png   (optional banner image)
        ---

        Write your note here in normal markdown.

   3. Push. That's it - nothing else to edit by hand.

      CI (.github/workflows/logs-build.yml) runs scripts/build_logs.py,
      which discovers every .md file in /logs, parses its frontmatter,
      computes reading time + excerpt, and commits logs/index.json +
      feed.xml back automatically. The archive, tag list, graph view
      and search index below all read from that generated index.json,
      so a new note appears everywhere on the next deploy with zero
      manual steps.

   This one script powers BOTH:
   - the "Digital Garden" preview list on index.html (#logsPreviewList)
   - the full notes page on logs.html (#logNotes / #logSidebarList)
   ============================================================ */

(function () {
  const INDEX_URL = 'logs/index.json';

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: raw };
    const [, , body] = match;
    return { meta: {}, body: body.trim() };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Splits a GFM table row like "| a | **b** |" into trimmed cell strings.
  function splitTableRow(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  }

  // Minimal markdown renderer used only if marked.js failed to load
  // (e.g. offline). Covers headings, bold/italic, images, links, code,
  // lists and GFM tables.
  function renderMarkdownFallback(md) {
    let html = escapeHtml(md);
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^###\s+(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^##\s+(.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#\s+(.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Images must be handled before the link pattern below, since
    // ![alt](src "title") would otherwise be half-matched as a link and
    // leave a stray "!" plus a mangled title attribute behind.
    html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => {
      const figcaption = title ? `<figcaption class="alogs-note-figcaption">${title}</figcaption>` : '';
      return `<figure class="alogs-note-figure"><img src="${src}" alt="${alt}" loading="lazy" />${figcaption}</figure>`;
    });
    html = html.replace(/(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // GFM pipe tables: a header row, a |---|---| separator row, then body rows.
    html = html.replace(/^(\|.+\|)[ \t]*\n\|[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*\n((?:\|.*\|[ \t]*\n?)+)/gm, (_, headerLine, bodyBlock) => {
      const headCells = splitTableRow(headerLine).map((c) => `<th>${c}</th>`).join('');
      const bodyRows = bodyBlock
        .trim()
        .split('\n')
        .map((row) => `<tr>${splitTableRow(row).map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('');
      return `<table><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    });
    html = html.replace(/^(?:-\s+.*\n?)+/gm, (block) => {
      const items = block.trim().split('\n').map((l) => `<li>${l.replace(/^-\s+/, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    });
    html = html.replace(/^(?:\d+\.\s+.*\n?)+/gm, (block) => {
      const items = block.trim().split('\n').map((l) => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    });
    html = html
      .split(/\n\s*\n/)
      .map((para) => (/^\s*<(h\d|ul|ol|pre|figure|table)/.test(para.trim()) ? para : `<p>${para.trim()}</p>`))
      .join('\n');
    return html;
  }

  // Wraps markdown images in a figure + caption (uses the optional
  // "title" in ![alt](src "caption") as the caption text).
  function renderMarkdown(md) {
    let html;
    if (window.marked && typeof window.marked.parse === 'function') {
      const renderer = new window.marked.Renderer();
      renderer.image = (href, title, text) => {
        const src = typeof href === 'object' ? href.href : href;
        const cap = (typeof href === 'object' ? href.title : title) || '';
        const alt = (typeof href === 'object' ? href.text : text) || '';
        const figcaption = cap ? `<figcaption class="alogs-note-figcaption">${escapeHtml(cap)}</figcaption>` : '';
        return `<figure class="alogs-note-figure"><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />${figcaption}</figure>`;
      };
      html = window.marked.parse(md, { renderer });
    } else {
      html = renderMarkdownFallback(md);
    }
    return html;
  }

  /* ---------- loading notes: metadata from index.json, body lazily ---------- */

  async function loadIndex() {
    // Use pre-loaded inline data first (works on file:// without a server)
    if (window.__LOGS_INDEX__) return window.__LOGS_INDEX__;
    try {
      const res = await fetch(INDEX_URL, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('logs: could not load logs/index.json', err);
    }
    return { categories: [], notes: [] };
  }

  function notesFromIndex(index) {
    return (index.notes || []).map((e) => ({
      slug: e.slug,
      filename: e.filename,
      title: e.title,
      date: e.date || '',
      cover: e.cover || '',
      tags: Array.isArray(e.tags) ? e.tags : [],
      category: e.category || null,
      categoryLabel: e.categoryLabel || null,
      readTime: e.readTime || '',
      excerpt: e.excerpt || '',
      bodyHtml: null, // fetched on demand, see loadNoteBody()
    }));
  }

  const bodyRequests = new Map();

  function loadNoteBody(note) {
    if (note.bodyHtml !== null) return Promise.resolve(note);
    if (bodyRequests.has(note.slug)) return bodyRequests.get(note.slug);

    // Use pre-loaded bodies (works on file:// without a server)
    if (window.__LOGS_BODIES__ && window.__LOGS_BODIES__[note.filename]) {
      const raw = window.__LOGS_BODIES__[note.filename];
      const { body } = parseFrontmatter(raw);
      note.bodyHtml = renderMarkdown(body);
      return Promise.resolve(note);
    }

    const promise = fetch(`logs/${note.filename}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${note.filename}`);
        return res.text();
      })
      .then((raw) => {
        const { body } = parseFrontmatter(raw);
        note.bodyHtml = renderMarkdown(body);
        return note;
      })
      .catch((err) => {
        console.warn('logs:', err.message);
        note.bodyHtml = '<p><em>This note could not be loaded.</em></p>';
        return note;
      });

    bodyRequests.set(note.slug, promise);
    return promise;
  }

  /* ---------- logs.html: full note list + sidebar ---------- */

  function buildFullNoteEl(note) {
    const article = document.createElement('article');
    article.className = 'alogs-note';
    article.id = note.slug;
    article.dataset.tags = note.tags.map((t) => t.toLowerCase()).join('|');
    article.dataset.date = note.date;

    const tagsHtml = note.tags.map((t) => `<span class="log-tag" data-tag="${escapeHtml(t.toLowerCase())}">${escapeHtml(t)}</span>`).join('');
    const catHtml = note.categoryLabel
      ? `<a class="alogs-note-category" href="#" data-category="${escapeHtml(note.category)}">${escapeHtml(note.categoryLabel)}</a>`
      : '';
    const coverHtml = note.cover
      ? `<img class="alogs-note-cover" src="${escapeHtml(note.cover)}" alt="${escapeHtml(note.title)} cover" loading="lazy" />`
      : '';

    article.innerHTML = `
      <div class="alogs-note-content">
        ${coverHtml}
        <div class="alogs-note-meta-row">
          ${catHtml}
          <span class="alogs-note-date">${escapeHtml(note.date)}</span>
          <span class="alogs-note-readtime">${escapeHtml(note.readTime)}</span>
        </div>
        <h3 class="alogs-note-title">${escapeHtml(note.title)}</h3>
        <div class="alogs-note-body alogs-note-body-loading"><div class="alogs-note-skeleton"></div></div>
        ${tagsHtml ? `<div class="alogs-note-tags">${tagsHtml}</div>` : ''}
        <div class="alogs-related" id="related-${note.slug}" hidden>
          <div class="alogs-related-label">More like this</div>
          <div class="alogs-related-list"></div>
        </div>
        <nav class="alogs-note-nav" id="nav-${note.slug}"></nav>
      </div>
    `;
    return article;
  }

  function addHeadingLinks(noteEl) {
    const bodyEl = noteEl.querySelector('.alogs-note-body');
    if (!bodyEl) return;
    bodyEl.querySelectorAll('h2, h3').forEach((heading) => {
      if (heading.querySelector('.alogs-heading-link')) return;
      const link = document.createElement('a');
      link.href = headingHash(noteEl.id, heading.id);
      link.className = 'alogs-heading-link';
      link.textContent = '#';
      link.title = 'Copy link to this section';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = `${location.origin}${location.pathname}${headingHash(noteEl.id, heading.id)}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        history.pushState(null, '', headingHash(noteEl.id, heading.id));
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        link.classList.add('copied');
        setTimeout(() => link.classList.remove('copied'), 1200);
      });
      heading.appendChild(link);
    });
  }

  function buildRelatedNotes(note, allNotes) {
    const container = document.getElementById(`related-${note.slug}`);
    if (!container) return;
    const list = container.querySelector('.alogs-related-list');
    const tagSet = new Set(note.tags.map((t) => t.toLowerCase()));
    const scored = allNotes
      .filter((n) => n.slug !== note.slug)
      .map((n) => ({
        note: n,
        score: n.tags.filter((t) => tagSet.has(t.toLowerCase())).length,
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    if (!scored.length) return;
    list.innerHTML = scored
      .map((s) => `<a class="alogs-related-item" href="#${s.note.slug}">${escapeHtml(s.note.title)}</a>`)
      .join('');
    container.hidden = false;
  }

  function buildPrevNextNav(note, index, allNotes) {
    const nav = document.getElementById(`nav-${note.slug}`);
    if (!nav) return;
    const prev = allNotes[index - 1];
    const next = allNotes[index + 1];
    let html = '';
    if (prev) {
      html += `<a class="alogs-note-nav-link prev" href="#${prev.slug}"><span class="alogs-note-nav-label">&larr; Previous</span><span class="alogs-note-nav-title">${escapeHtml(prev.title)}</span></a>`;
    } else {
      html += '<span></span>';
    }
    if (next) {
      html += `<a class="alogs-note-nav-link next" href="#${next.slug}"><span class="alogs-note-nav-label">Next &rarr;</span><span class="alogs-note-nav-title">${escapeHtml(next.title)}</span></a>`;
    }
    nav.innerHTML = html;
  }

  function slugify(str) {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function slugifyHeading(noteSlug, text, index) {
    const base = slugify(text) || 'section';
    return `${noteSlug}-${base}-${index + 1}`;
  }

  function headingHash(noteSlug, headingId) {
    return `#${noteSlug}:${headingId}`;
  }

  function parseNoteHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return { slug: '', headingId: '' };
    const [slug, ...rest] = raw.split(':');
    return { slug, headingId: rest.join(':') || '' };
  }

  let headingObserver = null;

  function renderActiveOutline(noteEl) {
    const outlineWrap = document.getElementById('activeOutline');
    const listEl = document.getElementById('activeOutlineList');
    if (!outlineWrap || !listEl) return;

    const bodyEl = noteEl.querySelector('.alogs-note-body');
    const headings = bodyEl ? Array.from(bodyEl.querySelectorAll('h2, h3, h4')) : [];
    if (headingObserver) { headingObserver.disconnect(); headingObserver = null; }

    if (!headings.length) {
      outlineWrap.hidden = true;
      return;
    }

    listEl.innerHTML = '';
    const linksById = new Map();
    headings.forEach((heading, index) => {
      const headingId = heading.id || slugifyHeading(noteEl.id, heading.textContent || '', index);
      heading.id = headingId;

      const link = document.createElement('a');
      link.href = headingHash(noteEl.id, headingId);
      link.textContent = heading.textContent.replace('#', '').trim();
      const headingLevel = heading.tagName.toLowerCase();
      link.className = headingLevel === 'h4'
        ? 'alogs-note-outline-link toc-h4'
        : headingLevel === 'h3'
          ? 'alogs-note-outline-link toc-h3'
          : 'alogs-note-outline-link';
      link.setAttribute('aria-current', 'false');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', headingHash(noteEl.id, headingId));
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      linksById.set(headingId, link);
      listEl.appendChild(link);
    });

    const setActiveLink = (activeId) => {
      linksById.forEach((link, id) => {
        const isActive = id === activeId;
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };
    setActiveLink(headings[0].id);

    headingObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        setActiveLink(visible[0].target.id);
      },
      { rootMargin: '-18% 0px -72% 0px', threshold: [0, 1] }
    );
    headings.forEach((heading) => headingObserver.observe(heading));

    outlineWrap.hidden = false;
  }

  function buildSidebarLink(note) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${note.slug}`;
    a.textContent = note.title;
    a.dataset.tags = note.tags.map((t) => t.toLowerCase()).join('|');
    li.appendChild(a);
    return li;
  }

  // Folder-based category tree, Obsidian/Quartz-style: a collapsible group
  // per category (in the server-computed canonical order), notes newest
  // first within each. A note with no category folder falls into "Uncategorized".
  function buildSidebarByCategory(notes, categories, sidebarListEl) {
    sidebarListEl.innerHTML = '';
    const byCategory = new Map();
    notes.forEach((note) => {
      const key = note.category || '__uncategorized__';
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push(note);
    });

    const groups = categories
      .filter((c) => byCategory.has(c.slug))
      .map((c) => ({ slug: c.slug, label: c.label }));
    if (byCategory.has('__uncategorized__')) {
      groups.push({ slug: '__uncategorized__', label: 'Uncategorized' });
    }

    groups.forEach((group) => {
      const groupLi = document.createElement('li');
      groupLi.className = 'alogs-category-group';
      groupLi.dataset.category = group.slug;

      const notesUl = document.createElement('ul');
      notesUl.className = 'alogs-category-notes';
      byCategory.get(group.slug).forEach((note) => notesUl.appendChild(buildSidebarLink(note)));

      groupLi.innerHTML = `
        <button type="button" class="alogs-category-toggle" data-category="${escapeHtml(group.slug)}" aria-expanded="true">
          <svg class="alogs-category-chevron" width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="alogs-category-label">${escapeHtml(group.label)}</span>
          <span class="alogs-category-count">${byCategory.get(group.slug).length}</span>
        </button>`;
      groupLi.appendChild(notesUl);
      sidebarListEl.appendChild(groupLi);

      groupLi.querySelector('.alogs-category-toggle').addEventListener('click', () => {
        const btn = groupLi.querySelector('.alogs-category-toggle');
        const expanded = btn.getAttribute('aria-expanded') !== 'false';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        notesUl.classList.toggle('is-collapsed', expanded);
      });
    });
  }

  function applyTagFilter(activeTag) {
    if (!document.getElementById('logNotes')) {
      window.location.href = `logs.html#tag=${encodeURIComponent(activeTag)}`;
      return;
    }
    document.querySelectorAll('.alogs-category-notes li').forEach((li) => {
      const tags = (li.querySelector('a')?.dataset.tags || '').split('|');
      li.classList.toggle('is-hidden', !!activeTag && !tags.includes(activeTag));
    });
    document.querySelectorAll('.alogs-category-group').forEach((groupLi) => {
      const notesUl = groupLi.querySelector('.alogs-category-notes');
      const anyVisible = notesUl ? Array.from(notesUl.children).some((li) => !li.classList.contains('is-hidden')) : false;
      groupLi.classList.toggle('is-hidden', !anyVisible);
    });
    document.querySelectorAll('.alogs-tagchip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.tag === (activeTag || ''));
    });
    document.querySelectorAll('.alogs-tags-list a').forEach((a) => {
      a.classList.toggle('active', a.dataset.tag === (activeTag || ''));
    });
    window.LogsGraph?.setFilterTag(activeTag || null);
  }

  function jumpToCategory(categorySlug) {
    const toggle = document.querySelector(`.alogs-category-toggle[data-category="${categorySlug}"]`);
    if (!toggle) return;
    if (toggle.getAttribute('aria-expanded') === 'false') toggle.click();
    toggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const groupLi = toggle.closest('.alogs-category-group');
    groupLi.classList.add('alogs-category-flash');
    setTimeout(() => groupLi.classList.remove('alogs-category-flash'), 1200);
  }

  function buildTagsPanel(notes, tagLimit) {
    const panel = document.getElementById('logTagsPanel');
    const listEl = document.getElementById('logTagsList');
    if (!panel || !listEl) return;

    const counts = new Map();
    notes.forEach((n) => n.tags.forEach((t) => {
      const key = t.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }));
    if (!counts.size) return;

    let sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    if (tagLimit) sorted = sorted.slice(0, tagLimit);

    listEl.innerHTML = sorted
      .map(([tag, count], i) => `<li style="animation-delay:${i * 45}ms"><a href="#" data-tag="${tag}">${escapeHtml(tag)}<span class="tag-count">${count}</span></a></li>`)
      .join('');
    listEl.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = a.classList.contains('active');
        applyTagFilter(isActive ? '' : a.dataset.tag);
      });
    });

    panel.hidden = false;

    if (window.LogsGraph) window.LogsGraph.init(notes);
  }

  function initKeyboardNav(notes, getActiveSlug, goToSlug) {
    document.addEventListener('keydown', (e) => {
      const overlay = document.querySelector('.site-search-overlay.open');
      if (overlay) return; // let search modal own keys
      if (document.querySelector('.alogs-graph-modal.open')) return; // let graph modal own keys
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key !== 'j' && e.key !== 'k') return;
      e.preventDefault();
      const currentIndex = notes.findIndex((n) => n.slug === getActiveSlug());
      const nextIndex = e.key === 'j'
        ? Math.min(currentIndex + 1, notes.length - 1)
        : Math.max(currentIndex - 1, 0);
      goToSlug(notes[nextIndex].slug);
    });
  }

  function initFullLogsPage(notes, categories) {
    const notesEl = document.getElementById('logNotes');
    const sidebarListEl = document.getElementById('logSidebarList');
    const sidebarEmptyEl = document.getElementById('logSidebarEmpty');
    if (!notesEl || !notes.length) return;

    notesEl.classList.remove('alogs-empty');
    if (sidebarListEl) buildSidebarByCategory(notes, categories, sidebarListEl);
    if (sidebarEmptyEl) sidebarEmptyEl.style.display = 'none';

    let activeSlug = notes[0].slug;
    let renderToken = 0;

    function highlightSidebar(slug) {
      document.querySelectorAll('#logSidebarList a').forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === `#${slug}`);
      });
    }

    async function renderNote(slug, opts = {}) {
      const idx = notes.findIndex((n) => n.slug === slug);
      const safeIdx = idx >= 0 ? idx : 0;
      const note = notes[safeIdx];
      activeSlug = note.slug;
      const myToken = ++renderToken;

      notesEl.innerHTML = '';
      const articleEl = buildFullNoteEl(note);
      articleEl.classList.add('alogs-note-entering');
      notesEl.appendChild(articleEl);
      requestAnimationFrame(() => articleEl.classList.remove('alogs-note-entering'));

      highlightSidebar(note.slug);
      window.LogsGraph?.setActiveSlug(note.slug);

      if (!opts.skipScroll) {
        const top = notesEl.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      await loadNoteBody(note);
      if (myToken !== renderToken) return; // a newer note was opened meanwhile

      const bodyEl = articleEl.querySelector('.alogs-note-body');
      bodyEl.classList.remove('alogs-note-body-loading');
      bodyEl.innerHTML = note.bodyHtml;

      addHeadingLinks(articleEl);
      buildRelatedNotes(note, notes);
      buildPrevNextNav(note, safeIdx, notes);
      renderActiveOutline(articleEl);

      if (opts.headingId) {
        const targetHeading = articleEl.querySelector(`#${opts.headingId}`);
        if (targetHeading) {
          targetHeading.scrollIntoView({ behavior: opts.skipScroll ? 'auto' : 'smooth', block: 'start' });
        }
      }
    }

    // Clicking a tag pill inside a note body filters the archive by it.
    document.addEventListener('click', (e) => {
      const tagEl = e.target.closest('.alogs-note-tags .log-tag[data-tag]');
      if (!tagEl) return;
      e.preventDefault();
      applyTagFilter(tagEl.dataset.tag);
      document.getElementById('logTagFilters')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Clicking a note's category badge jumps to (and expands) that folder in the sidebar.
    document.addEventListener('click', (e) => {
      const catEl = e.target.closest('.alogs-note-category[data-category]');
      if (!catEl) return;
      e.preventDefault();
      jumpToCategory(catEl.dataset.category);
    });

    // Intercept clicks only from real note-navigation areas so we swap the
    // rendered note instead of scrolling through the archive. Outline links
    // and in-body heading anchors must keep their native in-page behavior.
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      if (!a.closest('.alogs-sidebar, .alogs-note-nav, .alogs-related-list')) return;
      const targetSlug = a.getAttribute('href').slice(1);
      if (!notes.some((n) => n.slug === targetSlug)) return;
      e.preventDefault();
      history.pushState(null, '', `#${targetSlug}`);
      renderNote(targetSlug);
    });

    window.addEventListener('popstate', () => {
      const { slug, headingId } = parseNoteHash();
      const targetSlug = notes.some((n) => n.slug === slug) ? slug : notes[0].slug;
      renderNote(targetSlug, { headingId: targetSlug === slug ? headingId : '' });
    });

    buildTagFilters(notes);
    buildTagsPanel(notes);
    initKeyboardNav(notes, () => activeSlug, (slug) => {
      history.pushState(null, '', `#${slug}`);
      renderNote(slug);
    });
    initMobileNotesToggle();
    window.__logsData = notes; // exposed for site-enhance.js search
    window.LogsGraph?.onActivate((node) => {
      if (node.type === 'note') {
        history.pushState(null, '', `#${node.slug}`);
        renderNote(node.slug);
      } else if (node.type === 'tag') {
        applyTagFilter(node.tag);
      }
    });

    const { slug: initialSlug, headingId: initialHeadingId } = parseNoteHash();
    const targetSlug = notes.some((n) => n.slug === initialSlug) ? initialSlug : notes[0].slug;
    renderNote(targetSlug, { skipScroll: true, headingId: targetSlug === initialSlug ? initialHeadingId : '' });
  }

  function buildTagFilters(notes) {
    const filterEl = document.getElementById('logTagFilters');
    if (!filterEl) return;
    const tagCounts = new Map();
    notes.forEach((n) => n.tags.forEach((t) => {
      const key = t.toLowerCase();
      tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
    }));
    if (!tagCounts.size) return;

    const allChip = document.createElement('button');
    allChip.className = 'alogs-tagchip active';
    allChip.dataset.tag = '';
    allChip.textContent = 'All';
    allChip.addEventListener('click', () => applyTagFilter(''));
    filterEl.appendChild(allChip);

    Array.from(tagCounts.keys()).sort().forEach((tag) => {
      const chip = document.createElement('button');
      chip.className = 'alogs-tagchip';
      chip.dataset.tag = tag;
      chip.textContent = tag;
      chip.addEventListener('click', () => applyTagFilter(tag));
      filterEl.appendChild(chip);
    });

    // support #tag=foo deep links
    const hashMatch = location.hash.match(/tag=([\w-]+)/);
    if (hashMatch && tagCounts.has(hashMatch[1].toLowerCase())) {
      applyTagFilter(hashMatch[1].toLowerCase());
    }
  }

  function initMobileNotesToggle() {
    const notesBtn = document.getElementById('mobileNotesToggle');
    const sidebar = document.querySelector('.alogs-sidebar');
    if (notesBtn && sidebar) {
      notesBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('mobile-open');
        notesBtn.classList.toggle('active', isOpen);
      });
    }

    const tagsBtn = document.getElementById('mobileTagsToggle');
    const tagsPanel = document.querySelector('.alogs-tags-panel--rail');
    if (tagsBtn && tagsPanel) {
      tagsBtn.addEventListener('click', () => {
        const isOpen = tagsPanel.classList.toggle('mobile-open-tags');
        tagsBtn.classList.toggle('active', isOpen);
      });
    }
  }

  /* ---------- index.html: compact preview list ---------- */

  function buildPreviewEntryEl(note) {
    const a = document.createElement('a');
    a.className = 'log-entry';
    a.href = `logs.html#${note.slug}`;

    const tagsHtml = note.tags
      .slice(0, 3)
      .map((t) => `<span class="log-tag">${escapeHtml(t)}</span>`)
      .join('');

    a.innerHTML = `
      <span class="log-entry-date">${escapeHtml(note.date)}</span>
      <div class="log-entry-body">
        <div class="log-entry-title">${escapeHtml(note.title)}</div>
        <p class="log-entry-excerpt">${escapeHtml(note.excerpt)}</p>
        <div class="log-entry-footer">${tagsHtml}</div>
      </div>
    `;
    return a;
  }

  function initPreviewList(notes) {
    const listEl = document.getElementById('logsPreviewList');
    const emptyEl = document.getElementById('logsPreviewEmpty');
    if (!listEl || !notes.length) return;

    const preview = notes.slice(0, 5); // preview only: 5 most recent logs, full archive lives on logs.html
    listEl.innerHTML = '';
    preview.forEach((note) => listEl.appendChild(buildPreviewEntryEl(note)));

    if (emptyEl) emptyEl.style.display = 'none';
    window.__logsData = notes;
    buildTagsPanel(notes, 8); // preview only: top 8 tags, full tag list lives on logs.html
  }

  /* ---------- init ---------- */

  async function init() {
    const onLogsPage = !!document.getElementById('logNotes');
    const onIndexPage = !!document.getElementById('logsPreviewList');
    if (!onLogsPage && !onIndexPage) return;

    const index = await loadIndex();
    const notes = notesFromIndex(index);
    if (!notes.length) return; // keep default "nothing logged yet" states

    if (onLogsPage) initFullLogsPage(notes, index.categories || []);
    if (onIndexPage) initPreviewList(notes);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
