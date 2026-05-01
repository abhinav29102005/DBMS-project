/**
 * UIMS Auth Module — JWT Management
 * 
 * Uses 'jose' for WebCrypto-based signing and verification.
 */

import * as jose from 'jose';

export interface JwtPayload extends jose.JWTPayload {
  sub: string;      // userId
  role: string;     // primary role
  scopeId?: string; // optional scope
}

/**
 * Sign an access token (short-lived).
 */
export async function signAccessToken(
  payload: JwtPayload,
  secret: string,
  expiresInMinutes = 15
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresInMinutes}m`)
    .sign(secretBytes);
}

/**
 * Verify an access token.
 */
export async function verifyAccessToken(
  token: string,
  secret: string
): Promise<JwtPayload> {
  const secretBytes = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, secretBytes);
  return payload as JwtPayload;
}

/**
 * Sign a refresh token (long-lived).
 */
export async function signRefreshToken(
  userId: string,
  secret: string,
  expiresInDays = 7
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  
  return new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresInDays}d`)
    .sign(secretBytes);
}

/**
 * Verify a refresh token.
 */
export async function verifyRefreshToken(
  token: string,
  secret: string
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, secretBytes);
  return payload.sub as string;
}
