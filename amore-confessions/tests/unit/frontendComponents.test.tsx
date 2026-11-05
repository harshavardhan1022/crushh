import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../frontend/components/ThemeProvider';
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

  it('should dynamically reveal B.Tech branch dropdown and require branch before academic year for B.Tech', async () => {
    render(<ConfessionForm />);

    // Initially branch select is not rendered
    expect(screen.queryByLabelText(/Select Branch/i)).toBeNull();
    // Academic year is also not rendered yet
    expect(screen.queryByLabelText(/Academic Year/i)).toBeNull();

    // Select B.Tech
    const deptSelect = screen.getByLabelText(/Department/i);
    fireEvent.change(deptSelect, { target: { value: 'B.Tech' } });

    await waitFor(() => {
      // Branch dropdown should now appear
      const branchSelect = screen.getByLabelText(/Select Branch/i);
      expect(branchSelect).toBeDefined();
    });

    // Academic year should still be hidden until branch is selected
    expect(screen.queryByLabelText(/Academic Year/i)).toBeNull();

    // Select CSE branch
    const branchSelect = screen.getByLabelText(/Select Branch/i);
    fireEvent.change(branchSelect, { target: { value: 'CSE' } });

    await waitFor(() => {
      // Academic year dropdown should now be rendered with options
      const yearSelect = screen.getByLabelText(/Academic Year/i);
      expect(yearSelect).toBeDefined();
      expect(screen.getByText('1st Year')).toBeDefined();
      expect(screen.getByText('Graduated')).toBeDefined();
    });
  });

  it('should display academic year directly without branch dropdown for non-B.Tech departments', async () => {
    render(<ConfessionForm />);

    const deptSelect = screen.getByLabelText(/Department/i);
    fireEvent.change(deptSelect, { target: { value: 'MBA' } });

    await waitFor(() => {
      // Branch select should NOT be rendered
      expect(screen.queryByLabelText(/Select Branch/i)).toBeNull();

      // Academic year should be available immediately with MBA years (1st, 2nd)
      const yearSelect = screen.getByLabelText(/Academic Year/i);
      expect(yearSelect).toBeDefined();
      expect(screen.getByText('1st Year')).toBeDefined();
      expect(screen.getByText('2nd Year')).toBeDefined();
      expect(screen.queryByText('3rd Year')).toBeNull();
    });
  });
});
