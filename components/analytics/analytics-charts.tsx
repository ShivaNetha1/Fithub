"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type AnalyticsChartsProps = {
  membership: Array<{ name: string; value: number }>;
  revenue: Array<{ month: string; amount: number }>;
  attendance: Array<{ date: string; status: string }>;
};

type AttendancePeriod = "daily" | "weekly" | "monthly" | "quarterly";

const attendancePeriods: Array<{ label: string; value: AttendancePeriod }> = [
  { label: "Day", value: "daily" },
  { label: "Week", value: "weekly" },
  { label: "Month", value: "monthly" },
  { label: "Quarter", value: "quarterly" }
];

export function AnalyticsCharts({ membership, revenue, attendance }: AnalyticsChartsProps) {
  const [attendancePeriod, setAttendancePeriod] = useState<AttendancePeriod>("monthly");
  const attendanceTrend = useMemo(
    () => aggregateAttendance(attendance, attendancePeriod),
    [attendance, attendancePeriod]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Membership breakdown */}
      <ChartPanel title="Active vs Expired Members">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={membership}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                <Cell fill="#10b981" /> {/* Emerald Active */}
                <Cell fill="#ef4444" /> {/* Rose Expired */}
              </Pie>
              <Tooltip content={<CustomNumberTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom Legends */}
          <div className="flex sm:flex-col gap-4 self-center sm:self-auto shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {membership.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2.5">
                <span className={`size-3 rounded-full ${idx === 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                <div>
                  <p className="text-xxs font-bold uppercase tracking-wider text-[var(--muted)]">{item.name}</p>
                  <p className="text-sm font-black text-slate-800">{item.value.toLocaleString("en-IN")} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartPanel>

      {/* Revenue trend */}
      <ChartPanel title="Monthly Revenue Trend">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenue} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.25}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} />
            <Tooltip content={<CustomCurrencyTooltip />} />
            <Bar dataKey="amount" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      {/* Attendance trend */}
      <ChartPanel
        title="Check-in Attendance Trends"
        action={
          <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border)] p-1 bg-white">
            {attendancePeriods.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => setAttendancePeriod(period.value)}
                className={`h-8 rounded-md px-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  attendancePeriod === period.value
                    ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-slate-900"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} />
            <Tooltip content={<CustomNumberTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fill="url(#attendanceGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function CustomNumberTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-md text-white text-xs backdrop-blur-xs">
        <p className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 uppercase tracking-wider text-slate-400">{label}</p>
        <p className="font-extrabold text-sm text-[var(--primary)]">{payload[0].value.toLocaleString("en-IN")} count</p>
      </div>
    );
  }
  return null;
}

function CustomCurrencyTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-md text-white text-xs backdrop-blur-xs">
        <p className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 uppercase tracking-wider text-slate-400">{label}</p>
        <p className="font-extrabold text-sm text-[var(--primary)]">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

function ChartPanel({
  title,
  children,
  action
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">{title}</h2>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function aggregateAttendance(
  records: Array<{ date: string; status: string }>,
  period: AttendancePeriod
) {
  const today = startOfDay(new Date());
  const buckets = buildBuckets(today, period);

  records.forEach((record) => {
    if (record.status !== "present") {
      return;
    }

    const key = getBucketKey(parseDate(record.date), period);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.count += 1;
    }
  });

  return Array.from(buckets.values());
}

function buildBuckets(today: Date, period: AttendancePeriod) {
  const buckets = new Map<string, { key: string; label: string; count: number }>();

  if (period === "daily") {
    for (let index = 13; index >= 0; index -= 1) {
      const date = addDays(today, -index);
      const key = getBucketKey(date, period);
      buckets.set(key, { key, label: formatDay(date), count: 0 });
    }
  }

  if (period === "weekly") {
    const thisWeek = startOfWeek(today);
    for (let index = 11; index >= 0; index -= 1) {
      const date = addDays(thisWeek, -index * 7);
      const key = getBucketKey(date, period);
      buckets.set(key, { key, label: `Week of ${formatDay(date)}`, count: 0 });
    }
  }

  if (period === "monthly") {
    for (let index = 5; index >= 0; index -= 1) {
      const date = addMonths(startOfMonth(today), -index);
      const key = getBucketKey(date, period);
      buckets.set(key, { key, label: formatMonth(date), count: 0 });
    }
  }

  if (period === "quarterly") {
    const thisQuarter = startOfQuarter(today);
    for (let index = 3; index >= 0; index -= 1) {
      const date = addMonths(thisQuarter, -index * 3);
      const key = getBucketKey(date, period);
      buckets.set(key, { key, label: formatQuarter(date), count: 0 });
    }
  }

  return buckets;
}

function getBucketKey(date: Date, period: AttendancePeriod) {
  if (period === "daily") {
    return toDateKey(date);
  }

  if (period === "weekly") {
    return toDateKey(startOfWeek(date));
  }

  if (period === "monthly") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  return addDays(start, -daysSinceMonday);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfQuarter(date: Date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short"
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit"
  }).format(date);
}

function formatQuarter(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}
