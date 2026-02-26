# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Pierre-Marie Chatton (pmchatton.com). Static HTML/CSS/JS — no build step, no framework, no package manager.

## Development

**Preview locally:**
```bash
# Any of these work:
python3 -m http.server 8080
npx serve .
open index.html   # works but relative paths may behave differently
```

**Deploy:** Drag-and-drop the entire folder to Netlify (netlify.com) or push to GitHub and enable GitHub Pages. The domain pmchatton.com should be configured in the DNS/hosting settings with a CNAME pointing to the hosting provider.

## File Structure

```
index.html                  ← Home page (about, experience list, skills, contact)
experience/
  nuant.html                ← PM / MD at Nuant (2021–2025)
  kottek.html               ← Founder at Kottek (2018–present)
  partakus.html             ← Head of Projects at Partakus (2017–2021)
  palo-it.html              ← BU Manager at Palo IT (2015–2018)
  libon.html                ← Product Owner at Libon/Orange (2014–2017)
  orange-spain.html         ← Test & Validation Mgr at Orange Spain (2008–2014)
  niji.html                 ← Solution Engineer at Niji (2006–2010)
css/style.css               ← All styles (single file)
js/main.js                  ← Clock, terminal typewriter effect, active nav
```

Source data lives in `../job_research/cv/CV_PMC_PM_EN.html` — the primary reference for all professional content.

## Design System

All design tokens are CSS custom properties in `:root` at the top of `css/style.css`:

- **Colors**: `--color-bg` (dark bg), `--color-green` (#39d353 primary accent), `--color-blue` (#58a6ff links), `--color-orange` (#f0883e metrics/highlights)
- **Fonts**: `--font-mono` (JetBrains Mono — used for code, terminal, badges), `--font-sans` (Inter — body text)
- **Window chrome**: `.window` + `.window-titlebar` + `.window-buttons` creates the macOS-style app window look

## Key Components

**`.window`** — The core reusable component. Used on every experience page and on the index terminal. Requires `.window-titlebar` (with `.window-buttons` span trio) and `.window-content` (or `.terminal`).

**`.exp-list` / `.exp-row`** — The `ls -la` style experience table on the index page. Grid: `140px 1fr 200px 80px`. Collapses to 2-column on mobile.

**`.exp-achievements li`** — Green `→` bullet list used on every experience detail page.

**`.metric`** — Inline span for highlighting key numbers (orange, monospace). Use inside `<li>` text.

**`.meta-pill`** — Colored pill badges (`pill-green`, `pill-blue`, `pill-orange`, `pill-purple`).

**Terminal typewriter** — Defined in `js/main.js` as `terminalLines` array. Add new entries with `{delay, type, ...}`. Only runs when `#terminal-output` is present (index page only).

## Content Updates

When updating professional experience:
1. Edit the relevant `experience/*.html` file
2. Update the corresponding `.exp-row` in `index.html`
3. Update `terminalLines` in `js/main.js` if experience listing changes
4. Keep the `exp-nav` prev/next links consistent across pages

## Free Hosting Options (for pmchatton.com)

1. **Netlify** (recommended): Drop folder at app.netlify.com → Site settings → Custom domains → add `pmchatton.com`
2. **GitHub Pages**: Push to public repo → Settings → Pages → source: main branch → Custom domain
3. **Cloudflare Pages**: Connect GitHub repo, build command: none, output: `/`

For all options: set DNS A record or CNAME at your domain registrar pointing to the hosting provider.
