import app from '../index.js';

test('Positive cases', () => {
  expect(app('World')).not.toBeFalsy();
});
