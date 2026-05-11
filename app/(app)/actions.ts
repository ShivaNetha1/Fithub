"use server";

import { addMonths, subDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getOwnerGym } from "@/lib/data/gym";

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length ? value : null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const raw = formData.get(key);
  if (raw === null || raw === "") return fallback;
  return Number(raw);
}

function dateValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? new Date().toISOString().slice(0, 10));
}

async function logActivity(action: string, entityType: string, entityId?: string) {
  const { user, supabase, gym } = await getOwnerGym();
  await supabase.from("activity_logs").insert({
    gym_id: gym.id,
    actor_user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null
  });
}

export async function createPlanAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const { data, error } = await supabase
    .from("membership_plans")
    .insert({
      gym_id: gym.id,
      name: String(formData.get("name") ?? "").trim(),
      plan_type: String(formData.get("plan_type") ?? "custom") as never,
      duration_months: numberValue(formData, "duration_months", 1),
      price: numberValue(formData, "price", 0),
      description: text(formData, "description"),
      is_active: true
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await logActivity("created", "membership_plan", data.id);
  revalidatePath("/plans");
}

export async function deletePlanAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("membership_plans")
    .update({ is_active: false })
    .eq("id", id)
    .eq("gym_id", gym.id);

  if (error) throw new Error(error.message);
  await logActivity("deactivated", "membership_plan", id);
  revalidatePath("/plans");
}

export async function createMemberAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const planId = text(formData, "plan_id");
  const startDate = dateValue(formData, "start_date");
  const memberCode = String(formData.get("member_code") ?? "").trim();

  if (!memberCode) {
    throw new Error("Member code is required.");
  }

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("members")
    .select("id")
    .eq("gym_id", gym.id)
    .eq("member_code", memberCode)
    .maybeSingle();

  if (existingMemberError) {
    throw new Error(existingMemberError.message);
  }

  if (existingMember) {
    throw new Error("Member code already exists. Please choose a different code.");
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      gym_id: gym.id,
      member_code: memberCode,
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: text(formData, "email"),
      gender: (text(formData, "gender") as never) ?? null,
      join_date: startDate,
      address: text(formData, "address"),
      emergency_contact_name: text(formData, "emergency_contact_name"),
      emergency_contact_phone: text(formData, "emergency_contact_phone"),
      notes: text(formData, "notes")
    })
    .select("id")
    .single();

  if (memberError || !member) {
    if (
      memberError?.message?.includes("members_gym_code_unique") ||
      memberError?.message?.includes("duplicate key value violates unique constraint")
    ) {
      throw new Error("Member code already exists. Please choose a different code.");
    }

    throw new Error(memberError?.message ?? "Member creation failed.");
  }

  if (planId) {
    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("duration_months, price")
      .eq("id", planId)
      .eq("gym_id", gym.id)
      .single();

    if (planError || !plan) throw new Error(planError?.message ?? "Plan not found.");

    const endDate = subDays(addMonths(new Date(startDate), plan.duration_months), 1)
      .toISOString()
      .slice(0, 10);
    const initialPayment = numberValue(formData, "initial_payment", 0);

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        gym_id: gym.id,
        member_id: member.id,
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        base_amount: Number(plan.price),
        discount_amount: numberValue(formData, "discount_amount", 0),
        amount_paid: 0
      })
      .select("id")
      .single();

    if (subscriptionError || !subscription) {
      throw new Error(subscriptionError?.message ?? "Subscription creation failed.");
    }

    if (initialPayment > 0) {
      const { error: paymentError } = await supabase.from("payments").insert({
        gym_id: gym.id,
        member_id: member.id,
        subscription_id: subscription.id,
        amount: initialPayment,
        payment_date: startDate,
        method: String(formData.get("payment_method") ?? "cash") as never,
        status: "completed"
      });

      if (paymentError) throw new Error(paymentError.message);
    }
  }

  await logActivity("created", "member", member.id);
  revalidatePath("/members");
  redirect("/members");
}

