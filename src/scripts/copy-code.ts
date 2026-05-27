// Inject a top-right copy button into every Shiki code block.
// Spec §3.8. Loads via Astro's <script> bundle; re-runs on each
// astro:page-load to survive ViewTransitions navigations.

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8v-2a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';

const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';

function enhance(): void {
  const pres = document.querySelectorAll<HTMLPreElement>(
    'pre.astro-code:not([data-copy-enhanced])'
  );
  pres.forEach((pre) => {
    pre.setAttribute('data-copy-enhanced', 'true');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'codeblock-copy';
    button.setAttribute('aria-label', 'copy code');
    button.innerHTML = COPY_ICON;
    button.addEventListener('click', async () => {
      const codeEl = pre.querySelector('code');
      const text = codeEl?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text);
        button.dataset.state = 'copied';
        button.innerHTML = CHECK_ICON;
        button.setAttribute('aria-label', 'copied');
        window.setTimeout(() => {
          delete button.dataset.state;
          button.innerHTML = COPY_ICON;
          button.setAttribute('aria-label', 'copy code');
        }, 1500);
      } catch {
        /* clipboard blocked — leave the button unchanged */
      }
    });
    pre.appendChild(button);
  });
}

document.addEventListener('astro:page-load', enhance);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhance);
} else {
  enhance();
}
