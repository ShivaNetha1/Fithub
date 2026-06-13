import { recordPaymentAction } from "@/app/(app)/actions";
import { PaymentsManager } from "@/components/payments/payments-manager";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Payments" };
export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const { user, supabase, gym } = await getOwnerGym();
  
  const [{ data: members }, { data: subscriptions }, { data: payments }] = await Promise.all([
    supabase
      .from("members")
      .select("id, member_code, full_name")
      .eq("gym_id", gym.id)
      .order("full_name"),
    supabase
      .from("subscriptions")
      .select("id, member_id, end_date")
      .eq("gym_id", gym.id)
      .order("end_date", { ascending: false }),
    supabase
      .from("payments")
      .select("id, member_id, subscription_id, amount, payment_date, method, status, reference_number")
      .eq("gym_id", gym.id)
      .order("payment_date", { ascending: false })
  ]);

  const cleanMembers = members ?? [];
  const cleanSubscriptions = subscriptions ?? [];
  const cleanPayments = (payments ?? []) as Array<{
    id: string;
    member_id: string;
    subscription_id: string | null;
    amount: number;
    payment_date: string;
    method: string;
    status: string;
    reference_number: string | null;
  }>;

  const memberById = new Map(cleanMembers.map((member) => [member.id, member]));

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Payments Ledger</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Record income, track receipts, and manage membership transactions.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-start">
          {/* Record payment card */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xs">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Record Payment</h2>
            <form action={recordPaymentAction} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Select Member</span>
                <select name="member_id" className="input-like cursor-pointer bg-white" required>
                  <option value="">Choose member</option>
                  {cleanMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} ({member.member_code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Link Subscription (Optional)</span>
                <select name="subscription_id" className="input-like cursor-pointer bg-white">
                  <option value="">No subscription link</option>
                  {cleanSubscriptions.map((subscription) => {
                    const m = memberById.get(subscription.member_id);
                    return (
                      <option key={subscription.id} value={subscription.id}>
                        {m?.full_name ?? "Member"} · ends {subscription.end_date}
                      </option>
                    );
                  })}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount (INR)" name="amount" type="number" min="0" required />
                <Field
                  label="Payment Date"
                  name="payment_date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Payment Method</span>
                <select name="method" className="input-like cursor-pointer bg-white" defaultValue="cash">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <Field label="Reference Number" name="reference_number" placeholder="UPI Txn ID, Chq No..." />

              <button className="btn-primary w-full mt-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                Save Payment
              </button>
            </form>
          </section>

          {/* Payments Manager (Table, Filters & Search) */}
          <PaymentsManager
            payments={cleanPayments}
            memberById={memberById}
            currencyCode={gym.currency_code}
          />
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
