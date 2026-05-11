import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { fail, validationFail } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export type ApiContext = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireApiContext(): Promise<ApiContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return fail("UNAUTHORIZED", "Authentication is required.", 401);
  }

  return { supabase, user };
}

export function isApiErrorResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export async function parseJson<TSchema extends z.ZodType>(
  request: NextRequest,
  schema: TSchema
): Promise<z.infer<TSchema> | NextResponse> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationFail(parsed.error);
    }

    return parsed.data;
  } catch {
    return fail("BAD_REQUEST", "Request body must be valid JSON.", 400);
  }
}

export async function assertGymAccess(
  supabase: SupabaseClient,
  userId: string,
  gymId: string
) {
  const { data, error } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", gymId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    return fail("INTERNAL_ERROR", error.message, 500);
  }

  if (!data) {
    return fail("FORBIDDEN", "You do not have access to this gym.", 403);
  }

  return null;
}
