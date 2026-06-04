import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/providers";

export const metadata: Metadata = {
  title: "Krishna Multi-Branch E-Commerce",
  description: "Multi-branch e-commerce platform with role-based access and chat support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
