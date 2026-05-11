import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return children;
}
