import { startOfMonth, subMonths } from "date-fns";
import { type NextRequest } from "next/server";

import { assertGymAccess, isApiErrorResponse, requireApiContext } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";

export const runtime = "nodejs";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  const monthStart = startOfMonth(new Date());
  const sixMonthsAgo = startOfMonth(subMonths(monthStart, 5));
  const today = isoDate(new Date());

  const [memberStatus, payments, attendance] = await Promise.all([
    context.supabase
      .from("member_membership_status")
      .select("account_status, end_date")
      .eq("gym_id", gymId),
    context.supabase
      .from("payments")
      .select("amount, payment_date, status")
      .eq("gym_id", gymId)
      .gte("payment_date", isoDate(sixMonthsAgo))
      .eq("status", "completed"),
    context.supabase
      .from("attendance")
      .select("attendance_date, status")
      .eq("gym_id", gymId)
      .gte("attendance_date", isoDate(sixMonthsAgo))
  ]);

  if (memberStatus.error) return fail("INTERNAL_ERROR", memberStatus.error.message, 500);
  if (payments.error) return fail("INTERNAL_ERROR", payments.error.message, 500);
  if (attendance.error) return fail("INTERNAL_ERROR", attendance.error.message, 500);

  const active = memberStatus.data.filter((row) => row.account_status === "active").length;
  const expired = memberStatus.data.filter(
    (row) => row.account_status !== "active" || (row.end_date ? row.end_date < today : false)
  ).length;

  const revenueByMonth = new Map<string, number>();
  const attendanceByMonth = new Map<string, number>();

  for (let index = 0; index < 6; index += 1) {
    const key = isoDate(startOfMonth(subMonths(monthStart, 5 - index)));
    revenueByMonth.set(key, 0);
    attendanceByMonth.set(key, 0);
  }

  payments.data.forEach((payment) => {
    const key = isoDate(startOfMonth(new Date(payment.payment_date)));
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(payment.amount));
  });

  attendance.data.forEach((record) => {
    if (record.status === "present") {
      const key = isoDate(startOfMonth(new Date(record.attendance_date)));
      attendanceByMonth.set(key, (attendanceByMonth.get(key) ?? 0) + 1);
    }
  });

  return ok({
    membership: { active, expired },
    revenue: Array.from(revenueByMonth.entries()).map(([month, amount]) => ({
      month,
      amount
    })),
    attendance: Array.from(attendanceByMonth.entries()).map(([month, count]) => ({
      month,
      count
    }))
  });
}
