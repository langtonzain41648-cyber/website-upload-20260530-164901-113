(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('.js-mobile-toggle');
    var panel = qs('.js-mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('.js-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (slides.length < 2) return;
    var index = 0;

    function activate(next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) dots[index].classList.remove('is-active');
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) dots[index].classList.add('is-active');
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  function setupFilters() {
    var input = qs('.js-filter-input');
    var sort = qs('.js-sort-select');
    var cards = qsa('.js-filter-card');
    var empty = qs('.js-empty-state');
    var grid = qs('.js-filter-grid');
    if (!cards.length) return;

    function apply() {
      var keyword = input ? normalize(input.value) : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var ok = !keyword || haystack.indexOf(keyword) > -1;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    function sortCards() {
      if (!sort || !grid) return;
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
        var by = parseInt(b.getAttribute('data-year'), 10) || 0;
        var at = a.getAttribute('data-title') || '';
        var bt = b.getAttribute('data-title') || '';
        if (mode === 'oldest') return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
        if (mode === 'title') return at.localeCompare(bt, 'zh-Hans-CN');
        return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }

    if (input) input.addEventListener('input', apply);
    if (sort) sort.addEventListener('change', sortCards);
    apply();
  }

  function setupSearchPage() {
    var root = qs('.js-search-results');
    if (!root || !window.SITE_MOVIES) return;
    var input = qs('.js-search-page-input');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) input.value = query;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="movie-card__cover" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="movie-card__type">' + escapeHtml(movie.type) + '</span>',
        '<span class="movie-card__year">' + escapeHtml(movie.year) + '</span>',
        '<span class="movie-card__play">▶</span>',
        '</a>',
        '<div class="movie-card__body">',
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function render(value) {
      var keyword = normalize(value);
      var list = window.SITE_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return !keyword || haystack.indexOf(keyword) > -1;
      }).slice(0, 120);
      root.innerHTML = list.length
        ? list.map(card).join('')
        : '<div class="empty-state is-visible">没有找到匹配的影片内容</div>';
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  function setupPlayers() {
    qsa('.js-player').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('.player-overlay', player);
      var button = qs('.player-overlay__button', player);
      var url = player.getAttribute('data-url');
      var loaded = false;
      var hls = null;
      if (!video || !url) return;

      function load() {
        if (loaded) return;
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          video.src = url;
        }
      }

      function play() {
        load();
        if (overlay) overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) overlay.addEventListener('click', play);
      if (button) button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') hls.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
