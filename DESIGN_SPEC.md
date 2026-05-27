# `~/monesh` — Design Specification

**Status:** Locked at end of Phase 2a. This is the source of truth for Phase 2b implementation. Changes to anything in §2–§9 require a new spec revision; do not let them drift via PR comments.

**Owner:** Monesh B.
**Audience:** Engineering managers at scaling tech companies (primary), tech leads at digital agencies (secondary).
**Positioning:** Modern infrastructure & tooling engineer; weaponizes agentic workflows.

---

## 1. Identity & meta-principles

The site presents itself as a workspace the visitor has opened, not a marketing page they have landed on. The metaphor is a thoughtfully designed internal engineering tool — visual reference points are Linear, Raycast, Zed, Helix. It is explicitly **not** a literal terminal, not a fake OS desktop with draggable windows, not skeuomorphic CRT.

Five rules govern every decision below:

1. **No decoration.** Every visual element must do a job. If it does not, it is removed.
2. **System chrome is lowercase monospace; rendered prose is serif with proper case.** This split is load-bearing — it tells the visitor which surface is the tool and which is the content.
3. **The accent color encodes state, not brand.** It appears only where a UI element is *active*, *selected*, *focused*, or *streaming*. Decorative use is forbidden.
4. **The status bar is a real surface.** It reflects the current mode of the application at all times. It is never empty, never decorative.
5. **Lighthouse 100 is a hard floor.** Any feature that cannot ship under that constraint is cut, not compromised.

---

## 2. Design tokens

### 2.1 Color — light mode (default)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | Primary text, headings, prose links (underlined) |
| `--ink-2` | `#1A1A18` | Long-form body prose (subtle warmth vs. pure ink) |
| `--ink-3` | `#2A2A28` | Tree node labels, meta values |
| `--mute` | `#6B6B66` | Secondary text, sub-labels, status bar text |
| `--mute-2` | `#9A9A93` | Tertiary text, group labels, kbd-hint text |
| `--mute-3` | `#C8C7C0` | Hairlines on dimmed/pending content, breadcrumb separators |
| `--paper` | `#FAFAF7` | Page background, primary surface |
| `--paper-2` | `#F4F3ED` | Status bar background |
| `--paper-3` | `#F0EFE9` | Inline code background, hover row |
| `--border` | `rgba(10,10,10,0.10)` | All hairlines (0.5px) |
| `--accent` | `#2C5FFF` | UI state only — selected, focused, streaming |
| `--accent-bg` | `#E6EBFF` | Selected row fill |
| `--accent-ink` | `#1A3FBF` | Text on `--accent-bg` |
| `--danger` | `#A32D2D` | 404 path, bad-state indicators only |

### 2.2 Color — dark mode

The only token whose hue shifts is the accent, brightened to pass WCAG AA on the dark ground.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#E8E7E2` | Primary text |
| `--ink-2` | `#D8D7D2` | Body prose |
| `--ink-3` | `#C8C7C0` | Tree node labels, meta values |
| `--mute` | `#8A8A82` | Secondary text |
| `--mute-2` | `#5F5E58` | Tertiary text |
| `--mute-3` | `#3F3F3A` | Hairlines on dimmed content |
| `--paper` | `#0E0E0C` | Page background |
| `--paper-2` | `rgba(24,24,21,0.50)` | Status bar background |
| `--paper-3` | `rgba(232,231,226,0.07)` | Inline code background |
| `--border` | `rgba(232,231,226,0.08)` | All hairlines |
| `--accent` | `#4C7BFF` | UI state only |
| `--accent-bg` | `#1A2A55` | Selected row fill |
| `--accent-ink` | `#9DB6FF` | Text on `--accent-bg` |
| `--danger` | `#E24B4A` | 404 path, bad-state indicators |

Theme toggle: palette verbs `theme light`, `theme dark`, `theme system`. Default = `system`. Explicit choice persists in `localStorage` under key `monesh:theme`. First paint respects `prefers-color-scheme`; no flash.

### 2.3 Typography

| Role | Family | Weights | Loading |
|---|---|---|---|
| UI chrome (tree, status bar, palette, breadcrumb, meta, code) | IBM Plex Mono | 400, 500 | Self-hosted woff2, `font-display: swap`, subset to Latin |
| Long-form prose (h1, body paragraphs, lede, h2) | Source Serif 4 | 400, 500, 400 italic | Self-hosted woff2, `font-display: swap`, subset to Latin + small caps off |

