import { createPlanAction, deletePlanAction } from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Membership Plans" };
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const { user, supabase, gym } = await getOwnerGym();
  const { data: plans } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("gym_id", gym.id)
    .order("duration_months", { ascending: true });

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h1 className="text-xl font-semibold">Create membership plan</h1>
          <form action={createPlanAction} className="mt-5 space-y-4">
            <Field label="Plan name" name="name" placeholder="Monthly" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium">Plan type</span>
                <select name="plan_type" className="input-like">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half_yearly">Half-Yearly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <Field label="Duration months" name="duration_months" type="number" defaultValue="1" required />
            </div>
            <Field label="Price" name="price" type="number" defaultValue="1500" required />
            <Field label="Description" name="description" placeholder="Optional" />
            <button className="btn-primary">Save plan</button>
          </form>
        </section>

        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-xl font-semibold">Plans</h2>
          <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {plans?.length ? (
              plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {plan.duration_months} month(s) · {formatCurrency(Number(plan.price), gym.currency_code)}
                    </p>
                  </div>
                  <form action={deletePlanAction}>
                    <input type="hidden" name="id" value={plan.id} />
                    <button className="btn-secondary" disabled={!plan.is_active}>
                      {plan.is_active ? "Deactivate" : "Inactive"}
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[var(--muted)]">No plans yet.</p>
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
