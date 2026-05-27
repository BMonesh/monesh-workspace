# Phase 2b · PR 1 — Claude Code kickoff prompt

This is the prompt to paste into your **first** Claude Code session, inside a fresh empty directory that will become the `monesh` repo. Read the "Before you paste" section once, paste the body, then drive the conversation from there.

---

## Before you paste

1. `mkdir monesh && cd monesh && git init`
2. Drop `DESIGN_SPEC.md` (the file accompanying this one) into the repo root so Claude Code can read it.
3. Confirm pnpm is installed (`pnpm -v`).
4. Open Claude Code: `claude` (or `claude code` depending on your installed binary).
5. Paste everything between the `--- PROMPT START ---` and `--- PROMPT END ---` markers below as your first message. Do not paste the markers themselves.

The "Plan first" pattern in this prompt is non-negotiable. If Claude Code starts writing files without showing you the plan, stop it (`esc`) and re-issue the plan request. This is the single most important habit for keeping the review surface manageable.

---

## --- PROMPT START ---

You are pairing with me to build my personal engineering portfolio, a site called `~/monesh`. The full design specification is at `./DESIGN_SPEC.md` in this repo's root — read it before doing anything else. It is the source of truth; do not invent visual decisions outside it.

**Working agreement for every PR in this project, including this one:**

1. **Plan first.** Before writing or modifying any file, output a numbered list of every file you intend to create or modify and a one-line description of each. Then stop and wait for my explicit approval. Do not write any code until I reply with "approved" or equivalent.
2. **Small diffs.** A single PR touches at most ~15 files. If the plan exceeds 15 files, propose a split into multiple PRs and let me pick the first one.
3. **Read before writing.** Any time you touch a file that already exists, read it first in the same turn and quote the relevant lines back to me.
4. **No silent dependency additions.** If you want to add a dependency, name it in the plan with the exact version and one sentence on why. I will approve or substitute.
5. **No client framework runtime.** Astro islands authored in vanilla TypeScript only. No React, no Vue, no Svelte, no Preact runtime ships to the browser. Astro components (`.astro`) are fine; they compile to static HTML.

**This PR (PR 1) is scaffold only.** It must produce a deployable, empty `monesh` site that scores Lighthouse 100 across every category on a single placeholder route. No content. No design components beyond what is strictly needed to prove the scaffold builds. No project pages, no essay pages, no palette, no file tree, no hero, no theme toggle. Those are all later PRs.

**Acceptance criteria for PR 1 — please confirm in the plan that each is addressed:**

- [ ] `pnpm create astro@latest` baseline, TypeScript `strict: true` enabled
- [ ] Astro config: `output: 'static'`, site URL placeholder, integrations: `@astrojs/tailwind`, `@astrojs/mdx`, `@astrojs/sitemap`
- [ ] Tailwind config: design tokens from §2 of the spec hardcoded as theme extension (colors, font families, spacing, border radii); `darkMode: ['class', '[data-theme="dark"]']`
- [ ] Global stylesheet that injects the token CSS variables for both themes and the inline blocking script in `<head>` that sets `data-theme` from `localStorage` or `prefers-color-scheme` before paint
- [ ] Self-hosted IBM Plex Mono (400 + 500) and Source Serif 4 (400, 500, 400 italic) as woff2 in `public/fonts/`, Latin-subset, with `font-display: swap` and `<link rel="preload">` in the base layout
- [ ] Content collections schema (`src/content/config.ts`) for `projects` and `writing` — schemas matching the meta-block requirements in §3.4 (stack, role, status, links) for projects, and (title, subtitle, lede, readingTime, draft) for writing. Both empty at this PR.
- [ ] One placeholder route at `/` rendering "monesh — scaffold ok" in serif h1, with the status bar component stub at the bottom showing `● ready · scaffold` to prove tokens and chrome split work
- [ ] `.github/workflows/ci.yml`: typecheck → build → Lighthouse CI (config asserting all four categories ≥ 100) → fail PR on any score below 100
- [ ] Cloudflare Pages config: `_routes.json` for 404 handling (placeholder, real 404 page lands in a later PR), build command `pnpm build`, output directory `dist/`
- [ ] `README.md` with: project description (2-3 lines), local dev commands, deploy notes
- [ ] `.editorconfig`, `.gitignore`, `.nvmrc` (pin to current Node LTS)
- [ ] No dependencies beyond the Astro integrations above, Tailwind, and Lighthouse CI's GitHub Action

**Things explicitly NOT in this PR (do not preemptively add them):**

