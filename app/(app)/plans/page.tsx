import { createPlanAction, deletePlanAction } from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";
import { formatCurrency } from "@/lib/utils";
import { WalletCards, Sparkles } from "lucide-react";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Membership Plans</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Configure duration, pricing tiers, and descriptions for your gym packages.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-start">
          {/* Create Plan Card */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Create Plan</h2>
            <form action={createPlanAction} className="mt-5 space-y-4">
              <Field label="Plan Name" name="name" placeholder="e.g. Monthly Pro, Gold Member" required />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Plan Type</span>
                  <select name="plan_type" className="input-like cursor-pointer bg-white" defaultValue="monthly">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
                <Field label="Duration (Months)" name="duration_months" type="number" min="1" defaultValue="1" required />
              </div>
              
              <Field label="Price (INR)" name="price" type="number" min="0" defaultValue="1500" required />
              
              <Field label="Description" name="description" placeholder="Access to gym floor, locker, group classes..." />

              <button className="btn-primary w-full mt-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                Save Plan
              </button>
            </form>
          </section>

          {/* Plans Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Available Packages</h2>
              <span className="text-xs font-semibold text-[var(--muted)]">Total: {plans?.length ?? 0} plans</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {plans?.length ? (
                plans.map((plan) => {
                  const isActive = plan.is_active;
                  const isYearly = plan.duration_months >= 12;

                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 bg-white ${
                        isActive
                          ? isYearly
                            ? "border-blue-200 shadow-sm ring-1 ring-blue-50"
                            : "border-[var(--border)] shadow-2xs hover:shadow-xs"
                          : "border-slate-200 opacity-60 bg-slate-50"
                      }`}
                    >
                      {/* Yearly / Premium Badge highlight */}
                      {isActive && isYearly && (
                        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">
                          <Sparkles size={10} />
                          Best Value
                        </span>
                      )}

                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-800 text-base">{plan.name}</h3>
                          <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {plan.description && (
                          <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">{plan.description}</p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {formatCurrency(Number(plan.price), gym.currency_code)}
                          </p>
                          <p className="text-xxs font-bold uppercase tracking-wider text-[var(--muted)] mt-0.5">
                            For {plan.duration_months} Month(s)
                          </p>
                        </div>

                        <form action={deletePlanAction}>
                          <input type="hidden" name="id" value={plan.id} />
                          <button
                            type="submit"
                            disabled={!isActive}
                            className={`h-8 rounded-lg px-3 text-xs font-semibold border transition-all cursor-pointer ${
                              isActive
                                ? "bg-white border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isActive ? "Deactivate" : "Deactivated"}
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
                  <WalletCards size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">No membership plans created yet.</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Add a plan on the left to start subscribing members.</p>
                </div>
              )}
            </div>
          </section>
        </div>
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
