import formatPostTime from '@/utils/format-post-time';

describe('formatPostTime', () => {
  it('formats date string correctly', () => {
    const result = formatPostTime('2024-01-15T12:00:00Z');
    expect(result).toBe('January 15, 2024');
  });

  it('handles invalid date gracefully', () => {
    const result = formatPostTime('not-a-date');
    expect(result).toBe('Invalid Date');
  });
});
