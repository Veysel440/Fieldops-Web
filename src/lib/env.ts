import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
});

const raw = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
};

export const env = EnvSchema.parse(raw);
