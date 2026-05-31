import { type NextRequest } from "next/server";

import { assertGymAccess, isApiErrorResponse, requireApiContext } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("dashboard_summary")
    .select("*")
    .eq("gym_id", gymId)
    .maybeSingle();

  if (error) return fail("INTERNAL_ERROR", error.message, 500);
  return ok(
    data ?? {
      gym_id: gymId,
      total_members: 0,
      active_members: 0,
      inactive_members: 0,
      expired_members: 0,
      expiring_soon_members: 0,
      month_revenue: 0,
      pending_payments: 0,
      today_attendance: 0
    }
  );
}
