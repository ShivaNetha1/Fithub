import {
  Activity,
  BarChart3,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  WalletCards
} from "lucide-react";
import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
  ownerName: string;
  gymName?: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { href: "/plans", label: "Plans", icon: WalletCards, enabled: true },
  { href: "/members", label: "Members", icon: Users, enabled: true },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, enabled: true },
  { href: "/payments", label: "Payments", icon: CreditCard, enabled: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, enabled: true },
  { href: "/settings", label: "Settings", icon: Settings, enabled: true }
];

export function AppShell({ children, ownerName, gymName }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[var(--panel)] lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-white">
                <Dumbbell size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">Fithub</span>
                <span className="block text-xs text-[var(--muted)]">Owner console</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return item.enabled ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.href}
                  className="flex h-10 items-center justify-between gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] opacity-70"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="text-xs">Soon</span>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border)] p-4">
            <form action="/auth/logout" method="post">
              <button className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                <LogOut size={18} aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <p className="text-sm text-[var(--muted)]">Welcome, {ownerName}</p>
              <p className="font-semibold">{gymName ?? "Set up your first gym"}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] sm:flex">
              <Activity size={16} aria-hidden="true" />
              Live workspace
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
