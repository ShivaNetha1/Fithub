import { Dumbbell } from "lucide-react";
import Link from "next/link";

import { GymOnboardingForm } from "@/components/onboarding/gym-onboarding-form";

export const metadata = {
  title: "Set up gym"
};

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-white">
              <Dumbbell size={22} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold">Fithub</span>
              <span className="block text-xs text-[var(--muted)]">Gym setup</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Owner onboarding</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">Create your first gym</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            This creates the gym workspace and seeds the standard Monthly, Quarterly,
            Half-Yearly, and Yearly membership plans.
          </p>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <GymOnboardingForm />
        </div>
      </section>
    </main>
  );
}
