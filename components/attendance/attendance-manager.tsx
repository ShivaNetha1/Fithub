"use client";

import { useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { markAttendanceAction } from "@/app/(app)/actions";

type Member = {
  id: string;
  member_code: string;
  full_name: string;
};

type AttendanceManagerProps = {
  members: Member[];
  initialAttendance: Array<{ member_id: string; status: "present" | "absent" }>;
  today: string;
};

export function AttendanceManager({ members, initialAttendance, today }: AttendanceManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "unmarked">("all");

  // Local state to show instant UI feedback before server action completes
  const [localAttendance, setLocalAttendance] = useState<Record<string, "present" | "absent" | undefined>>(() => {
    const map: Record<string, "present" | "absent"> = {};
    initialAttendance.forEach((record) => {
      map[record.member_id] = record.status;
    });
    return map;
  });

  const stats = useMemo(() => {
    const total = members.length;
    const present = Object.values(localAttendance).filter((s) => s === "present").length;
    const absent = Object.values(localAttendance).filter((s) => s === "absent").length;
    const unmarked = total - present - absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, unmarked, rate };
  }, [members, localAttendance]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.member_code.toLowerCase().includes(searchQuery.toLowerCase());

      const status = localAttendance[member.id];
      if (filter === "all") return matchesSearch;
      if (filter === "present") return matchesSearch && status === "present";
      if (filter === "absent") return matchesSearch && status === "absent";
      if (filter === "unmarked") return matchesSearch && !status;
      return matchesSearch;
    });
  }, [members, searchQuery, filter, localAttendance]);

  const handleMark = (memberId: string, status: "present" | "absent") => {
    setLocalAttendance((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Active" value={stats.total} color="text-blue-600 bg-blue-50 border-blue-100" />
        <StatCard icon={CheckCircle2} label="Present Today" value={stats.present} color="text-emerald-600 bg-emerald-50 border-emerald-100" />
        <StatCard icon={XCircle} label="Absent Today" value={stats.absent} color="text-rose-600 bg-rose-50 border-rose-100" />
        <StatCard icon={Clock} label="Attendance Rate" value={`${stats.rate}%`} color="text-purple-600 bg-purple-50 border-purple-100" />
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 bg-white sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search active members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-like pl-10 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "present", "absent", "unmarked"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === opt
                    ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-slate-900"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Member Grid */}
        <div className="divide-y divide-[var(--border)] bg-white">
          {filteredMembers.length ? (
            filteredMembers.map((member) => {
              const status = localAttendance[member.id];
              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/20 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">{member.full_name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xxs font-bold uppercase tracking-wider text-[var(--muted)]">
                      <span>{member.member_code}</span>
                      {status && (
                        <>
                          <span>·</span>
                          <span className={status === "present" ? "text-emerald-600" : "text-rose-600"}>
                            {status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <form action={markAttendanceAction} className="flex items-center gap-2">
                    <input type="hidden" name="member_id" value={member.id} />
                    <input type="hidden" name="attendance_date" value={today} />
                    
                    <button
                      type="submit"
                      name="status"
                      value="present"
                      onClick={() => handleMark(member.id, "present")}
                      className={`h-9 rounded-lg px-4 text-xs font-semibold transition-all cursor-pointer border ${
                        status === "present"
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Present
                    </button>
                    
                    <button
                      type="submit"
                      name="status"
                      value="absent"
                      onClick={() => handleMark(member.id, "absent")}
                      className={`h-9 rounded-lg px-4 text-xs font-semibold transition-all cursor-pointer border ${
                        status === "absent"
                          ? "bg-rose-500 border-rose-500 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Absent
                    </button>
                  </form>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-[var(--muted)] bg-white">
              No active members found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number }>; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 flex items-center gap-4 shadow-2xs">
      <div className={`flex size-11 items-center justify-center rounded-xl border ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xxs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)] tracking-tight">{value}</p>
      </div>
    </div>
  );
}
