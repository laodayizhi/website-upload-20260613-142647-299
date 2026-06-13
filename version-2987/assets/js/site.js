(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-nav');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initGlobalSearch() {
        queryAll('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = './search.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var slides = queryAll('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = queryAll('.hero-dot');
        var next = document.querySelector('[data-hero-next]');
        var prev = document.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        start();
    }

    function initFilters() {
        var panels = queryAll('.movie-filter');
        panels.forEach(function (panel) {
            var input = panel.querySelector('.movie-search-input');
            var root = panel.parentElement || document;
            var cards = queryAll('.movie-card', root);
            var empty = root.querySelector('.empty-state');
            var state = panel.querySelector('.filter-state');
            var selects = queryAll('.filter-select', panel);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';

            if (input && q) {
                input.value = q;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = true;
                    if (keyword && (card.getAttribute('data-search') || '').indexOf(keyword) === -1) {
                        ok = false;
                    }
                    selects.forEach(function (select) {
                        var field = select.getAttribute('data-filter-field');
                        var selected = select.value;
                        if (selected && card.getAttribute('data-' + field) !== selected) {
                            ok = false;
                        }
                    });
                    card.classList.toggle('is-hidden-card', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
                if (state) {
                    state.textContent = visible ? '已显示匹配内容' : '';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('.movie-player');
        var overlay = document.querySelector('.player-overlay');
        var ready = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initGlobalSearch();
        initHero();
        initFilters();
    });
})();