Fallback stacks:

```css
--font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
--font-serif: 'Source Serif 4', 'Source Serif Pro', Georgia, Cambria, 'Times New Roman', serif;
```

Sizes:

| Element | Size | Line-height | Weight | Letter-spacing |
|---|---|---|---|---|
| Essay `h1` | 24px | 1.2 | 500 | -0.01em |
| Project `h1` | 22px | 1.25 | 500 | -0.01em |
| Hero `h1` | 28px | 1.2 | 500 | -0.015em |
| Essay `h2` | 17px | 1.35 | 500 | -0.005em |
| Body prose | 15.5px (essay) / 15px (project) | 1.65–1.7 | 400 | 0 |
| Lede (italic) | 16px | 1.65 | 400 italic | 0 |
| Sub-line under `h1` | 11px mono | 1.4 | 400 | 0 |
| Meta block | 11px mono | 1.4 | 400 | 0 |
| Tree row | 12px mono | 1.45 | 400 | 0 |
| Status bar | 11px mono | 1 | 400 | 0 |
| Group label (UPPERCASE) | 10px mono | 1 | 400 | 0.06em |
| `kbd` | 10px mono | 1 | 400 | 0 |

**Minimum size: 10px** (group labels and kbd only). Body text never below 14px on mobile, 15px on desktop.

### 2.4 Spacing & layout

Spacing scale (rem, base 16px): `0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 2.5 / 3`.

| Token | Value | Use |
|---|---|---|
| `--rail-w` | `200px` | Desktop file tree width |
| `--measure` | `68ch` | Max prose width (essay), >1280px viewport |
| `--measure-narrow` | `60ch` | Project page prose, lede |
| `--pane-pad-x` | `28px` | Right pane horizontal padding |
| `--pane-pad-y` | `22px` | Right pane vertical padding |
| `--rail-pad` | `12px 8px` | Tree padding |
| `--bar-pad` | `8px 14px` | Status bar padding |

Border radii: `--r-sm: 3px` (kbd, inline code) · `--r-md: 4px` (tree rows, palette rows) · `--r-lg: 12px` (palette, page-level cards on mobile drawer).

Hairlines: **always 0.5px**, never 1px. Color from `--border` token.

---

## 3. Components

Each component below has a fixed anatomy. PRs may not invent variants without a spec revision.

### 3.1 File tree (left rail)

**Anatomy:** group label (uppercase, mono, `--mute-2`) → rows (icon + label + optional trailing affordance) → indent levels `depth-0` (root) and `depth-1` (child file).

**States per row:**
- Default: `color: var(--ink-3)`, no background
- Hover: `background: var(--paper-3)`
- Selected: `background: var(--accent-bg)`, `color: var(--accent-ink)`, icon inherits `--accent-ink`
- Focused (keyboard): same as selected + 2px `box-shadow: 0 0 0 2px var(--accent) inset`

**Trailing affordances** (right-aligned, `font-size: 10px`):
- `●` (`--accent`) — currently open
- `★` (`--ink-3`) — featured / recommended by Monesh
- `↗` (Tabler `ti-external-link`, `--mute-2`) — external link

**Keyboard:** `j`/`↓` next, `k`/`↑` previous, `h`/`←` collapse, `l`/`→` expand, `enter` open, `gg` jump to top, `G` jump to bottom. Vim bindings deliberate.

**URL contract:** selecting a row updates the URL to the file's static route (`/projects/forge-savant`, `/writing/decoupling-the-monorepo`). No hash fragments. No client-side routing fakery — Astro view transitions only.

### 3.2 Status bar (footer)

Always present. Left cluster: state + 2-4 context fields. Right cluster: keyboard hint.

**Left field grammar by mode:**

| Mode | Fields (left → right) |
|---|---|
| Reading a project | `● ready` · `utf-8` · `markdown` · `ln N, col N` |
| Reading an essay | `● ready` · `utf-8` · `markdown` · `N,NNN words · N min` |
| Palette open | `● palette` · `N result[s]` · `fuzzy: subsequence` |
| Hero typing | `● typing` · `N of N chars/sec` · `N paragraphs queued` |
| 404 | `● 404` · `utf-8` · `fuzzy: subsequence` · `N suggestions` |
| Drawer open (mobile) | `● drawer open` · `tap scrim to dismiss` |

The leading `●` is the accent dot. The mode word is lowercase. Field separator is the space-dot-space `·` (middle dot, U+00B7), never a pipe.

