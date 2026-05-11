import { type NextRequest } from "next/server";

import {
  assertGymAccess,
  isApiErrorResponse,
  parseJson,
  requireApiContext
} from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { attendanceSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  const date = request.nextUrl.searchParams.get("date");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  let query = context.supabase
    .from("attendance")
    .select("*, members(full_name, member_code)")
    .eq("gym_id", gymId)
    .order("attendance_date", { ascending: false });

  if (date) query = query.eq("attendance_date", date);

  const { data, error } = await query;
  if (error) return fail("INTERNAL_ERROR", error.message, 500);
  return ok(data);
}

export async function POST(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const parsed = await parseJson(request, attendanceSchema);
  if (isApiErrorResponse(parsed)) return parsed;

  const accessError = await assertGymAccess(context.supabase, context.user.id, parsed.gym_id);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("attendance")
    .upsert(parsed, {
      onConflict: "gym_id,member_id,attendance_date"
    })
    .select("*")
    .single();

  if (error) return fail("CONFLICT", error.message, 409);
  return ok(data, 201);
}
