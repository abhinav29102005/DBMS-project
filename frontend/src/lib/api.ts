/**
 * UIMS Frontend API Layer
 * Custom fetch wrapper with typed responses, automatic JWT attachment, and error handling.
 * Designed for Cloudflare Pages (Edge Runtime).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
  token?: string | null;
}

/**
 * Custom Error class for API failures.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Typed fetch wrapper for API requests.
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...rest } = options;

  if (!BASE) {
    console.warn('NEXT_PUBLIC_API_URL is not defined');
  }

  const url = `${BASE}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status, 
      err.code ?? 'UNKNOWN', 
      err.message ?? 'Request failed'
    );
  }

  return res.json() as Promise<T>;
}
