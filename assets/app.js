/* ==========================================================================
   MEDHANE — shared behaviour
   Progressive enhancement only: every page works with JS disabled.
   ========================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile navigation ------------------------------------------------ */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const burger = nav.querySelector('[data-nav-burger]');
    burger?.addEventListener('click', () => {
      const open = nav.dataset.open === 'true';
      nav.dataset.open = String(!open);
      burger.setAttribute('aria-expanded', String(!open));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('.nav__links a, .nav__cta')) nav.dataset.open = 'false';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') nav.dataset.open = 'false';
    });
  }

  /* --- Segment tabs (Home: how it works / Shop: view) -------------------- */
  document.querySelectorAll('[data-segment]').forEach((seg) => {
    const buttons = [...seg.querySelectorAll('button[role="tab"]')];
    const scope = document.getElementById(seg.dataset.segment);

    const select = (btn) => {
      buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      if (!scope) return;
      scope.querySelectorAll('[data-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== btn.dataset.tab;
      });
    };

    seg.addEventListener('click', (e) => {
      const btn = e.target.closest('button[role="tab"]');
      if (btn) select(btn);
    });

    // Roving keyboard support across the tablist
    seg.addEventListener('keydown', (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % buttons.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = buttons.length - 1;
      if (next === null) return;
      e.preventDefault();
      buttons[next].focus();
      select(buttons[next]);
    });

    const initial = buttons.find((b) => b.getAttribute('aria-selected') === 'true') || buttons[0];
    if (initial) select(initial);
  });

  /* --- Stat block switcher ---------------------------------------------- */
  const statList = document.querySelector('[data-stat-list]');
  if (statList) {
    const panel = document.getElementById(statList.dataset.statList);
    const buttons = [...statList.querySelectorAll('button')];

    const select = (btn) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (!panel) return;
      panel.querySelectorAll('[data-stat-panel]').forEach((p) => {
        p.hidden = p.dataset.statPanel !== btn.dataset.stat;
      });
    };

    statList.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn) select(btn);
    });

    // Roll the numeral when a stat is selected
    const roll = (el) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      if (reduceMotion) { el.textContent = el.dataset.suffix ? target + el.dataset.suffix : String(target); return; }
      const dur = 900;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (el.dataset.suffix || '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const initial = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
    if (initial) {
      select(initial);
      const n = panel?.querySelector('[data-stat-panel]:not([hidden]) .numeral');
      if (n) roll(n);
    }
  }

  /* --- Catalogue filters ------------------------------------------------ */
  const filters = document.querySelector('[data-filters]');
  if (filters) {
    const grid = document.getElementById(filters.dataset.filters);
    const empty = document.querySelector('[data-filter-empty]');
    const count = document.querySelector('[data-filter-count]');

    const apply = (key) => {
      let shown = 0;
      grid?.querySelectorAll('[data-tags]').forEach((card) => {
        const tags = card.dataset.tags.split(/\s+/);
        const match = key === 'all' || tags.includes(key);
        card.hidden = !match;
        if (match) shown++;
      });
      if (count) count.textContent = String(shown);
      if (empty) empty.hidden = shown !== 0;
    };

    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filters.querySelectorAll('button').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      apply(btn.dataset.filter);
    });
  }

  /* --- Sort control ----------------------------------------------------- */
  const sort = document.querySelector('[data-sort]');
  if (sort && document.getElementById('catalogue')) {
    sort.addEventListener('change', () => {
      const grid = document.getElementById('catalogue');
      const cards = [...grid.querySelectorAll('[data-tags]')];
      const dir = sort.value === 'az' ? 1 : -1;
      cards
        .sort((a, b) =>
          dir * a.dataset.name.localeCompare(b.dataset.name, undefined, { sensitivity: 'base' })
        )
        .forEach((c) => grid.appendChild(c));
    });
  }

  /* --- Bag counter (demo only, held in sessionStorage) ------------------ */
  const BAG_KEY = 'medhane.bag';
  const readBag = () => {
    try { return JSON.parse(sessionStorage.getItem(BAG_KEY)) || {}; } catch { return {}; }
  };
  const writeBag = (bag) => {
    try { sessionStorage.setItem(BAG_KEY, JSON.stringify(bag)); } catch { /* private mode */ }
  };

  const paintBag = () => {
    const total = Object.values(readBag()).reduce((a, b) => a + b, 0);
    document.querySelectorAll('[data-bag-count]').forEach((el) => {
      el.textContent = total > 99 ? '99+' : String(total);
      el.hidden = total === 0;
    });
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    const bag = readBag();
    const id = btn.dataset.add;
    bag[id] = (bag[id] || 0) + 1;
    writeBag(bag);
    paintBag();

    const label = btn.querySelector('[data-add-label]');
    const original = label ? label.textContent : null;
    if (label) label.textContent = 'Added';
    btn.disabled = true;
    setTimeout(() => {
      if (label && original) label.textContent = original;
      btn.disabled = false;
    }, 1200);
  });
  paintBag();

  /* --- Scroll reveal ---------------------------------------------------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* --- Count-up numerals anywhere --------------------------------------- */
  const counters = document.querySelectorAll('[data-count]:not([data-stat-panel])');
  if (counters.length) {
    const run = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (!Number.isFinite(target)) return;
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 1100;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
    } else {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => cio.observe(el));
    }
  }

  /* --- Footer year ------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* --- Cross-page view transitions -------------------------------------- */
  if (!reduceMotion && 'startViewTransition' in document && !location.search.includes('noanim')) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank') return;
      if (link.hasAttribute('download')) return;
      let url;
      try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (!document.startViewTransition) return;
      e.preventDefault();
      document.startViewTransition(() => { location.href = url.href; });
    });
  }
})();