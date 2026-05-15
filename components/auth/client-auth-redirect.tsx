"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { consumeAuthHash, routeAuthenticatedUser } from "@/lib/auth/client-auth-flow";
import { createClient } from "@/lib/supabase/browser";

export function ClientAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const navigate = (path: string) => router.replace(path);

    // Check if a session is already present or encoded in the auth hash fragment.
    consumeAuthHash(supabase)
      .then((result) => {
        if (result?.session) {
          return routeAuthenticatedUser(supabase, result.session, navigate, {
            type: result.type
          });
        }

        return supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            return routeAuthenticatedUser(supabase, session, navigate);
          }

          return null;
        });
      })
      .catch(() => {
        router.replace("/auth/login");
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
        routeAuthenticatedUser(supabase, session, navigate);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
