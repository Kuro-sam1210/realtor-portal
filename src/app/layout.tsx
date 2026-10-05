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
      <body className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-zinc-200 px-4 py-6 text-center text-xs text-zinc-500">
          <nav className="mb-2 flex justify-center gap-4">
            <span>Conditions</span>
            <span>Help</span>
            <span>Terms</span>
          </nav>
          <p>
            copyright {GROUP_NAME} &copy; {new Date().getFullYear()} . All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
