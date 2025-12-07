import { describe, expect, it } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '../validation';

describe('createTaskSchema', () => {
  it('accepts a complete task payload', () => {
    const data = {
      title: 'Ship MVP',
      notes: 'Coordinate release notes and migration plan.',
      dueAt: '2030-05-01T09:30',
      estimatedEffort: 120,
      importance: 5,
      project: 'Launch',
      tags: ['launch', 'product'],
      completed: false,
      archived: false,
    };

    expect(() => createTaskSchema.parse(data)).not.toThrow();
  });

  it('normalizes optional fields when omitted', () => {
    const parsed = createTaskSchema.parse({
      title: 'Follow up with design partners',
      notes: '',
      dueAt: '',
      estimatedEffort: '',
      importance: '',
      project: '  ',
      tags: [],
    });

    expect(parsed.notes).toBe('');
    expect(parsed.dueAt).toBeNull();
    expect(parsed.estimatedEffort).toBeUndefined();
    expect(parsed.importance).toBeUndefined();
    expect(parsed.project).toBeUndefined();
  });

  it('rejects invalid due dates', () => {
    const result = createTaskSchema.safeParse({
      title: 'Sync with finance',
      dueAt: 'not-a-date',
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects effort outside allowed range', () => {
    const result = createTaskSchema.safeParse({
      title: 'Oversized effort',
      estimatedEffort: 5000,
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects importance outside 1-5', () => {
    const result = createTaskSchema.safeParse({
      title: 'Out-of-range importance',
      importance: 7,
      tags: [],
    });

    expect(result.success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('allows partial updates', () => {
    const data = {
      notes: 'Updated notes',
      completed: true,
      archived: true,
    };

    expect(() => updateTaskSchema.parse(data)).not.toThrow();
  });
});
