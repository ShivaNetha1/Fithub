import { type NextRequest } from "next/server";

import {
  assertGymAccess,
  isApiErrorResponse,
  parseJson,
  requireApiContext
} from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { memberSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  const search = request.nextUrl.searchParams.get("search");
  const status = request.nextUrl.searchParams.get("status");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  let query = context.supabase
    .from("members")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("account_status", status);
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,member_code.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return fail("INTERNAL_ERROR", error.message, 500);
  return ok(data);
}

export async function POST(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const parsed = await parseJson(request, memberSchema);
  if (isApiErrorResponse(parsed)) return parsed;

  const accessError = await assertGymAccess(context.supabase, context.user.id, parsed.gym_id);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("members")
    .insert(parsed)
    .select("*")
    .single();

  if (error) return fail("CONFLICT", error.message, 409);
  return ok(data, 201);
}
