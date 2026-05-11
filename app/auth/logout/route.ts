import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_PATH } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(LOGIN_PATH, request.url), {
    status: 303
  });
}