**Right cluster:** `⌘K palette` by default; replaced by `esc dismiss` when palette/drawer is open.

### 3.3 Command palette

**Trigger:** `⌘K` (mac) / `Ctrl+K` (everything else). Also reachable via the right-cluster status bar affordance.

**Anatomy:** input row (prompt glyph `>` in accent + query text + `⌘K` focus ring badge on right) → grouped result list → footer keymap.

**Group order (locked):**
1. `writing · N matches`
2. `projects · N matches`
3. `verbs · N matches`
4. `external · N matches`

Empty groups are shown with `0 matches` to signal search comprehensiveness. Sections are separated by their uppercase mono labels at `--mute-2`.

**Match algorithm:** subsequence fuzzy (fzf-style), build-time indexed. Matched characters in result labels are weight-500. Status bar surfaces `fuzzy: subsequence` while open.

**Verbs (first-class results):**

| Verb | Behavior |
|---|---|
| `open <path>` | Navigate to file's static route |
| `cat <path>` | Render file in current pane without changing route |
| `goto <url>` | Open external URL (with confirmation if outside known domains) |
| `theme {light,dark,system}` | Switch theme |
| `copy email` | Copy primary contact email to clipboard |

**Keyboard:** `↑`/`↓` navigate, `↵` select, `⌘↵` open in new tab (external only), `tab` cycle verb for current query, `esc` close.

### 3.4 Meta block (project pages only)

Three rows, fixed order, hairline above and below:

```
stack    [tech stack, dot-separated]
role     [role description]
status   [Shipped|Archived|WIP] · [link] · [link]
```

Keys: 10px mono, `--mute-2`, uppercase, 80px column. Values: 11px mono, `--ink-3`. Links: `--ink` with 0.5px underline (light) / `--ink` with 0.5px underline (dark). Never accent-colored.

### 3.5 Footnote rail (essay pages only)

Two-column grid on viewports >1024px: `minmax(0, 1fr) 140px` with 28px gutter. Left column: prose. Right column: rail with sticky `on this page` TOC at top, footnotes flowing below.

**Inline footnote markers** are superscript accent-colored numerals in the prose, generated from MDX footnote syntax. The rail renders the matching number in accent followed by the footnote text in 10px mono `--mute`.

**Below 1024px** the rail disappears; footnotes become click-to-expand inline, accent-colored numeral toggles a details/summary.

### 3.6 Breadcrumb

Mono, 11px, `--mute`. Final segment is `--ink-3`. Separator is ` / ` with `--mute-3` color (use a `<span class="sep">/</span>`, do not inline). On a 404, the bad path segment gets `color: var(--danger)` and a 0.5px dashed `--danger` underline.

### 3.7 Inline code (`.term`)

`font-family: var(--font-mono); font-size: 13px; background: var(--paper-3); padding: 1px 5px; border-radius: var(--r-sm)`. No border. Used for filenames, identifiers, paths inline in serif prose.

### 3.8 Block code

Shiki at build time, dual themes (`github-light` + `github-dark`), zero runtime JS. Language label top-left in 10px mono `--mute-2`. Copy button top-right (icon-only, `ti-copy`). Line numbers off by default; enable per-block via MDX prop `lineNumbers`.

### 3.9 kbd

`<kbd>` tag styled directly. `font-family: var(--font-mono); font-size: 10px; background: var(--paper); border: 0.5px solid var(--mute-3); border-bottom-width: 1px; border-radius: var(--r-sm); padding: 1px 5px; color: var(--ink-3)`. Use real kbd characters: `⌘`, `↵`, `↑`, `↓`, `←`, `→`, `esc`, `tab`.

---

## 4. Page templates

### 4.1 Landing (`/`)

Right pane content: monospace command echo (`> cat about.md`) → metadata echo line (`about/about.md · 412 bytes · serif · streaming…`) → rendered `about.md` content. First paragraph animates via CSS `steps()` keyframes over ~1.6s. Final state in DOM at t=0 for SSR/SR/noscript. Any keypress, click, scroll, or `prefers-reduced-motion: reduce` jumps to final state. Status bar shows `typing` mode while active, `ready` after.

Tree state: `about/` selected with active dot.

### 4.2 Project (`/projects/<slug>`)

Right pane: breadcrumb → `h1` (Title Case, serif) → sub-line (mono, mute) → meta block (§3.4) → prose with 60ch measure. No footnote rail. No TOC.

