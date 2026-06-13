(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
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
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var forms = document.querySelectorAll('[data-search-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      if (form.getAttribute('action') === 'movies.html' && window.location.pathname.endsWith('/movies.html')) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set('q', input.value.trim());
        window.history.replaceState({}, '', url.toString());
        filterCards(input.value.trim());
      }
    });
  });

  function filterCards(query) {
    var container = document.querySelector('[data-filter-container]');
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-search]'));
    var empty = document.querySelector('[data-empty-state]');
    var normalized = (query || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = !normalized || haystack.indexOf(normalized) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query) {
    var searchInputs = document.querySelectorAll('input[name="q"]');
    searchInputs.forEach(function (input) {
      input.value = query;
    });
    filterCards(query);
  }

  var players = document.querySelectorAll('[data-hls-player]');
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-source');
    var hls = null;
    var ready = false;
    var manifestReady = false;

    if (!video || !source) {
      return;
    }

    function initialize() {
      if (ready) {
        return Promise.resolve();
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            manifestReady = true;
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
          window.setTimeout(function () {
            if (!manifestReady) {
              resolve();
            }
          }, 1800);
        });
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      return Promise.resolve();
    }

    function playVideo() {
      initialize().then(function () {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      initialize();
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('playing');
      }
    });

    video.addEventListener('ended', function () {
      player.classList.remove('playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
