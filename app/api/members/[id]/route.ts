import { type NextRequest } from "next/server";
import { z } from "zod";

import {
  assertGymAccess,
  isApiErrorResponse,
  parseJson,
  requireApiContext
} from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { memberSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

const updateMemberSchema = memberSchema.partial().extend({
  gym_id: z.string().uuid()
});

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .eq("gym_id", gymId)
    .single();

  if (error) return fail("NOT_FOUND", error.message, 404);
  return ok(data);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const parsed = await parseJson(request, updateMemberSchema);
  if (isApiErrorResponse(parsed)) return parsed;

  const { gym_id: gymId, ...updates } = parsed;
  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("members")
    .update(updates)
    .eq("id", id)
    .eq("gym_id", gymId)
    .select("*")
    .single();

  if (error) return fail("NOT_FOUND", error.message, 404);
  return ok(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const gymId = request.nextUrl.searchParams.get("gym_id");
  if (!gymId) return fail("BAD_REQUEST", "gym_id query parameter is required.", 400);

  const accessError = await assertGymAccess(context.supabase, context.user.id, gymId);
  if (accessError) return accessError;

  const { error } = await context.supabase
    .from("members")
    .delete()
    .eq("id", id)
    .eq("gym_id", gymId);

  if (error) return fail("CONFLICT", error.message, 409);
  return ok({ deleted: true });
}
