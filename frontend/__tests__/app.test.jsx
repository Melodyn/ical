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
  heading: () => screen.getByRole('heading'),
  nav: () => screen.getByRole('navigation'),
  button: (name) => within(getItem.nav()).getByRole('button', { name }),
  existingByTitle: (title) => within(getItem.heading()).getByText(title),
  nonExistingByTitle: (title) => within(getItem.heading()).queryByText(title),
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
    await waitFor(() => expect(screen.getByText('Community calendar')).toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(getItem.nav()).toBeInTheDocument();
    expect(getItem.heading()).toBeInTheDocument();
  });

  test('Base navigation', async () => {
    await waitFor(() => expect(getItem.button('Calendar')).toBeInTheDocument(), {
      timeout: 5000,
    });

    const calendarButton = getItem.button('Calendar');
    const installButton = getItem.button('Install');
    const settingsButton = getItem.button('Settings');
    const helpButton = getItem.button('Help');
    const backButton = getItem.button('Back');

    expect(backButton).toBeInTheDocument();
    expect(helpButton).toBeInTheDocument();
    expect(calendarButton).toHaveClass('vkuiTabbarItem--selected');

    userEvent.click(installButton);
    expect(getItem.nonExistingByTitle('Community calendar')).not.toBeInTheDocument();
    expect(getItem.existingByTitle('Get app')).toBeInTheDocument();
    expect(calendarButton).not.toHaveClass('vkuiTabbarItem--selected');
    expect(installButton).toHaveClass('vkuiTabbarItem--selected');

    userEvent.click(calendarButton);
    expect(getItem.existingByTitle('Community calendar')).toBeInTheDocument();
    expect(calendarButton).toHaveClass('vkuiTabbarItem--selected');
    expect(settingsButton).not.toHaveClass('vkuiTabbarItem--selected');
    expect(installButton).not.toHaveClass('vkuiTabbarItem--selected');
  });
});
