"use client";

import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  WalletCards,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AppShellProps = {
  children: React.ReactNode;
  ownerName: string;
  gymName?: string;
};

function confirmLogout(event: FormEvent<HTMLFormElement>) {
  if (!window.confirm("Are you sure you want to logout?")) {
    event.preventDefault();
  }
}

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar (hidden on small/medium screens) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[var(--panel)] lg:block shadow-xs">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-sm shadow-[var(--primary-glow)]">
                <Dumbbell size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold tracking-tight text-[var(--foreground)]">FitHub</span>
                <span className="block text-xxs font-medium uppercase tracking-wider text-[var(--muted)]">Console</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return item.enabled ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[var(--primary-glow)] text-[var(--primary)] font-semibold shadow-2xs"
                      : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={18} className={`transition-transform duration-200 ${isActive ? "scale-105" : ""}`} aria-hidden="true" />
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.href}
                  className="flex h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium text-[var(--muted)] opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="text-xxs font-semibold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border)] p-4">
            <form action="/auth/logout" method="post" onSubmit={confirmLogout}>
              <button className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--muted)] transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                <LogOut size={18} aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay (Backdrop) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-66 border-r border-[var(--border)] bg-[var(--panel)] shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-sm">
                <Dumbbell size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold tracking-tight text-[var(--foreground)]">FitHub</span>
                <span className="block text-xxs font-medium uppercase tracking-wider text-[var(--muted)]">Console</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--panel-strong)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return item.enabled ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[var(--primary-glow)] text-[var(--primary)] font-semibold shadow-2xs"
                      : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.href}
                  className="flex h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium text-[var(--muted)] opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="text-xxs font-semibold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border)] p-4">
            <form action="/auth/logout" method="post" onSubmit={confirmLogout}>
              <button className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--muted)] transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                <LogOut size={18} aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--panel)]/90 backdrop-blur-md">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] transition-colors lg:hidden cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={18} aria-hidden="true" />
              </button>
              <div>
                <p className="text-xxs font-medium uppercase tracking-wider text-[var(--muted)]">Welcome, {ownerName}</p>
                <p className="text-sm font-bold text-[var(--foreground)] sm:text-base">{gymName ?? "Set up your first gym"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 sm:flex shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Live Workspace
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
