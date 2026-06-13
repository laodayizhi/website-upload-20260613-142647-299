(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var channelFilter = document.querySelector('[data-filter-channel]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function includesValue(text, value) {
    return !value || String(text || '').indexOf(value) !== -1;
  }

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var typeValue = typeFilter ? typeFilter.value : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var channelValue = channelFilter ? channelFilter.value : '';

    cards.forEach(function (card) {
      var searchText = String(card.getAttribute('data-search') || '').toLowerCase();
      var title = String(card.getAttribute('data-title') || '').toLowerCase();
      var matchQuery = !query || searchText.indexOf(query) !== -1 || title.indexOf(query) !== -1;
      var matchType = includesValue(card.getAttribute('data-type'), typeValue);
      var matchYear = includesValue(card.getAttribute('data-year'), yearValue);
      var matchChannel = !channelValue || card.getAttribute('data-channel') === channelValue;

      card.classList.toggle('is-hidden', !(matchQuery && matchType && matchYear && matchChannel));
    });
  }

  [searchInput, typeFilter, yearFilter, channelFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    }
  });

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var source = video ? video.querySelector('source') : null;
    var hlsInstance = null;

    function prepareVideo() {
      if (!video || !source) {
        return;
      }

      var src = source.getAttribute('src');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', src);
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        }
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
    }

    function startVideo() {
      prepareVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    prepareVideo();

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
  }
})();
