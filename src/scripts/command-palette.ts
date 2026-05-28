// Command palette controller. Spec §3.3 / §3.2 / §7.
// Vanilla TS, no framework. Loaded lazily via the <script> tag in
// CommandPalette.astro; reuses the bundle across ViewTransitions
// navigations via document-level listeners and an `astro:page-load` hook.

import { navigate } from 'astro:transitions/client';
import { matchSubsequence, highlight } from './fuzzy';
import {
  writing as writingData,
  projects as projectsData,
  external as externalData,
  type Entry,
} from '../data/manifest';

type VerbPrefix = null | 'open' | 'cat' | 'goto';
const VERB_CYCLE: VerbPrefix[] = [null, 'open', 'cat', 'goto'];

type VerbEntry = {
  kind: 'verb';
  label: string;
  subtitle: string;
  action: 'theme' | 'navigate' | 'prefill';
  href?: string;
  prefill?: string;
};

type PathEntry = {
  kind: 'path';
  label: string;
  href: string;
  external?: boolean;
  subtitle?: string;
};

type AnyEntry = VerbEntry | PathEntry;

interface RankedEntry {
  entry: AnyEntry;
  positions: number[];
  score: number;
}

interface GroupedResults {
  writing: RankedEntry[];
  projects: RankedEntry[];
  verbs: RankedEntry[];
  external: RankedEntry[];
}

// Verbs are not data — they carry behavior — so they live here, not in
// the manifest. `about`/`contact` are listed as bare-name verbs because
// the locked spec group order (§3.3) has no home for root pages.
const verbEntries: VerbEntry[] = [
  {
    kind: 'verb',
    label: 'theme',
    subtitle: 'toggle light/dark',
    action: 'theme',
  },
  {
    kind: 'verb',
    label: 'about',
    subtitle: 'navigate to /about',
    action: 'navigate',
    href: '/about',
  },
  {
    kind: 'verb',
    label: 'contact',
    subtitle: 'navigate to /contact',
    action: 'navigate',
    href: '/contact',
  },
  {
    kind: 'verb',
    label: 'open',
    subtitle: 'navigate to a path',
    action: 'prefill',
    prefill: 'open ',
  },
  {
    // TODO PR 4: when the MDX renderer ships, switch `cat` to render
    // the target in-pane without changing route (spec §3.3).
    kind: 'verb',
    label: 'cat',
    subtitle: 'render a path (currently same as open)',
    action: 'prefill',
    prefill: 'cat ',
  },
  {
    kind: 'verb',
    label: 'goto',
    subtitle: 'open external',
    action: 'prefill',
    prefill: 'goto ',
  },
];

const toPath = (e: Entry): PathEntry => ({ kind: 'path', ...e });
const writingPaths: PathEntry[] = writingData.map(toPath);
const projectsPaths: PathEntry[] = projectsData.map(toPath);
const externalPaths: PathEntry[] = externalData.map(toPath);

interface State {
  open: boolean;
  rawQuery: string;
  verbMode: VerbPrefix;
  restQuery: string;
  selectedIndex: number;
  results: RankedEntry[];
  lastTrigger: HTMLElement | null;
}

const state: State = {
  open: false,
  rawQuery: '',
  verbMode: null,
  restQuery: '',
  selectedIndex: 0,
  results: [],
  lastTrigger: null,
};

let palette: HTMLElement | null = null;
let inputEl: HTMLInputElement | null = null;
let resultsEl: HTMLElement | null = null;
let wired = false;

function parseQuery(raw: string): {
  verbMode: VerbPrefix;
  restQuery: string;
} {
  const trimmed = raw.replace(/^\s+/, '');
  for (const v of ['open', 'cat', 'goto'] as const) {
    if (trimmed === v) return { verbMode: v, restQuery: '' };
    if (trimmed.startsWith(v + ' ')) {
      return { verbMode: v, restQuery: trimmed.slice(v.length + 1) };
    }
  }
  return { verbMode: null, restQuery: trimmed };
}

