import type { Metadata } from "next";

import "./globals.css";

const appName = process.env.APP_NAME ?? "Fithub";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`
  },
  description: "Multi-gym management SaaS for gym owners.",
  applicationName: appName
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
