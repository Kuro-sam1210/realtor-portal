import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions";
import { getDashboard } from "@/lib/data";
import { GROUP_NAME, card, day, input, money, td, th } from "@/lib/ui";

export default async function Dashboard() {
  const data = await getDashboard();
  if (!data) redirect("/login");

  const { me, star, lines: premiumLines, earnings: earned, notifications } = data;
  const lineName = new Map(premiumLines.map((line) => [line.id, line.full_name]));
  const total = earned.reduce((sum, c) => sum + Number(c.amount), 0);

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const refLink = `${protocol}://${host}/?ref=${me.ref_code}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-brand-dark">{GROUP_NAME}</h1>
          <p className="text-sm text-zinc-600">Welcome, {me.full_name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {me.is_admin && (
            <Link href="/admin" className="font-semibold text-brand">
              Admin
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className="text-zinc-600 hover:text-zinc-900">
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={card}>
          <h2 className="mb-2 font-semibold">Your referral link</h2>
          <input readOnly value={refLink} className={input} />
          <p className="mt-2 text-sm text-zinc-600">
            Anyone who registers with this link becomes your premium-line. Your code: <strong>{me.ref_code}</strong>
          </p>
        </section>

        <section className={card}>
          <h2 className="mb-2 font-semibold">Your premium-star</h2>
          {star ? (
            <p className="text-sm text-zinc-800">
              <strong>{star.full_name}</strong>
              <br />
              {star.email}
              {star.phone && <> · {star.phone}</>}
            </p>
          ) : (
            <p className="text-sm text-zinc-600">You joined without a referral link, so you have no premium-star.</p>
          )}
        </section>

        <section className={`${card} md:col-span-2`}>
          <h2 className="mb-2 font-semibold">Your premium-lines ({premiumLines.length})</h2>
          {premiumLines.length === 0 ? (
            <p className="text-sm text-zinc-600">Nobody has joined with your link yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Phone</th>
                    <th className={th}>City</th>
                    <th className={th}>Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {premiumLines.map((line) => (
                    <tr key={line.id}>
                      <td className={td}>{line.full_name}</td>
                      <td className={td}>{line.email}</td>
                      <td className={td}>{line.phone ?? "-"}</td>
                      <td className={td}>{line.city ?? "-"}</td>
                      <td className={td}>{day(line.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-2 font-semibold">Your commissions</h2>
          <p className="mb-3 text-2xl font-bold text-brand-dark">{money(total)}</p>
          {earned.length === 0 ? (
            <p className="text-sm text-zinc-600">No commission yet. You earn when a premium-line sells land or a house.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {earned.map((c) => (
                <li key={c.id} className="flex justify-between gap-3 py-2">
                  <span>
                    {lineName.get(c.seller_id)} · {c.rate_percent}% · {day(c.created_at)}
                  </span>
                  <strong>{money(c.amount)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-2 font-semibold">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-zinc-600">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {notifications.map((n) => (
                <li key={n.id} className="py-2">
                  {n.body}
                  <span className="block text-xs text-zinc-500">{day(n.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
