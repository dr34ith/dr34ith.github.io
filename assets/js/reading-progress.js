// Reading progress bar for Dreaith's Chirpy site.
// Inserts a fixed bar (#reading-progress, styled in jekyll-theme-chirpy.scss)
// and fills it based on scroll position within the article content.
document.addEventListener('DOMContentLoaded', function () {
  var bar = document.getElementById('reading-progress');
  if (!bar) return;

  function update() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});
