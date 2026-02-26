// ============================================================
//  Clock
// ============================================================
function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  const d = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const t = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  el.textContent = `${d}  ${t}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
//  Terminal typewriter
// ============================================================
const expYears = new Date().getFullYear() - 2005;
const terminalLines = [
  { delay: 300,  type: 'cmd',      text: 'cat profile.json' },
  { delay: 600,  type: 'open',     text: '{' },
  { delay: 780,  type: 'kv',       key: '"name"',        value: '"Pierre-Marie Chatton"' },
  { delay: 920,  type: 'kv',       key: '"role"',         value: '"Product Manager / Managing Director"' },
  { delay: 1060, type: 'kv',       key: '"location"',     value: '"Plouézec, France"' },
  { delay: 1200, type: 'kv',       key: '"experience"',   value: '"' + expYears + ' years"' },
  { delay: 1340, type: 'kv',       key: '"languages"',    value: '["French", "English", "Spanish", "German"]' },
  { delay: 1480, type: 'kv',       key: '"specialties"',  value: '["0→1 products", "B2B SaaS", "Data", "Compliance"]' },
  { delay: 1620, type: 'close',    text: '}' },
  { delay: 2000, type: 'cmd',      text: 'ls -la ./experience/' },
  { delay: 2250, type: 'ls',       text: 'total 7' },
  { delay: 2350, type: 'ls-file',  date: '2021-03', name: 'nuant/',        role: 'Head of Ops / PM / MD',         color: 'green'  },
  { delay: 2440, type: 'ls-file',  date: '2018-10', name: 'kottek/',       role: 'Founder & MD',                  color: 'orange' },
  { delay: 2530, type: 'ls-file',  date: '2017-09', name: 'partakus/',     role: 'Head of Projects',              color: 'purple' },
  { delay: 2620, type: 'ls-file',  date: '2015-03', name: 'palo-it/',      role: 'Hive Master, Pre-Sales',        color: 'blue'   },
  { delay: 2710, type: 'ls-file',  date: '2014-03', name: 'libon/',        role: 'Product Owner',                 color: 'green'  },
  { delay: 2800, type: 'ls-file',  date: '2008-09', name: 'orange-spain/', role: 'Test & Validation Manager',     color: 'blue'   },
  { delay: 2890, type: 'ls-file',  date: '2006-02', name: 'niji/',         role: 'Solution Engineer',             color: 'purple' },
];

function renderTerminalLine(item) {
  const wrap = document.createElement('div');
  wrap.className = 'terminal-line';
  const colors = { green: 'color:#39D353', orange: 'color:#F0883E', blue: 'color:#58A6FF', purple: 'color:#BC8CFF' };
  switch (item.type) {
    case 'cmd':
      wrap.innerHTML = `<span class="prompt">pmc@pmchatton:~$</span> <span class="t-cmd">${item.text}</span>`; break;
    case 'open':
      wrap.innerHTML = `<span class="t-key">{</span>`; break;
    case 'kv':
      wrap.innerHTML = `&nbsp;&nbsp;<span class="t-key">${item.key}</span><span style="color:#8B949E">: </span><span class="t-str">${item.value}</span><span style="color:#8B949E">,</span>`; break;
    case 'close':
      wrap.innerHTML = `<span class="t-key">}</span>`; break;
    case 'ls':
      wrap.innerHTML = `<span style="color:#6E7681">${item.text}</span>`; break;
    case 'ls-file':
      wrap.innerHTML = `<span style="color:#6E7681">${item.date}&nbsp;&nbsp;</span><span style="${colors[item.color]};font-weight:600">${item.name}</span><span style="color:#8B949E">&nbsp;&nbsp;${item.role}</span>`; break;
  }
  return wrap;
}

function runTerminal() {
  const output = document.getElementById('terminal-output');
  if (!output) return;
  terminalLines.forEach(item => {
    setTimeout(() => {
      output.appendChild(renderTerminalLine(item));
      const t = output.closest('.terminal');
      if (t) t.scrollTop = t.scrollHeight;
    }, item.delay);
  });
}

// ============================================================
//  Window Manager — drag & collapse
// ============================================================
let globalZ = 100;

function initWindows() {
  document.querySelectorAll('.window').forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    let isFloating = false;
    let isDragging = false;
    let placeholder = null;
    let dragOffX = 0, dragOffY = 0;

    // ── Drag ──────────────────────────────────────────────
    titlebar.addEventListener('mousedown', e => {
      if (e.target.closest('.window-buttons')) return;

      win.style.zIndex = ++globalZ;

      if (!isFloating) {
        const rect = win.getBoundingClientRect();

        // Hold the space in the layout
        placeholder = document.createElement('div');
        placeholder.style.cssText =
          `width:${rect.width}px;height:${rect.height}px;flex-shrink:0;pointer-events:none;visibility:hidden`;
        win.parentNode.insertBefore(placeholder, win);

        // Detach to fixed
        win.style.position = 'fixed';
        win.style.left     = rect.left + 'px';
        win.style.top      = rect.top  + 'px';
        win.style.width    = rect.width + 'px';
        win.style.margin   = '0';
        win.style.zIndex   = globalZ;
        win.classList.add('floating');
        isFloating = true;
      }

      isDragging = true;
      dragOffX = e.clientX - parseFloat(win.style.left);
      dragOffY = e.clientY - parseFloat(win.style.top);
      win.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      win.style.left = (e.clientX - dragOffX) + 'px';
      win.style.top  = (e.clientY - dragOffY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      win.classList.remove('dragging');
    });

    // ── Collapse: double-click titlebar ───────────────────
    titlebar.addEventListener('dblclick', e => {
      if (e.target.closest('.window-buttons')) return;
      toggleCollapse(win, placeholder);
    });

    // ── Minimize button (yellow) ──────────────────────────
    win.querySelector('.btn-minimize')
      ?.addEventListener('click', () => toggleCollapse(win, placeholder));

    // ── Maximize button (green) ───────────────────────────
    let isMaximized = false;
    let preMaxState = {};
    win.querySelector('.btn-maximize')
      ?.addEventListener('click', () => {
        if (!isMaximized) {
          // Float first if not already
          if (!isFloating) {
            const rect = win.getBoundingClientRect();
            placeholder = document.createElement('div');
            placeholder.style.cssText =
              `width:${rect.width}px;height:${rect.height}px;flex-shrink:0;pointer-events:none;visibility:hidden`;
            win.parentNode.insertBefore(placeholder, win);
            win.style.position = 'fixed';
            win.style.left   = rect.left + 'px';
            win.style.top    = rect.top  + 'px';
            win.style.width  = rect.width + 'px';
            win.style.margin = '0';
            win.classList.add('floating');
            isFloating = true;
          }
          preMaxState = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
          const barH = document.querySelector('.menubar')?.offsetHeight || 26;
          win.style.left   = '0';
          win.style.top    = barH + 'px';
          win.style.width  = '100vw';
          win.style.height = `calc(100vh - ${barH}px)`;
          win.style.zIndex = ++globalZ;
          win.classList.add('maximized');
          isMaximized = true;
        } else {
          win.style.left   = preMaxState.left;
          win.style.top    = preMaxState.top;
          win.style.width  = preMaxState.width;
          win.style.height = preMaxState.height;
          win.classList.remove('maximized');
          isMaximized = false;
        }
      });

    // ── Close button (red) ────────────────────────────────
    win.querySelector('.btn-close')
      ?.addEventListener('click', () => {
        win._placeholder = placeholder;
        win.style.display = 'none';
        if (placeholder) placeholder.style.display = 'none';
      });

    // ── Bring to front on any click ───────────────────────
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++globalZ;
    }, true);
  });
}

function toggleCollapse(win, placeholder) {
  win.classList.toggle('collapsed');
  // Sync placeholder height after reflow
  if (placeholder) {
    requestAnimationFrame(() => {
      placeholder.style.height = win.offsetHeight + 'px';
    });
  }
}

// ============================================================
//  Active nav on scroll
// ============================================================
function initScrollNav() {
  const sections  = document.querySelectorAll('.section[id]');
  const navLinks  = document.querySelectorAll('.menubar .menu-item[href^="#"]');
  if (!sections.length) return;

  function setActive(id) {
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.menubar .menu-item[href="#${id}"]`)?.classList.add('active');
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));

  // Activate last section when scrolled to the bottom
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
      setActive(sections[sections.length - 1].id);
    }
  }, { passive: true });
}

// ============================================================
//  Desktop icon single-click selection feedback
// ============================================================
function initDesktopIcons() {
  document.querySelectorAll('.desktop-icon:not(.icon-disabled)').forEach(icon => {
    icon.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');

      // Reopen window if it was closed
      const href = icon.getAttribute('href');
      if (href && href.startsWith('#')) {
        const win = document.querySelector(href + ' .window');
        if (win && win.style.display === 'none') {
          win.style.display = '';
          if (win._placeholder) win._placeholder.style.display = '';
        }
      }
    });
  });
  // Deselect on desktop click
  document.addEventListener('click', e => {
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });
}

// ============================================================
//  Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  runTerminal();
  initWindows();
  initScrollNav();
  initDesktopIcons();
});
