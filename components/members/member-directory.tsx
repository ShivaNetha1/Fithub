"use client";

import { Pencil, Plus, Trash2, UserCheck, UserX, X, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createMemberAction,
  deleteMemberAction,
  toggleMemberStatusAction,
  updateMemberAction
} from "@/app/(app)/actions";

type Member = {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  join_date: string;
  account_status: "active" | "inactive" | "archived";
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
};

type Plan = {
  id: string;
  name: string;
};

type MemberStatus = {
  member_id: string;
  subscription_id: string | null;
  plan_name: string | null;
  computed_subscription_status: string;
  end_date: string | null;
  balance_amount: number;
};

type Subscription = {
  id: string;
  member_id: string;
  base_amount: number;
  discount_amount: number;
  amount_paid: number;
  balance_amount: number;
  end_date: string;
};

type MemberDirectoryProps = {
  members: Member[];
  plans: Plan[];
  statuses: MemberStatus[];
  subscriptions: Subscription[];
  defaultMemberCode: string;
};

export function MemberDirectory({
  members,
  plans,
  statuses,
  subscriptions,
  defaultMemberCode
}: MemberDirectoryProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const statusByMember = useMemo(
    () => new Map(statuses.map((status) => [status.member_id, status])),
    [statuses]
  );
  const subscriptionById = useMemo(
    () => new Map(subscriptions.map((subscription) => [subscription.id, subscription])),
    [subscriptions]
  );
  const editingMember = members.find((member) => member.id === editingMemberId) ?? null;

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            View every member, payment balance, current plan, and expiry date in one workspace.
          </p>
        </div>
        <button type="button" onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus size={17} aria-hidden="true" />
          Add member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--panel-strong)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-semibold">Name / ID</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Plan</th>
              <th className="px-5 py-3 font-semibold">Discount</th>
              <th className="px-5 py-3 font-semibold">Paid</th>
              <th className="px-5 py-3 font-semibold">Balance</th>
              <th className="px-5 py-3 font-semibold">Expiry</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {members.length ? (
              members.map((member) => {
                const status = statusByMember.get(member.id);
                const subscription = status?.subscription_id
                  ? subscriptionById.get(status.subscription_id)
                  : null;
                const accountStatus = member.account_status ?? "active";

                return (
                  <tr key={member.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium">{member.full_name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{member.member_code}</p>
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">{member.phone}</td>
                    <td className="px-5 py-4">
                      <p>{status?.plan_name ?? "No plan"}</p>
                      <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                        {status?.computed_subscription_status ?? "expired"}
                      </p>
                    </td>
                    <td className="px-5 py-4">{formatDiscount(subscription)}</td>
                    <td className="px-5 py-4">{formatMoney(subscription?.amount_paid)}</td>
                    <td className="px-5 py-4 font-medium">
                      {formatMoney(getBalance(subscription, status))}
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">
                      {formatDate(subscription?.end_date ?? status?.end_date)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={accountStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <form action={toggleMemberStatusAction}>
                          <input type="hidden" name="id" value={member.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={accountStatus === "active" ? "inactive" : "active"}
                          />
                          <IconButton
                            label={accountStatus === "active" ? "Deactivate" : "Activate"}
                            icon={accountStatus === "active" ? UserX : UserCheck}
                          />
                        </form>
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(member.id)}
                          className="btn-secondary"
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Edit
                        </button>
                        <form action={deleteMemberAction}>
                          <input type="hidden" name="id" value={member.id} />
                          <IconButton label="Delete" icon={Trash2} />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-[var(--muted)]">
                  No members yet. Add your first member to start tracking plans and payments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddOpen ? (
        <MemberModal title="Add member" onClose={() => setIsAddOpen(false)}>
          <MemberForm plans={plans} defaultMemberCode={defaultMemberCode} mode="create" />
        </MemberModal>
      ) : null}

      {editingMember ? (
        <MemberModal title="Edit member" onClose={() => setEditingMemberId(null)}>
          <MemberForm plans={plans} member={editingMember} mode="edit" />
        </MemberModal>
      ) : null}
    </section>
  );
}

function MemberModal({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--panel)] shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--border)] hover:bg-[var(--panel-strong)]"
            aria-label="Close modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function MemberForm({
  mode,
  plans,
  defaultMemberCode,
  member
}: {
  mode: "create" | "edit";
  plans: Plan[];
  defaultMemberCode?: string;
  member?: Member;
}) {
  const action = mode === "create" ? createMemberAction : updateMemberAction;

  return (
    <form action={action} className="space-y-4">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Member code"
          name="member_code"
          placeholder="M001"
          defaultValue={member?.member_code ?? defaultMemberCode}
          required
        />
        <Field
          label="Full name"
          name="full_name"
          placeholder="Riya Patel"
          defaultValue={member?.full_name}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" defaultValue={member?.phone} required />
        <Field label="Email" name="email" type="email" defaultValue={member?.email ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-sm font-medium">Gender</span>
          <select name="gender" className="input-like" defaultValue={member?.gender ?? ""}>
            <option value="">Not set</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <Field
          label={mode === "create" ? "Join date" : "Join date"}
          name={mode === "create" ? "start_date" : "join_date"}
          type="date"
          defaultValue={member?.join_date ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      {mode === "create" ? (
        <>
          <label>
            <span className="mb-1.5 block text-sm font-medium">Initial plan</span>
            <select name="plan_id" className="input-like">
              <option value="">No plan yet</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Discount (%)"
              name="discount_amount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue="0"
            />
            <Field label="Initial payment" name="initial_payment" type="number" defaultValue="0" />
          </div>
        </>
      ) : (
        <>
          <Field label="Address" name="address" defaultValue={member?.address ?? ""} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Emergency contact name"
              name="emergency_contact_name"
              defaultValue={member?.emergency_contact_name ?? ""}
            />
            <Field
              label="Emergency contact phone"
              name="emergency_contact_phone"
              defaultValue={member?.emergency_contact_phone ?? ""}
            />
          </div>
          <Field label="Notes" name="notes" defaultValue={member?.notes ?? ""} />
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <SubmitButton label={mode === "create" ? "Save member" : "Save changes"} />
      </div>
    </form>
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Saving..." : label}
    </button>
  );
}

function IconButton({
  label,
  icon: Icon
}: {
  label: string;
  icon: LucideIcon;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-secondary disabled:opacity-60">
      <Icon size={16} aria-hidden="true" />
      {pending ? "Saving..." : label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

function formatDiscount(subscription: Subscription | null | undefined) {
  const percent = getDiscountPercent(subscription);
  return `${formatNumber(percent)}%`;
}

function getBalance(
  subscription: Subscription | null | undefined,
  status: MemberStatus | null | undefined
) {
  if (!subscription) {
    return status?.balance_amount ?? 0;
  }

  const baseAmount = Number(subscription.base_amount ?? 0);
  const discountPercent = getDiscountPercent(subscription);
  const paid = Number(subscription.amount_paid ?? 0);

  return Math.max(baseAmount - (baseAmount / 100) * discountPercent - paid, 0);
}

function getDiscountPercent(subscription: Subscription | null | undefined) {
  if (!subscription) {
    return 0;
  }

  const baseAmount = Number(subscription.base_amount ?? 0);
  const discountAmount = Number(subscription.discount_amount ?? 0);

  if (!baseAmount || !discountAmount) {
    return 0;
  }

  const storedAmountAsPercent = (discountAmount / baseAmount) * 100;

  if (discountAmount <= 100 && storedAmountAsPercent < 1) {
    return discountAmount;
  }

  return storedAmountAsPercent;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
