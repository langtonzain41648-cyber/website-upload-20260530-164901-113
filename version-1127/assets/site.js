(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindMenu() {
    const button = document.querySelector('.site-menu-button');
    const menu = document.querySelector('.site-mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindHero() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function bindFilters() {
    const input = document.getElementById('movie-search');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const chips = Array.from(document.querySelectorAll('.filter-chip'));
    const empty = document.querySelector('.empty-state');
    if (!input || !cards.length) {
      return;
    }
    let filter = 'all';
    function apply() {
      const query = normalize(input.value);
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category
        ].join(' '));
        const category = card.dataset.category || '';
        const matchQuery = !query || haystack.indexOf(query) !== -1;
        const matchFilter = filter === 'all' || category === filter;
        const show = matchQuery && matchFilter;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    input.addEventListener('input', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });
    apply();
  }

  window.initMoviePlayer = function (options) {
    const source = options && options.source;
    const video = document.getElementById(options && options.videoId || 'movie-player');
    const button = document.getElementById(options && options.buttonId || 'movie-start');
    if (!source || !video || !button) {
      return;
    }
    let ready = false;
    let requested = false;
    let hls = null;

    function playVideo() {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            playVideo();
          }
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
      ready = true;
    }

    function startPlayback() {
      requested = true;
      attachSource();
      button.classList.add('is-hidden');
      video.controls = true;
      if (!hls) {
        playVideo();
      } else {
        window.setTimeout(playVideo, 350);
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
