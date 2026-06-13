(function() {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function basePath() {
    return document.body.getAttribute("data-base") || "";
  }

  function text(value) {
    return String(value || "").replace(/[&<>"]/g, function(character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        """: "&quot;"
      }[character];
    });
  }

  function matches(item, query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      return false;
    }
    var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category, item.tags].join(" ").toLowerCase();
    return haystack.indexOf(q) !== -1;
  }

  function buildSearchItem(item, base) {
    return "<a class="search-item" href="" + base + item.url + "">" +
      "<img src="" + base + item.image + "" alt="" + text(item.title) + "" loading="lazy">" +
      "<span><strong>" + text(item.title) + "</strong><span>" + text(item.region + " · " + item.year + " · " + item.genre) + "</span></span>" +
      "</a>";
  }

  function buildSearchCard(item, base) {
    return "<a class="movie-card" href="" + base + item.url + "">" +
      "<div class="poster"><img src="" + base + item.image + "" alt="" + text(item.title) + "" loading="lazy"><span class="poster-kind">" + text(item.region) + "</span><span class="play-badge">▶</span></div>" +
      "<div class="card-body"><span class="card-pill">" + text(item.year || item.type) + "</span><h3 class="card-title">" + text(item.title) + "</h3><p class="card-text">" + text(item.genre) + "</p></div>" +
      "</a>";
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (button && nav) {
      button.addEventListener("click", function() {
        nav.classList.toggle("is-open");
      });
    }
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var active = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle("is-active", position === active);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle("is-active", position === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function() {
        show(active + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(active - 1);
        restart();
      });
    }

    dots.forEach(function(dot, position) {
      dot.addEventListener("click", function() {
        show(position);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initSearch() {
    var items = window.SEARCH_ITEMS || [];
    var base = basePath();
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var pageResults = document.querySelector("[data-search-page-results]");
    var pageInput = document.querySelector("[data-search-page-input]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    forms.forEach(function(form) {
      var input = form.querySelector("input[name='q']");
      var panel = form.querySelector("[data-search-panel]");

      if (!input || !panel) {
        return;
      }

      input.addEventListener("input", function() {
        var query = input.value;
        var results = items.filter(function(item) {
          return matches(item, query);
        }).slice(0, 8);

        if (!query.trim() || !results.length) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }

        panel.innerHTML = results.map(function(item) {
          return buildSearchItem(item, base);
        }).join("");
        panel.classList.add("is-open");
      });

      document.addEventListener("click", function(event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });

    if (pageInput) {
      pageInput.value = initialQuery;
    }

    function renderPageResults(query) {
      if (!pageResults) {
        return;
      }

      var results = items.filter(function(item) {
        return matches(item, query);
      }).slice(0, 72);

      if (!query.trim()) {
        pageResults.innerHTML = "<div class="empty-state">输入片名、类型、地区或年份，快速找到想看的内容。</div>";
        return;
      }

      if (!results.length) {
        pageResults.innerHTML = "<div class="empty-state">没有找到相关影片。</div>";
        return;
      }

      pageResults.innerHTML = results.map(function(item) {
        return buildSearchCard(item, base);
      }).join("");
    }

    if (pageResults) {
      renderPageResults(initialQuery);
      if (pageInput) {
        pageInput.addEventListener("input", function() {
          renderPageResults(pageInput.value);
        });
      }
    }
  }

  function initCardFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function(scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
      var state = {};

      buttons.forEach(function(button) {
        var field = button.getAttribute("data-filter-field");
        if (!state[field]) {
          state[field] = "all";
        }

        button.addEventListener("click", function() {
          var value = button.getAttribute("data-filter-value") || "all";
          state[field] = value;

          buttons.forEach(function(peer) {
            if (peer.getAttribute("data-filter-field") === field) {
              peer.classList.toggle("is-active", peer === button);
            }
          });

          cards.forEach(function(card) {
            var visible = Object.keys(state).every(function(key) {
              return state[key] === "all" || card.getAttribute("data-" + key) === state[key];
            });
            card.classList.toggle("is-filtered-out", !visible);
          });
        });
      });
    });
  }

  onReady(function() {
    initHeader();
    initHero();
    initSearch();
    initCardFilters();
  });
})();

function startMoviePlayer(streamUrl) {
  var video = document.querySelector(".js-player");
  var overlay = document.querySelector(".js-player-overlay");
  var prepared = false;
  var wanted = false;

  if (!video) {
    return;
  }

  function begin() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {
        setTimeout(function() {
          var retry = video.play();
          if (retry && typeof retry.catch === "function") {
            retry.catch(function() {});
          }
        }, 500);
      });
    }
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var player = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      player.loadSource(streamUrl);
      player.attachMedia(video);
      player.on(window.Hls.Events.MEDIA_ATTACHED, function() {
        if (wanted) {
          begin();
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function playNow() {
    wanted = true;
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    begin();
  }

  if (overlay) {
    overlay.addEventListener("click", playNow);
  }

  video.addEventListener("click", function() {
    if (!prepared || video.paused) {
      playNow();
    }
  });
}
