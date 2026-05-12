import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Reset password"
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
