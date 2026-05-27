# monesh

Personal engineering portfolio of Monesh B. Astro 4 + TypeScript (strict) + Tailwind, statically exported to Cloudflare Pages.

## Local development

```sh
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # static export to dist/
pnpm preview      # serve dist/ locally
pnpm typecheck    # astro check (runs the same gate CI uses)
pnpm lhci         # run Lighthouse CI locally against ./dist
```

Node version pinned in `.nvmrc` (Node 22 LTS). Use `nvm use` (or your shim of choice) before installing.

## Deploy

Cloudflare Pages, static export.

- **Build command:** `pnpm build`
- **Output directory:** `dist/`
- **Node version:** read from `.nvmrc`
- **Routing:** `public/_routes.json` — currently a passthrough (`/*`). The real 404 page lands in PR 9.

## CI

Each PR runs `typecheck → build → Lighthouse CI` via `.github/workflows/ci.yml`. Every Lighthouse category (Performance, Accessibility, Best Practices, SEO) must score `100`; anything below blocks the merge. See `lighthouserc.json` for assertion config.

## Design source of truth

`DESIGN_SPEC.md` at the repo root. Do not introduce visual decisions outside the spec.

## Fonts

PR 1 ships with system font stacks only (`ui-monospace, Menlo, …` and `Georgia, …`). Self-hosted IBM Plex Mono (400, 500) and Source Serif 4 (400, 500, 400 italic) land in PR 2 as Latin-subset woff2 files in `public/fonts/`, generated via:

```sh
# placeholder — exact command will be committed in PR 2 alongside the fonts
pyftsubset SourceSerif4-Regular.ttf \
  --output-file=public/fonts/source-serif-4-400.woff2 \
  --flavor=woff2 \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' \
  --layout-features='kern,liga,clig,calt'
```

## Project status

PR 1 — scaffold (this PR). Subsequent PRs (two-pane shell, palette, MDX pipeline, content, hero, theme toggle, 404) tracked in `PR1_CLAUDE_CODE_PROMPT.md` and forthcoming kickoff prompts.