### 4.3 Essay (`/writing/<slug>`)

Right pane: breadcrumb → `h1` (Title Case, serif) → sub-line with read time → optional italic lede (60ch) → prose with 68ch measure → footnote rail with TOC (§3.5).

### 4.4 404 (any unmatched route)

Right pane: breadcrumb with bad path → mono echo (`> cat <bad-path>`) → mono error (`cat: <bad-path>: No such file or directory`) → status meta block (status, path, referrer, closest) → `Did you mean` group with top-3 fuzzy matches → escape hatch link to `~/monesh` + palette hint.

Status: HTTP 404 served by host (Cloudflare Pages `_routes.json` or equivalent).

---

## 5. Routing & URL model

Every tree node maps to a static route. No client routing library; Astro's file-based routing only, with view transitions for in-app navigation.

```
/                                 → landing (about.md inline)
/projects                         → projects index (list view)
/projects/forge-savant            → project page
/projects/routemate               → project page
/projects/plantpal                → project page
/projects/mc-modding              → project page
/writing                          → writing index
/writing/decoupling-the-monorepo  → essay
/about                            → about full page
/contact                          → contact
/resume.pdf                       → static asset, direct link
```

Sitemap and RSS (`/rss.xml` for `/writing/` only) generated at build time.

---

## 6. Interaction & keyboard model

Global keys (work from any page):

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open palette |
| `g h` | Go to `/` (home) |
| `g p` | Go to `/projects` |
| `g w` | Go to `/writing` |
| `g a` | Go to `/about` |
| `?` | Show keyboard help (palette opens with verb `help` selected) |
| `esc` | Close any overlay (palette, drawer, footnote expand) |

Tree-focus keys: §3.1.

Palette keys: §3.3.

A discoverable affordance for every shortcut: status bar right cluster + palette footer + `?` help overlay.

---

## 7. Motion

| Surface | Animation | Duration | Easing |
|---|---|---|---|
| Hero typewriter (paragraph 1) | CSS `steps()` keyframes on `clip-path: inset()` | ~1.6s total, ~22 chars/sec | linear |
| Palette open | opacity 0→1 + translateY(-4px → 0) | 120ms | ease-out |
| Palette close | reverse | 80ms | ease-in |
| Mobile drawer open | translateX(-100% → 0) + scrim opacity 0→0.32 | 200ms | ease-out |
| Tree row selection | none — instantaneous |  |  |
| Theme toggle | none — instantaneous |  |  |

All animations respect `prefers-reduced-motion: reduce` by collapsing to 0ms with the final state shown.

No spring physics. No gesture-driven momentum. No scroll-linked effects.

---

## 8. Responsive

| Breakpoint | Behavior |
|---|---|
| `<640px` | Single column, tree becomes drawer (closed by default), prose flows full-width minus 16px padding, font sizes step down 1pt, footnote rail collapses to inline click-to-expand |
| `640–1024px` | Same single-column with drawer; prose comfortable measure ~55ch; rail still inline |
| `1024–1280px` | Two-pane returns, tree visible, prose at 60ch, footnote rail appears for essays |
| `>1280px` | Full layout, prose capped at 68ch (essay) / 60ch (project) |
| `>1600px` | Layout does not stretch further — container max-width `1440px`, centered |

Drawer is summoned via top-left `ti-menu-2` icon or by swipe-right from screen edge. Dismissed via scrim tap, swipe-left, or `esc`.

---

## 9. Accessibility

- Every interactive element has a visible focus state at minimum 2px `--accent` outline or inset shadow.
- Tab order follows visual order. Skip-to-content link at top of every page (visually hidden until focused).
- All icons are decorative (`aria-hidden="true"`) and accompanied by text. Icon-only buttons get `aria-label`.
- Color contrast: AA minimum for body text (4.5:1), AAA target for headings (7:1). Verified in both themes via automated test in CI.
- Tree is a `role="tree"` with `aria-expanded` on folders and `aria-selected` on the current row.
- Palette is a `role="dialog"` with `aria-modal="true"`, traps focus while open, returns focus to the trigger on close.
- Footnote markers are `<sup>` with `<a href="#fn-N" aria-describedby="fn-N">` and the rail entries are `<aside role="doc-endnotes">`.
- Hero typewriter: full final text in DOM at t=0, animation is purely visual via `clip-path`. Screen readers read the final text immediately. Respects `prefers-reduced-motion`.
- Theme respects `prefers-color-scheme` on first paint with no flash (inline blocking script in `<head>` reads `localStorage` and sets a class on `<html>` before any CSS evaluates).

