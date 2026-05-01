
const BASE = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
  token?: string | null;
}

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
 * Read the access_token cookie so authenticated requests work
 * without having to pass the token explicitly every time.
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? match[1] : null;
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...rest } = options;

  if (!BASE) {
    console.warn('NEXT_PUBLIC_API_URL is not defined');
  }

  const resolvedToken = token ?? getStoredToken();
  const url = `${BASE}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      err.code ?? err.error?.code ?? 'UNKNOWN',
      err.message ?? err.error?.message ?? 'Request failed'
    );
  }

  return res.json() as Promise<T>;
}
