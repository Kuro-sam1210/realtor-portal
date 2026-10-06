import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions";
import { GROUP_NAME } from "@/lib/ui";

const navLink = "navlink flex items-center gap-3 px-6 py-3 text-sm text-zinc-300 hover:bg-slate-700 hover:text-white";

// Breakpoints are written as full media queries rather than `md:`, which this
// build does not emit. One checkbox drives both layouts, so unchecked has to be
// the state each wants on load: the drawer closed on a phone, the sidebar open
// on a desktop. The inner rules hang off the aside because `peer-checked:`
// reaches siblings only, never their descendants, hence the `[&_...]` selectors.
const sidebar = [
  // Phone: an off-canvas drawer that slides over the content.
  "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col overflow-y-auto bg-slate-800 transition-transform",
  "peer-checked:translate-x-0",
  // Desktop: back in the flow, and the toggle narrows it to an icon rail.
  "[@media(min-width:768px)]:static [@media(min-width:768px)]:translate-x-0",
  "[@media(min-width:768px)]:shrink-0 [@media(min-width:768px)]:transition-[width]",
  "[@media(min-width:768px)]:peer-checked:w-16",
  "[@media(min-width:768px)]:peer-checked:[&_.wide-only]:hidden",
  "[@media(min-width:768px)]:peer-checked:[&_.navlink]:justify-center",
  "[@media(min-width:768px)]:peer-checked:[&_.navlink]:px-0",
].join(" ");

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
      <input type="checkbox" id="sidebar-toggle" className="peer sr-only" />

      {/* Tapping the dimmed page closes the drawer. */}
      <label
        htmlFor="sidebar-toggle"
        aria-hidden
        className="fixed inset-0 z-30 hidden bg-black/50 peer-checked:block [@media(min-width:768px)]:peer-checked:hidden"
      />

      <aside className={sidebar}>
        <div className="flex h-[61px] items-center overflow-hidden bg-white px-4">
          <span className="truncate text-xl font-bold text-slate-800">{GROUP_NAME}</span>
        </div>

        <div className="wide-only px-4 py-4">
          <p className="mb-3 text-center text-sm font-bold text-white">{userName}</p>
          <div className="flex items-center rounded-md border border-slate-600 bg-slate-700 px-3">
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search"
              className="w-full min-w-0 bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-400"
            />
            <Icon name="search" className="h-4 w-4 shrink-0 text-zinc-300" />
          </div>
        </div>

        <nav className="flex flex-col py-2">
          <Link href="/" className={navLink}>
            <Icon name="search" className="h-4 w-4 shrink-0" />
            <span className="wide-only">Main website</span>
          </Link>
          <Link href="/dashboard" className={navLink}>
            <Icon name="search" className="h-4 w-4 shrink-0" />
            <span className="wide-only">Dashboard</span>
          </Link>
          <Link href="/premium-lines" className={navLink}>
            <Icon name="users" className="h-4 w-4 shrink-0" />
            <span className="wide-only">Premium-Lines</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className={navLink}>
              <Icon name="gear" className="h-4 w-4 shrink-0" />
              <span className="wide-only">Admin</span>
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-3 [@media(min-width:640px)]:px-5">
          <label
            htmlFor="sidebar-toggle"
            className="shrink-0 cursor-pointer px-2 text-zinc-600 hover:text-zinc-900"
            aria-label="Toggle menu"
          >
            <Icon name="menu" className="h-6 w-6" />
          </label>
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-sm font-bold text-slate-700"
            >
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate text-lg text-zinc-700">{userName}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900">
                Logout
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-3 [@media(min-width:640px)]:p-5">{children}</main>

        <footer className="bg-zinc-100 px-4 py-6 text-center text-sm text-zinc-600">
          Copyright &copy; {new Date().getFullYear()} <span className="font-bold text-brand">{GROUP_NAME}</span>
        </footer>
      </div>
    </div>
  );
}

// One of the orange stat tiles in the row above the panels.
export function StatTile({ icon, title, value }: { icon: IconName; title: string; value?: string }) {
  return (
    <div className="flex bg-white shadow-sm">
      <div
        aria-hidden
        className="flex w-20 shrink-0 items-center justify-center bg-orange-500 text-white [@media(min-width:640px)]:w-24"
      >
        <Icon name={icon} className="h-10 w-10 [@media(min-width:640px)]:h-12 [@media(min-width:640px)]:w-12" />
      </div>
      <div className="min-w-0 px-3 py-3 text-zinc-700 [@media(min-width:640px)]:px-4 [@media(min-width:640px)]:py-4">
        <p className="text-sm">{title}</p>
        {value && <p className="text-lg font-bold [@media(min-width:640px)]:text-xl">{value}</p>}
      </div>
    </div>
  );
}

export type IconName = "gear" | "user" | "cart" | "users" | "search" | "menu";

// Stroked outlines so one set of paths works at sidebar size and tile size.
const paths: Record<IconName, ReactNode> = {
  gear: (
    <>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </>
  ),
  cart: (
    <>
      <path d="M2 4h2.5l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.55L20.5 7H6" />
      <circle cx="9.5" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20v-.8A5.2 5.2 0 0 1 7.2 14h3.6a5.2 5.2 0 0 1 5.2 5.2v.8" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.8M18.5 14A4 4 0 0 1 22 18v2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
