// Client-side 404 enhancer — spec §4.4.
// Static export can't know the bad URL at build time (Astro renders 404.astro
// with Astro.url = /404), so this script reads window.location at runtime,
// fills the placeholder elements, runs the existing fuzzy matcher against
// the manifest, and surfaces top-3 suggestions.

import { matchSubsequence } from './fuzzy';
import { writing, projects } from '../data/manifest';

interface Candidate {
  label: string;
  href: string;
  score: number;
}

const extraRoutes: { label: string; href: string }[] = [
  { label: 'about', href: '/about' },
  { label: 'contact', href: '/contact' },
  { label: 'projects/', href: '/projects' },
  { label: 'writing/', href: '/writing' },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setText(selector: string, text: string): void {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = text;
  });
}

function formatReferrer(raw: string): string {
  if (!raw) return 'direct';
  try {
    const url = new URL(raw);
    return url.host || raw;
  } catch {
    return raw;
  }
}

function init(): void {
  const root = document.querySelector<HTMLElement>('.page-404');
  if (!root) return;
  if (root.dataset.init === 'true') return;
  root.dataset.init = 'true';

  const badPath = window.location.pathname || '/';
  const referrer = document.referrer || '';

  setText('[data-404-badpath]', badPath);
  setText('[data-404-cmdpath]', badPath);
  setText('[data-404-errpath]', badPath);
  setText('[data-404-meta-path]', badPath);
  setText('[data-404-meta-referrer]', formatReferrer(referrer));

  const knownPaths = [
    ...writing.map((e) => ({ label: e.label, href: e.href })),
    ...projects.map((e) => ({ label: e.label, href: e.href })),
    ...extraRoutes,
  ];

  // Query against the most informative path segment.
  const segments = badPath.split('/').filter(Boolean);
  const query = segments.length > 0 ? segments[segments.length - 1] : '';

  const candidates: Candidate[] = [];
  if (query) {
    for (const entry of knownPaths) {
      const m =
        matchSubsequence(query, entry.label) ??
        matchSubsequence(query, entry.href);
      if (m) candidates.push({ ...entry, score: m.score });
    }
    candidates.sort((a, b) => b.score - a.score);
  }
  const top = candidates.slice(0, 3);

  setText('[data-404-meta-count]', String(top.length));

  const list = document.querySelector<HTMLElement>('[data-404-suggestions]');
  if (list) {
    if (top.length === 0) {
      list.innerHTML =
        '<li class="suggestion-empty">no close matches &mdash; try the palette (⌘K)</li>';
    } else {
      list.innerHTML = top
        .map(
          (c) =>
            '<li><a href="' +
            escapeHtml(c.href) +
            '"><span class="suggestion-label">' +
            escapeHtml(c.label) +
            '</span><span class="suggestion-href">' +
            escapeHtml(c.href) +
            '</span><span class="suggestion-score">score ' +
            c.score +
            '</span></a></li>'
        )
        .join('');
    }
  }

  // Status bar: ● 404 · utf-8 · fuzzy: subsequence · N suggestion(s)
  const modeEl = document.querySelector('[data-statusbar-mode]');
  const ctxEl = document.querySelector('[data-statusbar-context]');
  if (modeEl) modeEl.textContent = '404';
  if (ctxEl) {
    ctxEl.textContent =
      'utf-8 · fuzzy: subsequence · ' +
      top.length +
      (top.length === 1 ? ' suggestion' : ' suggestions');
  }
}

document.addEventListener('astro:page-load', init);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
