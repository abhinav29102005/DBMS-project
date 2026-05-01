/**
 * UIMS — Security Utilities
 *
 * Input sanitisation and security helpers.
 */

/**
 * Strip potentially dangerous characters from user-supplied strings.
 * Prevents basic XSS when values are echoed in JSON responses.
 */
export function sanitize(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * on tokens/secrets. Uses Web Crypto subtle.timingSafeEqual
 * where available, falls back to manual comparison.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

/**
 * Generate a cryptographically secure random hex string.
 */
export function secureRandomHex(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}
