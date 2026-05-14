import { NextResponse, type NextRequest } from "next/server";

import { APP_HOME } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? APP_HOME;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      // If this is a fresh user who hasn't completed onboarding, enforce setting a password first
      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(
          new URL("/auth/reset-password?next=/onboarding", request.url)
        );
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
