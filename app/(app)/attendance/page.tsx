import { markAttendanceAction } from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Attendance" };
export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const { user, supabase, gym } = await getOwnerGym();
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: members }, { data: attendance }] = await Promise.all([
    supabase.from("members").select("*").eq("gym_id", gym.id).eq("account_status", "active").order("full_name"),
    supabase.from("attendance").select("*").eq("gym_id", gym.id).eq("attendance_date", today)
  ]);
  const attendanceByMember = new Map(attendance?.map((record) => [record.member_id, record.status]));

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <h1 className="text-xl font-semibold">Daily attendance</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{today}</p>
        <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {members?.length ? (
            members.map((member) => {
              const memberStatus = attendanceByMember.get(member.id);
              const statusColorClass =
                memberStatus === "present"
                  ? "text-emerald-600"
                  : memberStatus === "absent"
                  ? "text-rose-600"
                  : "text-[var(--muted)]";
              return (
                <div key={member.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="mt-1 text-sm">
                      <span className="text-[var(--muted)]">{member.member_code} · </span>
                      <span className={statusColorClass}>{memberStatus ?? "not marked"}</span>
                    </p>
                  </div>
                  <form action={markAttendanceAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="member_id" value={member.id} />
                    <input type="hidden" name="attendance_date" value={today} />
                    <button name="status" value="present" className="btn-primary">
                      Present
                    </button>
                    <button name="status" value="absent" className="btn-secondary">
                      Absent
                    </button>
                  </form>
                </div>
              );
            })
          ) : (
            <p className="py-5 text-sm text-[var(--muted)]">No active members yet.</p>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}
