import { promisify } from 'util';
import jwt from 'jsonwebtoken';

const createJWTService = (params) => {
  const secret = params.VK_PROTECTED_KEY;
  const expiresIn = params.JWT_LIFETIME;

  const encode = promisify(jwt.sign);
  const decode = promisify(jwt.decode);
  const verify = promisify(jwt.verify);

  return {
    encode: (data) => encode(data, secret, { expiresIn }),
    decode: (token) => decode(token),
    verify: (token) => verify(token, secret),
  };
};

export default createJWTService;
