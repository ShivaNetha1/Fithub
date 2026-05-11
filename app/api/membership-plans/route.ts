import { type NextRequest } from "next/server";

import {
  assertGymAccess,
  isApiErrorResponse,
  parseJson,
  requireApiContext
} from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { planSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("membership_plans")
    .select("*")
    .eq("gym_id", gymId)
    .order("duration_months", { ascending: true });

  if (error) return fail("INTERNAL_ERROR", error.message, 500);
  return ok(data);
}

export async function POST(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const parsed = await parseJson(request, planSchema);
  if (isApiErrorResponse(parsed)) return parsed;

  const accessError = await assertGymAccess(context.supabase, context.user.id, parsed.gym_id);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("membership_plans")
    .insert(parsed)
    .select("*")
    .single();

  if (error) return fail("CONFLICT", error.message, 409);
  return ok(data, 201);
}
