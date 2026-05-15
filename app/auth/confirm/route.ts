import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { APP_HOME, LOGIN_PATH, ONBOARDING_PATH } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

const PASSWORD_SETUP_PATH = `/auth/reset-password?next=${encodeURIComponent(ONBOARDING_PATH)}`;
const EMAIL_OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email",
  "email_change"
]);

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return APP_HOME;
  }

  return value;
}

function getOtpType(value: string | null): EmailOtpType | null {
  if (!value || !EMAIL_OTP_TYPES.has(value)) {
    return null;
  }

  return value as EmailOtpType;
}

function redirectWithError(request: NextRequest, message: string) {
  const redirectUrl = new URL(LOGIN_PATH, request.url);
  redirectUrl.searchParams.set("error", message);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = getOtpType(requestUrl.searchParams.get("type"));
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!tokenHash || !type) {
    return redirectWithError(request, "Invalid or expired authentication link.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type
  });

  if (error) {
    return redirectWithError(request, error.message);
  }

  if (type === "invite") {
    return NextResponse.redirect(new URL(PASSWORD_SETUP_PATH, request.url));
  }

  if (type === "signup") {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
  }

  if (type === "recovery") {
    const resetUrl = new URL("/auth/reset-password", request.url);
    resetUrl.searchParams.set("next", next);
    return NextResponse.redirect(resetUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
