import { REQUIRED_ENV_KEYS } from "@/lib/config/env-keys";

type EnvRequirement = {
  key: string;
  configured: boolean;
};

export function getEnvStatus(): EnvRequirement[] {
  return [
    ...REQUIRED_ENV_KEYS.map((key) => ({
      key,
      configured: Boolean(process.env[key])
    })),
    {
      key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      configured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    },
    {
      key: "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
      configured: Boolean(
        process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    }
  ];
}

export function getMissingEnvRequirements() {
  return getEnvStatus().filter((item) => !item.configured);
}
