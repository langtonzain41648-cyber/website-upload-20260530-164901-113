document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5600);
    }
  }

  var searchInput = document.querySelector("[data-site-search]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  var activeFilter = "";

  var applyFilters = function () {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var filterMatched = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle("hidden-by-filter", !(keywordMatched && filterMatched));
    });
  };

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter-value") || "";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyFilters();
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var playButton = player.querySelector("[data-play]");
    var status = player.querySelector("[data-player-status]");
    var src = player.getAttribute("data-src");
    var loaded = false;
    var hlsInstance = null;

    var setStatus = function (text) {
      if (status) {
        status.textContent = text;
      }
    };

    var loadVideo = function () {
      if (!video || !src || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = src;
      loaded = true;
    };

    var playVideo = function () {
      loadVideo();
      player.classList.add("is-playing");
      setStatus("正在加载，请稍候");

      var promise = video.play();

      if (promise && promise.catch) {
        promise.then(function () {
          setStatus("正在播放");
        }).catch(function () {
          player.classList.remove("is-playing");
          setStatus("请再次点击播放");
        });
      }
    };

    if (playButton && video) {
      playButton.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        setStatus("正在播放");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
        setStatus("已暂停");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
        setStatus("播放结束");
      });
    }
  });
});
