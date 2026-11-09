---
layout: page
icon: fas fa-user-astronaut
order: 5
---

<div id="galaxy-bg" aria-hidden="true">
  <div class="galaxy-nebula nebula-1"></div>
  <div class="galaxy-nebula nebula-2"></div>
  <div class="galaxy-nebula nebula-3"></div>
  <canvas id="starfield"></canvas>
</div>

<div class="about-gallery">

  <header class="about-gallery__intro fade-in-stagger delay-1">
    <span class="about-gallery__label">A personal archive</span>
    <h2>Hi, I'm Dreaith.</h2>
    <p>Witty person (source: me)  |  Creative student  |  "NBSB" flex  |  Not-Chalant.</p>
  </header>

  <section class="about-gallery__exhibit fade-in-stagger delay-2">
    <span class="about-gallery__label">01 / In practice</span>
    <p>
      Currently working on building a solid foundation of self-confidence,
      self-trust, and consistency. I'm learning to show up even when
      motivation decides to take a day off. Right now, I'm focused on
      blue teaming and defensive security. I'm also trying to keep my
      dopamine levels reasonable while resisting the temptation to make
      everything red just because I like the color.
    </p>
  </section>

  <section class="about-gallery__exhibit fade-in-stagger delay-3">
    <span class="about-gallery__label">02 / Beyond the screen</span>
    <p>
      When I'm not buried in a lab, I'm usually somewhere around music,
      art, or a guitar (just planning to start being bookish). I enjoy
      painting, listening to bands, and reading whenever my attention span
      cooperates. I also love hiking, although apparently loving the
      mountains doesn't automatically mean loving the exhaustion that comes
      with them.
    </p>
  </section>

  <section class="about-gallery__exhibit fade-in-stagger delay-4">
    <span class="about-gallery__label">03 / Reflection</span>
    <p>
      Comparison slows down my progress. Impostor syndrome is something I
      feel all the time, but I've realized that I need to do something about
      it instead of just sitting with it. So I'm learning to measure myself
      against who I was yesterday, not against everyone else. I write down
      what I learn, even the messy parts, because it's proof that I'm
      moving, even when it doesn't feel like it. If I can't do it yet,
      I'll keep trying.
    </p>
  </section>

  <div class="about-cat" aria-hidden="true">
    <div class="about-cat__body">
      <div class="about-cat__ears">
        <div class="about-cat__ear about-cat__ear--left"></div>
        <div class="about-cat__ear about-cat__ear--right"></div>
      </div>

      <div class="about-cat__face">
        <div class="about-cat__eyes">
          <div class="about-cat__eye about-cat__eye--left">
            <div class="about-cat__pupil"></div>
          </div>
          <div class="about-cat__eye about-cat__eye--right">
            <div class="about-cat__pupil"></div>
          </div>
        </div>

        <div class="about-cat__nose"></div>
        <div class="about-cat__mouth"></div>

        <div class="about-cat__whiskers about-cat__whiskers--left">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="about-cat__whiskers about-cat__whiskers--right">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="about-cat__tail"></div>
    </div>
  </div>

  <canvas id="about-pink-particles" class="about-pink-particles" aria-hidden="true"></canvas>

</div>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,800&display=swap">
<link rel="stylesheet" href="{{ '/assets/css/about-enhance.css' | relative_url }}">
<script src="{{ '/assets/js/about-enhance.js' | relative_url }}" defer></script>

<script src="{{ '/assets/js/starfield.js' | relative_url }}"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    initStarfield('starfield');
  });
</script>
