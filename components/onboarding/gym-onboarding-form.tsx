"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createGymAction, type OnboardingState } from "@/app/(app)/onboarding/actions";

const initialState: OnboardingState = {};

export function GymOnboardingForm() {
  const [state, action] = useActionState(createGymAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Gym name</span>
          <input
            required
            minLength={2}
            name="name"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
            placeholder="Fithub Fitness Studio"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium">Phone</span>
          <input
            name="phone"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
            placeholder="+91 98765 43210"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
            placeholder="gym@example.com"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium">City</span>
          <input
            name="city"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
            placeholder="Bengaluru"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium">State</span>
          <input
            name="state"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
            placeholder="Karnataka"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium">Country</span>
          <input
            name="country"
            defaultValue="India"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium">Currency</span>
          <input
            name="currency_code"
            defaultValue="INR"
            maxLength={3}
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm uppercase outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]"
          />
        </label>
      </div>

      <input type="hidden" name="timezone" value="Asia/Kolkata" />

      {state.error ? (
        <div className="rounded-md border border-[#f1b8ad] bg-[#fff0ed] px-3 py-2 text-sm text-[var(--danger)]">
          {state.error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[#0f6853] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : null}
      Create gym workspace
    </button>
  );
}
