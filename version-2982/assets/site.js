(function () {
    var header = document.querySelector('[data-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 48) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
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
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var region = scope.querySelector('[data-filter-region]');
        var genre = scope.querySelector('[data-filter-genre]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var empty = scope.querySelector('[data-empty]');
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var genreValue = normalize(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year')
            ].join(' '));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardGenre = normalize(card.getAttribute('data-genre'));
            var queryMatch = !query || text.indexOf(query) !== -1;
            var regionMatch = !regionValue || cardRegion === regionValue;
            var genreMatch = !genreValue || cardGenre.indexOf(genreValue) !== -1;
            var shouldShow = queryMatch && regionMatch && genreMatch;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var controls = scope.querySelectorAll('[data-filter-input], [data-filter-region], [data-filter-genre]');
        controls.forEach(function (control) {
            control.addEventListener('input', function () {
                applyFilter(scope);
            });
            control.addEventListener('change', function () {
                applyFilter(scope);
            });
        });
        applyFilter(scope);
    });

    var searchScope = document.querySelector('[data-search-page]');
    if (searchScope) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var searchInput = searchScope.querySelector('[data-filter-input]');
        if (q && searchInput) {
            searchInput.value = q;
            applyFilter(searchScope);
        }
    }
})();
