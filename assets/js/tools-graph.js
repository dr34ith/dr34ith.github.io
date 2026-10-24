(function () {
  const CATEGORY_COLORS = {
    network: '#c084fc',
    web: '#e879f9',
    exploitation: '#f472b6',
    forensics: '#a78bfa',
    scripting: '#d8b4fe',
    default: '#dbb6fc'
  };

  const CATEGORY_VARIANTS = {
    network: ['#c084fc', '#b57aef', '#d19cff'],
    web: ['#e879f9', '#d96aea', '#f09cff'],
    exploitation: ['#f472b6', '#e863a5', '#fb8ec8'],
    forensics: ['#a78bfa', '#9b7df0', '#b99dff'],
    scripting: ['#d8b4fe', '#cda6f5', '#e4c6ff'],
    default: ['#dbb6fc', '#cfaaef', '#e8c8ff']
  };

  const categoryOrder = ['network', 'web', 'exploitation', 'forensics', 'scripting'];

  function setupGraphPage() {
    const graphSvg = document.getElementById('tools-graph');
    if (!graphSvg) return;

    const source = graphSvg.dataset.graphSource;
    const searchBox = document.getElementById('tool-search');
    const fullscreenBtn = document.getElementById('tool-fullscreen');
    const legendNode = document.getElementById('tool-graph-legend');

    if (source) {
      fetch(source)
        .then(function (r) { return r.json(); })
        .then(function (data) { renderGraph(graphSvg, data, { searchBox: searchBox, fullscreenBtn: fullscreenBtn, legendNode: legendNode, isLocal: false }); })
        .catch(function (err) { console.error('Unable to load tool graph data:', err); });
    }
  }

  function setupLocalGraphs() {
    var localGraphs = document.querySelectorAll('[data-local-graph="true"]');
    localGraphs.forEach(function (svg) {
      var source = svg.dataset.graphSource;
      if (!source) return;
      fetch(source)
        .then(function (r) { return r.json(); })
        .then(function (data) { renderGraph(svg, data, { isLocal: true, nodeId: svg.dataset.nodeId }); })
        .catch(function (err) { console.error('Unable to load local graph data:', err); });
    });
  }

  function buildLegend(legendNode, categories) {
    if (!legendNode) return;
    legendNode.innerHTML = '';
    categoryOrder.forEach(function (name) {
      if (!categories.includes(name)) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'tool-category-toggle active';
      button.dataset.category = name;
      button.innerHTML = '<span class="legend-dot" style="background:' + (CATEGORY_COLORS[name] || CATEGORY_COLORS.default) + '"></span>' + name;
      button.addEventListener('click', function () {
        var isActive = button.classList.toggle('active');
        button.setAttribute('aria-pressed', String(isActive));
        var shell = button.closest('.tools-graph-shell');
        var svg = shell && shell.querySelector('svg');
        if (svg && svg.__graphState) {
          if (isActive) svg.__graphState.activeCategories.add(name);
          else svg.__graphState.activeCategories.delete(name);
          svg.__graphState.updateVisibility();
        }
      });
      legendNode.appendChild(button);
    });
  }

  function renderGraph(svg, data, options) {
    options = options || {};
    var searchBox = options.searchBox;
    var fullscreenBtn = options.fullscreenBtn;
    var legendNode = options.legendNode;
    var isLocal = options.isLocal || false;
    var nodeId = options.nodeId || null;

    var rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
    var rawEdges = Array.isArray(data.edges) ? data.edges : [];
    var writeupEdges = Array.isArray(data.writeupEdges) ? data.writeupEdges : [];
    var allEdges = rawEdges.concat(writeupEdges);

    var processedNodes = rawNodes.map(function (n) {
      return { id: n.id, title: n.title, category: n.category || 'default', url: n.url, linkCount: Number(n.linkCount || 0) };
    });

    var nodes = processedNodes;
    var edges = allEdges;

    if (isLocal && nodeId) {
      var connectedIds = new Set([nodeId]);
      var localEdges = [];
      allEdges.forEach(function (e) {
        if (e.source === nodeId || e.target === nodeId) {
          connectedIds.add(e.source);
          connectedIds.add(e.target);
          localEdges.push(e);
        }
      });
      nodes = processedNodes.filter(function (n) { return connectedIds.has(n.id); });
      edges = localEdges;
    }

    if (!nodes.length) return;

    var categories = Array.from(new Set(nodes.map(function (n) { return n.category; })));
    if (legendNode) buildLegend(legendNode, categories);

    var state = {
      activeCategories: new Set(categories),
      filteredText: '',
      hoverNodeId: null
    };
    state.updateVisibility = function () { updateGraphVisibility(state); };
    svg.__graphState = state;

    var container = svg.parentElement;
    var width = container.clientWidth || 900;
    var height = isLocal ? 260 : Math.max(container.clientHeight || 520, 480);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    var radiusScale = d3.scaleLinear()
      .domain([1, d3.max(nodes, function (n) { return Math.max(n.linkCount, 1); }) || 1])
      .range([14, 32]);

    var graphNodes = nodes.map(function (n, idx) {
      var variants = CATEGORY_VARIANTS[n.category] || CATEGORY_VARIANTS.default;
      var nodeColor = variants[idx % variants.length];
      return { id: n.id, title: n.title, category: n.category, url: n.url, linkCount: n.linkCount, radius: radiusScale(Math.max(n.linkCount, 1)), color: nodeColor };
    });

    var graphLinks = edges.filter(function (e) {
      return graphNodes.find(function (n) { return n.id === e.source; }) && graphNodes.find(function (n) { return n.id === e.target; });
    }).map(function (e) {
      return { source: e.source, target: e.target };
    });

    var root = d3.select(svg);
    root.selectAll('*').remove();

    var defs = root.append('defs');

    // glow filter
    var glowFilter = defs.append('filter').attr('id', 'node-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '5').attr('result', 'blur');
    var merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    var zoomLayer = root.append('g').attr('class', 'zoom-layer');
    var linkLayer = zoomLayer.append('g').attr('class', 'links');
    var nodeLayer = zoomLayer.append('g').attr('class', 'nodes');
    var labelLayer = zoomLayer.append('g').attr('class', 'labels');

    // force simulation
    var simulation = d3.forceSimulation(graphNodes)
      .force('link', d3.forceLink(graphLinks).id(function (d) { return d.id; }).distance(function (d) { return 80 + d.source.radius + d.target.radius; }))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(function (d) { return d.radius + 12; }))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04))
      .alphaDecay(0.018)
      .velocityDecay(0.35);

    // links
    var links = linkLayer.selectAll('line')
      .data(graphLinks)
      .join('line')
      .attr('class', 'tool-link');

    // node groups
    var nodeGroups = nodeLayer.selectAll('g.node-group')
      .data(graphNodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer');

    // outer glow ring
    nodeGroups.append('circle')
      .attr('class', 'node-glow-ring')
      .attr('r', function (d) { return d.radius + 7; })
      .attr('fill', function (d) { return d.color; })
      .attr('opacity', 0.18);

    // main circle
    nodeGroups.append('circle')
      .attr('class', 'node-core')
      .attr('r', function (d) { return d.radius; })
      .attr('fill', function (d) { return d.color; })
      .attr('stroke', function (d) { return d.id === nodeId ? '#fca5a5' : 'rgba(255,255,255,0.3)'; })
      .attr('stroke-width', function (d) { return d.id === nodeId ? 2.5 : 1.2; })
      .attr('filter', 'url(#node-glow)');

    // inner highlight dot
    nodeGroups.append('circle')
      .attr('class', 'node-highlight')
      .attr('r', function (d) { return d.radius * 0.35; })
      .attr('cx', function (d) { return -d.radius * 0.2; })
      .attr('cy', function (d) { return -d.radius * 0.2; })
      .attr('fill', 'rgba(255,255,255,0.25)');

    // labels
    var labels = labelLayer.selectAll('text')
      .data(graphNodes)
      .join('text')
      .attr('class', 'tool-node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', function (d) { return -d.radius - 10; })
      .text(function (d) { return d.title; });

    // drag behavior
    var drag = d3.drag()
      .on('start', function (event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function (event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function (event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroups.call(drag);

    // hover and click
    nodeGroups
      .on('mouseenter', function (event, d) {
        state.hoverNodeId = d.id;
        updateGraphVisibility(state);

        d3.select(this).select('.node-glow-ring')
          .transition().duration(200)
          .attr('r', d.radius + 12)
          .attr('opacity', 0.3);

        d3.select(this).select('.node-core')
          .transition().duration(200)
          .attr('r', d.radius + 3);

        var tooltip = document.getElementById('tool-tooltip');
        if (!tooltip) {
          var box = document.createElement('div');
          box.id = 'tool-tooltip';
          box.className = 'tool-tooltip';
          document.body.appendChild(box);
        }
        var tooltipEl = document.getElementById('tool-tooltip');
        tooltipEl.innerHTML = '<strong>' + d.title + '</strong><span>' + (d.category || 'tool') + '</span>';
        tooltipEl.style.left = (event.clientX + 16) + 'px';
        tooltipEl.style.top = (event.clientY + 14) + 'px';
        tooltipEl.hidden = false;
      })
      .on('mousemove', function (event) {
        var tooltipEl = document.getElementById('tool-tooltip');
        if (tooltipEl) {
          tooltipEl.style.left = (event.clientX + 16) + 'px';
          tooltipEl.style.top = (event.clientY + 14) + 'px';
        }
      })
      .on('mouseleave', function (event, d) {
        state.hoverNodeId = null;
        updateGraphVisibility(state);

        d3.select(this).select('.node-glow-ring')
          .transition().duration(300)
          .attr('r', d.radius + 6)
          .attr('opacity', 0.15);

        d3.select(this).select('.node-core')
          .transition().duration(300)
          .attr('r', d.radius);

        var tooltip = document.getElementById('tool-tooltip');
        if (tooltip) tooltip.hidden = true;
      })
      .on('click', function (event, d) {
        if (d.url) window.location.href = d.url;
      });

    // zoom
    var zoomBehavior = d3.zoom()
      .scaleExtent([0.4, 3])
      .on('zoom', function (event) {
        zoomLayer.attr('transform', event.transform);
      });
    root.call(zoomBehavior);

    // tick
    simulation.on('tick', function () {
      links
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });

      nodeGroups.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
      labels.attr('x', function (d) { return d.x; }).attr('y', function (d) { return d.y; });
    });

    function updateGraphVisibility(gs) {
      var active = gs.activeCategories || new Set(categories);
      var filter = (gs.filteredText || '').trim().toLowerCase();
      var hovered = gs.hoverNodeId;

      var neighborIds = new Set();
      if (hovered) {
        graphLinks.forEach(function (e) {
          var sid = typeof e.source === 'object' ? e.source.id : e.source;
          var tid = typeof e.target === 'object' ? e.target.id : e.target;
          if (sid === hovered || tid === hovered) {
            neighborIds.add(sid);
            neighborIds.add(tid);
          }
        });
      }

      nodeGroups.transition().duration(200).style('opacity', function (d) {
        var catOk = active.has(d.category);
        var textOk = !filter || d.title.toLowerCase().includes(filter);
        var hoverOk = !hovered || neighborIds.has(d.id) || d.id === hovered;
        return catOk && textOk && hoverOk ? 1 : 0.12;
      });

      links.transition().duration(200).style('opacity', function (d) {
        var s = typeof d.source === 'object' ? d.source : { id: d.source, category: '' };
        var t = typeof d.target === 'object' ? d.target : { id: d.target, category: '' };
        var catOk = active.has(s.category) && active.has(t.category);
        var textOk = !filter || s.title && s.title.toLowerCase().includes(filter) || t.title && t.title.toLowerCase().includes(filter);
        var hoverOk = !hovered || hovered === s.id || hovered === t.id;
        return catOk && textOk && hoverOk ? 0.6 : 0.06;
      });

      labels.transition().duration(200).style('opacity', function (d) {
        var isHovered = hovered === d.id || (neighborIds.has(d.id) && hovered);
        var textOk = !filter || d.title.toLowerCase().includes(filter);
        var catOk = active.has(d.category);
        return (isHovered || (textOk && filter)) && catOk ? 1 : catOk && !filter ? 0.7 : 0;
      });
    }

    if (searchBox) {
      searchBox.addEventListener('input', function (e) {
        state.filteredText = e.target.value;
        updateGraphVisibility(state);
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', function () {
        var wrapper = container.closest('.tools-graph-shell');
        if (!wrapper) return;
        if (!document.fullscreenElement) {
          wrapper.requestFullscreen().catch(function () {});
        } else {
          document.exitFullscreen();
        }
      });
    }

    updateGraphVisibility(state);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupStarfield();
    setupGraphPage();
    setupLocalGraphs();
    setupToolPreview();
  });

  function setupStarfield() {
    var shell = document.querySelector('.tools-graph-shell');
    if (!shell) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'tools-starfield-canvas';
    shell.insertBefore(canvas, shell.firstChild);

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    function resize() {
      var rect = shell.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    }

    var dim = resize();
    window.addEventListener('resize', function () { dim = resize(); });

    var stars = [];
    var particleCount = 45;
    var hues = [270, 290, 310, 320, 330];
    for (var i = 0; i < particleCount; i++) {
      stars.push({
        x: Math.random() * dim.w,
        y: Math.random() * dim.h,
        r: 0.4 + Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.1,
        hue: hues[Math.floor(Math.random() * hues.length)],
        alpha: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    var frame = 0;
    function animate() {
      frame++;
      ctx.clearRect(0, 0, dim.w, dim.h);

      stars.forEach(function (s) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = dim.w + 5;
        if (s.x > dim.w + 5) s.x = -5;
        if (s.y < -5) s.y = dim.h + 5;
        if (s.y > dim.h + 5) s.y = -5;

        var flicker = s.alpha + Math.sin(frame * 0.015 + s.phase) * 0.2;
        flicker = Math.max(0.1, Math.min(0.8, flicker));

        var glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        glow.addColorStop(0, 'hsla(' + s.hue + ', 70%, 80%, ' + (flicker * 0.4) + ')');
        glow.addColorStop(1, 'hsla(' + s.hue + ', 70%, 80%, 0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + s.hue + ', 60%, 85%, ' + flicker + ')';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  function setupToolPreview() {
    document.querySelectorAll('a[href*="/tools/"]').forEach(function (link) {
      var previewCard = document.getElementById('tool-preview-card');
      if (!previewCard) return;
      link.addEventListener('mouseenter', function () {
        var title = link.textContent.trim();
        var previewText = link.getAttribute('data-preview') || 'Tool reference';
        previewCard.hidden = false;
        previewCard.innerHTML = '<h4>' + title + '</h4><p>' + previewText + '</p>';
        previewCard.style.left = (link.getBoundingClientRect().left + 16) + 'px';
        previewCard.style.top = (link.getBoundingClientRect().top + 16) + 'px';
      });
      link.addEventListener('mouseleave', function () {
        previewCard.hidden = true;
      });
    });
  }
})();
