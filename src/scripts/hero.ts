// Landing hero controller — spec §4.1 / §7.
// The typing animation itself is pure CSS (clip-path + steps()).
// This script only:
//   - flips the status bar into `typing` mode on /
//   - listens for any user interaction to snap the hero to its done state
//   - tears down listeners cleanly on ViewTransitions navigation away
//   - short-circuits immediately under prefers-reduced-motion

function setStatusBar(mode: 'typing' | 'ready'): void {
  const modeEl = document.querySelector('[data-statusbar-mode]');
  const ctxEl = document.querySelector('[data-statusbar-context]');
  if (!modeEl || !ctxEl) return;
  if (mode === 'typing') {
    modeEl.textContent = 'typing';
    ctxEl.textContent = '65 chars/sec · 1 paragraph queued';
  } else {
    modeEl.textContent = 'ready';
    ctxEl.textContent = 'scaffold';
  }
}

function init(): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return;
  if (hero.dataset.heroInit === 'true') return;
  hero.dataset.heroInit = 'true';

  setStatusBar('typing');

  const ctrl = new AbortController();
  const signal = ctrl.signal;
  let completed = false;
  let autoTimer = 0;

  function complete(): void {
    if (completed) return;
    completed = true;
    hero.dataset.state = 'done';
    setStatusBar('ready');
    if (autoTimer) window.clearTimeout(autoTimer);
    ctrl.abort();
  }

  document.addEventListener('keydown', complete, { signal });
  document.addEventListener('mousedown', complete, { signal });
  document.addEventListener('touchstart', complete, { signal, passive: true });
  window.addEventListener('scroll', complete, { signal, passive: true });

  // Cleanup on navigation away — don't touch the status bar; the next
  // page's init handles its own grammar.
  document.addEventListener(
    'astro:before-swap',
    () => {
      if (autoTimer) window.clearTimeout(autoTimer);
      ctrl.abort();
    },
    { signal }
  );

  // Auto-complete after typing (1.6s) + p2 fade (400ms) + buffer (100ms).
  autoTimer = window.setTimeout(complete, 2100);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    complete();
  }
}

document.addEventListener('astro:page-load', init);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
