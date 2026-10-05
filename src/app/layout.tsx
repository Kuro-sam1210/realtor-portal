import type { Metadata } from "next";
import { GROUP_NAME } from "@/lib/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: `${GROUP_NAME} | Realtor Portal`,
  description: `Realtor group portal for ${GROUP_NAME}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
