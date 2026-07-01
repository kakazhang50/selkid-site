(function () {
  'use strict';

  var PAGE_SIZE = 24;
  var WAITLIST_KEY = 'selkid_waitlist_v1';

  function initNav() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var toggle = header.querySelector('.nav-toggle');
    var nav = header.querySelector('.nav');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    }
    if (nav) {
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          header.classList.remove('nav-open');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
          }
        });
      });
    }
    if (header.classList.contains('site-header--hero')) {
      window.addEventListener(
        'scroll',
        function () {
          header.classList.toggle('scrolled', window.scrollY > 48);
        },
        { passive: true }
      );
    } else {
      header.classList.add('solid');
    }
  }

  function initReveal() {
    var nodes = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initEmailForms() {
    document.querySelectorAll('[data-email-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var note = form.querySelector('.form-note');
        var btn = form.querySelector('button[type="submit"]');
        var endpoint = (form.getAttribute('data-endpoint') || '').trim();
        var sample = form.getAttribute('data-free-sample') || '';
        if (!input || !input.value) return;
        var email = input.value.trim();
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Sending…';
        }
        var payload = {
          email: email,
          _subject: 'SELKID newsletter signup',
          tags: 'selkid-newsletter',
          source: form.getAttribute('data-form-context') || 'form',
          page: window.location.pathname,
        };
        var done = function (mode) {
          if (sample) {
            note.innerHTML =
              'You\'re on the list! <a href="' +
              sample +
              '" target="_blank" rel="noopener">Download your free sample</a>.';
          } else if (mode === 'local') {
            note.textContent =
              "You're on the list! We'll email your free Training Data sample when delivery is live.";
          } else {
            note.textContent = "You're on the list! Check your inbox for updates from SELKID.";
          }
          input.value = '';
        };
        if (!endpoint) {
          try {
            var list = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
            if (list.indexOf(email) === -1) list.push(email);
            localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
          } catch (e) {}
          done('local');
          if (btn) {
            btn.disabled = false;
            btn.textContent = btn.getAttribute('data-label') || 'Join';
          }
          return;
        }
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            if (!res.ok) throw new Error('fail');
            done('remote');
          })
          .catch(function () {
            note.textContent = 'Something went wrong. Please try again.';
          })
          .finally(function () {
            if (btn) {
              btn.disabled = false;
              btn.textContent = btn.getAttribute('data-label') || 'Join';
            }
          });
      });
      var btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.getAttribute('data-label')) btn.setAttribute('data-label', btn.textContent);
    });
  }

  function productCard(product) {
    var img = product.coverUrl || product.localImage || '/assets/covers/sel-waiting-cover.png';
    if (img.indexOf('/') !== 0 && img.indexOf('http') !== 0) img = '/' + img;
    var title = (product.title || '').replace(/"/g, '&quot;');
    return (
      '<article class="product-card"><a class="product-link" href="' +
      product.tptUrl +
      '" target="_blank" rel="noopener"><div class="product-cover"><img src="' +
      img +
      '" alt="' +
      title +
      '" loading="lazy"></div><div class="product-body">' +
      (product.grades ? '<span class="product-grade">' + product.grades + '</span>' : '') +
      (product.category ? '<span class="product-cat">' + product.category + '</span>' : '') +
      '<h3 class="product-title">' +
      product.title +
      '</h3>' +
      (product.price ? '<span class="product-price">' + product.price + '</span>' : '') +
      '<span class="product-cta">View on TPT</span></div></a></article>'
    );
  }

  function initCatalogFilter() {
    var bar = document.querySelector('[data-filter-bar]');
    var grid = document.querySelector('[data-catalog-grid]');
    if (!bar || !grid) return;
    var pillar = grid.getAttribute('data-catalog') || 'sel';
    var state = { pillar: pillar, category: 'all', search: '' };
    var allProducts = [];
    var shown = PAGE_SIZE;

    function render() {
      var list = allProducts.filter(function (p) {
        if (p.pillar !== state.pillar) return false;
        if (state.category !== 'all' && p.categoryId !== state.category) return false;
        if (state.search && (p.title || '').toLowerCase().indexOf(state.search) === -1) return false;
        return true;
      });
      var slice = list.slice(0, shown);
      grid.innerHTML = slice.length
        ? slice.map(productCard).join('')
        : '<p class="grid-empty">No resources match this filter.</p>';
      var wrap = grid.parentElement;
      var existing = wrap.querySelector('[data-load-more]');
      if (existing) existing.remove();
      if (shown < list.length) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary load-more-btn';
        btn.setAttribute('data-load-more', '');
        btn.textContent = 'Load more (' + (list.length - shown) + ' remaining)';
        btn.addEventListener('click', function () {
          shown = Math.min(shown + PAGE_SIZE, list.length);
          render();
        });
        wrap.appendChild(btn);
      }
    }

    fetch('/data/catalog.json')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        allProducts = data.products || [];
        render();
        var params = new URLSearchParams(window.location.search);
        var cat = params.get('category');
        if (cat) {
          var btn = bar.querySelector('.filter-btn[data-category="' + cat + '"]');
          if (btn) btn.click();
        }
      });

    bar.addEventListener('click', function (event) {
      var btn = event.target.closest('.filter-btn');
      if (!btn) return;
      var group = btn.getAttribute('data-filter-group');
      bar.querySelectorAll('.filter-btn[data-filter-group="' + group + '"]').forEach(function (el) {
        el.classList.remove('active');
      });
      btn.classList.add('active');
      if (group === 'category') state.category = btn.getAttribute('data-category') || 'all';
      shown = PAGE_SIZE;
      render();
    });

    var search = bar.querySelector('[data-search]');
    if (search) {
      search.addEventListener('input', function () {
        state.search = search.value.trim().toLowerCase();
        shown = PAGE_SIZE;
        render();
      });
    }
  }

  function boot() {
    initNav();
    initReveal();
    initEmailForms();
    initCatalogFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
