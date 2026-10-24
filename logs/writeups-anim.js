/* Writeups section: headline typewriter + card deal-in, triggered once on scroll */
(function () {
  const head = document.querySelector('.wu-type');
  const grid = document.getElementById('writeups-grid');
  if (!head || !grid) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const text = head.dataset.text;

  function deal() {
    grid.classList.add('wu-in');
    setTimeout(() => grid.classList.add('wu-done'), 1800);
  }
  function type() {
    if (reduce) { deal(); return; }
    head.textContent = '';
    head.classList.add('is-typing');
    let i = 0;
    const t = setInterval(() => {
      head.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(t);
        setTimeout(() => head.classList.remove('is-typing'), 900);
      }
    }, 55);
    setTimeout(deal, 350);
  }

  if (reduce || !('IntersectionObserver' in window)) { deal(); return; }
  head.textContent = '';
  const io = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { io.disconnect(); type(); }
  }, { threshold: 0.25 });
  io.observe(head);
})();
