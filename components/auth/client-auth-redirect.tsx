"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";

export function ClientAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check if a session is already present or established via hash fragment
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && !data.onboarding_completed) {
              router.replace("/auth/reset-password?next=/onboarding");
            } else {
              router.replace("/dashboard");
            }
          });
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
        supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && !data.onboarding_completed) {
              router.replace("/auth/reset-password?next=/onboarding");
            } else {
              router.replace("/dashboard");
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
