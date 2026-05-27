// Subsequence fuzzy matcher (fzf-style). Spec §3.3.
//
// Returns the indices of matched characters in the target so callers can
// render them with `font-weight: 500` highlighting. Scoring rewards
// consecutive matches, earlier positions, and matches at word boundaries
// (-, _, /, ., or space).

export interface MatchResult {
  score: number;
  positions: number[];
}

export function matchSubsequence(
  query: string,
  target: string
): MatchResult | null {
  if (!query) return { score: 0, positions: [] };
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const positions: number[] = [];
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t.charAt(ti) === q.charAt(qi)) {
      positions.push(ti);
      qi++;
    }
  }
  if (qi < q.length) return null;

  let score = -positions[0];
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] === positions[i - 1] + 1) score += 2;
  }
  for (const p of positions) {
    if (p === 0) {
      score += 3;
    } else {
      const prev = t.charAt(p - 1);
      if (
        prev === '-' ||
        prev === '_' ||
        prev === '/' ||
        prev === ' ' ||
        prev === '.'
      ) {
        score += 2;
      }
    }
  }
  return { score, positions };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function highlight(label: string, positions: number[]): string {
  if (positions.length === 0) return escapeHtml(label);
  const out: string[] = [];
  let cursor = 0;
  for (const p of positions) {
    if (p > cursor) out.push(escapeHtml(label.slice(cursor, p)));
    out.push(
      '<span class="palette-match">' + escapeHtml(label.charAt(p)) + '</span>'
    );
    cursor = p + 1;
  }
  if (cursor < label.length) out.push(escapeHtml(label.slice(cursor)));
  return out.join('');
}
