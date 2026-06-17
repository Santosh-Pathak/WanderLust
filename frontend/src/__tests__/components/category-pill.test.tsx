import { render, screen } from '@testing-library/react';
import CategoryPill from '@/components/category-pill';

describe('CategoryPill', () => {
  it('renders category name', () => {
    render(<CategoryPill category="Travel" />);
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('applies selected styles when selected', () => {
    render(<CategoryPill category="Travel" selected />);
    const pill = screen.getByText('Travel');
    expect(pill.className).toContain('bg-pink-500');
  });

  it('applies disabled styles when disabled', () => {
    render(<CategoryPill category="Travel" disabled />);
    const pill = screen.getByText('Travel');
    expect(pill.className).toContain('cursor-not-allowed');
  });
});
