"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartPanel title="Active vs expired members">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={membership} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92}>
              <Cell fill="#147d64" />
              <Cell fill="#c46f2b" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Revenue trend">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenue}>
            <CartesianGrid stroke="#d8ded9" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="amount" fill="#147d64" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Attendance trend"
        action={
          <div className="flex flex-wrap gap-1 rounded-md border border-[var(--border)] p-1">
            {attendancePeriods.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => setAttendancePeriod(period.value)}
                className={`h-8 rounded px-3 text-xs font-medium transition ${
                  attendancePeriod === period.value
                    ? "bg-[var(--primary)] text-white"
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
          <LineChart data={attendanceTrend}>
            <CartesianGrid stroke="#d8ded9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#c46f2b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
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
    <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
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
