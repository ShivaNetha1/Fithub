"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { APP_HOME } from "@/lib/auth/paths";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const gymSchema = z.object({
  name: z.string().trim().min(2, "Gym name must be at least 2 characters."),
  phone: z.string().trim().min(6, "Phone number must be at least 6 characters.").optional(),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().min(2).default("India"),
  currency_code: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  timezone: z.string().trim().min(2).default("Asia/Kolkata")
});

export type OnboardingState = {
  error?: string;
};

export async function createGymAction(
  _previousState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await requireUser();
  const parsed = gymSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || "",
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    country: formData.get("country") || "India",
    currency_code: formData.get("currency_code") || "INR",
    timezone: formData.get("timezone") || "Asia/Kolkata"
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your gym details."
    };
  }

  const supabase = await createClient();
  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      country: parsed.data.country,
      currency_code: parsed.data.currency_code,
      timezone: parsed.data.timezone
    })
    .select("id")
    .single();

  if (gymError || !gym) {
    return {
      error: gymError?.message ?? "Could not create your gym. Please try again."
    };
  }

  const { error: planError } = await supabase.rpc("create_default_membership_plans", {
    target_gym_id: gym.id
  });

  if (planError) {
    return {
      error: planError.message
    };
  }

  await supabase
    .from("users")
    .update({
      onboarding_completed: true
    })
    .eq("id", user.id);

  redirect(APP_HOME);
}
