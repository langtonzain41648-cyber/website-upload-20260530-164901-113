(function () {
  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      const open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function cardText(card) {
    return normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
  }

  function setupSearch() {
    const forms = Array.from(document.querySelectorAll(".site-search"));
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    const index = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    forms.forEach(function (form) {
      const input = form.querySelector(".site-search-input");
      const results = form.querySelector(".search-results");
      if (!input || !results) {
        return;
      }
      function renderResults(value) {
        const q = normalize(value);
        if (!q) {
          results.classList.remove("open");
          results.innerHTML = "";
          cards.forEach(function (card) {
            card.classList.remove("hidden-by-search");
          });
          return;
        }
        let shown = 0;
        cards.forEach(function (card) {
          const matched = cardText(card).indexOf(q) !== -1;
          card.classList.toggle("hidden-by-search", !matched);
        });
        const matches = index.filter(function (item) {
          return normalize(item.title + " " + item.meta + " " + item.text).indexOf(q) !== -1;
        }).slice(0, 8);
        results.innerHTML = matches.map(function (item) {
          shown += 1;
          return '<a href="' + item.url + '"><img src="' + item.image + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><span>' + item.text + '</span></span></a>';
        }).join("");
        results.classList.toggle("open", shown > 0);
      }
      input.addEventListener("input", function () {
        renderResults(input.value);
      });
      form.addEventListener("submit", function (event) {
        const q = normalize(input.value);
        if (!q) {
          return;
        }
        const first = index.find(function (item) {
          return normalize(item.title + " " + item.meta + " " + item.text).indexOf(q) !== -1;
        });
        if (first) {
          event.preventDefault();
          window.location.href = first.url;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          results.classList.remove("open");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
