import { type NextRequest } from "next/server";

import {
  assertGymAccess,
  isApiErrorResponse,
  parseJson,
  requireApiContext
} from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { gymSettingsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const context = await requireApiContext();
  if (isApiErrorResponse(context)) return context;

  const parsed = await parseJson(request, gymSettingsSchema);
  if (isApiErrorResponse(parsed)) return parsed;

  const accessError = await assertGymAccess(context.supabase, context.user.id, id);
  if (accessError) return accessError;

  const { data, error } = await context.supabase
    .from("gyms")
    .update(parsed)
    .eq("id", id)
    .eq("owner_id", context.user.id)
    .select("*")
    .single();

  if (error) return fail("NOT_FOUND", error.message, 404);
  return ok(data);
}
