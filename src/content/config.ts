import { defineCollection, z } from 'astro:content';

// Spec §3.4 — project meta block: stack, role, status, links.
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    stack: z.array(z.string()).min(1),
    role: z.string(),
    status: z.enum(['Shipped', 'Archived', 'WIP']),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().url(),
        })
      )
      .default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Spec §4.3 — essay frontmatter: title, subtitle, lede, readingTime, draft.
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    lede: z.string().optional(),
    readingTime: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, writing };
