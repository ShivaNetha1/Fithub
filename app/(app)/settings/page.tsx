import { updateGymSettingsAction } from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, gym } = await getOwnerGym();

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Settings</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage your gym profile details, localization parameters, and system timezone.</p>
        </div>

        <section className="max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-4">Gym Settings</h2>
          <form action={updateGymSettingsAction} className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Gym Name" name="name" defaultValue={gym.name} required />
            <Field label="Contact Phone" name="phone" defaultValue={gym.phone ?? ""} placeholder="+91 98765 43210" />
            <Field label="Contact Email" name="email" type="email" defaultValue={gym.email ?? ""} placeholder="info@gym.com" />
            <Field label="City" name="city" defaultValue={gym.city ?? ""} placeholder="Bengaluru" />
            <Field label="State" name="state" defaultValue={gym.state ?? ""} placeholder="Karnataka" />
            <Field label="Country" name="country" defaultValue={gym.country} />
            <Field label="Currency Code" name="currency_code" defaultValue={gym.currency_code} maxLength={3} placeholder="INR" />
            <Field label="System Timezone" name="timezone" defaultValue={gym.timezone} placeholder="Asia/Kolkata" />
            <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
              <button className="btn-primary shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                Save Settings
              </button>
            </div>
          </form>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</span>
      <input className="input-like" {...inputProps} />
    </label>
  );
}
