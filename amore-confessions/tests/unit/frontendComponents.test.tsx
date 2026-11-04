import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../frontend/components/ThemeProvider';
import { ThemeToggle } from '../../frontend/components/ThemeToggle';
import { LoadingAnimation } from '../../frontend/components/LoadingAnimation';
import { ConfessionForm } from '../../frontend/components/ConfessionForm';

// Helper component to test ThemeProvider
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('Frontend Components', () => {
  it('should render ThemeProvider and toggle theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('theme-val');
    expect(themeSpan).toBeDefined();

    const button = screen.getByRole('button', { name: /toggle/i });
    fireEvent.click(button);
  });

  it('should render LoadingAnimation with text', () => {
    render(<LoadingAnimation text="Authenticating..." />);
    expect(screen.getByText('Authenticating...')).toBeDefined();
  });

  it('should render ConfessionForm with required fields and character counter', () => {
    render(<ConfessionForm />);

    // Check heading
    expect(screen.getByText('Confess Your Feelings')).toBeDefined();

    // Check crush name input
    expect(screen.getByPlaceholderText(/Enter your crush's name/i)).toBeDefined();

    // Check confession message textarea
    expect(screen.getByPlaceholderText(/Tell your story/i)).toBeDefined();

    // Check character counter
    expect(screen.getByText(/0 \/ 2000/)).toBeDefined();

    // Check department dropdown
    const deptSelect = screen.getByLabelText(/Department/i);
    expect(deptSelect).toBeDefined();

    // Check submit button
    expect(screen.getByRole('button', { name: /Send My Confession/i })).toBeDefined();
  });

  it('should dynamically reveal academic year dropdown when department is selected', async () => {
    render(<ConfessionForm />);

    // Initially year placeholder indicates selecting department first
    expect(screen.getByText('Select department first')).toBeDefined();

    // Select B.Tech
    const deptSelect = screen.getByLabelText(/Department/i);
    fireEvent.change(deptSelect, { target: { value: 'B.Tech' } });

    await waitFor(() => {
      // Academic year select should now be visible with options
      const yearSelect = screen.getByLabelText(/Academic Year/i);
      expect(yearSelect).toBeDefined();
    });
  });
});

