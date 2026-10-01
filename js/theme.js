(function () {
  var stored = localStorage.getItem('theme');
  var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', theme);
})();

// Browsers restore the previous scroll position on refresh by default.
// If that happens before the pinned Long Boxes section finishes its
// layout math, GSAP ScrollTrigger's pin-spacer gets sized against a
// scrolled-down viewport instead of the top of the page, and the
// section ends up stuck at the wrong spot once you scroll back up.
// Reloading always at the top sidesteps that race entirely.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', function () {
  var toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;
  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      function apply() {
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
      }
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && document.startViewTransition) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    });
  });
});
