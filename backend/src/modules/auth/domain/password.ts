

import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string, cost = 10): Promise<string> {

  return bcrypt.hash(plain, cost);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
