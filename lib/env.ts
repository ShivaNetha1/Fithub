import { z } from "zod";

const stringNumber = z.coerce.number().int().positive();

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_KEY: z.string().min(1)
});

const serverEnvSchema = publicEnvSchema.extend({
  APP_NAME: z.string().min(1).default("Fithub"),
  APP_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  PORT: stringNumber.default(3000),
  SUPABASE_ADMIN_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  CURRENCY_CODE: z.string().min(3).max(3).default("INR"),
  EXPIRY_SOON_DAYS: stringNumber.default(7),
  RATE_LIMIT_WINDOW_MS: stringNumber.default(60000),
  RATE_LIMIT_MAX_REQUESTS: stringNumber.default(120)
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getPublicEnv(): PublicEnv {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: supabaseKey
  });
}

export function getServerEnv(): ServerEnv {
  const publicSupabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminSupabaseKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  return serverEnvSchema.parse({
    APP_NAME: process.env.APP_NAME,
    APP_ENV: process.env.APP_ENV,
    PORT: process.env.PORT,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: publicSupabaseKey,
    SUPABASE_ADMIN_KEY: adminSupabaseKey,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    CURRENCY_CODE: process.env.CURRENCY_CODE,
    EXPIRY_SOON_DAYS: process.env.EXPIRY_SOON_DAYS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS
  });
}

export function maskSecret(value?: string): string {
  if (!value) {
    return "missing";
  }

  if (value.length <= 8) {
    return "configured";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
