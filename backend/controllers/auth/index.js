import { AuthError } from '../../utils/errors.cjs';

// eslint-disable-next-line import/prefer-default-export
export const create = ({ data, app }) => {
  const validationResult = app.services.vk.validateUser(data);
  if (!validationResult.isValid) {
    throw new AuthError(validationResult.error, 'vk.sign.invalid', validationResult.params);
  }

  return app.services.jwt.encode(validationResult.user).then((token) => ({ token }));
};
