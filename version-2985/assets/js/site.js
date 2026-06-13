(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initMenu() {
        var header = qs('.site-header');
        var button = qs('.menu-toggle');
        if (!header || !button) {
            return;
        }
        button.addEventListener('click', function () {
            header.classList.toggle('menu-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var controls = qsa('.hero-control', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            controls.forEach(function (control, i) {
                control.classList.toggle('active', i === index);
            });
        }
        controls.forEach(function (control, i) {
            control.addEventListener('click', function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFilters() {
        qsa('[data-filter]').forEach(function (filter) {
            var input = qs('[data-filter-input]', filter);
            var select = qs('[data-filter-select]', filter);
            var yearSelect = qs('[data-year-select]', filter);
            var area = filter.closest('.main') || document;
            var cards = qsa('[data-card]', area);
            var empty = qs('[data-empty]', area);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (query && input) {
                input.value = query;
            }
            function apply() {
                var keyword = normalize(input ? input.value : '');
                var category = normalize(select ? select.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var hay = normalize(card.getAttribute('data-filter-text'));
                    var matchKeyword = !keyword || hay.indexOf(keyword) !== -1;
                    var matchCategory = !category || hay.indexOf(category) !== -1;
                    var ok = matchKeyword && matchCategory;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }
            function sortCards(direction) {
                var grid = cards[0] && cards[0].parentElement;
                if (!grid) {
                    return;
                }
                cards.sort(function (a, b) {
                    var ay = Number(a.getAttribute('data-year') || 0);
                    var by = Number(b.getAttribute('data-year') || 0);
                    return direction === 'asc' ? ay - by : by - ay;
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (select) {
                select.addEventListener('change', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', function () {
                    sortCards(yearSelect.value);
                    apply();
                });
            }
            apply();
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = qs('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                if (window.Hls) {
                    resolve();
                }
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function initPlayer() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video', player);
            var button = qs('.play-overlay', player);
            var stream = player.getAttribute('data-stream');
            var started = false;
            if (!video || !button || !stream) {
                return;
            }
            function mark() {
                player.classList.toggle('is-playing', !video.paused);
            }
            function attach() {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    return Promise.resolve();
                }
                return loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest').then(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        return;
                    }
                    video.src = stream;
                }).catch(function () {
                    video.src = stream;
                });
            }
            function play() {
                var ready = started ? Promise.resolve() : attach();
                started = true;
                ready.then(function () {
                    var result = video.play();
                    if (result && typeof result.then === 'function') {
                        result.then(mark).catch(mark);
                    } else {
                        mark();
                    }
                });
            }
            button.addEventListener('click', play);
            video.addEventListener('play', mark);
            video.addEventListener('pause', mark);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