function rankList(list: AnyEntry[], q: string): RankedEntry[] {
  const out: RankedEntry[] = [];
  for (const entry of list) {
    const m = matchSubsequence(q, entry.label);
    if (m) out.push({ entry, positions: m.positions, score: m.score });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

function computeResults(): GroupedResults {
  const { verbMode, restQuery } = state;
  const q = restQuery;
  if (verbMode === 'open' || verbMode === 'cat') {
    return {
      writing: rankList(writingPaths, q),
      projects: rankList(projectsPaths, q),
      verbs: [],
      external: [],
    };
  }
  if (verbMode === 'goto') {
    return {
      writing: [],
      projects: [],
      verbs: [],
      external: rankList(externalPaths, q),
    };
  }
  return {
    writing: rankList(writingPaths, q),
    projects: rankList(projectsPaths, q),
    verbs: rankList(verbEntries, q),
    external: rankList(externalPaths, q),
  };
}

const sectionsOrder: { key: keyof GroupedResults; label: string }[] = [
  { key: 'writing', label: 'WRITING' },
  { key: 'projects', label: 'PROJECTS' },
  { key: 'verbs', label: 'VERBS' },
  { key: 'external', label: 'EXTERNAL' },
];

function render(grouped: GroupedResults): void {
  if (!resultsEl) return;
  const flat: RankedEntry[] = [];
  const html: string[] = [];
  let globalIndex = 0;

  for (const section of sectionsOrder) {
    const entries = grouped[section.key];
    const count = entries.length;
    const word = count === 1 ? 'match' : 'matches';
    html.push(
      '<li role="presentation" class="palette-group-label">' +
        section.label +
        ' &middot; ' +
        count +
        ' ' +
        word +
        '</li>'
    );
    if (count === 0) {
      html.push(
        '<li role="presentation" class="palette-group-empty">0 matches</li>'
      );
      continue;
    }
    for (const r of entries) {
      flat.push(r);
      const id = 'palette-result-' + globalIndex;
      const labelHtml = highlight(r.entry.label, r.positions);
      const subtitle = r.entry.subtitle
        ? '<span class="palette-subtitle">' +
          r.entry.subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
          '</span>'
        : '';
      const trailing =
        r.entry.kind === 'path' && r.entry.external
          ? '<span class="palette-trailing" aria-hidden="true">&#x2197;</span>'
          : '';
      html.push(
        '<li id="' +
          id +
          '" role="option" data-palette-result data-index="' +
          globalIndex +
          '" class="palette-result">' +
          '<span class="palette-label">' +
          labelHtml +
          '</span>' +
          subtitle +
          trailing +
          '</li>'
      );
      globalIndex++;
    }
  }

  resultsEl.innerHTML = html.join('');
  state.results = flat;
  if (state.selectedIndex >= flat.length) state.selectedIndex = 0;
  applySelection();
  updateStatusBar();
}

function applySelection(): void {
  if (!resultsEl || !inputEl) return;
  const rows = resultsEl.querySelectorAll<HTMLElement>('[data-palette-result]');
  rows.forEach((row, i) => {
    if (i === state.selectedIndex) {
      row.setAttribute('aria-selected', 'true');
      inputEl!.setAttribute('aria-activedescendant', row.id);
      row.scrollIntoView({ block: 'nearest' });
    } else {
      row.removeAttribute('aria-selected');
    }
  });
  if (rows.length === 0) {
    inputEl.removeAttribute('aria-activedescendant');
  }
}

function recompute(): void {
  const parsed = parseQuery(state.rawQuery);
  state.verbMode = parsed.verbMode;
  state.restQuery = parsed.restQuery;
  const grouped = computeResults();
  render(grouped);
}

function updateStatusBar(): void {
  const mode = document.querySelector('[data-statusbar-mode]');
  const ctx = document.querySelector('[data-statusbar-context]');
  if (mode) mode.textContent = state.open ? 'palette' : 'ready';
  if (ctx) {
    if (state.open) {
      const total = state.results.length;
      ctx.textContent = total + ' ' + (total === 1 ? 'result' : 'results');
    } else {
      ctx.textContent = 'scaffold';
    }
  }
  document.querySelectorAll<HTMLElement>('[data-when="ready"]').forEach((el) => {
    el.hidden = state.open;
  });
  document
    .querySelectorAll<HTMLElement>('[data-when="palette"]')
    .forEach((el) => {
      el.hidden = !state.open;
    });
  document.querySelectorAll<HTMLElement>('[data-when="modal"]').forEach((el) => {
    el.hidden = !state.open;
  });
}

function openPalette(trigger: HTMLElement | null): void {
  if (state.open || !palette || !inputEl) return;
  state.open = true;
  state.lastTrigger =
    trigger && document.contains(trigger) ? trigger : null;
  state.rawQuery = '';
  inputEl.value = '';
  state.selectedIndex = 0;
  palette.setAttribute('data-open', 'true');
  recompute();
  requestAnimationFrame(() => inputEl?.focus());
}

function closePalette(): void {
  if (!state.open || !palette) return;
  state.open = false;
  palette.setAttribute('data-open', 'false');
  updateStatusBar();
  const trigger = state.lastTrigger;
  state.lastTrigger = null;
  if (trigger && document.contains(trigger)) {
    trigger.focus();
  }
}

function moveSelection(delta: number): void {
  const total = state.results.length;
  if (total === 0) return;
  let next = state.selectedIndex + delta;
  if (next < 0) next = 0;
  if (next >= total) next = total - 1;
  state.selectedIndex = next;
  applySelection();
}

function selectIndex(i: number): void {
  if (state.results.length === 0) return;
  state.selectedIndex = Math.max(0, Math.min(i, state.results.length - 1));
  applySelection();
}

function toggleTheme(): void {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem('monesh:theme', next);
  } catch {
    /* private mode — swallow */
  }
}

function executeSelected(meta: boolean): void {
  const r = state.results[state.selectedIndex];
  if (!r) return;
  const entry = r.entry;
  if (entry.kind === 'verb') {
    if (entry.action === 'theme') {
      toggleTheme();
      closePalette();
    } else if (entry.action === 'navigate' && entry.href) {
      const href = entry.href;
      closePalette();
      navigate(href);
    } else if (entry.action === 'prefill' && entry.prefill && inputEl) {
      inputEl.value = entry.prefill;
      state.rawQuery = inputEl.value;
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
      state.selectedIndex = 0;
      recompute();
    }
    return;
  }
  const href = entry.href;
  if (entry.external || meta) {
    window.open(href, '_blank', 'noopener,noreferrer');
    closePalette();
  } else {
    closePalette();
    navigate(href);
  }
}

function cycleVerbPrefix(): void {
  if (!inputEl) return;
  const idx = VERB_CYCLE.indexOf(state.verbMode);
  const next = VERB_CYCLE[(idx + 1) % VERB_CYCLE.length];
  const rest = state.restQuery;
  inputEl.value = next === null ? rest : next + ' ' + rest;
  state.rawQuery = inputEl.value;
  inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
  state.selectedIndex = 0;
  recompute();
}

function onKey(event: KeyboardEvent): void {
  const meta = event.metaKey || event.ctrlKey;
  if (meta && (event.key === 'k' || event.key === 'K')) {
    event.preventDefault();
    if (state.open) closePalette();
    else openPalette(document.activeElement as HTMLElement | null);
    return;
  }
  if (!state.open) return;

  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      closePalette();
      break;
    case 'ArrowDown':
      event.preventDefault();
      moveSelection(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveSelection(-1);
      break;
    case 'Home':
      event.preventDefault();
      selectIndex(0);
      break;
    case 'End':
      event.preventDefault();
      selectIndex(state.results.length - 1);
      break;
    case 'Enter':
      event.preventDefault();
      executeSelected(meta);
      break;
    case 'Tab':
      event.preventDefault();
      cycleVerbPrefix();
      break;
  }
}

function onClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const trigger = target.closest<HTMLElement>('[data-palette-trigger]');
  if (trigger) {
    event.preventDefault();
    if (state.open) closePalette();
    else openPalette(trigger);
    return;
  }

  if (!state.open) return;

  const row = target.closest<HTMLElement>('[data-palette-result]');
  if (row) {
    const i = parseInt(row.dataset.index ?? '-1', 10);
    if (i >= 0) {
      state.selectedIndex = i;
      applySelection();
      executeSelected(event.metaKey || event.ctrlKey);
    }
    return;
  }

  if (target.closest('[data-palette-scrim]')) {
    closePalette();
  }
}

function onFocusOut(event: FocusEvent): void {
  if (!state.open || !palette || !inputEl) return;
  const next = event.relatedTarget;
  if (next instanceof Node && palette.contains(next)) return;
  // Soft focus trap — refocus the input.
  inputEl.focus();
}

function onInput(): void {
  if (!inputEl) return;
  state.rawQuery = inputEl.value;
  state.selectedIndex = 0;
  recompute();
}

function init(): void {
  palette = document.getElementById('command-palette');
  if (!palette) return;
  inputEl = palette.querySelector<HTMLInputElement>('[data-palette-input]');
  resultsEl = palette.querySelector<HTMLElement>('[data-palette-results]');
  if (!inputEl || !resultsEl) return;

  state.open = false;
  state.rawQuery = '';
  state.selectedIndex = 0;
  palette.setAttribute('data-open', 'false');
  recompute();
  updateStatusBar();

  inputEl.addEventListener('input', onInput);

  if (!wired) {
    wired = true;
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    document.addEventListener('focusout', onFocusOut, true);
  }
}

document.addEventListener('astro:page-load', init);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
