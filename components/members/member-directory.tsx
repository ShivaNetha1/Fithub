"use client";

import { Pencil, Plus, Trash2, UserCheck, UserX, X, Search, Filter, type LucideIcon } from "lucide-react";
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const statusByMember = useMemo(
    () => new Map(statuses.map((status) => [status.member_id, status])),
    [statuses]
  );
  const subscriptionById = useMemo(
    () => new Map(subscriptions.map((subscription) => [subscription.id, subscription])),
    [subscriptions]
  );
  const editingMember = members.find((member) => member.id === editingMemberId) ?? null;

  // Search and filter logic
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.member_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()));

      if (filterStatus === "all") return matchesSearch;
      return matchesSearch && member.account_status === filterStatus;
    });
  }, [members, searchQuery, filterStatus]);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xs overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 sm:flex-row sm:items-center sm:justify-between bg-white">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Members</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your roster, track subscription expirations, discount structures, and pending balances.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="btn-primary shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} aria-hidden="true" />
          Add member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by name, ID, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-like pl-10 bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mr-2 flex items-center gap-1">
            <Filter size={12} />
            Status:
          </span>
          <div className="flex rounded-lg border border-[var(--border)] bg-white p-0.5">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterStatus === status
                    ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-6 py-4 font-bold">Name / Code</th>
              <th className="px-6 py-4 font-bold">Phone</th>
              <th className="px-6 py-4 font-bold">Plan Details</th>
              <th className="px-6 py-4 font-bold">Discount</th>
              <th className="px-6 py-4 font-bold">Paid</th>
              <th className="px-6 py-4 font-bold">Balance</th>
              <th className="px-6 py-4 font-bold">Expiry Date</th>
              <th className="px-6 py-4 font-bold">Account Status</th>
              <th className="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-white">
            {filteredMembers.length ? (
              filteredMembers.map((member) => {
                const status = statusByMember.get(member.id);
                const subscription = status?.subscription_id
                  ? subscriptionById.get(status.subscription_id)
                  : null;
                const accountStatus = member.account_status ?? "active";

                return (
                  <tr key={member.id} className="align-top hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4.5">
                      <p className="font-semibold text-slate-800">{member.full_name}</p>
                      <p className="mt-1 text-xxs font-bold uppercase tracking-wider text-[var(--muted)]">{member.member_code}</p>
                    </td>
                    <td className="px-6 py-4.5 text-[var(--muted)] font-medium">{member.phone}</td>
                    <td className="px-6 py-4.5">
                      <p className="font-semibold text-slate-800">{status?.plan_name ?? "No plan"}</p>
                      {status?.computed_subscription_status && (
                        <p className={`mt-1 text-xxs font-bold uppercase tracking-wider ${
                          status.computed_subscription_status === "active"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}>
                          {status.computed_subscription_status}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 font-medium">{formatDiscount(subscription)}</td>
                    <td className="px-6 py-4.5 text-slate-700 font-medium">{formatMoney(subscription?.amount_paid)}</td>
                    <td className={`px-6 py-4.5 font-semibold ${
                      getBalance(subscription, status) > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}>
                      {formatMoney(getBalance(subscription, status))}
                    </td>
                    <td className="px-6 py-4.5 text-[var(--muted)] font-medium">
                      {formatDate(subscription?.end_date ?? status?.end_date)}
                    </td>
                    <td className="px-6 py-4.5">
                      <StatusPill status={accountStatus} />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex justify-end items-center gap-2">
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
                            variant={accountStatus === "active" ? "warning" : "success"}
                          />
                        </form>
                        <button
                          type="button"
                          title="Edit Profile"
                          onClick={() => setEditingMemberId(member.id)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <form action={deleteMemberAction} onSubmit={(e) => {
                          if (!window.confirm(`Are you sure you want to delete ${member.full_name}?`)) {
                            e.preventDefault();
                          }
                        }}>
                          <input type="hidden" name="id" value={member.id} />
                          <IconButton label="Delete" icon={Trash2} variant="danger" />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-[var(--muted)]">
                  {members.length === 0
                    ? "No members yet. Add your first member to start tracking."
                    : "No members match the search query and status filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics counter */}
      <div className="border-t border-[var(--border)] px-6 py-4 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
        <p>
          Showing {filteredMembers.length} of {members.length} members
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Active accounts: {members.filter(m => m.account_status === "active").length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-400" />
            Inactive accounts: {members.filter(m => m.account_status === "inactive").length}
          </span>
        </div>
      </div>

      {/* Modals */}
      {isAddOpen ? (
        <MemberModal title="Add Member" onClose={() => setIsAddOpen(false)}>
          <MemberForm plans={plans} defaultMemberCode={defaultMemberCode} mode="create" />
        </MemberModal>
      ) : null}

      {editingMember ? (
        <MemberModal title="Edit Member Profile" onClose={() => setEditingMemberId(null)}>
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
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      {/* Modal Card */}
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-xl animate-scale-in z-10">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-6 py-4.5">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--panel-strong)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">{children}</div>
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
    <form action={action} className="space-y-5">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}
      
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Member Code / Badge ID"
          name="member_code"
          placeholder="e.g. M001"
          defaultValue={member?.member_code ?? defaultMemberCode}
          required
        />
        <Field
          label="Full Name"
          name="full_name"
          placeholder="e.g. Riya Patel"
          defaultValue={member?.full_name}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Phone Number"
          name="phone"
          placeholder="e.g. 9876543210"
          defaultValue={member?.phone}
          required
        />
        <Field
          label="Email Address"
          name="email"
          type="email"
          placeholder="e.g. riya@example.com"
          defaultValue={member?.email ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Gender</span>
          <select name="gender" className="input-like cursor-pointer" defaultValue={member?.gender ?? ""}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <Field
          label="Join Date"
          name={mode === "create" ? "start_date" : "join_date"}
          type="date"
          defaultValue={member?.join_date ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      {mode === "create" ? (
        <>
          <label className="block border-t border-[var(--border)] pt-5">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Select Initial Plan</span>
            <select name="plan_id" className="input-like cursor-pointer">
              <option value="">No initial plan (create unpaid roster record)</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Discount (%)"
              name="discount_amount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue="0"
            />
            <Field
              label="Initial Payment Amount (INR)"
              name="initial_payment"
              type="number"
              min="0"
              defaultValue="0"
            />
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Payment Method</span>
            <select name="payment_method" className="input-like cursor-pointer" defaultValue="cash">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="other">Other</option>
            </select>
          </label>
        </>
      ) : (
        <>
          <Field
            label="Home Address"
            name="address"
            placeholder="e.g. 123, Park Avenue, Sector 4"
            defaultValue={member?.address ?? ""}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Emergency Contact Name"
              name="emergency_contact_name"
              placeholder="e.g. Suresh Patel"
              defaultValue={member?.emergency_contact_name ?? ""}
            />
            <Field
              label="Emergency Contact Phone"
              name="emergency_contact_phone"
              placeholder="e.g. 9812345678"
              defaultValue={member?.emergency_contact_phone ?? ""}
            />
          </div>
          <Field
            label="Internal Notes"
            name="notes"
            placeholder="Medical history, workout goals, preference notes..."
            defaultValue={member?.notes ?? ""}
          />
        </>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <SubmitButton label={mode === "create" ? "Add Member" : "Save Changes"} />
      </div>
    </form>
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function IconButton({
  label,
  icon: Icon,
  variant = "secondary"
}: {
  label: string;
  icon: LucideIcon;
  variant?: "secondary" | "danger" | "success" | "warning";
}) {
  const { pending } = useFormStatus();

  const baseClasses = "inline-flex size-8 items-center justify-center rounded-lg border transition-all duration-150 cursor-pointer disabled:opacity-60";
  const variantClasses =
    variant === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
      : variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
      : variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
      : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]";

  return (
    <button
      type="submit"
      disabled={pending}
      title={label}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xxs font-bold uppercase tracking-wider ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-100 text-slate-700 border border-slate-200"
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
