import { recordPaymentAction } from "@/app/(app)/actions";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getOwnerGym } from "@/lib/data/gym";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Payments" };
export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const { user, supabase, gym } = await getOwnerGym();
  const [{ data: members }, { data: subscriptions }, { data: payments }] = await Promise.all([
    supabase.from("members").select("*").eq("gym_id", gym.id).order("full_name"),
    supabase.from("subscriptions").select("*").eq("gym_id", gym.id).order("end_date", { ascending: false }),
    supabase.from("payments").select("*").eq("gym_id", gym.id).order("payment_date", { ascending: false })
  ]);
  const memberById = new Map(members?.map((member) => [member.id, member]));

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h1 className="text-xl font-semibold">Record payment</h1>
          <form action={recordPaymentAction} className="mt-5 space-y-4">
            <label>
              <span className="mb-1.5 block text-sm font-medium">Member</span>
              <select name="member_id" className="input-like" required>
                <option value="">Select member</option>
                {members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name} ({member.member_code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Subscription</span>
              <select name="subscription_id" className="input-like">
                <option value="">No subscription link</option>
                {subscriptions?.map((subscription) => {
                  const member = memberById.get(subscription.member_id);
                  return (
                    <option key={subscription.id} value={subscription.id}>
                      {member?.full_name ?? "Member"} · ends {subscription.end_date}
                    </option>
                  );
                })}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount" name="amount" type="number" required />
              <Field label="Payment date" name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Method</span>
              <select name="method" className="input-like">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </label>
            <Field label="Reference" name="reference_number" />
            <button className="btn-primary">Save payment</button>
          </form>
        </section>

        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-xl font-semibold">Payment history</h2>
          <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {payments?.length ? (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{memberById.get(payment.member_id)?.full_name ?? "Member"}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {payment.payment_date} · {payment.method} · {payment.status}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(Number(payment.amount), gym.currency_code)}</p>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[var(--muted)]">No payments recorded yet.</p>
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
