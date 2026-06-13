(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot") || 0);
                show(index);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var area = panel.parentElement;
            if (!area) {
                return;
            }
            var input = panel.querySelector(".js-filter-input");
            var year = panel.querySelector(".js-filter-year");
            var category = panel.querySelector(".js-filter-category");
            var cards = Array.prototype.slice.call(area.querySelectorAll(".js-filter-card"));
            function apply() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var minYear = year && year.value ? Number(year.value) : 0;
                var cat = category ? category.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var cardYear = Number(card.getAttribute("data-year") || 0);
                    var cardCategory = card.getAttribute("data-category") || "";
                    var visible = true;
                    if (term && text.indexOf(term) === -1) {
                        visible = false;
                    }
                    if (minYear && cardYear < minYear) {
                        visible = false;
                    }
                    if (cat && cardCategory !== cat) {
                        visible = false;
                    }
                    card.classList.toggle("is-filter-hidden", !visible);
                });
            }
            [input, year, category].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var startButton = document.querySelector(".player-start");
    if (!video || !startButton || !streamUrl) {
        return;
    }
    var loaded = false;
    var hlsInstance = null;
    function loadStream() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function playVideo() {
        loadStream();
        startButton.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                startButton.classList.remove("is-hidden");
            });
        }
    }
    startButton.addEventListener("click", function (event) {
        event.preventDefault();
        playVideo();
    });
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function () {
        startButton.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            startButton.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
