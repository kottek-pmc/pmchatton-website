// ============================================================
//  content.js — Runtime i18n content layer for pmchatton.com
//  No build step. No dependencies. Works with fetch() + .md files.
// ============================================================
(function () {

  var EXP_START_YEAR = 2005;

  // ── Language detection ────────────────────────────────────
  function detectLang() {
    const param = new URLSearchParams(location.search).get('lang');
    if (param && ['en', 'fr', 'es'].includes(param)) {
      localStorage.setItem('pmc_lang', param);
      return param;
    }
    const stored = localStorage.getItem('pmc_lang');
    if (stored && ['en', 'fr', 'es'].includes(stored)) return stored;
    return 'en';
  }

  // ── Markdown parser ───────────────────────────────────────
  // Splits on --- delimiters, returns { fm: {key:val}, sections: {name:text} }
  function parseMd(text) {
    const parts = text.split(/^---[ \t]*$/m);
    const fm = {};
    if (parts.length >= 3) {
      parts[1].split('\n').forEach(function (line) {
        var colon = line.indexOf(':');
        if (colon < 0) return;
        var key = line.slice(0, colon).trim();
        var val = line.slice(colon + 1).trim();
        if (key && key[0] !== '#') fm[key] = val;
      });
    }
    var bodyText = parts.length >= 3 ? parts.slice(2).join('---') : (parts[1] || '');
    var sections = {};
    var chunks = bodyText.split(/^## /m);
    chunks.forEach(function (chunk, i) {
      if (i === 0) return;
      var nl = chunk.indexOf('\n');
      if (nl < 0) return;
      var name = chunk.slice(0, nl).trim();
      var content = chunk.slice(nl + 1).trim();
      sections[name] = content;
    });
    return { fm: fm, sections: sections };
  }

  // ── Inline renderer: **bold** → <span class="metric"> ────
  function renderInline(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<span class="metric">$1</span>');
  }

  // ── Fetch with EN fallback ────────────────────────────────
  function fetchContent(lang, slug) {
    var base = isExpPage ? '..' : '.';
    var url = base + '/content/' + lang + '/' + slug + '.md';
    return fetch(url).then(function (res) {
      if (res.ok) return res.text();
      if (lang !== 'en') {
        return fetch(base + '/content/en/' + slug + '.md').then(function (r) {
          return r.ok ? r.text() : null;
        });
      }
      return null;
    });
  }

  // ── Pill renderer: "green | text" → pill HTML ────────────
  function renderPill(val) {
    var idx = val.indexOf('|');
    if (idx < 0) return '';
    var color = val.slice(0, idx).trim();
    var text = val.slice(idx + 1).trim();
    return '<span class="meta-pill pill-' + color + '">' + text + '</span>';
  }

  // ── Metric box renderer: "value | label | color" ─────────
  function renderMetricBox(val) {
    var parts = val.split('|').map(function (s) { return s.trim(); });
    if (parts.length < 3) return '';
    return '<div class="metric-box">' +
      '<div class="metric-box-value" style="color:var(--color-' + parts[2] + ')">' + parts[0] + '</div>' +
      '<div class="metric-box-label">' + parts[1] + '</div>' +
      '</div>';
  }

  // ── Helpers ───────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }
  function setText(id, text) { var e = el(id); if (e) e.textContent = text; }
  function setHtml(id, html) { var e = el(id); if (e) e.innerHTML = html; }

  // ── Language switcher ─────────────────────────────────────
  function injectLangSwitcher() {
    var container = el('lang-switcher');
    if (!container) return;
    ['en', 'fr', 'es'].forEach(function (l) {
      var btn = document.createElement('button');
      btn.className = 'lang-btn' + (l === lang ? ' lang-btn--active' : '');
      btn.textContent = l.toUpperCase();
      btn.onclick = function () {
        localStorage.setItem('pmc_lang', l);
        var url = new URL(location.href);
        url.searchParams.delete('lang');
        var target = url.toString();
        // location.href won't reload if URL is identical; use reload() as fallback
        if (target === location.href) {
          location.reload();
        } else {
          location.href = target;
        }
      };
      container.appendChild(btn);
    });
  }

  // ── Experience page loader ────────────────────────────────
  function loadExpPage() {
    fetchContent(lang, window.EXP_SLUG).then(function (text) {
      if (!text) return;
      var parsed = parseMd(text);
      var fm = parsed.fm;
      var sections = parsed.sections;

      // Window title
      setText('exp-window-title', fm.window_title || '');

      // Emoji + title + company
      setText('exp-emoji', fm.emoji || '');
      setText('exp-title', fm.title || '');
      setText('exp-company', fm.company || '');

      // Pills
      var pillsHtml = '';
      ['pill_1', 'pill_2', 'pill_3', 'pill_4'].forEach(function (k) {
        if (fm[k]) pillsHtml += renderPill(fm[k]);
      });
      setHtml('exp-pills', pillsHtml);

      // Section labels
      setText('exp-context-label', fm.context_label || 'Context');
      setText('exp-achievements-label', fm.achievements_label || 'Achievements');
      setText('exp-stack-label', fm.stack_label || 'Stack & Tools');
      setText('exp-metrics-label', fm.metrics_label || 'Key Metrics');

      // Context
      if (sections['Context']) {
        setHtml('exp-context', renderInline(sections['Context']));
      }

      // Achievements
      if (sections['Achievements']) {
        var lines = sections['Achievements'].split('\n');
        var achHtml = '';
        lines.forEach(function (line) {
          var item = line.replace(/^[-*]\s+/, '').trim();
          if (item) achHtml += '<li>' + renderInline(item) + '</li>';
        });
        setHtml('exp-achievements', achHtml);
      }

      // Key Clients (optional)
      var clientsBlock = el('exp-clients-block');
      if (clientsBlock) {
        if (fm.clients) {
          clientsBlock.style.display = '';
          setText('exp-clients-label', fm.clients_label || 'Key Clients');
          var clientsHtml = fm.clients.split(',').map(function (c) {
            return '<span class="tech-tag">' + c.trim() + '</span>';
          }).join('');
          setHtml('exp-clients', clientsHtml);
        } else {
          clientsBlock.style.display = 'none';
        }
      }

      // Stack
      if (fm.stack) {
        var stackHtml = fm.stack.split(',').map(function (t) {
          return '<span class="tech-tag">' + t.trim() + '</span>';
        }).join('');
        setHtml('exp-stack', stackHtml);
      }

      // Metrics
      var metricsBlock = el('exp-metrics-block');
      var metricsHtml = '';
      ['metric_1', 'metric_2', 'metric_3', 'metric_4'].forEach(function (k) {
        if (fm[k]) metricsHtml += renderMetricBox(fm[k]);
      });
      if (metricsHtml) {
        setHtml('exp-metrics', metricsHtml);
      } else if (metricsBlock) {
        metricsBlock.style.display = 'none';
      }

      // Navigation
      var navPrev = el('exp-nav-prev');
      if (navPrev) {
        navPrev.href = fm.nav_prev_url || '#';
        setText('exp-nav-prev-dir', fm.nav_prev_dir || '← Previous');
        setText('exp-nav-prev-label', fm.nav_prev_label || '');
      }
      var navNext = el('exp-nav-next');
      if (navNext) {
        navNext.href = fm.nav_next_url || '#';
        setText('exp-nav-next-dir', fm.nav_next_dir || 'Next →');
        setText('exp-nav-next-label', fm.nav_next_label || '');
      }

      // Footer company
      setText('exp-footer-company', fm.company_short || '');
    });
  }

  // ── Portfolio page loader ─────────────────────────────────
  function loadPortfolioPage() {
    fetch('content/portfolio.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        var grid = el('portfolio-grid');
        if (!grid) return;

        function renderCard(p) {
          var link = p.url
            ? '<a href="' + p.url + '" target="_blank" rel="noopener" class="btn btn-secondary" style="margin-top:4px">' +
              'Visit site →</a>'
            : '';
          return '<div class="portfolio-card">' +
            '<div class="portfolio-card-header">' +
            '<span class="portfolio-emoji">' + (p.emoji || '') + '</span>' +
            '<div>' +
            '<div class="portfolio-name">' + p.name + '</div>' +
            '<div class="portfolio-tagline">' + p.tagline + '</div>' +
            '</div></div>' +
            link +
            '</div>';
        }

        if (data.sections) {
          grid.innerHTML = data.sections.map(function (s) {
            return '<div class="section-sub" style="margin-bottom:10px;margin-top:18px">' + s.title + '</div>' +
              '<div class="portfolio-grid-row">' +
              s.projects.map(renderCard).join('') +
              '</div>';
          }).join('');
          // Remove top margin from first section label
          var first = grid.querySelector('.section-sub');
          if (first) first.style.marginTop = '0';
        } else {
          grid.innerHTML = '<div class="portfolio-grid-row">' +
            data.projects.map(renderCard).join('') +
            '</div>';
        }
      });
  }

  // ── Skills loader (from content/skills.json) ─────────────
  function loadSkills() {
    var base = isExpPage ? '..' : '.';
    fetch(base + '/content/skills.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;

        var skillsEl = el('skills-grid');
        if (skillsEl && data.skills) {
          skillsEl.innerHTML = data.skills.map(function (card) {
            return '<div class="skill-card">' +
              '<div class="skill-card-header">' +
              '<div class="skill-icon">' + card.icon + '</div>' +
              '<div class="skill-card-title">' + card.title + '</div>' +
              '</div><div class="skill-items">' +
              card.items.map(function (item) {
                return '<span class="skill-badge">' + item + '</span>';
              }).join('') +
              '</div></div>';
          }).join('');
        }

        var langEl = el('lang-grid');
        if (langEl && data.languages) {
          langEl.innerHTML = data.languages.map(function (l) {
            return '<div class="lang-card">' +
              '<div class="lang-name">' + l.flag + ' ' + l.name + '</div>' +
              '<div class="lang-level">' + l.level + '</div>' +
              '</div>';
          }).join('');
        }

        var eduEl = el('education-block');
        if (eduEl && data.education) {
          var cards = data.education.map(function (e) {
            return '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;' +
              'background:var(--color-surface-2);border:1px solid;' +
              'border-color:#888884 #ffffff #ffffff #888884;border-radius:2px;flex:1;min-width:220px">' +
              '<span style="font-size:24px;flex-shrink:0">' + e.icon + '</span><div>' +
              '<div style="font-weight:bold;font-size:13px;color:var(--color-text)">' + e.degree + '</div>' +
              '<div style="font-size:11px;color:var(--color-text-muted)">' + e.school + '</div>' +
              '<div style="font-family:var(--font-mono);font-size:10px;color:var(--color-text-subtle)">' + e.period + '</div>' +
              '</div></div>';
          }).join('');
          eduEl.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px">' + cards + '</div>';
        }
      });
  }

  // ── Home page loader ──────────────────────────────────────
  function loadHomePage() {
    fetchContent(lang, 'home').then(function (text) {
      if (!text) return;
      // Replace {{years_exp}} with computed value
      var years = new Date().getFullYear() - EXP_START_YEAR;
      text = text.replace(/\{\{years_exp\}\}/g, years);
      var parsed = parseMd(text);
      var fm = parsed.fm;
      var sections = parsed.sections;

      setText('hero-tagline', fm.tagline || '');

      var nameEl = el('hero-name');
      if (nameEl) nameEl.innerHTML = (fm.name || '') + '<br>' + (fm.name2 || '');

      setText('hero-role', fm.role || '');

      if (sections['Summary']) {
        setHtml('hero-summary', renderInline(sections['Summary']));
      }

      // Stats
      var statsEl = el('stats-row');
      if (statsEl) {
        var statsHtml = '';
        ['stat_1', 'stat_2', 'stat_3', 'stat_4'].forEach(function (k) {
          if (!fm[k]) return;
          var sep = fm[k].indexOf('|');
          if (sep < 0) return;
          var val = fm[k].slice(0, sep).trim();
          var label = fm[k].slice(sep + 1).trim();
          statsHtml += '<div class="stat">' +
            '<span class="stat-value">' + val + '</span>' +
            '<span class="stat-label">' + label + '</span>' +
            '</div>';
        });
        if (statsHtml) statsEl.innerHTML = statsHtml;
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────
  var isExpPage = typeof window.EXP_SLUG !== 'undefined';
  var isPortfolioPage = typeof window.PAGE_TYPE !== 'undefined' && window.PAGE_TYPE === 'portfolio';
  var lang = detectLang();

  document.addEventListener('DOMContentLoaded', function () {
    injectLangSwitcher();
    if (isPortfolioPage) {
      loadPortfolioPage();
    } else if (isExpPage) {
      loadExpPage();
    } else {
      loadHomePage();
      loadSkills();
    }
  });

})();