export async function updateMemberAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const memberId = String(formData.get("id") ?? "").trim();
  const memberCode = String(formData.get("member_code") ?? "").trim();

  if (!memberId) {
    throw new Error("Member id is required.");
  }
  if (!memberCode) {
    throw new Error("Member code is required.");
  }

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("members")
    .select("id")
    .eq("gym_id", gym.id)
    .eq("member_code", memberCode)
    .neq("id", memberId)
    .maybeSingle();

  if (existingMemberError) {
    throw new Error(existingMemberError.message);
  }
  if (existingMember) {
    throw new Error("Member code already exists. Please choose a different code.");
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .update({
      member_code: memberCode,
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: text(formData, "email"),
      gender: (text(formData, "gender") as never) ?? null,
      join_date: dateValue(formData, "join_date"),
      address: text(formData, "address"),
      emergency_contact_name: text(formData, "emergency_contact_name"),
      emergency_contact_phone: text(formData, "emergency_contact_phone"),
      notes: text(formData, "notes")
    })
    .eq("id", memberId)
    .eq("gym_id", gym.id)
    .select("id")
    .single();

  if (memberError || !member) {
    if (
      memberError?.message?.includes("members_gym_code_unique") ||
      memberError?.message?.includes("duplicate key value violates unique constraint")
    ) {
      throw new Error("Member code already exists. Please choose a different code.");
    }
    throw new Error(memberError?.message ?? "Member update failed.");
  }

  await logActivity("updated", "member", memberId);
  revalidatePath("/members");
  redirect("/members");
}

export async function toggleMemberStatusAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const memberId = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "active" | "inactive";

  if (!memberId) {
    throw new Error("Member id is required.");
  }
  if (status !== "active" && status !== "inactive") {
    throw new Error("Invalid member status.");
  }

  const { error } = await supabase
    .from("members")
    .update({ account_status: status })
    .eq("id", memberId)
    .eq("gym_id", gym.id);

  if (error) throw new Error(error.message);

  await logActivity(status === "active" ? "activated" : "deactivated", "member", memberId);
  revalidatePath("/members");
  redirect("/members");
}

export async function deleteMemberAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("members").delete().eq("id", id).eq("gym_id", gym.id);

  if (error) throw new Error(error.message);
  await logActivity("deleted", "member", id);
  revalidatePath("/members");
}

export async function recordPaymentAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const memberId = String(formData.get("member_id") ?? "");
  const subscriptionId = text(formData, "subscription_id");
  const { data, error } = await supabase
    .from("payments")
    .insert({
      gym_id: gym.id,
      member_id: memberId,
      subscription_id: subscriptionId,
      amount: numberValue(formData, "amount"),
      payment_date: dateValue(formData, "payment_date"),
      method: String(formData.get("method") ?? "cash") as never,
      status: "completed",
      reference_number: text(formData, "reference_number"),
      notes: text(formData, "notes")
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await logActivity("recorded", "payment", data.id);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
}

export async function markAttendanceAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const memberId = String(formData.get("member_id") ?? "");
  const attendanceDate = dateValue(formData, "attendance_date");
  const status = String(formData.get("status") ?? "present") as "present" | "absent";
  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        gym_id: gym.id,
        member_id: memberId,
        attendance_date: attendanceDate,
        status,
        check_in_time: status === "present" ? new Date().toISOString() : null,
        notes: text(formData, "notes")
      },
      { onConflict: "gym_id,member_id,attendance_date" }
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await logActivity("marked", "attendance", data.id);
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function updateGymSettingsAction(formData: FormData) {
  const { supabase, gym } = await getOwnerGym();
  const { error } = await supabase
    .from("gyms")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      city: text(formData, "city"),
      state: text(formData, "state"),
      country: String(formData.get("country") ?? "India").trim(),
      timezone: String(formData.get("timezone") ?? "Asia/Kolkata").trim(),
      currency_code: String(formData.get("currency_code") ?? "INR").trim().toUpperCase()
    })
    .eq("id", gym.id);

  if (error) throw new Error(error.message);
  await logActivity("updated", "gym", gym.id);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
