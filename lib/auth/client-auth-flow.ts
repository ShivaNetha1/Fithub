"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { APP_HOME, ONBOARDING_PATH } from "@/lib/auth/paths";

const PASSWORD_SETUP_PATH = `/auth/reset-password?next=${encodeURIComponent(ONBOARDING_PATH)}`;

type Navigate = (path: string) => void;

type AuthHashResult = {
  session: Session | null;
  type: string | null;
};

function cleanUrlHash() {
  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`
  );
}

function getAuthHashParams() {
  if (!window.location.hash || window.location.hash.length <= 1) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  if (!params.has("access_token") || !params.has("refresh_token")) {
    return null;
  }

  return params;
}

export async function consumeAuthHash(
  supabase: SupabaseClient
): Promise<AuthHashResult | null> {
  const params = getAuthHashParams();

  if (!params) {
    return null;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");

  if (!accessToken || !refreshToken) {
    return null;
  }

  cleanUrlHash();

  const {
    data: { session },
    error
  } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error) {
    throw error;
  }

  return {
    session,
    type
  };
}

export async function routeAuthenticatedUser(
  supabase: SupabaseClient,
  session: Session,
  navigate: Navigate,
  options?: {
    nextPath?: string;
    type?: string | null;
  }
) {
  const isInvite = options?.type === "invite";
  const isSignup = options?.type === "signup";

  if (isInvite) {
    navigate(PASSWORD_SETUP_PATH);
    return;
  }

  if (isSignup) {
    navigate(ONBOARDING_PATH);
    return;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) {
    navigate(ONBOARDING_PATH);
    return;
  }

  navigate(options?.nextPath ?? APP_HOME);
}
