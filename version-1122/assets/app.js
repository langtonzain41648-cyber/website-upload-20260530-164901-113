(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var queryInput = document.querySelector("[data-query-input]");
    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var value = params.get("q") || "";
      queryInput.value = value;
    }

    bindFilters();
  });

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindFilters() {
    var area = document.querySelector("[data-filter-area]");
    if (!area) {
      return;
    }

    var search = document.querySelector("[data-local-search]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var region = document.querySelector("[data-region-filter]");
    var count = document.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(area.querySelectorAll("[data-filter-card]"));

    function apply() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var r = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (q) {
          ok = normalize(card.getAttribute("data-search")).indexOf(q) !== -1;
        }
        if (ok && y) {
          ok = normalize(card.getAttribute("data-year")) === y;
        }
        if (ok && t) {
          ok = normalize(card.getAttribute("data-type")) === t;
        }
        if (ok && r) {
          ok = normalize(card.getAttribute("data-region")) === r;
        }
        card.classList.toggle("is-filter-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部作品";
      }
    }

    [search, year, type, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.setupVideoPlayer = function (source) {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-play-button]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !button) {
      return;
    }

    var loaded = false;
    function load() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      if (cover) {
        cover.classList.add("is-active");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", load);
    if (cover) {
      cover.addEventListener("click", function (event) {
        if (event.target === video && loaded) {
          return;
        }
        load();
      });
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        load();
      }
    });
  };
})();
