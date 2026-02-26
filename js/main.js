// ============================================================
//  Clock in menubar
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
//  Terminal typewriter (index page only)
// ============================================================
const terminalLines = [
  { delay: 300,  type: 'cmd',    text: 'cat profile.json' },
  { delay: 600,  type: 'open',   text: '{' },
  { delay: 800,  type: 'kv',     key: '"name"',       value: '"Pierre-Marie Chatton"' },
  { delay: 950,  type: 'kv',     key: '"role"',        value: '"Product Manager / Managing Director"' },
  { delay: 1100, type: 'kv',     key: '"location"',    value: '"Plouézec, France"' },
  { delay: 1250, type: 'kv',     key: '"experience"',  value: '"15+ years"' },
  { delay: 1400, type: 'kv',     key: '"languages"',   value: '["French", "English", "Spanish", "German"]' },
  { delay: 1550, type: 'kv',     key: '"specialties"', value: '["0→1 products", "B2B SaaS", "Data platforms", "Compliance"]' },
  { delay: 1700, type: 'kv',     key: '"education"',   value: '"Ingénieur ENST Bretagne · Telecom Bretagne"' },
  { delay: 1850, type: 'close',  text: '}' },
  { delay: 2200, type: 'cmd',    text: 'ls -la ./experience/' },
  { delay: 2500, type: 'ls',     text: 'total 7' },
  { delay: 2600, type: 'ls-file', date: '2021-03', name: 'nuant/', role: 'PM / Managing Director', color: 'green' },
  { delay: 2700, type: 'ls-file', date: '2018-10', name: 'kottek/', role: 'Founder & Managing Director', color: 'orange' },
  { delay: 2800, type: 'ls-file', date: '2017-09', name: 'partakus/', role: 'Head of Projects', color: 'purple' },
  { delay: 2900, type: 'ls-file', date: '2015-03', name: 'palo-it/', role: 'Business Unit Manager', color: 'blue' },
  { delay: 3000, type: 'ls-file', date: '2014-03', name: 'libon/', role: 'Product Owner', color: 'green' },
  { delay: 3100, type: 'ls-file', date: '2008-09', name: 'orange-spain/', role: 'Test & Validation Manager', color: 'blue' },
  { delay: 3200, type: 'ls-file', date: '2006-02', name: 'niji/', role: 'Solution Engineer', color: 'purple' },
];

function renderTerminalLine(item) {
  const wrap = document.createElement('div');
  wrap.className = 'terminal-line';

  const colorMap = { green: 'color:var(--color-green)', orange: 'color:var(--color-orange)', blue: 'color:var(--color-blue)', purple: 'color:var(--color-purple)' };

  if (item.type === 'cmd') {
    wrap.innerHTML = `<span class="prompt">pmc@pmchatton:~$</span> <span class="t-cmd">${item.text}</span>`;
  } else if (item.type === 'open') {
    wrap.innerHTML = `<span class="t-key">${item.text}</span>`;
  } else if (item.type === 'kv') {
    wrap.innerHTML = `&nbsp;&nbsp;<span class="t-key">${item.key}</span><span style="color:var(--color-text-muted)">: </span><span class="t-str">${item.value}</span><span style="color:var(--color-text-muted)">,</span>`;
  } else if (item.type === 'close') {
    wrap.innerHTML = `<span class="t-key">}</span>`;
  } else if (item.type === 'ls') {
    wrap.innerHTML = `<span style="color:var(--color-text-subtle)">${item.text}</span>`;
  } else if (item.type === 'ls-file') {
    const c = colorMap[item.color] || '';
    wrap.innerHTML = `<span style="color:var(--color-text-subtle)">${item.date}&nbsp;&nbsp;</span><span style="${c};font-weight:600">${item.name}</span><span style="color:var(--color-text-muted)">&nbsp;&nbsp;${item.role}</span>`;
  }

  return wrap;
}

function runTerminal() {
  const output = document.getElementById('terminal-output');
  const inputLine = document.getElementById('terminal-input');
  if (!output) return;

  terminalLines.forEach(item => {
    setTimeout(() => {
      const node = renderTerminalLine(item);
      output.appendChild(node);
      // Auto-scroll terminal
      const terminal = output.closest('.terminal');
      if (terminal) terminal.scrollTop = terminal.scrollHeight;
    }, item.delay);
  });
}

document.addEventListener('DOMContentLoaded', runTerminal);

// ============================================================
//  Active menubar item based on scroll (index only)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section[id]');
  if (!sections.length) return;

  const navLinks = document.querySelectorAll('.menubar .menu-item[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.menubar .menu-item[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
});
