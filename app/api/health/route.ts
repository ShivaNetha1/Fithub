import { NextResponse } from "next/server";

import { getEnvStatus, getMissingEnvRequirements } from "@/lib/config/env-status";

export const runtime = "nodejs";

export function GET() {
  const envStatus = getEnvStatus();
  const missing = getMissingEnvRequirements();

  return NextResponse.json({
    status: missing.length === 0 ? "ok" : "configuration_required",
    app: process.env.APP_NAME ?? "Fithub",
    environment: process.env.APP_ENV ?? "development",
    timestamp: new Date().toISOString(),
    requiredEnv: {
      configured: envStatus.length - missing.length,
      total: envStatus.length,
      missing: missing.map((item) => item.key)
    }
  });
}
