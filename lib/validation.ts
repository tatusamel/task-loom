import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(160, 'Title is too long'),
  content: z.string().optional(),
  tags: z.array(z.string().min(1)).max(12).default([]),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteQuerySchema = z.object({
  query: z.string().optional(),
  tags: z
    .preprocess(value => {
      if (Array.isArray(value)) {
        return value
          .flatMap(entry => (typeof entry === 'string' ? entry.split(',') : []))
          .map(tag => tag.trim().toLowerCase())
          .filter(Boolean);
      }
      if (typeof value === 'string') {
        return value
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(Boolean);
      }
      return [];
    }, z.array(z.string().min(1)).max(10).default([])),
  status: z.enum(['active', 'archived', 'all']).default('active'),
});

const optionalDateTime = z.preprocess(
  value => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z
    .string()
    .refine(val => !Number.isNaN(new Date(val).getTime()), { message: 'Invalid date/time' })
    .optional(),
);

const optionalPositiveMinutes = z.preprocess(
  value => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = typeof value === 'string' ? Number(value) : value;
    return Number.isNaN(Number(parsed)) ? value : Number(parsed);
  },
  z
    .number({
      invalid_type_error: 'Estimated effort must be a number of minutes',
    })
    .int('Estimated effort must be an integer')
    .positive('Estimated effort must be greater than zero')
    .max(24 * 60, 'Keep estimated effort under 24 hours')
    .optional(),
);

const optionalImportance = z.preprocess(
  value => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = typeof value === 'string' ? Number(value) : value;
    return Number.isNaN(Number(parsed)) ? value : Number(parsed);
  },
  z
    .number({
      invalid_type_error: 'Importance must be a number between 1 and 5',
    })
    .int('Importance must be an integer')
    .min(1, 'Importance must be at least 1')
    .max(5, 'Importance must be at most 5')
    .optional(),
);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(160, 'Title is too long'),
  notes: z.string().optional(),
  dueAt: optionalDateTime,
  estimatedEffort: optionalPositiveMinutes,
  importance: optionalImportance,
  project: z.preprocess(
    value => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().max(80, 'Project names should be short').optional(),
  ),
  tags: z.array(z.string().min(1)).max(12).default([]),
  completed: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  status: z.enum(['all', 'active', 'completed', 'archived', 'upcoming']).default('all'),
  tag: z.string().optional(),
  project: z.string().optional(),
  query: z.string().optional(),
});
