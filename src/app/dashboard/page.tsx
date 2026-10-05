import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { GROUP_NAME, card, day, input, money, td, th } from "@/lib/ui";

type Line = { id: string; full_name: string; email: string; phone: string | null; city: string | null; created_at: string };
type Commission = { id: number; seller_id: string; rate_percent: number; amount: number; created_at: string };

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [profile, star, lines, commissions, notifications] = await Promise.all([
    supabase.from("profiles").select("full_name, ref_code, is_admin").eq("id", auth.user.id).single(),
    supabase.rpc("my_premium_star").maybeSingle<{ full_name: string; email: string; phone: string | null }>(),
    supabase.rpc("my_premium_lines"),
    // Filtered explicitly because admins can read every commission.
    supabase
      .from("commissions")
      .select("id, seller_id, rate_percent, amount, created_at")
      .eq("beneficiary_id", auth.user.id)
      .order("created_at", { ascending: false }),
    supabase.from("notifications").select("id, body, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const me = profile.data;
  if (!me) redirect("/login?error=" + encodeURIComponent("Your profile could not be loaded."));

  const premiumLines = (lines.data ?? []) as Line[];
  const earned = (commissions.data ?? []) as Commission[];
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
          <h1 className="text-lg font-bold text-emerald-800">{GROUP_NAME}</h1>
          <p className="text-sm text-zinc-600">Welcome, {me.full_name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {me.is_admin && (
            <Link href="/admin" className="font-semibold text-emerald-700">
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
          {star.data ? (
            <p className="text-sm text-zinc-800">
              <strong>{star.data.full_name}</strong>
              <br />
              {star.data.email}
              {star.data.phone && <> · {star.data.phone}</>}
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
          <p className="mb-3 text-2xl font-bold text-emerald-800">{money(total)}</p>
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
          {(notifications.data ?? []).length === 0 ? (
            <p className="text-sm text-zinc-600">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {(notifications.data ?? []).map((n) => (
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
