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
    var tags = product.selTags || {};
    var meta = product.matrixMeta || {};
    var tagHtml = '';
    var tagLabel = '';
    if (meta.mechanism && meta.mechanism.en) {
      tagLabel = meta.mechanism.en;
    } else if (product.pillar === 'thinking' && tags.thinkingSkills && tags.thinkingSkills[0]) {
      tagLabel = tags.thinkingSkills[0].replace(/-/g, ' ');
    } else if (tags.skills && tags.skills[0]) {
      tagLabel = tags.skills[0].replace(/-/g, ' ');
    }
    if (tagLabel) {
      tagHtml = '<span class="product-matrix-tag">' + tagLabel + '</span>';
    }
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
      tagHtml +
      '<h3 class="product-title">' +
      product.title +
      '</h3>' +
      (product.price ? '<span class="product-price">' + product.price + '</span>' : '') +
      '<span class="product-cta">View on TPT</span></div></a></article>'
    );
  }

  var FACET_KEYS = {
    scenario: 'scenarios',
    trigger: 'triggers',
    emotion: 'emotions',
    skill: 'skills',
    casel: 'casel',
    thinkingSkill: 'thinkingSkills',
  };

  var FACET_STATE_KEYS = ['scenario', 'trigger', 'emotion', 'skill', 'casel'];

  function productMatchesFacets(product, facets) {
    var tags = product.selTags || {};
    for (var key in facets) {
      if (!facets[key]) continue;
      var arr = tags[FACET_KEYS[key]] || [];
      if (arr.indexOf(facets[key]) === -1) return false;
    }
    return true;
  }

  function syncUrl(state) {
    var params = new URLSearchParams();
    if (state.category && state.category !== 'all') params.set('category', state.category);
    if (state.thinkingSkill && state.thinkingSkill !== 'all') params.set('thinkingSkill', state.thinkingSkill);
    FACET_STATE_KEYS.forEach(function (k) {
      if (state[k]) params.set(k, state[k]);
    });
    if (state.preset) params.set('preset', state.preset);
    if (state.search) params.set('q', state.search);
    var qs = params.toString();
    var next = window.location.pathname + (qs ? '?' + qs : '');
    if (next !== window.location.pathname + window.location.search) {
      history.replaceState(null, '', next);
    }
  }

  function initCatalogFilter() {
    var bar = document.querySelector('[data-filter-bar]');
    var grid = document.querySelector('[data-catalog-grid]');
    if (!bar || !grid) return;
    var pillar = grid.getAttribute('data-catalog') || bar.getAttribute('data-filter-pillar') || 'sel';
    var state = {
      pillar: pillar,
      category: 'all',
      thinkingSkill: 'all',
      scenario: '',
      trigger: '',
      emotion: '',
      skill: '',
      casel: '',
      preset: '',
      search: '',
    };
    var allProducts = [];
    var shown = PAGE_SIZE;
    var statusBar = bar.querySelector('[data-filter-status]');
    var countEl = bar.querySelector('[data-result-count]');

    function activeFacets() {
      return FACET_STATE_KEYS.filter(function (k) {
        return !!state[k];
      });
    }

    function clearMatrixFacets() {
      FACET_STATE_KEYS.forEach(function (k) {
        state[k] = '';
      });
      state.preset = '';
    }

    function updateFacetUI() {
      bar.querySelectorAll('.facet-chip').forEach(function (chip) {
        var facet = chip.getAttribute('data-facet');
        var id = chip.getAttribute('data-facet-id');
        if (facet === 'thinkingSkill') {
          chip.classList.toggle('active', state.thinkingSkill === id);
        } else {
          chip.classList.toggle('active', state[facet] === id);
        }
      });
      bar.querySelectorAll('.preset-chip').forEach(function (chip) {
        chip.classList.toggle('active', state.preset === chip.getAttribute('data-preset'));
      });
      var hasFilters =
        activeFacets().length > 0 || state.preset || state.search || state.category !== 'all' || state.thinkingSkill !== 'all';
      if (statusBar) statusBar.hidden = !hasFilters;
    }

    function render() {
      var list = allProducts.filter(function (p) {
        if (p.pillar !== state.pillar) return false;
        if (state.category !== 'all' && p.categoryId !== state.category) return false;
        if (state.thinkingSkill !== 'all') {
          var ts = (p.selTags && p.selTags.thinkingSkills) || [];
          if (ts.indexOf(state.thinkingSkill) === -1) return false;
        }
        if (!productMatchesFacets(p, state)) return false;
        if (state.search && (p.title || '').toLowerCase().indexOf(state.search) === -1) return false;
        return true;
      });
      var slice = list.slice(0, shown);
      grid.innerHTML = slice.length
        ? slice.map(productCard).join('')
        : '<p class="grid-empty">No resources match this combination. Try removing a filter or pick another quick pick.</p>';
      if (countEl) {
        countEl.textContent =
          list.length + ' stor' + (list.length === 1 ? 'y' : 'ies') + ' match' + (list.length === 1 ? 'es' : '');
      }
      var wrap = grid.parentElement;
      if (wrap) {
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
      syncUrl(state);
      updateFacetUI();
    }

    function applyPreset(presetBtn) {
      clearMatrixFacets();
      state.category = 'all';
      state.thinkingSkill = 'all';
      bar.querySelectorAll('.filter-btn[data-filter-group="category"]').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-category') === 'all');
      });
      bar.querySelectorAll('.filter-btn[data-filter-group="thinkingSkill"]').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-thinking-skill') === 'all');
      });
      var filters = {};
      try {
        filters = JSON.parse(presetBtn.getAttribute('data-preset-filters') || '{}');
      } catch (e) {}
      Object.keys(filters).forEach(function (k) {
        if (FACET_STATE_KEYS.indexOf(k) !== -1) state[k] = filters[k];
      });
      var cat = presetBtn.getAttribute('data-preset-category');
      if (cat) {
        state.category = cat;
        var catBtn = bar.querySelector('.filter-btn[data-category="' + cat + '"]');
        if (catBtn) {
          bar.querySelectorAll('.filter-btn[data-filter-group="category"]').forEach(function (el) {
            el.classList.remove('active');
          });
          catBtn.classList.add('active');
        }
      }
      state.preset = presetBtn.getAttribute('data-preset');
      shown = PAGE_SIZE;
      render();
    }

    function applyParams(params) {
      var presetId = params.get('preset');
      if (presetId) {
        var presetBtn = bar.querySelector('.preset-chip[data-preset="' + presetId + '"]');
        if (presetBtn) {
          applyPreset(presetBtn);
          return;
        }
      }
      var cat = params.get('category');
      if (cat) {
        state.category = cat;
        var catBtn = bar.querySelector('.filter-btn[data-category="' + cat + '"]');
        if (catBtn) {
          bar.querySelectorAll('.filter-btn[data-filter-group="category"]').forEach(function (el) {
            el.classList.remove('active');
          });
          catBtn.classList.add('active');
        }
      }
      var think = params.get('thinkingSkill');
      if (think) {
        state.thinkingSkill = think;
        var thinkBtn = bar.querySelector('.filter-btn[data-thinking-skill="' + think + '"]');
        if (thinkBtn) {
          bar.querySelectorAll('.filter-btn[data-filter-group="thinkingSkill"]').forEach(function (el) {
            el.classList.remove('active');
          });
          thinkBtn.classList.add('active');
        }
      }
      FACET_STATE_KEYS.forEach(function (k) {
        state[k] = params.get(k) || '';
      });
      var q = params.get('q');
      if (q) {
        state.search = q.toLowerCase();
        var search = bar.querySelector('[data-search]');
        if (search) search.value = q;
      }
    }

    fetch('/data/catalog.json')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        allProducts = data.products || [];
        applyParams(new URLSearchParams(window.location.search));
        render();
      });

    bar.addEventListener('click', function (event) {
      var preset = event.target.closest('.preset-chip');
      if (preset) {
        if (state.preset === preset.getAttribute('data-preset')) {
          clearMatrixFacets();
          state.category = 'all';
          bar.querySelectorAll('.filter-btn[data-filter-group="category"]').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-category') === 'all');
          });
        } else {
          applyPreset(preset);
        }
        return;
      }

      var btn = event.target.closest('.filter-btn');
      if (btn) {
        var group = btn.getAttribute('data-filter-group');
        bar.querySelectorAll('.filter-btn[data-filter-group="' + group + '"]').forEach(function (el) {
          el.classList.remove('active');
        });
        btn.classList.add('active');
        if (group === 'category') {
          state.category = btn.getAttribute('data-category') || 'all';
          state.preset = '';
        }
        if (group === 'thinkingSkill') {
          state.thinkingSkill = btn.getAttribute('data-thinking-skill') || 'all';
        }
        shown = PAGE_SIZE;
        render();
        return;
      }

      var chip = event.target.closest('.facet-chip');
      if (chip) {
        var facet = chip.getAttribute('data-facet');
        var id = chip.getAttribute('data-facet-id');
        if (facet === 'thinkingSkill') {
          state.thinkingSkill = state.thinkingSkill === id ? 'all' : id;
          bar.querySelectorAll('.filter-btn[data-filter-group="thinkingSkill"]').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-thinking-skill') === state.thinkingSkill);
          });
        } else {
          state[facet] = state[facet] === id ? '' : id;
        }
        state.preset = '';
        shown = PAGE_SIZE;
        render();
        return;
      }

      var clear = event.target.closest('[data-clear-filters]');
      if (clear) {
        clearMatrixFacets();
        state.category = 'all';
        state.thinkingSkill = 'all';
        bar.querySelectorAll('.filter-btn').forEach(function (el) {
          var g = el.getAttribute('data-filter-group');
          if (!g) return;
          el.classList.toggle(
            'active',
            el.getAttribute('data-category') === 'all' || el.getAttribute('data-thinking-skill') === 'all'
          );
        });
        shown = PAGE_SIZE;
        render();
      }
    });

    var search = bar.querySelector('[data-search]');
    if (search) {
      search.addEventListener('input', function () {
        state.search = search.value.trim().toLowerCase();
        state.preset = '';
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
