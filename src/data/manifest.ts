// Hardcoded route manifest for the command palette (spec §3.3).
// PR 4 will replace this with a build-time index derived from MDX
// content collections. Keep the `Entry` shape stable so callers
// don't have to change when the source switches.

export type Entry = {
  label: string;
  href: string;
  external?: boolean;
  subtitle?: string;
};

export const writing: Entry[] = [
  { label: 'decoupling-the-monorepo', href: '/writing/decoupling-the-monorepo' },
  { label: 'writing/', href: '/writing', subtitle: 'index' },
];

export const projects: Entry[] = [
  { label: 'forge-savant', href: '/projects/forge-savant' },
  { label: 'routemate', href: '/projects/routemate' },
  { label: 'plantpal', href: '/projects/plantpal' },
  { label: 'mc-modding', href: '/projects/mc-modding' },
  { label: 'projects/', href: '/projects', subtitle: 'index' },
];

export const external: Entry[] = [
  {
    label: 'github · monesh',
    href: 'https://github.com/BMonesh',
    external: true,
  },
];
