import { NextResponse, type NextRequest } from "next/server";

import { APP_HOME } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? APP_HOME;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        // If it's an invite or the user hasn't onboarded, force password setup
        if (type === "invite" || (profile && !profile.onboarding_completed)) {
          return NextResponse.redirect(
            new URL("/auth/reset-password?next=/onboarding", request.url)
          );
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
