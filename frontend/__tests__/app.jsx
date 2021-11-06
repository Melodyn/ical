import React from 'react';
import {
  screen, render, within, act, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import generateConfig from '../libs/generateConfig.js';
import getVkBridge from '../libs/getVkBridge.js';

import App from '../src/App.jsx';

const getItem = {
  nav: () => screen.getByRole('navigation'),
  button: (name) => within(getItem.nav()).getByRole('button', { name }),
};

const env = process.env.NODE_ENV || 'test';
const config = generateConfig(env);
const bridge = getVkBridge(config);

describe('Positive cases', () => {
  beforeEach(async () => {
    await act(async () => {
      await render(<App config={config} bridge={bridge} />);
    });
  });

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
