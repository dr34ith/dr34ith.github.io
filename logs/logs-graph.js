/* ============================================================
   LOGS GRAPH VIEW - Obsidian-inspired force-directed graph.

   Nodes = notes + tags, edges = "note uses tag". A tiny custom
   force simulation (no external deps) lays them out; the same
   simulation drives however many <svg> "views" are mounted at
   once (the small preview in the sidebar rail + the full-screen
   modal opened via the expand button on logs.html).

   Public API (window.LogsGraph):
     init(notes)            - (re)builds the graph from note data
     setActiveSlug(slug)    - highlights the currently open note
     setFilterTag(tag|null) - dims everything not related to a tag
     onActivate(fn)         - fn({type:'note',slug}) or ({type:'tag',tag})
                               fires on a plain click (not a drag)
   ============================================================ */

(function () {
  const VB = 300; // square logical coordinate space, shared by every view
  const CENTER = VB / 2;
  const NOTE_R = 7;
  const MARGIN = 16;
  const MIN_SCALE = 0.45;
  const MAX_SCALE = 3.2;

  const REPULSION = 1400;
  const SPRING_K = 0.05;
  const EDGE_LEN = 56;
  const CENTER_K = 0.0016;
  const DAMPING = 0.82;
  const ALPHA_DECAY = 0.05;
  const ALPHA_MIN = 0.004;

  let graphData = null; // { nodes: [...], edges: [...] }
  let adjacency = new Map(); // nodeId -> Set(neighbor nodeId)
  let views = [];
  let alpha = 0;
  let rafId = null;

  let activeSlug = null;
  let filterTag = null;
  let hoverId = null;
  const activateCallbacks = [];

  /* ---------- simulation ---------- */

  function buildGraphData(notes) {
    const nodesById = new Map();
    const edges = [];

    function ensureTagNode(tagLower, original) {
      const id = `tag:${tagLower}`;
      if (!nodesById.has(id)) {
        const angle = Math.random() * Math.PI * 2;
        const rad = 60 + Math.random() * 40;
        nodesById.set(id, {
          id, type: 'tag', tag: tagLower, label: `#${original}`,
          x: CENTER + Math.cos(angle) * rad,
          y: CENTER + Math.sin(angle) * rad,
          vx: 0, vy: 0, fixed: false, fx: 0, fy: 0, degree: 0, r: 4,
        });
      }
      return nodesById.get(id);
    }

    notes.forEach((note) => {
      const angle = Math.random() * Math.PI * 2;
      const rad = 20 + Math.random() * 50;
      const noteNode = {
        id: `note:${note.slug}`, type: 'note', slug: note.slug, label: note.title,
        x: CENTER + Math.cos(angle) * rad,
        y: CENTER + Math.sin(angle) * rad,
        vx: 0, vy: 0, fixed: false, fx: 0, fy: 0, degree: 0, r: NOTE_R,
      };
      nodesById.set(noteNode.id, noteNode);
      note.tags.forEach((t) => {
        const tagNode = ensureTagNode(t.toLowerCase(), t);
        edges.push({ source: noteNode, target: tagNode });
        noteNode.degree += 1;
        tagNode.degree += 1;
      });
    });

    const nodes = Array.from(nodesById.values());
    nodes.forEach((n) => {
      if (n.type === 'tag') n.r = 3.5 + Math.min(10, n.degree) * 1.15;
    });

    const adj = new Map();
    nodes.forEach((n) => adj.set(n.id, new Set()));
    edges.forEach((e) => {
      adj.get(e.source.id).add(e.target.id);
      adj.get(e.target.id).add(e.source.id);
    });

    return { nodes, edges, adjacency: adj };
  }

  function simulateStep(a) {
    const { nodes, edges } = graphData;
    const n = nodes.length;

    for (let i = 0; i < n; i++) {
      const nodeA = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const nodeB = nodes[j];
        let dx = nodeB.x - nodeA.x;
        let dy = nodeB.y - nodeA.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 0.02) { dx = (Math.random() - 0.5) * 0.2; dy = (Math.random() - 0.5) * 0.2; distSq = 0.04; }
        const dist = Math.sqrt(distSq);
        const force = (REPULSION * a) / distSq;
        const fx = (force * dx) / dist;
        const fy = (force * dy) / dist;
        if (!nodeA.fixed) { nodeA.vx -= fx; nodeA.vy -= fy; }
        if (!nodeB.fixed) { nodeB.vx += fx; nodeB.vy += fy; }
      }
    }

    edges.forEach((e) => {
      const { source, target } = e;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const diff = (dist - EDGE_LEN) * SPRING_K * a;
      const fx = (diff * dx) / dist;
      const fy = (diff * dy) / dist;
      if (!source.fixed) { source.vx += fx; source.vy += fy; }
      if (!target.fixed) { target.vx -= fx; target.vy -= fy; }
    });

    nodes.forEach((node) => {
      if (node.fixed) {
        node.x = node.fx; node.y = node.fy; node.vx = 0; node.vy = 0;
        return;
      }
      node.vx += (CENTER - node.x) * CENTER_K * a;
      node.vy += (CENTER - node.y) * CENTER_K * a;
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;
      node.x = Math.min(VB - MARGIN, Math.max(MARGIN, node.x));
      node.y = Math.min(VB - MARGIN, Math.max(MARGIN, node.y));
    });
  }

  function tick() {
    if (!graphData || alpha < ALPHA_MIN) { rafId = null; return; }
    simulateStep(alpha);
    alpha -= alpha * ALPHA_DECAY;
    views.forEach((v) => v.render());
    rafId = requestAnimationFrame(tick);
  }

  function reheat(amount) {
    alpha = Math.max(alpha, amount);
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  /* ---------- highlight state shared across every view ---------- */

  function nodeVisualState(node) {
    const nodeAdj = adjacency.get(node.id);
    if (hoverId) {
      if (node.id === hoverId) return 'hover';
      if (nodeAdj && nodeAdj.has(hoverId)) return 'connected';
      return 'dim';
    }
    if (filterTag) {
      const tagId = `tag:${filterTag}`;
      if (node.id === tagId) return 'hover';
      if (nodeAdj && nodeAdj.has(tagId)) return 'connected';
      return 'dim';
    }
    if (activeSlug && node.id === `note:${activeSlug}`) return 'active';
    return 'normal';
  }

  function edgeVisualState(edge) {
    if (hoverId) {
      return (edge.source.id === hoverId || edge.target.id === hoverId) ? 'connected' : 'dim';
    }
    if (filterTag) {
      const tagId = `tag:${filterTag}`;
      return (edge.source.id === tagId || edge.target.id === tagId) ? 'connected' : 'dim';
    }
    return 'normal';
  }

  /* ---------- a single rendered <svg> instance ---------- */

  function createView(svgEl) {
    svgEl.setAttribute('viewBox', `0 0 ${VB} ${VB}`);
    svgEl.classList.add('lg-svg');
    svgEl.innerHTML = `
      <rect class="lg-bg" x="0" y="0" width="${VB}" height="${VB}" fill="transparent"></rect>
      <g class="lg-world">
        <g class="lg-edges"></g>
        <g class="lg-nodes"></g>
      </g>`;

    const worldEl = svgEl.querySelector('.lg-world');
    const edgesEl = svgEl.querySelector('.lg-edges');
    const nodesEl = svgEl.querySelector('.lg-nodes');
    const bgEl = svgEl.querySelector('.lg-bg');

    let pan = { x: 0, y: 0 };
    let scale = 1;
    let edgeEls = [];
    let nodeEls = new Map();

    function applyTransform() {
      worldEl.setAttribute('transform', `translate(${pan.x} ${pan.y}) scale(${scale})`);
    }

    // The svg keeps its default preserveAspectRatio ("xMidYMid meet") so
    // nodes stay perfectly round even when the container isn't square -
    // that means a single uniform scale (not independent x/y ratios) maps
    // client pixels to viewBox units, same as the browser's own letterboxing.
    function containerScale() {
      const rect = svgEl.getBoundingClientRect();
      return Math.min(rect.width, rect.height) / VB || 1;
    }

    function rectToWorldDelta(dxClient, dyClient) {
      const s = containerScale();
      return [dxClient / s, dyClient / s];
    }

    function clientToViewBoxPoint(clientX, clientY) {
      const rect = svgEl.getBoundingClientRect();
      const s = containerScale();
      const offsetX = (rect.width - VB * s) / 2;
      const offsetY = (rect.height - VB * s) / 2;
      return [(clientX - rect.left - offsetX) / s, (clientY - rect.top - offsetY) / s];
    }

    function rebuild() {
      edgesEl.innerHTML = '';
      nodesEl.innerHTML = '';
      edgeEls = graphData.edges.map((edge) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'lg-edge');
        edgesEl.appendChild(line);
        return { edge, line };
      });

      nodeEls = new Map();
      graphData.nodes.forEach((node) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `lg-node type-${node.type}`);
        g.dataset.nodeId = node.id;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', String(node.r));
        g.appendChild(circle);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'lg-label');
        label.setAttribute('dy', '0.32em');
        label.textContent = node.label;
        g.appendChild(label);

        nodesEl.appendChild(g);
        nodeEls.set(node.id, { node, g, circle, label });
        attachNodeInteractions(g, node);
      });

      updateHighlight();
    }

    function render() {
      edgeEls.forEach(({ edge, line }) => {
        line.setAttribute('x1', edge.source.x.toFixed(1));
        line.setAttribute('y1', edge.source.y.toFixed(1));
        line.setAttribute('x2', edge.target.x.toFixed(1));
        line.setAttribute('y2', edge.target.y.toFixed(1));
      });
      nodeEls.forEach(({ node, circle, label }) => {
        circle.setAttribute('cx', node.x.toFixed(1));
        circle.setAttribute('cy', node.y.toFixed(1));
        label.setAttribute('x', (node.x + node.r + 5).toFixed(1));
        label.setAttribute('y', node.y.toFixed(1));
      });
    }

    function updateHighlight() {
      nodeEls.forEach(({ node, g }) => {
        g.classList.remove('is-hover', 'is-connected', 'is-dim', 'is-active');
        const state = nodeVisualState(node);
        if (state === 'hover') g.classList.add('is-hover');
        else if (state === 'connected') g.classList.add('is-connected');
        else if (state === 'dim') g.classList.add('is-dim');
        else if (state === 'active') g.classList.add('is-active');
      });
      edgeEls.forEach(({ edge, line }) => {
        line.classList.remove('is-connected', 'is-dim');
        const state = edgeVisualState(edge);
        if (state === 'connected') line.classList.add('is-connected');
        else if (state === 'dim') line.classList.add('is-dim');
      });
    }

    function zoomAt(clientX, clientY, factor) {
      const [px, py] = clientToViewBoxPoint(clientX, clientY);
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      const ratio = newScale / scale;
      pan.x = px - ratio * (px - pan.x);
      pan.y = py - ratio * (py - pan.y);
      scale = newScale;
      applyTransform();
    }

    function resetView() {
      pan = { x: 0, y: 0 };
      scale = 1;
      applyTransform();
    }

    function attachNodeInteractions(g, node) {
      g.addEventListener('pointerenter', () => {
        hoverId = node.id;
        views.forEach((v) => v.updateHighlight());
      });
      g.addEventListener('pointerleave', () => {
        if (hoverId === node.id) hoverId = null;
        views.forEach((v) => v.updateHighlight());
      });
      g.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        g.setPointerCapture(e.pointerId);
        const startClientX = e.clientX;
        const startClientY = e.clientY;
        const startX = node.x;
        const startY = node.y;
        let moved = false;
        node.fixed = true;
        node.fx = startX;
        node.fy = startY;
        reheat(0.6);

        function onMove(ev) {
          const dxClient = ev.clientX - startClientX;
          const dyClient = ev.clientY - startClientY;
          if (Math.abs(dxClient) > 3 || Math.abs(dyClient) > 3) moved = true;
          const [wdx, wdy] = rectToWorldDelta(dxClient, dyClient);
          node.fx = startX + wdx / scale;
          node.fy = startY + wdy / scale;
          reheat(0.5);
        }
        function onUp() {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          node.fixed = false;
          if (!moved) activateNode(node);
        }
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp, { once: true });
      });
    }

    // background pan
    bgEl.addEventListener('pointerdown', (e) => {
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startPan = { x: pan.x, y: pan.y };
      svgEl.classList.add('is-panning');
      function onMove(ev) {
        const dxClient = ev.clientX - startClientX;
        const dyClient = ev.clientY - startClientY;
        const [wdx, wdy] = rectToWorldDelta(dxClient, dyClient);
        pan.x = startPan.x + wdx;
        pan.y = startPan.y + wdy;
        applyTransform();
      }
      function onUp() {
        svgEl.classList.remove('is-panning');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    });

    svgEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomAt(e.clientX, e.clientY, factor);
    }, { passive: false });

    applyTransform();

    return { rebuild, render, updateHighlight, resetView, zoomAt, svgEl };
  }

  function activateNode(node) {
    activateCallbacks.forEach((fn) => {
      if (node.type === 'note') fn({ type: 'note', slug: node.slug });
      else fn({ type: 'tag', tag: node.tag });
    });
  }

  /* ---------- fullscreen modal wiring (logs.html only) ---------- */

  function initModal() {
    const expandBtn = document.getElementById('logGraphExpandBtn');
    const modal = document.getElementById('logGraphModal');
    const closeBtn = document.getElementById('logGraphModalClose');
    const canvas = document.getElementById('logGraphModalCanvas');
    if (!expandBtn || !modal || !closeBtn || !canvas) return;

    let modalView = null;

    function open() {
      if (!modalView) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        canvas.appendChild(svg);
        modalView = createView(svg);
        modalView.rebuild();
        modalView.render(); // reflect current (already-settled) node positions immediately
        views.push(modalView);
      }
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('open'));
      reheat(0.06); // gentle nudge only - avoid a long re-settle jitter on every open
      document.body.classList.add('lg-modal-open');
    }
    function close() {
      modal.classList.remove('open');
      document.body.classList.remove('lg-modal-open');
      setTimeout(() => { modal.hidden = true; }, 220);
    }

    expandBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
    modal.querySelectorAll('.alogs-graph-zoom').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!modalView) return;
        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (btn.dataset.zoom === 'in') modalView.zoomAt(cx, cy, 1.3);
        else if (btn.dataset.zoom === 'out') modalView.zoomAt(cx, cy, 0.77);
        else modalView.resetView();
      });
    });
  }

  /* ---------- public API ---------- */

  window.LogsGraph = {
    init(notes) {
      graphData = buildGraphData(notes);
      adjacency = graphData.adjacency;
      views = [];

      const miniSvg = document.getElementById('logTagsGraph');
      if (miniSvg) {
        const miniView = createView(miniSvg);
        views.push(miniView);
      }
      views.forEach((v) => v.rebuild());
      initModal();
      reheat(1);
    },
    setActiveSlug(slug) {
      activeSlug = slug;
      views.forEach((v) => v.updateHighlight());
    },
    setFilterTag(tag) {
      filterTag = tag;
      views.forEach((v) => v.updateHighlight());
    },
    onActivate(fn) {
      activateCallbacks.push(fn);
    },
  };
})();
