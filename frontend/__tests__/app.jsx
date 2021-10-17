import React from 'react';
import { screen, render } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import App from '../src/App.jsx';

window.scrollTo = jest.fn();

test('Init app', () => {
  render(<App />);

  expect(screen.getByText('Main')).toBeInTheDocument();
});
