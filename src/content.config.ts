/* src/content.config.ts */
import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const archive = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: "./src/content/archive" }),
  schema: z.object({
    name: z.string(),
    era: z.string(),
    period: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    stats: z.record(z.string(), z.union([z.string(), z.number()])),
    information: z.array(z.string()),
    guide: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      content: z.union([z.string(), z.array(z.string())]),
    })).optional(),
    dimorphism: z.object({
      male: z.array(z.string()),
      female: z.array(z.string()),
    }).optional(),
    visuals: z.object({
      male: z.string().nullable(),
      female: z.string().nullable(),
      action: z.string().optional().nullable(), 
    }),
    audio: z.string().nullable(),
  }),
});

export const collections = { archive };