

export const RATE_LIMITS = {
  LOGIN:    { max: 5,  windowSec: 60  },
  REGISTER: { max: 3,  windowSec: 300 },
  API:      { max: 60, windowSec: 60  },
} as const;

export const CACHE_TTL = {
  PERMISSIONS:  300,
  DEPARTMENTS: 3600,
  COURSES:     3600,
  GRADE_SCALE: 86400,
} as const;

export const JWT_DEFAULTS = {
  ACCESS_TTL_MINUTES:  15,
  REFRESH_TTL_DAYS:    7,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
  BCRYPT_COST: 10,
  MAX_FAILED_ATTEMPTS: 5,
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const LIBRARY = {
  MAX_BOOKS_PER_USER: 5,
  DEFAULT_LOAN_DAYS: 14,
  FINE_PER_DAY: 2.00,
  MAX_RENEWALS: 2,
} as const;
