---
layout: page
title: Tools
icon: fas fa-toolbox
order: 2
---

<div class="tools-graph-shell">
  <header class="tools-graph-header">
    <div>
      <span class="tools-graph-eyebrow">Security toolkit index</span>
      <h2>Tool intelligence map</h2>
      <p>Explore the tools behind reconnaissance, analysis, exploitation, and incident response.</p>
    </div>
    <span class="tools-graph-status"><i class="fas fa-circle"></i> Live map</span>
  </header>

  <div class="tools-graph-toolbar">
    <label class="tools-search-wrap" for="tool-search">
      <i class="fas fa-search"></i>
      <input id="tool-search" type="search" placeholder="Search tools..." aria-label="Search tools" />
    </label>
    <button id="tool-fullscreen" class="tools-fullscreen-btn" type="button" aria-label="Toggle fullscreen graph">
      <i class="fas fa-expand"></i>
      <span>Fullscreen</span>
    </button>
  </div>

  <div id="tool-graph-legend" class="tool-graph-legend" aria-label="Tool categories"></div>

  <div id="tools-graph-wrapper" class="tools-graph-wrapper">
    <svg id="tools-graph" data-graph-source="{{ '/assets/js/tools-graph.json' | relative_url }}" aria-label="Cybersecurity tools graph"></svg>
  </div>
</div>

<link rel="stylesheet" href="{{ '/assets/css/tools-graph.css' | relative_url }}">
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script src="{{ '/assets/js/tools-graph.js' | relative_url }}"></script>
