import { NextResponse, type NextRequest } from "next/server";

import { APP_HOME, LOGIN_PATH, ONBOARDING_PATH } from "@/lib/auth/paths";
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

        if (type === "invite") {
          return NextResponse.redirect(
            new URL("/auth/reset-password?next=/onboarding", request.url)
          );
        }

        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
        }
      }
    }
  }

  if (!code) {
    const fallbackUrl = new URL(LOGIN_PATH, request.url);
    fallbackUrl.searchParams.set("next", next);
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
