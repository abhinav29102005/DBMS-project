/**
 * UIMS Auth Module — Password Hashing
 * 
 * Uses bcryptjs for Workers compatibility.
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password.
 */
export async function hashPassword(plain: string, cost = 10): Promise<string> {
  // Workers CPU budget is tight (10ms). 
  // cost=10 usually takes ~3ms in JS, which fits.
  return bcrypt.hash(plain, cost);
}

/**
 * Verify a plain text password against a hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
