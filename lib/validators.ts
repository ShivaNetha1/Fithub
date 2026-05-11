import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

const optionalEmail = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase())
  .or(z.literal("").transform(() => null))
  .nullable()
  .optional();

export const uuidSchema = z.string().uuid();

export const planSchema = z.object({
  gym_id: uuidSchema,
  name: z.string().trim().min(2),
  plan_type: z.enum(["monthly", "quarterly", "half_yearly", "yearly", "custom"]),
  duration_months: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  description: optionalText,
  is_active: z.coerce.boolean().default(true)
});

export const memberSchema = z.object({
  gym_id: uuidSchema,
  member_code: z.string().trim().min(1).max(40),
  full_name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: optionalEmail,
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .nullable()
    .optional(),
  date_of_birth: z.string().date().nullable().optional(),
  address: optionalText,
  emergency_contact_name: optionalText,
  emergency_contact_phone: optionalText,
  join_date: z.string().date(),
  account_status: z.enum(["active", "inactive", "archived"]).default("active"),
  notes: optionalText
});

export const subscriptionSchema = z.object({
  gym_id: uuidSchema,
  member_id: uuidSchema,
  plan_id: uuidSchema,
  renewal_of_subscription_id: uuidSchema.nullable().optional(),
  start_date: z.string().date(),
  end_date: z.string().date(),
  status: z.enum(["active", "expired", "cancelled", "upcoming"]).default("active"),
  base_amount: z.coerce.number().min(0),
  discount_amount: z.coerce.number().min(0).default(0),
  amount_paid: z.coerce.number().min(0).default(0),
  notes: optionalText
});

export const paymentSchema = z.object({
  gym_id: uuidSchema,
  member_id: uuidSchema,
  subscription_id: uuidSchema.nullable().optional(),
  amount: z.coerce.number().positive(),
  payment_date: z.string().date(),
  method: z.enum(["cash", "card", "upi", "bank_transfer", "cheque", "other"]),
  status: z.enum(["completed", "pending", "failed", "refunded"]).default("completed"),
  reference_number: optionalText,
  notes: optionalText
});

export const attendanceSchema = z.object({
  gym_id: uuidSchema,
  member_id: uuidSchema,
  attendance_date: z.string().date(),
  status: z.enum(["present", "absent"]).default("present"),
  check_in_time: z.string().datetime().nullable().optional(),
  check_out_time: z.string().datetime().nullable().optional(),
  notes: optionalText
});

export const gymSettingsSchema = z.object({
  name: z.string().trim().min(2),
  email: optionalEmail,
  phone: optionalText,
  city: optionalText,
  state: optionalText,
  country: z.string().trim().min(2),
  timezone: z.string().trim().min(2),
  currency_code: z.string().trim().length(3).transform((value) => value.toUpperCase())
});
