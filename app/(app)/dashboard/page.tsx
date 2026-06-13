import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  Users,
  Building2,
  ChevronRight,
  Activity,
  Plus,
  Clock,
  type LucideIcon
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
    .select("id, name, city, currency_code, phone")
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
    <div className="space-y-8">
      {/* Onboarding callout */}
      {!hasGym ? (
        <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white shadow-lg shadow-blue-500/10">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Dumbbell size={240} />
          </div>
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              First Step
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Create your gym workspace</h1>
            <p className="mt-3 text-sm text-blue-100 leading-relaxed">
              Your account is ready. Add your gym details to unlock membership plans, member lists,
              payment ledgers, attendance systems, and business intelligence analytics.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-blue-600 shadow-xs hover:bg-blue-50 transition-all duration-150 active:scale-98"
            >
              Set up gym
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}

      {/* Metrics Section */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total members"
          value={String(summary?.total_members ?? 0)}
          colorClass="bg-blue-50 text-blue-600 border-blue-100"
          accentBg="from-blue-500/10 to-indigo-500/5"
        />
        <MetricCard
          icon={Dumbbell}
          label="Active members"
          value={String(summary?.active_members ?? 0)}
          colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
          accentBg="from-emerald-500/10 to-teal-500/5"
        />
        <MetricCard
          icon={CreditCard}
          label="Monthly revenue"
          value={formatCurrency(Number(summary?.month_revenue ?? 0), gym?.currency_code ?? "INR")}
          colorClass="bg-purple-50 text-purple-600 border-purple-100"
          accentBg="from-purple-500/10 to-indigo-500/5"
        />
        <MetricCard
          icon={CalendarCheck}
          label="Today attendance"
          value={String(summary?.today_attendance ?? 0)}
          colorClass="bg-orange-50 text-orange-600 border-orange-100"
          accentBg="from-orange-500/10 to-amber-500/5"
        />
      </section>

      {/* Main Grid */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Workspaces list */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Gym Workspaces</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Workspaces connected to your owner account.
              </p>
            </div>
            <Link
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
              href="/onboarding"
            >
              <Plus size={14} aria-hidden="true" />
              Add workspace
            </Link>
          </div>

          <div className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {gyms?.length ? (
              gyms.map((g) => (
                <div
                  key={g.id}
                  className={`flex items-center justify-between gap-4 py-4 group transition-colors ${
                    gym?.id === g.id ? "bg-slate-50/50 -mx-6 px-6" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex size-11 items-center justify-center rounded-lg ${
                      gym?.id === g.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--foreground)]">{g.name}</p>
                        {gym?.id === g.id && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xxs font-bold text-blue-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {g.city ?? "Location not set"} · {g.currency_code} {g.phone ? `· ${g.phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building2 size={32} className="text-slate-300" />
                <p className="mt-2 text-sm text-[var(--muted)]">No workspaces created yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity timeline */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Recent Activity</h2>
            <Activity size={16} className="text-[var(--muted)]" />
          </div>

          <div className="mt-6 relative border-l border-slate-200 pl-4 space-y-6 flex-1">
            {activities?.length ? (
              activities.map((activity) => {
                const isDeactivated = activity.action.includes("deactivated") || activity.action.includes("deleted");
                const isCreated = activity.action.includes("created") || activity.action.includes("marked") || activity.action.includes("recorded");
                
                return (
                  <div key={activity.id} className="relative group">
                    {/* Timeline dot */}
                    <span className={`absolute -left-[21px] top-1 flex size-3 items-center justify-center rounded-full border-2 ${
                      isDeactivated 
                        ? "bg-rose-500 border-white ring-4 ring-rose-50"
                        : isCreated
                        ? "bg-emerald-500 border-white ring-4 ring-emerald-50"
                        : "bg-blue-500 border-white ring-4 ring-blue-50"
                    }`} />
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-800 capitalize leading-none">
                        {activity.action} <span className="text-slate-500 font-medium">{activity.entity_type.replace("_", " ")}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Clock size={12} />
                        {new Date(activity.created_at).toLocaleString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short"
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full border-none pl-0">
                <Clock size={32} className="text-slate-300" />
                <p className="mt-2 text-sm text-[var(--muted)]">No operations logged yet.</p>
              </div>
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
  colorClass: string;
  accentBg: string;
};

function MetricCard({ icon: Icon, label, value, colorClass, accentBg }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
      <div className={`absolute -right-4 -bottom-4 size-24 rounded-full bg-gradient-to-br ${accentBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      <div className="flex items-center justify-between gap-4 relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <span className={`flex size-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-110 ${colorClass}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 text-3xl font-extrabold tracking-tight text-[var(--foreground)] relative z-10">{value}</p>
    </div>
  );
}
