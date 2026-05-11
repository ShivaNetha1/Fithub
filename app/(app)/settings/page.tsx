import { updateGymSettingsAction } from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, gym } = await getOwnerGym();

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <section className="max-w-3xl rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <h1 className="text-xl font-semibold">Gym settings</h1>
        <form action={updateGymSettingsAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Gym name" name="name" defaultValue={gym.name} required />
          <Field label="Phone" name="phone" defaultValue={gym.phone ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={gym.email ?? ""} />
          <Field label="City" name="city" defaultValue={gym.city ?? ""} />
          <Field label="State" name="state" defaultValue={gym.state ?? ""} />
          <Field label="Country" name="country" defaultValue={gym.country} />
          <Field label="Currency" name="currency_code" defaultValue={gym.currency_code} maxLength={3} />
          <Field label="Timezone" name="timezone" defaultValue={gym.timezone} />
          <div className="sm:col-span-2">
            <button className="btn-primary">Save settings</button>
          </div>
        </form>
      </section>
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
