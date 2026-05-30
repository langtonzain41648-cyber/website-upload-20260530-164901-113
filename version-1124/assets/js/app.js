document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var heroCards = Array.prototype.slice.call(document.querySelectorAll(".hero-card"));
  if (heroCards.length > 1) {
    var activeIndex = 0;
    heroCards[0].classList.add("is-active");
    window.setInterval(function () {
      heroCards[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % heroCards.length;
      heroCards[activeIndex].classList.add("is-active");
    }, 4200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var resultCount = document.querySelector("[data-result-count]");
    var emptyState = document.querySelector("[data-empty-state]");

    var update = function () {
      var query = filterInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = query === "" || haystack.indexOf(query) !== -1;
        card.classList.toggle("is-hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = String(visible);
      }

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    };

    filterInput.addEventListener("input", update);
    update();
  }
});
