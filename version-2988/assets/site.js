(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupFiltering() {
    var input = document.getElementById('siteSearch');
    var category = document.getElementById('categoryFilter');
    var year = document.getElementById('yearFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var result = document.querySelector('[data-result-count]');

    if (!cards.length || (!input && !category && !year)) {
      return;
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var categoryValue = normalize(category ? category.value : '');
      var yearValue = normalize(year ? year.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = !categoryValue || haystack.indexOf(categoryValue) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var isVisible = matchesQuery && matchesCategory && matchesYear;

        card.classList.toggle('is-hidden', !isVisible);

        if (isVisible) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = String(visible);
      }
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');

      if (!video) {
        return;
      }

      function loadAndPlay() {
        var source = video.getAttribute('data-src');

        if (!source) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsInstance) {
            video.__hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video.__hlsInstance.loadSource(source);
            video.__hlsInstance.attachMedia(video);
          }
        } else {
          video.src = source;
        }

        if (button) {
          button.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', loadAndPlay);
      }

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
