(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    if (!slides.length || !thumbs.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('active', thumbIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5600);
    }
    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function bindFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
      var section = input.closest('.section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-filter-type]'));
      var type = 'all';
      function apply() {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title'));
          var cardType = normalize(card.getAttribute('data-type'));
          var typeMatch = type === 'all' || cardType.indexOf(normalize(type)) !== -1;
          var textMatch = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !(typeMatch && textMatch));
        });
      }
      input.addEventListener('input', apply);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          type = button.getAttribute('data-filter-type') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
    });
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var overlay = wrap.querySelector('.player-overlay');
      var stream = wrap.getAttribute('data-stream');
      var prepared = false;
      function prepare() {
        if (prepared || !video || !stream) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        prepare();
        wrap.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            wrap.classList.remove('is-playing');
          });
        }
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          wrap.classList.add('is-playing');
        });
      }
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-play-jump]')).forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('[data-player]');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var button = player.querySelector('.player-overlay');
        if (button) {
          button.click();
        }
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
    bindPlayers();
  });
})();
