import { describe, expect, it } from 'vitest';
import { parseQuickAdd } from './parseQuickAdd';

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

  it('detects textual priority commands', () => {
    const result = parseQuickAdd('Plan sprint ASAP !high #ops');
    expect(result).toEqual({
      title: 'Plan sprint',
      tags: ['ops'],
      priority: 'high',
      importance: 5,
    });
  });

  it('supports priority shorthand tokens', () => {
    const result = parseQuickAdd('Ship API p2 #backend');
    expect(result).toEqual({
      title: 'Ship API',
      tags: ['backend'],
      priority: 'medium',
      importance: 3,
    });
  });

  it('handles emoji priority markers', () => {
    const result = parseQuickAdd('Close books 🔥 #finance');
    expect(result).toEqual({
      title: 'Close books',
      tags: ['finance'],
      priority: 'high',
      importance: 5,
    });
  });
});
