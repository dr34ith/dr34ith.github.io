/**
 * Builds a nested, always-visible "Contents" outline for writeup posts,
 * placed right under the post meta (date / updated) block. This does not
 * depend on the sidebar/tocbot panel, so it still shows up even on
 * breakpoints or pages where that panel is hidden.
 */
(function () {
  function slugCount(map, base) {
    if (!map.has(base)) {
      map.set(base, 0);
      return base;
    }
    const next = map.get(base) + 1;
    map.set(base, next);
    return base + '-' + next;
  }

  function buildOutline() {
    const list = document.getElementById('post-outline-list');
    const nav = document.getElementById('post-outline');
    const content = document.querySelector('article.post-article .content');
    if (!list || !nav || !content) return;

    const headings = Array.from(content.querySelectorAll('h2, h3'))
      .filter((h) => !h.hasAttribute('data-toc-skip'));

    if (headings.length < 2) {
      nav.remove();
      return;
    }

    const usedIds = new Map();
    let currentTopLi = null;
    let currentSubList = null;

    headings.forEach((heading) => {
      if (!heading.id) {
        const base = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        heading.id = slugCount(usedIds, base || 'section');
      }

      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.className = 'post-outline-link';
      link.textContent = heading.textContent.trim();

      const li = document.createElement('li');
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
          currentSubList.className = 'post-outline-sublist';
          currentTopLi.appendChild(currentSubList);
        }
        currentSubList.appendChild(li);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildOutline);
  } else {
    buildOutline();
  }
})();
