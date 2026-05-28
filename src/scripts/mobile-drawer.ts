// Mobile drawer controller — spec §3.2 (status bar grammar), §7 (motion),
// §8 (responsive), §9 (a11y / focus trap).
//
// Open via [data-drawer-trigger]. Close via [data-drawer-close], scrim
// click, Esc, or navigation away. Maintains a Tab-key focus trap inside
// the panel. Shares the status bar's [data-when="modal"] toggle with
// the command palette.

interface State {
  open: boolean;
  lastTrigger: HTMLElement | null;
}

const state: State = {
  open: false,
  lastTrigger: null,
};

let drawer: HTMLElement | null = null;
let panel: HTMLElement | null = null;
let wired = false;

function setStatusBar(mode: 'ready' | 'drawer'): void {
  const modeEl = document.querySelector('[data-statusbar-mode]');
  const ctxEl = document.querySelector('[data-statusbar-context]');
  if (mode === 'drawer') {
    if (modeEl) modeEl.textContent = 'drawer open';
    if (ctxEl) ctxEl.textContent = 'tap scrim to dismiss';
  } else {
    if (modeEl) modeEl.textContent = 'ready';
    if (ctxEl) ctxEl.textContent = 'scaffold';
  }
  document.querySelectorAll<HTMLElement>('[data-when="ready"]').forEach((el) => {
    el.hidden = mode === 'drawer';
  });
  document.querySelectorAll<HTMLElement>('[data-when="modal"]').forEach((el) => {
    el.hidden = mode !== 'drawer';
  });
}

function getFocusables(): HTMLElement[] {
  if (!panel) return [];
  const selector =
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
  return Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null
  );
}

function openDrawer(trigger: HTMLElement | null): void {
  if (state.open || !drawer) return;
  state.open = true;
  state.lastTrigger = trigger && document.contains(trigger) ? trigger : null;
  drawer.setAttribute('data-open', 'true');
  drawer.setAttribute('aria-hidden', 'false');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  setStatusBar('drawer');
  requestAnimationFrame(() => {
    const focusables = getFocusables();
    focusables[0]?.focus();
  });
}

function closeDrawer(): void {
  if (!state.open || !drawer) return;
  state.open = false;
  drawer.setAttribute('data-open', 'false');
  drawer.setAttribute('aria-hidden', 'true');
  document
    .querySelectorAll<HTMLElement>('[data-drawer-trigger]')
    .forEach((t) => t.setAttribute('aria-expanded', 'false'));
  setStatusBar('ready');
  const trigger = state.lastTrigger;
  state.lastTrigger = null;
  if (trigger && document.contains(trigger)) {
    trigger.focus();
  }
}

function onKey(event: KeyboardEvent): void {
  if (!state.open) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeDrawer();
    return;
  }
  if (event.key === 'Tab') {
    const focusables = getFocusables();
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function onClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const trigger = target.closest<HTMLElement>('[data-drawer-trigger]');
  if (trigger) {
    event.preventDefault();
    openDrawer(trigger);
    return;
  }

  if (!state.open) return;

  if (target.closest<HTMLElement>('[data-drawer-close]')) {
    event.preventDefault();
    closeDrawer();
    return;
  }

  if (target.closest('[data-drawer-scrim]')) {
    closeDrawer();
    return;
  }

  if (panel && panel.contains(target)) {
    const anchor = target.closest<HTMLElement>('a[href]');
    if (anchor) {
      // Navigation incoming — close the drawer immediately for snappy UX.
      closeDrawer();
    }
  }
}

function onBeforeSwap(): void {
  if (!state.open || !drawer) return;
  // Snap closed without animation; the new page renders fresh.
  state.open = false;
  drawer.setAttribute('data-open', 'false');
  drawer.setAttribute('aria-hidden', 'true');
  setStatusBar('ready');
  state.lastTrigger = null;
}

function init(): void {
  drawer = document.getElementById('mobile-drawer');
  if (!drawer) return;
  panel = drawer.querySelector<HTMLElement>('[data-drawer-panel]');
  if (!panel) return;

  // Reset per-page state.
  state.open = false;
  state.lastTrigger = null;
  drawer.setAttribute('data-open', 'false');
  drawer.setAttribute('aria-hidden', 'true');

  if (!wired) {
    wired = true;
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    document.addEventListener('astro:before-swap', onBeforeSwap);
  }
}

document.addEventListener('astro:page-load', init);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
