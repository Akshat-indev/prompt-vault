import { z } from 'zod';

export const createPromptSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .default(''),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Prompt content cannot be empty'),
  original_prompt: z.string().trim().optional(),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category cannot exceed 50 characters'),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty'))
    .default([])
    .transform((tags) => Array.from(new Set(tags.map((t) => t.toLowerCase())))),
  isFavorite: z.boolean().default(false),
});

export const updatePromptSchema = createPromptSchema.partial();

export const promptIdParamSchema = z.object({
  id: z.string().uuid('Invalid prompt ID format (must be a valid UUID)'),
});

export const promptQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isFavorite: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  sortBy: z.enum(['updatedAt', 'createdAt', 'title']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const toggleFavoriteSchema = z.object({
  isFavorite: z.boolean().optional(),
});

export const analyzePromptInputSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt text is required' })
    .trim()
    .min(5, 'Prompt must be at least 5 characters long for analysis')
    .max(10000, 'Prompt cannot exceed 10,000 characters'),
});

export const aiVariableSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().default(''),
  example: z.string().trim().default(''),
});

export const aiAnalyzeResultSchema = z.object({
  title: z.string().trim().default('Reusable Prompt'),
  description: z.string().trim().default(''),
  category: z.string().trim().default('Other'),
  tags: z.array(z.string().trim()).default([]),
  original_prompt: z.string().trim().default(''),
  generalized_prompt: z.string().trim(),
  variables: z.array(aiVariableSchema).default([]),
});
