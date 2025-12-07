import { describe, expect, it } from 'vitest';
import { parseQuickAdd } from './parseQuickAdd';

const referenceDate = new Date('2024-03-01T10:00:00.000Z');

describe('parseQuickAdd', () => {
  it('extracts tags and title from input', () => {
    const result = parseQuickAdd('Pay rent #finance #bills');
    expect(result).toEqual({
      title: 'Pay rent',
      tags: ['finance', 'bills'],
    });
  });

  it('handles uppercase tags and punctuation', () => {
    const result = parseQuickAdd('Draft OKR summary #Planning!');
    expect(result).toEqual({
      title: 'Draft OKR summary',
      tags: ['planning'],
    });
  });

  it('returns entire string when parsing fails', () => {
    const result = parseQuickAdd('# # #');
    expect(result).toEqual({
      title: '# # #',
      tags: [],
    });
  });

  it('deduplicates tags', () => {
    const result = parseQuickAdd('Meet team #ops #ops #Ops');
    expect(result).toEqual({
      title: 'Meet team',
      tags: ['ops'],
    });
  });

  it('supports inputs without tags', () => {
    const result = parseQuickAdd('Just a title');
    expect(result).toEqual({
      title: 'Just a title',
      tags: [],
    });
  });

  it('parses natural language due dates and effort tokens', () => {
    const result = parseQuickAdd('Prep launch tomorrow 90m #ops', referenceDate);
    expect(result).toEqual({
      title: 'Prep launch',
      tags: ['ops'],
      dueDate: '2024-03-02',
      estimatedEffortMinutes: 90,
    });
  });

  it('supports "next" weekdays, priority markers, and combined durations', () => {
    const result = parseQuickAdd('Plan sprint next Friday 1h30m !high', referenceDate);
    expect(result).toEqual({
      title: 'Plan sprint',
      tags: [],
      dueDate: '2024-03-08',
      estimatedEffortMinutes: 90,
      priority: 'high',
      importance: 5,
    });
  });

  it('handles multi-token relative dates and priority shorthand', () => {
    const result = parseQuickAdd('Ship API in 3 days eta:45m p2 #backend', referenceDate);
    expect(result).toEqual({
      title: 'Ship API',
      tags: ['backend'],
      dueDate: '2024-03-04',
      estimatedEffortMinutes: 45,
      priority: 'medium',
      importance: 3,
    });
  });

  it('parses explicit due dates and preserves remaining text as title', () => {
    const result = parseQuickAdd('Close books due:2024-03-15 🔥 #finance', referenceDate);
    expect(result).toEqual({
      title: 'Close books',
      tags: ['finance'],
      dueDate: '2024-03-15',
      priority: 'high',
      importance: 5,
    });
  });
});
