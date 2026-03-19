// Navigation mobile toggle — armateurscotiers.fr
(function () {
  'use strict';
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-mobile');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.setAttribute('data-open', String(!expanded));
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('data-open', 'false');
      toggle.focus();
    }
  });
})();
