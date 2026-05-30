(function() {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var panel = document.querySelector('[data-search-panel]');
  var globalInputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));

  function renderSearch(query) {
    if (!panel) {
      return;
    }

    var q = (query || '').trim().toLowerCase();
    if (!q) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }

    var data = window.SEARCH_INDEX || [];
    var results = data.filter(function(item) {
      return [item.title, item.region, item.genre, item.year, item.category].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12);

    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">未找到相关影片</div>';
      panel.classList.add('is-open');
      return;
    }

    panel.innerHTML = results.map(function(item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.poster + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</em></span>' +
        '</a>';
    }).join('');
    panel.classList.add('is-open');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  }

  globalInputs.forEach(function(input) {
    input.addEventListener('input', function() {
      renderSearch(input.value);
    });
    input.addEventListener('focus', function() {
      renderSearch(input.value);
    });
  });

  document.addEventListener('click', function(event) {
    if (!panel) {
      return;
    }
    var target = event.target;
    var inSearch = target.closest && (target.closest('[data-search-panel]') || target.closest('[data-global-search]'));
    if (!inSearch) {
      panel.classList.remove('is-open');
    }
  });

  var filterSections = Array.prototype.slice.call(document.querySelectorAll('.filter-section'));
  filterSections.forEach(function(section) {
    var input = section.querySelector('.filter-input');
    var genre = section.querySelector('.genre-filter');
    var year = section.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var g = genre ? genre.value : '';
      var y = year ? year.value : '';

      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (g && (card.getAttribute('data-genre') || '').indexOf(g) === -1) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }

    [input, genre, year].forEach(function(el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });
  });
}());
