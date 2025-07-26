import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param {string} id - The user's ID to be included in the token payload.
 * @returns {string} The generated JWT.
 */
export const generateToken = (id: string, role: string): string => {
  console.log(`Signing with secret length: ${process.env.JWT_SECRET?.length}`);
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: '30d', // The token will be valid for 30 days
  });
};
