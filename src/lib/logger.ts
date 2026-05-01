/**
 * Production-safe logger utility.
 * In development: passes through to console.
 * In production: silences debug logs, only keeps errors (for monitoring tools).
 */
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Keep errors in production — they may be captured by error monitoring (e.g. Sentry)
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
};
