import createApp from '../index.js';

describe('Positive cases', () => {
  let app;

  test('Run app', async () => {
    app = await createApp(process.env.NODE_ENV).catch((e) => e);
    expect(app).not.toBeInstanceOf(Error);
  });

  test('App is exists', async () => {
    expect(app).not.toBeFalsy();
    expect(app).toEqual(expect.objectContaining({
      server: expect.any(Function),
      stop: expect.any(Function),
    }));
  });

  test('Stop app', async () => {
    await expect(app.stop()).resolves.not.toThrow();
  });
});

describe('Negative cases', () => {
  test('Run app', async () => {
    await expect(createApp('NODE_ENV')).rejects.toThrow();
  });

  test('Invalid config', async () => {
    const err = await createApp('invalid').catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.message.includes('Config validation error')).toBe(true);
  });
});
