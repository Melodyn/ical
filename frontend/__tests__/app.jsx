import React from 'react';
import { screen, render } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import App from '../src/App.jsx';

test('Init app', () => {
  render(<App />);

  expect(screen.getByText('VKUI')).toBeInTheDocument();
});
