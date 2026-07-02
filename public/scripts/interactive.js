(function () {
  'use strict';

  var PAGE_SIZE = 48;
  var COVER_FALLBACK = '/assets/covers/sel-waiting-cover.png';

  var SEARCH_SYNONYMS = {
    blurting: ['calling out', 'call out', 'interrupting', 'talking out', 'speak out', 'shout out'],
    waiting: ['wait', 'turn', 'patience', 'line', 'my turn'],
    hitting: ['hands', 'safe hands', 'gentle hands', 'boundaries', 'personal space'],
    regulation: ['calm', 'big feelings', 'emotional', 'self-control', 'reset'],
    friendship: ['friend', 'repair', 'apolog', 'left out'],
    executive: ['forget', 'directions', 'steps', 'memory', 'focus'],
  };

  var FACET_STATE_KEYS = ['scenario', 'trigger', 'emotion', 'skill', 'casel'];
  var WAITLIST_KEY = 'selkid_waitlist_v1';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function expandSearchTerms(q) {
    var terms = [q];
    Object.keys(SEARCH_SYNONYMS).forEach(function (key) {
      var syns = SEARCH_SYNONYMS[key];
      if (q.indexOf(key) !== -1 || syns.some(function (s) { return q.indexOf(s) !== -1; })) {
        terms.push(key);
        terms = terms.concat(syns);
      }
    });
    return terms.filter(function (t, i, arr) { return t && arr.indexOf(t) === i; });
  }

  function tagList(value) {
    if (!value) return [];
    return value.split('|').filter(Boolean);
  }

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

  function showFormNote(note, html, type) {
    if (!note) return;
    note.innerHTML = html;
    note.classList.remove('is-success', 'is-error');
    if (type) note.classList.add(type);
    note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function submitMailerLite(url, email) {
    var body = 'fields[email]=' + encodeURIComponent(email);
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: body,
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data && data.success) return data;
        throw new Error('fail');
      })
      .catch(function () {
        return new Promise(function (resolve, reject) {
          var cb = 'ml_cb_' + Date.now();
          var script = document.createElement('script');
          var settled = false;
          var finish = function (ok) {
            if (settled) return;
            settled = true;
            delete window[cb];
            if (script.parentNode) script.parentNode.removeChild(script);
            if (ok) resolve({ success: true });
            else reject(new Error('fail'));
          };
          window[cb] = function (data) {
            finish(Boolean(data && data.success));
          };
          script.src = url + '?callback=' + cb + '&' + body;
          script.onerror = function () {
            finish(false);
          };
          document.body.appendChild(script);
          window.setTimeout(function () {
            finish(false);
          }, 10000);
        });
      });
  }

  function successMessage(sample, mode) {
    if (sample) {
      var external = sample.indexOf('http') === 0;
      var attrs = external ? ' target="_blank" rel="noopener"' : '';
      return (
        '<strong>You\'re on the list!</strong> <a href="' +
        sample +
        '"' +
        attrs +
        '>Get your free sample</a>'
      );
    }
    if (mode === 'local') {
      return "<strong>You're on the list!</strong> Open your free sample — full 16-panel comic and partial lesson guides.";
    }
    return "<strong>You're on the list!</strong> Check your inbox for updates from SELKID.";
  }

  function initEmailForms() {
    document.querySelectorAll('[data-email-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var note = form.querySelector('.form-note');
        var btn = form.querySelector('button[type="submit"]');
        var endpoint = (form.getAttribute('data-endpoint') || '').trim();
        var mlUrl = (form.getAttribute('data-mailerlite-url') || '').trim();
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
          showFormNote(note, successMessage(sample, mode), 'is-success');
          input.value = '';
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Subscribed ✓';
          }
        };
        var fail = function () {
          showFormNote(note, 'Something went wrong. Please try again.', 'is-error');
          if (btn) {
            btn.disabled = false;
            btn.textContent = btn.getAttribute('data-label') || 'Get free sample';
          }
        };
        if (mlUrl) {
          submitMailerLite(mlUrl, email)
            .then(function () {
              done('remote');
            })
            .catch(fail);
          return;
        }
        if (!endpoint) {
          try {
            var list = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
            if (list.indexOf(email) === -1) list.push(email);
            localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
          } catch (e) {}
          done('local');
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
          .catch(fail);
      });
      var btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.getAttribute('data-label')) btn.setAttribute('data-label', btn.textContent);
    });
  }

  function cardMatches(card, state) {
    if (state.category !== 'all' && card.getAttribute('data-category-id') !== state.category) return false;
    if (state.thinkingSkill !== 'all') {
      var ts = tagList(card.getAttribute('data-thinking-skills'));
      if (ts.indexOf(state.thinkingSkill) === -1) return false;
    }
    var facetMap = {
      scenario: 'data-scenarios',
      trigger: 'data-triggers',
      emotion: 'data-emotions',
      skill: 'data-skills',
      casel: 'data-casel',
    };
    for (var i = 0; i < FACET_STATE_KEYS.length; i++) {
      var key = FACET_STATE_KEYS[i];
      if (!state[key]) continue;
      var attr = facetMap[key];
      var vals = tagList(card.getAttribute(attr));
      if (vals.indexOf(state[key]) === -1) return false;
    }
    if (state.search) {
      var hay = card.getAttribute('data-search') || '';
      var terms = expandSearchTerms(state.search);
      var hit = terms.some(function (t) {
        return hay.indexOf(t) !== -1;
      });
      if (!hit) return false;
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

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-product-card]'));
    if (!cards.length) return;

    var state = {
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
    var shown = PAGE_SIZE;
    var statusBar = bar.querySelector('[data-filter-status]');
    var countEl = bar.querySelector('[data-result-count]');
    var resultsBar = document.querySelector('[data-results-bar]');
    var resultsSummary = document.querySelector('[data-results-summary]');
    var activeFilterPills = document.querySelector('[data-active-filter-pills]');
    var resultsSection = document.querySelector('[data-catalog-results]');
    var hadUrlFilters = false;

    function facetLabel(facet, id) {
      var chip = bar.querySelector('.facet-chip[data-facet="' + facet + '"][data-facet-id="' + id + '"]');
      if (!chip) return id.replace(/-/g, ' ');
      var clone = chip.cloneNode(true);
      var em = clone.querySelector('em');
      if (em) em.remove();
      return clone.textContent.trim();
    }

    function categoryLabel(id) {
      var btn = bar.querySelector('[data-category="' + id + '"]');
      return btn ? btn.textContent.trim() : id;
    }

    function updateResultsBar(matched) {
      var hasFilters =
        activeFacets().length > 0 || state.preset || state.search || state.category !== 'all' || state.thinkingSkill !== 'all';
      if (resultsBar) resultsBar.hidden = !hasFilters;
      if (!hasFilters || !resultsSummary) return;

      var parts = [];
      if (state.category !== 'all') parts.push(categoryLabel(state.category));
      if (state.thinkingSkill !== 'all') {
        var tBtn = bar.querySelector('[data-thinking-skill="' + state.thinkingSkill + '"]');
        parts.push(tBtn ? tBtn.textContent.trim() : state.thinkingSkill);
      }
      FACET_STATE_KEYS.forEach(function (k) {
        if (state[k]) parts.push(facetLabel(k, state[k]));
      });
      if (state.search) parts.push('Search: “' + state.search + '”');

      var visible = Math.min(shown, matched.length);
      resultsSummary.textContent =
        matched.length +
        ' stor' +
        (matched.length === 1 ? 'y' : 'ies') +
        ' match' +
        (parts.length ? ' · ' + parts.join(' · ') : '') +
        (visible < matched.length ? ' (showing ' + visible + ')' : '');

      if (activeFilterPills) {
        activeFilterPills.innerHTML = '';
        parts.forEach(function (label) {
          var pill = document.createElement('span');
          pill.className = 'catalog-active-pill';
          pill.textContent = label;
          activeFilterPills.appendChild(pill);
        });
      }
    }

    function scrollToResults() {
      if (!resultsSection) return;
      var top = resultsSection.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

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
      bar.querySelectorAll('.catalog-preset').forEach(function (chip) {
        chip.classList.toggle('active', state.preset === chip.getAttribute('data-preset'));
      });
      bar.querySelectorAll('[data-filter-group]').forEach(function (pill) {
        var group = pill.getAttribute('data-filter-group');
        if (group === 'category') {
          pill.classList.toggle('active', pill.getAttribute('data-category') === state.category);
        }
        if (group === 'thinkingSkill') {
          pill.classList.toggle('active', pill.getAttribute('data-thinking-skill') === state.thinkingSkill);
        }
      });
      var hasFilters =
        activeFacets().length > 0 || state.preset || state.search || state.category !== 'all' || state.thinkingSkill !== 'all';
      if (statusBar) statusBar.hidden = !hasFilters;
      bar.querySelectorAll('[data-clear-filters]').forEach(function (btn) {
        btn.hidden = !hasFilters;
      });
    }

    function render() {
      var matched = cards.filter(function (card) {
        return cardMatches(card, state);
      });
      cards.forEach(function (card) {
        card.classList.add('catalog-card-hidden');
        card.classList.remove('catalog-card-filtered-out');
      });
      matched.forEach(function (card, index) {
        card.classList.remove('catalog-card-filtered-out');
        if (index < shown) card.classList.remove('catalog-card-hidden');
      });
      cards.forEach(function (card) {
        if (matched.indexOf(card) === -1) {
          card.classList.add('catalog-card-filtered-out');
          card.classList.add('catalog-card-hidden');
        }
      });

      var empty = grid.querySelector('.grid-empty-dynamic');
      if (empty) empty.remove();
      if (!matched.length) {
        var p = document.createElement('p');
        p.className = 'grid-empty grid-empty-dynamic';
        p.textContent = 'No resources match this combination. Try removing a filter or pick another quick pick.';
        grid.appendChild(p);
      }

      if (countEl) {
        var visible = Math.min(shown, matched.length);
        countEl.textContent =
          visible === matched.length
            ? matched.length + ' resource' + (matched.length === 1 ? '' : 's')
            : 'Showing ' + visible + ' of ' + matched.length;
      }

      updateResultsBar(matched);

      var wrap = resultsSection || grid.parentElement || grid;
      var existing = wrap.querySelector('[data-load-more]');
      if (existing) existing.remove();
      if (shown < matched.length) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary load-more-btn';
        btn.setAttribute('data-load-more', '');
        btn.textContent = 'Load more (' + (matched.length - shown) + ' remaining)';
        btn.addEventListener('click', function () {
          shown = Math.min(shown + PAGE_SIZE, matched.length);
          render();
        });
        wrap.appendChild(btn);
      }

      syncUrl(state);
      updateFacetUI();
    }

    function applyPreset(presetBtn) {
      clearMatrixFacets();
      state.category = 'all';
      state.thinkingSkill = 'all';
      bar.querySelectorAll('[data-filter-group="category"]').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-category') === 'all');
      });
      bar.querySelectorAll('[data-filter-group="thinkingSkill"]').forEach(function (el) {
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
        var catBtn = bar.querySelector('[data-category="' + cat + '"]');
        if (catBtn) {
          bar.querySelectorAll('[data-filter-group="category"]').forEach(function (el) {
            el.classList.remove('active');
          });
          catBtn.classList.add('active');
        }
      }
      state.preset = presetBtn.getAttribute('data-preset');
      shown = PAGE_SIZE;
      render();
      scrollToResults();
    }

    function applyParams(params) {
      var presetId = params.get('preset');
      if (presetId) {
        var presetBtn = bar.querySelector('.catalog-preset[data-preset="' + presetId + '"]');
        if (presetBtn) {
          applyPreset(presetBtn);
          return;
        }
      }
      var cat = params.get('category');
      if (cat) {
        state.category = cat;
        var catBtn = bar.querySelector('[data-category="' + cat + '"]');
        if (catBtn) {
          bar.querySelectorAll('[data-filter-group="category"]').forEach(function (el) {
            el.classList.remove('active');
          });
          catBtn.classList.add('active');
        }
      }
      var think = params.get('thinkingSkill');
      if (think) {
        state.thinkingSkill = think;
        var thinkBtn = bar.querySelector('[data-thinking-skill="' + think + '"]');
        if (thinkBtn) {
          bar.querySelectorAll('[data-filter-group="thinkingSkill"]').forEach(function (el) {
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
      hadUrlFilters =
        activeFacets().length > 0 ||
        state.category !== 'all' ||
        state.thinkingSkill !== 'all' ||
        !!state.search;
      if (hadUrlFilters) {
        var advanced = bar.querySelector('.catalog-advanced');
        if (advanced) advanced.open = true;
      }
    }

    applyParams(new URLSearchParams(window.location.search));
    cards.forEach(function (card, index) {
      if (index >= PAGE_SIZE) card.classList.add('catalog-card-hidden');
    });
    render();
    if (hadUrlFilters) {
      window.setTimeout(scrollToResults, 120);
    }

    bar.addEventListener('click', function (event) {
      var preset = event.target.closest('.catalog-preset');
      if (preset) {
        if (state.preset === preset.getAttribute('data-preset')) {
          clearMatrixFacets();
          state.category = 'all';
          bar.querySelectorAll('[data-filter-group="category"]').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-category') === 'all');
          });
        } else {
          applyPreset(preset);
        }
        return;
      }

      var btn = event.target.closest('[data-filter-group]');
      if (btn) {
        var group = btn.getAttribute('data-filter-group');
        bar.querySelectorAll('[data-filter-group="' + group + '"]').forEach(function (el) {
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
        scrollToResults();
        return;
      }

      var chip = event.target.closest('.facet-chip');
      if (chip) {
        var facet = chip.getAttribute('data-facet');
        var id = chip.getAttribute('data-facet-id');
        if (facet === 'thinkingSkill') {
          state.thinkingSkill = state.thinkingSkill === id ? 'all' : id;
          bar.querySelectorAll('[data-filter-group="thinkingSkill"]').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-thinking-skill') === state.thinkingSkill);
          });
        } else {
          state[facet] = state[facet] === id ? '' : id;
        }
        state.preset = '';
        shown = PAGE_SIZE;
        render();
        scrollToResults();
        return;
      }

      var clear = event.target.closest('[data-clear-filters]');
      if (clear) {
        clearMatrixFacets();
        state.category = 'all';
        state.thinkingSkill = 'all';
        state.search = '';
        var searchInput = bar.querySelector('[data-search]');
        if (searchInput) searchInput.value = '';
        bar.querySelectorAll('[data-filter-group]').forEach(function (el) {
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
        if (state.search) scrollToResults();
      });
    }
  }

  function initCoverFallback() {
    document.addEventListener(
      'error',
      function (event) {
        var img = event.target;
        if (!img || img.tagName !== 'IMG') return;
        var fallback = img.getAttribute('data-fallback');
        if (fallback && img.src.indexOf(fallback) === -1) {
          img.src = fallback;
        }
      },
      true
    );
  }

  function boot() {
    initNav();
    initReveal();
    initEmailForms();
    initCoverFallback();
    initCatalogFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
