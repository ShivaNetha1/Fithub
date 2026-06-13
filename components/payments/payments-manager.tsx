"use client";

import { useMemo, useState } from "react";
import { Search, CreditCard, Filter, DollarSign, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Payment = {
  id: string;
  member_id: string;
  subscription_id: string | null;
  amount: number;
  payment_date: string;
  method: string;
  status: string;
  reference_number: string | null;
};

type Member = {
  id: string;
  member_code: string;
  full_name: string;
};

type PaymentsManagerProps = {
  payments: Payment[];
  memberById: Map<string, Member>;
  currencyCode: string;
};

export function PaymentsManager({ payments, memberById, currencyCode }: PaymentsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const member = memberById.get(payment.member_id);
      const matchesSearch = member
        ? member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.member_code.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      if (filterMethod === "all") return matchesSearch;
      return matchesSearch && payment.method.toLowerCase() === filterMethod.toLowerCase();
    });
  }, [payments, searchQuery, filterMethod, memberById]);

  const stats = useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const upiCollected = payments.filter((p) => p.method === "upi").reduce((sum, p) => sum + Number(p.amount), 0);
    const cashCollected = payments.filter((p) => p.method === "cash").reduce((sum, p) => sum + Number(p.amount), 0);
    const cardCollected = payments.filter((p) => p.method === "card").reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalCollected, upiCollected, cashCollected, cardCollected };
  }, [payments]);

  const methods = ["all", "cash", "upi", "card", "bank_transfer"];

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Total Collected" value={formatCurrency(stats.totalCollected, currencyCode)} icon={DollarSign} color="bg-blue-50 text-blue-600 border-blue-100" />
        <MiniStat label="UPI Payments" value={formatCurrency(stats.upiCollected, currencyCode)} icon={Wallet} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
        <MiniStat label="Cash / Card" value={formatCurrency(stats.cashCollected + stats.cardCollected, currencyCode)} icon={CreditCard} color="bg-purple-50 text-purple-600 border-purple-100" />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 bg-white sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search payment history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-like pl-10 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mr-2 flex items-center gap-1">
              <Filter size={12} />
              Method:
            </span>
            <div className="flex rounded-lg border border-[var(--border)] bg-white p-0.5">
              {methods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFilterMethod(method)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    filterMethod === method
                      ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Member</th>
                <th className="px-5 py-3.5 font-bold">Date</th>
                <th className="px-5 py-3.5 font-bold">Method</th>
                <th className="px-5 py-3.5 font-bold">Reference</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredPayments.length ? (
                filteredPayments.map((payment) => {
                  const member = memberById.get(payment.member_id);
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{member?.full_name ?? "Unknown Member"}</p>
                        <p className="text-xxs font-bold uppercase tracking-wider text-[var(--muted)] mt-0.5">{member?.member_code}</p>
                      </td>
                      <td className="px-5 py-4 text-[var(--muted)] font-medium">
                        {new Date(payment.payment_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-800">
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[var(--muted)] font-medium font-mono text-xs">
                        {payment.reference_number ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xxs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900">
                        {formatCurrency(Number(payment.amount), currencyCode)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ size?: number }>; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4.5 flex items-center gap-3.5 shadow-2xs bg-white">
      <div className={`flex size-10 items-center justify-center rounded-xl border ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xxs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <p className="mt-0.5 text-xl font-extrabold text-[var(--foreground)] tracking-tight">{value}</p>
      </div>
    </div>
  );
}
