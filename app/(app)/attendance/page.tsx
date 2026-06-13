import { AttendanceManager } from "@/components/attendance/attendance-manager";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Attendance" };
export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const { user, supabase, gym } = await getOwnerGym();
  const today = new Date().toISOString().slice(0, 10);
  
  const [{ data: members }, { data: attendance }] = await Promise.all([
    supabase
      .from("members")
      .select("id, member_code, full_name")
      .eq("gym_id", gym.id)
      .eq("account_status", "active")
      .order("full_name"),
    supabase
      .from("attendance")
      .select("member_id, status")
      .eq("gym_id", gym.id)
      .eq("attendance_date", today)
  ]);

  const cleanMembers = members ?? [];
  const cleanAttendance = (attendance ?? []) as Array<{ member_id: string; status: "present" | "absent" }>;

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Attendance</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Check-in active members and view real-time statistics for {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}.
          </p>
        </div>
        <AttendanceManager
          members={cleanMembers}
          initialAttendance={cleanAttendance}
          today={today}
        />
      </div>
    </WorkspaceShell>
  );
}
