import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Forgot password"
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
