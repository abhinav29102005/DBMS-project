

import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string, cost = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plain, cost, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plain, hash, (err, isMatch) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });
}
