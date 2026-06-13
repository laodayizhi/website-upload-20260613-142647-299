(() => {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", () => {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const tabs = Array.from(slider.querySelectorAll("[data-hero-tab]"));
        let activeIndex = 0;
        let timer = null;

        const showSlide = (index) => {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            tabs.forEach((tab, tabIndex) => {
                tab.classList.toggle("is-active", tabIndex === activeIndex);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                showSlide(index);
                start();
            });
        });

        showSlide(0);
        start();
    }

    const searchForms = document.querySelectorAll("[data-search-form]");

    searchForms.forEach((form) => {
        form.addEventListener("submit", () => {
            const input = form.querySelector("input[name='q']");
            if (input) {
                input.value = input.value.trim();
            }
        });
    });

    const panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach((panel) => {
        const input = panel.querySelector("[data-filter-input]");
        const category = panel.querySelector("[data-filter-category]");
        const year = panel.querySelector("[data-filter-year]");
        const list = panel.parentElement ? panel.parentElement.querySelector("[data-card-list]") : null;
        const cards = list ? Array.from(list.querySelectorAll("[data-card]")) : [];

        if (!cards.length) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (query && input) {
            input.value = query;
        }

        const filter = () => {
            const text = input ? input.value.trim().toLowerCase() : "";
            const selectedCategory = category ? category.value : "";
            const selectedYear = year ? year.value : "";

            cards.forEach((card) => {
                const haystack = card.dataset.search || "";
                const cardCategory = card.dataset.category || "";
                const cardYear = card.dataset.year || "";
                const matchedText = !text || haystack.includes(text);
                const matchedCategory = !selectedCategory || cardCategory === selectedCategory;
                const matchedYear = !selectedYear || cardYear === selectedYear;
                card.classList.toggle("is-hidden", !(matchedText && matchedCategory && matchedYear));
            });
        };

        [input, category, year].forEach((element) => {
            if (element) {
                element.addEventListener("input", filter);
                element.addEventListener("change", filter);
            }
        });

        filter();
    });
})();
