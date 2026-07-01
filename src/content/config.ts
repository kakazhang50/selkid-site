import { defineCollection, z } from 'astro:content';

const educatorNotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    featured: z.boolean().default(false),
    category: z.enum(['classroom', 'sel', 'ai', 'product']).default('classroom'),
  }),
});

export const collections = { educatorNotes };
