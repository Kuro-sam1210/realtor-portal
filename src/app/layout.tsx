import type { Metadata } from "next";
import { isDemo } from "@/lib/demo";
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
        {isDemo && (
          <p className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
            Demo preview: sample data only, nothing you enter is saved.
          </p>
        )}
        {children}
      </body>
    </html>
  );
}
