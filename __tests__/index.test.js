import app from '../index.js';

test('Positive cases', () => {
  expect(app('World')).toEqual('Hello, World!');
});

test('Negative cases', () => {
  expect(() => app()).toThrow('Name is required');
});
