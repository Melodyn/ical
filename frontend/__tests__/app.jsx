import React from 'react';
import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import App from '../src/App.jsx';

window.scrollTo = jest.fn();

const getItem = {
  nav: () => screen.getByRole('navigation'),
  button: (name) => within(getItem.nav()).getByRole('button', { name }),
};

describe('Positive cases', () => {
  beforeEach(() => render(<App />));

  test('Init app', () => {
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(getItem.nav()).toBeInTheDocument();
  });

  test('Navigation', () => {
    const homeButton = getItem.button('Home');
    const kittyButton = getItem.button('Kitty');
    const worldButton = getItem.button('World');
    const backButton = getItem.button('Back');

    expect(backButton).toBeInTheDocument();
    expect(homeButton).toHaveClass('vkuiTabbarItem--selected');

    userEvent.click(kittyButton);
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
    expect(screen.getByText('Hello Kitty')).toBeInTheDocument();
    expect(homeButton).not.toHaveClass('vkuiTabbarItem--selected');
    expect(kittyButton).toHaveClass('vkuiTabbarItem--selected');

    userEvent.click(worldButton);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(worldButton).toHaveClass('vkuiTabbarItem--selected');
    expect(kittyButton).not.toHaveClass('vkuiTabbarItem--selected');

    userEvent.click(homeButton);
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(homeButton).toHaveClass('vkuiTabbarItem--selected');
    expect(worldButton).not.toHaveClass('vkuiTabbarItem--selected');
    expect(kittyButton).not.toHaveClass('vkuiTabbarItem--selected');
  });
});
