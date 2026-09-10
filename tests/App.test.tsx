// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('Medication Inventory app shell', () => {
  it('renders the dashboard and opens the add medication dialog', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Stock, thoughtfully organized.', level: 1 }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Add medication' }));
    expect(screen.getByRole('dialog', { name: 'Add medication' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'Add medication' })).toBeNull();
  });
});
