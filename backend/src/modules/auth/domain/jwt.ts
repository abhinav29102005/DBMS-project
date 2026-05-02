

import * as jose from 'jose';

export interface JwtPayload extends jose.JWTPayload {
  sub: string;
  email: string;
  role: string;
  scopeId?: string;
}

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

export async function verifyAccessToken(
  token: string,
  secret: string
): Promise<JwtPayload> {
  const secretBytes = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, secretBytes);
  return payload as JwtPayload;
}

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

export async function verifyRefreshToken(
  token: string,
  secret: string
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, secretBytes);
  return payload.sub as string;
}
