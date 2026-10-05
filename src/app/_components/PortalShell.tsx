import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions";
import { GROUP_NAME } from "@/lib/ui";

const navLink = "flex items-center gap-3 px-6 py-3 text-sm text-zinc-300 hover:bg-slate-700 hover:text-white";

// Sidebar collapse is a CSS-only toggle so the shell stays a server component.
export function PortalShell({
  userName,
  isAdmin,
  children,
}: {
  userName: string;
  isAdmin: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <input type="checkbox" id="sidebar-toggle" className="peer sr-only" defaultChecked />

      <aside className="hidden w-64 shrink-0 flex-col bg-slate-800 md:peer-checked:flex">
        <div className="bg-white px-6 py-5">
          <span className="text-xl font-bold text-slate-800">{GROUP_NAME}</span>
        </div>

        <div className="px-4 py-4">
          <p className="mb-3 text-center text-sm font-bold text-white">{userName}</p>
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-400 focus:border-brand"
          />
        </div>

        <nav className="flex flex-col py-2">
          <Link href="/" className={navLink}>
            Main website
          </Link>
          <Link href="/dashboard" className={navLink}>
            Dashboard
          </Link>
          <Link href="/downlines" className={navLink}>
            Downlines
          </Link>
          {isAdmin && (
            <Link href="/admin" className={navLink}>
              Admin
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
          <label
            htmlFor="sidebar-toggle"
            className="cursor-pointer px-2 text-xl text-zinc-600 hover:text-zinc-900"
            aria-label="Toggle menu"
          >
            &#9776;
          </label>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-300 text-sm font-bold text-slate-700"
            >
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-lg text-zinc-700">{userName}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900">
                Logout
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-5">{children}</main>

        <footer className="bg-zinc-100 px-4 py-6 text-center text-sm text-zinc-600">
          Copyright &copy; {new Date().getFullYear()} <span className="font-bold text-brand">{GROUP_NAME}</span>
        </footer>
      </div>
    </div>
  );
}

// One of the orange stat tiles in the row above the panels.
export function StatTile({ icon, title, value }: { icon: string; title: string; value?: string }) {
  return (
    <div className="flex bg-white shadow-sm">
      <div aria-hidden className="flex w-20 shrink-0 items-center justify-center bg-orange-500 text-3xl text-white">
        {icon}
      </div>
      <div className="px-4 py-4 text-zinc-700">
        <p className="text-sm">{title}</p>
        {value && <p className="text-xl font-bold">{value}</p>}
      </div>
    </div>
  );
}
