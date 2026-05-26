import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  type LucideIcon,
  Users
} from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Dashboard"
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: gyms } = await supabase
    .from("gyms")
    .select("id, name, city, currency_code")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const hasGym = Boolean(gyms?.length);
  const gym = gyms?.[0];
  const [{ data: summary }, { data: activities }] = gym
    ? await Promise.all([
        supabase.from("dashboard_summary").select("*").eq("gym_id", gym.id).maybeSingle(),
        supabase
          .from("activity_logs")
          .select("*")
          .eq("gym_id", gym.id)
          .order("created_at", { ascending: false })
          .limit(8)
      ])
    : [{ data: null }, { data: [] }];

  return (
    <div className="space-y-6">
      {!hasGym ? (
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[var(--primary)]">First step</p>
            <h1 className="mt-2 text-2xl font-semibold">Create your gym workspace</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Your account is ready. Add your gym details to unlock plans, members,
              payments, attendance, and analytics.
            </p>
            <Link
              href="/onboarding"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white hover:bg-[#0f6853]"
            >
              Set up gym
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Total members" value={String(summary?.total_members ?? 0)} />
        <MetricCard icon={Dumbbell} label="Active members" value={String(summary?.active_members ?? 0)} />
        <MetricCard
          icon={CreditCard}
          label="Monthly revenue"
          value={formatCurrency(Number(summary?.month_revenue ?? 0), gym?.currency_code ?? "INR")}
        />
        <MetricCard icon={CalendarCheck} label="Today attendance" value={String(summary?.today_attendance ?? 0)} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Gyms</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Workspaces connected to your owner account.
              </p>
            </div>
            <Link className="text-sm font-medium text-[var(--primary)] hover:underline" href="/onboarding">
              Add gym
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {gyms?.length ? (
              gyms.map((gym) => (
                <div key={gym.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{gym.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {gym.city ?? "City not set"} · {gym.currency_code}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[var(--muted)]">No gyms created yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="font-semibold">Recent activity</h2>
          <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)] text-sm">
            {activities?.length ? (
              activities.map((activity) => (
                <div key={activity.id} className="py-3">
                  <p className="font-medium">
                    {activity.action} {activity.entity_type}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    {new Date(activity.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-5 text-[var(--muted)]">No activity yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-md bg-[var(--panel-strong)] text-[var(--primary)]">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}
