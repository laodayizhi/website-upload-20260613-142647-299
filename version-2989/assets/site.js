(function () {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-hidden");
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setSlide(dotIndex);
        startTimer();
      });
    });

    setSlide(0);
    startTimer();
  }

  const filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    const input = filterPanel.querySelector("[data-search-input]");
    const year = filterPanel.querySelector("[data-year-filter]");
    const type = filterPanel.querySelector("[data-type-filter]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(input ? input.value : "");
      const selectedYear = normalize(year ? year.value : "");
      const selectedType = normalize(type ? type.value : "");

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        const yearMatch = !selectedYear || normalize(card.dataset.year) === selectedYear;
        const typeMatch = !selectedType || normalize(card.dataset.type).indexOf(selectedType) !== -1;
        const queryMatch = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("is-filter-hidden", !(yearMatch && typeMatch && queryMatch));
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }

  const video = document.querySelector("[data-player]");
  const cover = document.querySelector("[data-player-cover]");

  if (video && cover && typeof playerConfig !== "undefined" && playerConfig.src) {
    let playerReady = false;
    let hls = null;

    function bindPlayer() {
      if (playerReady) {
        return;
      }
      playerReady = true;
      video.controls = true;
      video.poster = playerConfig.poster || video.poster;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playerConfig.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playerConfig.src);
        hls.attachMedia(video);
      } else {
        video.src = playerConfig.src;
      }
    }

    function playVideo() {
      bindPlayer();
      cover.classList.add("is-hidden");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    cover.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (!playerReady) {
        playVideo();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