- The two-pane workspace layout
- The file tree component
- The command palette
- The hero typewriter animation
- The theme toggle UI (the `data-theme` mechanism is in place, but no toggle yet)
- The Shiki code highlighter integration
- Any real project or essay content
- The MDX renderer with custom components
- The fuzzy-match index for the palette

**Stack lock (from spec §14):** Astro latest stable, TypeScript strict, Tailwind via the integration, MDX integration installed but no `.mdx` files yet, pnpm, deploy target Cloudflare Pages static. Node LTS via `.nvmrc`.

**Output expected from you right now:**

1. Confirm you've read `DESIGN_SPEC.md` and quote back the §14 tech stack table.
2. Produce the file plan (numbered list, each file with a one-line purpose).
3. List the dependencies you'll add with exact major versions.
4. Stop and wait for my approval.

Do not write any files yet.

## --- PROMPT END ---

---

## After Claude Code responds

Expect a response that looks like:

> I've read DESIGN_SPEC.md. The tech stack from §14 is: Astro 4+, TypeScript strict, Tailwind via @astrojs/tailwind, content collections with MDX, Shiki for code, self-hosted fzf-style fuzzy search, Cloudflare Pages static, GitHub Actions CI, Node LTS, pnpm.
>
> Plan for PR 1 (scaffold-only):
>
> 1. `package.json` — pnpm workspace, dependencies pinned
> 2. `astro.config.mjs` — output static, integrations: tailwind, mdx, sitemap
> 3. `tailwind.config.mjs` — design tokens as theme extension
> 4. `tsconfig.json` — strict mode, Astro defaults
> 5. `src/styles/global.css` — token CSS variables for both themes
> 6. `src/layouts/Base.astro` — base layout with theme script in head, font preloads
> 7. `src/components/StatusBar.astro` — minimal stub rendering `● ready · scaffold`
> 8. `src/pages/index.astro` — placeholder route
> 9. `src/content/config.ts` — content collection schemas for projects and writing
> 10. `public/fonts/*.woff2` — IBM Plex Mono 400/500, Source Serif 4 400/500/400-italic (subset latin)
> 11. `.github/workflows/ci.yml` — typecheck, build, Lighthouse CI gating
> 12. `lighthouserc.json` — assert all four scores ≥ 100
> 13. `_routes.json` — Cloudflare Pages routing
> 14. `README.md`, `.gitignore`, `.editorconfig`, `.nvmrc`
>
> Dependencies (exact majors): astro@4, @astrojs/tailwind@5, @astrojs/mdx@3, @astrojs/sitemap@3, tailwindcss@3, typescript@5. Dev: @lhci/cli@0.13.
>
> Awaiting approval.

**Your review checklist before you approve:**

- Is the plan ≤15 files? (Yes above.)
- Did Claude propose any extra files not in the criteria? (Push back: "remove X, that belongs in PR Y.")
- Did Claude propose extra dependencies? (Push back unless the rationale is airtight.)
- Did Claude skip something? (e.g. forgetting `.nvmrc` or the Lighthouse CI config — call it out.)
- Are the font files genuinely going to be subset? (Ask: "confirm you'll generate the subset .woff2 files via `glyphhanger` or equivalent, and include the exact command in the README under 'fonts' so I can re-run it later.")

When the plan is right: reply "approved." Claude Code will then write the files. Review each one as it appears. When the PR is complete:

1. Run `pnpm install && pnpm dev` and visit `localhost:4321`.
2. Run `pnpm build && pnpm preview` and verify the static output.
3. Run Lighthouse manually (Chrome DevTools or `lhci autorun`) and confirm 100/100/100/100.
4. Commit, push, open the PR, let the GitHub Action run.
5. Once CI is green, merge.

---

## What comes next

PR 2 is the two-pane workspace shell — file tree component, base layout, keyboard navigation. I'll provide that prompt when you've merged PR 1 and confirmed deploy works on Cloudflare Pages. Bring back any surprises from PR 1 (decisions Claude Code made that you want to revisit) and we'll fold them into PR 2's plan.

The full PR sequence from spec §13 and the original pipeline:

- **PR 1** — Scaffold (you're here)
- **PR 2** — Two-pane shell, file tree, keyboard nav, static content
- **PR 3** — Command palette with fuzzy search over hardcoded manifest
- **PR 4** — MDX rendering pipeline, Shiki, custom components
- **PR 5** — Featured content: `decoupling-the-monorepo` essay + `forge-savant` project
- **PR 6** — Remaining three projects
- **PR 7** — Landing route hero (`cat about.md` CSS typewriter)
- **PR 8** — Theme toggle UI + dark mode polish
- **PR 9** — 404 page with fuzzy suggestions, OG images, sitemap, RSS, favicon

Each gets its own copy-paste prompt when you're ready for it.