---

## 10. Performance budget

Lighthouse 100 across all four scores (Performance, Accessibility, Best Practices, SEO) on every route, enforced in CI. Specifically:

| Metric | Budget |
|---|---|
| LCP | < 1.2s on simulated Slow 4G |
| TBT | < 100ms |
| CLS | 0 (zero) |
| Total transferred HTML | < 25 KB per route |
| Total CSS | < 20 KB (compiled, gzipped) |
| Total JS shipped | 0 KB on landing, project, essay, 404 routes |
| Total JS for palette + theme toggle | < 8 KB gzipped, lazy-loaded on first interaction |
| Fonts | 2 woff2 files (Plex Mono 400+500, Source Serif 4 400+500), each subset to Latin, total < 60 KB |
| Images | None on chrome. Project pages may include build-optimized AVIF/WebP with intrinsic dimensions and `loading="lazy"` |

The palette and theme toggle are the only JavaScript on the site. Both are progressively enhanced — site fully usable with JS disabled (no palette, no live theme toggle, but every page renders and every link works).

---

## 11. Content rules

**Case rule (locked):**
- System chrome (file tree labels, breadcrumb segments, URL paths, status bar text, palette inputs, kbd-hint text, group labels): **lowercase-kebab-case** or **lowercase**.
- Rendered prose (page headings, body, lede, project titles in headings): **Title Case** for proper nouns and headings, **sentence case** otherwise — follow English typography conventions.

**File naming:** lowercase-kebab-case for both URL slugs and source filenames. The slug `decoupling-the-monorepo` corresponds to the source file `src/content/writing/decoupling-the-monorepo.mdx` and the URL `/writing/decoupling-the-monorepo`. The rendered `h1` is "Decoupling the Monorepo."

**Voice:** First person, direct, no marketing register. Sentence length varied. Numbers preferred to adjectives ("cut p99 from 800ms to 40ms" > "significantly improved performance"). A "What I'd do differently" or "What I'd skip" section closes every project deep-dive and every essay.

**Forbidden:**
- Emoji anywhere in chrome or prose.
- Title Case in system chrome.
- The word "passionate."
- Decorative gradients, shadows, glow, blur effects.
- Animated icons or rotating decorations.

---

## 12. Content inventory (Phase 2b targets)

| Slug | Type | Word target | PR |
|---|---|---|---|
| `about` | page | 250 | PR 7 (hero) + PR 9 (full page) |
| `projects/forge-savant` | project | 1,500–2,000 | PR 5 |
| `projects/routemate` | project | 1,200–1,800 | PR 6 |
| `projects/plantpal` | project | 1,200–1,800 | PR 6 |
| `projects/mc-modding` | project | 1,000–1,500 | PR 6 |
| `writing/decoupling-the-monorepo` | essay | 2,500–3,500 | PR 5 (featured, top of writing/) |

---

## 13. Deferred decisions

These are explicitly **not** specified here; they will be resolved in their respective PRs against the principles above. PRs may not invent visual variants outside these.

- Exact Shiki theme tokens for the code-block syntax highlighter (PR 4)
- OG image template layout (PR 9)
- Print stylesheet for essays (PR 9, nice-to-have)
- Favicon set (PR 9)
- Resume PDF layout — currently planned to live as a static `/resume.pdf`, may be regenerated from MDX (PR 9)
- Per-essay header image — current default is "no image"; if added later, must follow the chrome metaphor (a screenshot-style framed card, not a hero photograph)

---

## 14. Tech stack lock

| Layer | Choice |
|---|---|
| Framework | Astro 4+ (latest stable at PR 1 date) |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS via `@astrojs/tailwind`, design tokens hardcoded in `tailwind.config.mjs` |
| Content | Astro content collections, MDX for essays and projects |
| Code highlighting | Shiki (build-time, dual themes) |
| Fuzzy search | Self-hosted JS port of fzf algorithm, build-time index |
| Deploy target | Cloudflare Pages, static export, `output: 'static'` |
| CI | GitHub Actions: typecheck → build → Lighthouse CI → Playwright a11y/keyboard checks |
| Node | LTS at time of PR 1 |
| Package manager | pnpm |

No client framework (no React, no Vue, no Svelte runtime). Astro islands are used only for the palette and theme toggle, both authored as vanilla TypeScript components.

---

End of spec.
