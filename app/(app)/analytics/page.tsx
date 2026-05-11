import { startOfMonth, subMonths } from "date-fns";

import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

function isoMonth(date: Date) {
  return date.toISOString().slice(0, 7);
}

export default async function AnalyticsPage() {
  const { user, supabase, gym } = await getOwnerGym();
  const monthStart = startOfMonth(new Date());
  const sixMonthsAgo = startOfMonth(subMonths(monthStart, 5)).toISOString().slice(0, 10);

  const [{ data: memberStatus }, { data: payments }, { data: attendance }] = await Promise.all([
    supabase.from("member_membership_status").select("*").eq("gym_id", gym.id),
    supabase.from("payments").select("*").eq("gym_id", gym.id).eq("status", "completed").gte("payment_date", sixMonthsAgo),
    supabase.from("attendance").select("*").eq("gym_id", gym.id).gte("attendance_date", sixMonthsAgo)
  ]);

  const active = memberStatus?.filter((row) => row.computed_subscription_status === "active").length ?? 0;
  const expired = memberStatus?.filter((row) => row.computed_subscription_status === "expired").length ?? 0;
  const revenue = new Map<string, number>();
  const attendanceCounts = new Map<string, number>();

  for (let index = 0; index < 6; index += 1) {
    const key = isoMonth(startOfMonth(subMonths(monthStart, 5 - index)));
    revenue.set(key, 0);
    attendanceCounts.set(key, 0);
  }

  payments?.forEach((payment) => {
    const key = payment.payment_date.slice(0, 7);
    revenue.set(key, (revenue.get(key) ?? 0) + Number(payment.amount));
  });

  attendance?.forEach((record) => {
    if (record.status === "present") {
      const key = record.attendance_date.slice(0, 7);
      attendanceCounts.set(key, (attendanceCounts.get(key) ?? 0) + 1);
    }
  });

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Six-month revenue, attendance, and membership health.</p>
        </div>
        <AnalyticsCharts
          membership={[
            { name: "Active", value: active },
            { name: "Expired", value: expired }
          ]}
          revenue={Array.from(revenue.entries()).map(([month, amount]) => ({ month, amount }))}
          attendance={Array.from(attendanceCounts.entries()).map(([month, count]) => ({ month, count }))}
        />
      </div>
    </WorkspaceShell>
  );
}
