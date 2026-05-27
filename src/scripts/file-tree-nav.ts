// Roving-tabindex keyboard navigation for the workspace tree.
// Spec §3.1: arrow keys move focus, Enter activates (browser default on <a>).
// Vim keys (j/k/h/l/gg/G) and folder expand/collapse defer to a later PR.

function setup(): void {
  const tree = document.querySelector<HTMLElement>('[data-file-tree]');
  if (!tree) return;
  if (tree.dataset.initialized === 'true') return;
  tree.dataset.initialized = 'true';

  const rows = (): HTMLElement[] =>
    Array.from(tree.querySelectorAll<HTMLElement>('[data-tree-row]'));

  const moveTo = (target: HTMLElement, all: HTMLElement[]): void => {
    for (const r of all) r.tabIndex = -1;
    target.tabIndex = 0;
    target.focus();
  };

  tree.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || target.dataset.treeRow === undefined) return;

    const all = rows();
    const index = all.indexOf(target);
    if (index < 0) return;

    let next: HTMLElement | null = null;
    switch (event.key) {
      case 'ArrowDown':
        next = all[Math.min(index + 1, all.length - 1)] ?? null;
        break;
      case 'ArrowUp':
        next = all[Math.max(index - 1, 0)] ?? null;
        break;
      case 'Home':
        next = all[0] ?? null;
        break;
      case 'End':
        next = all[all.length - 1] ?? null;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (next && next !== target) moveTo(next, all);
  });
}

// `astro:page-load` fires on initial load AND on each ViewTransitions
// navigation. The init guard inside setup() makes repeated calls idempotent.
document.addEventListener('astro:page-load', setup);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}
