import React from 'react';
import {
  screen, render, within, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import App from '../src/App.jsx';

const getItem = {
  nav: () => screen.getByRole('navigation'),
  button: (name) => within(getItem.nav()).getByRole('button', { name }),
};

const NODE_ENV = process.env.NODE_ENV || 'test';
const config = {
  NODE_ENV,
  IS_PROD_ENV: false,
  IS_DEV_ENV: false,
  IS_TEST_ENV: true,
  ROLLBAR_TOKEN: 'ROLLBAR_TOKEN',
  VK_PARAMS: {},
};

describe('Positive cases', () => {
  beforeEach(() => render(<App config={config} />));

  test('Init app', async () => {
    await waitFor(() => expect(screen.getByText('Main')).toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(getItem.nav()).toBeInTheDocument();
  });

  test('Navigation', async () => {
    await waitFor(() => expect(getItem.button('Home')).toBeInTheDocument(), {
      timeout: 5000,
    });

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
