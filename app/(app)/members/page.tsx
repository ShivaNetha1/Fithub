import {
  createMemberAction,
  deleteMemberAction,
  toggleMemberStatusAction,
  updateMemberAction
} from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { user, supabase, gym } = await getOwnerGym();
  const [{ data: members }, { data: plans }, { data: statuses }] = await Promise.all([
    supabase.from("members").select("*").eq("gym_id", gym.id).order("created_at", { ascending: false }),
    supabase.from("membership_plans").select("*").eq("gym_id", gym.id).eq("is_active", true),
    supabase.from("member_membership_status").select("*").eq("gym_id", gym.id)
  ]);

  const statusByMember = new Map(statuses?.map((status) => [status.member_id, status]));
  const defaultMemberCode = getNextMemberCode(members ?? []);

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h1 className="text-xl font-semibold">Add member</h1>
          <form action={createMemberAction} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Member code" name="member_code" placeholder="M001" defaultValue={defaultMemberCode} required />
              <Field label="Full name" name="full_name" placeholder="Riya Patel" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" name="phone" required />
              <Field label="Email" name="email" type="email" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium">Gender</span>
                <select name="gender" className="input-like">
                  <option value="">Not set</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </label>
              <Field label="Join date" name="start_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Initial plan</span>
              <select name="plan_id" className="input-like">
                <option value="">No plan yet</option>
                {plans?.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Discount" name="discount_amount" type="number" defaultValue="0" />
              <Field label="Initial payment" name="initial_payment" type="number" defaultValue="0" />
            </div>
            <button className="btn-primary">Add member</button>
          </form>
        </section>

        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-xl font-semibold">Members</h2>
          <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {members?.length ? (
              members.map((member) => {
                const status = statusByMember.get(member.id);
                const accountStatus = member.account_status ?? "active";
                return (
                  <div key={member.id} className="border-b border-[var(--border)] py-4 last:border-none">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {member.member_code} · {member.phone} · {status?.computed_subscription_status ?? "expired"}
                        </p>
                        <p className="mt-2 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              accountStatus === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {accountStatus === "active" ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={toggleMemberStatusAction}>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="status" value={accountStatus === "active" ? "inactive" : "active"} />
                          <button className="btn-secondary">
                            {accountStatus === "active" ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                        <form action={deleteMemberAction}>
                          <input type="hidden" name="id" value={member.id} />
                          <button className="btn-secondary">Delete</button>
                        </form>
                      </div>
                    </div>

                    <details className="mt-4 rounded border border-[var(--border)] bg-[var(--panel)] p-4">
                      <summary className="cursor-pointer font-medium">Edit member</summary>
                      <form action={updateMemberAction} className="mt-4 space-y-4">
                        <input type="hidden" name="id" value={member.id} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Member code" name="member_code" defaultValue={member.member_code} required />
                          <Field label="Full name" name="full_name" defaultValue={member.full_name} required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Phone" name="phone" defaultValue={member.phone} required />
                          <Field label="Email" name="email" type="email" defaultValue={member.email ?? ""} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label>
                            <span className="mb-1.5 block text-sm font-medium">Gender</span>
                            <select name="gender" className="input-like" defaultValue={member.gender ?? ""}>
                              <option value="">Not set</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                          </label>
                          <Field
                            label="Join date"
                            name="join_date"
                            type="date"
                            defaultValue={member.join_date ?? new Date().toISOString().slice(0, 10)}
                            required
                          />
                        </div>
                        <Field label="Address" name="address" defaultValue={member.address ?? ""} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Emergency contact name" name="emergency_contact_name" defaultValue={member.emergency_contact_name ?? ""} />
                          <Field label="Emergency contact phone" name="emergency_contact_phone" defaultValue={member.emergency_contact_phone ?? ""} />
                        </div>
                        <Field label="Notes" name="notes" defaultValue={member.notes ?? ""} />
                        <button type="submit" className="btn-primary">
                          Save changes
                        </button>
                      </form>
                    </details>
                  </div>
                );
              })
            ) : (
              <p className="py-5 text-sm text-[var(--muted)]">No members yet.</p>
            )}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input className="input-like" {...inputProps} />
    </label>
  );
}

function getNextMemberCode(members: Array<{ member_code: string | null | undefined }>) {
  const highest = members.reduce((max, member) => {
    const code = member.member_code ?? "";
    const match = code.match(/(\d+)$/);
    if (!match) return max;
    const value = Number(match[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `M${String(highest + 1).padStart(3, "0")}`;
}
