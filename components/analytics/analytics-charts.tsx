"use client";

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
  attendance: Array<{ month: string; count: number }>;
};

export function AnalyticsCharts({ membership, revenue, attendance }: AnalyticsChartsProps) {
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

      <ChartPanel title="Attendance trend">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={attendance}>
            <CartesianGrid stroke="#d8ded9" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#c46f2b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
