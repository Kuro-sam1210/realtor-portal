import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell, StatTile } from "@/app/_components/PortalShell";
import { SUPABASE_MISSING, createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { day, input, money, monthYear, panel, panelHead, panelTitle, td, th } from "@/lib/ui";

type Line = { id: string; full_name: string; email: string; phone: string | null; city: string | null; created_at: string };
type Commission = { id: number; seller_id: string; rate_percent: number; amount: number; created_at: string };
type Property = { id: number; name: string; status: string; price: number; location: string };

const statusPill: Record<string, string> = {
  Selling: "bg-green-600",
  "Sold Out": "bg-zinc-500",
  "Coming Soon": "bg-cyan-600",
};

export default async function Dashboard() {
  if (!isSupabaseConfigured) redirect("/login?error=" + encodeURIComponent(SUPABASE_MISSING));

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [profile, star, lines, commissions, notifications, properties] = await Promise.all([
    supabase.from("profiles").select("full_name, ref_code, is_admin, created_at").eq("id", auth.user.id).single(),
    supabase.rpc("my_premium_star").maybeSingle<{ full_name: string; email: string; phone: string | null }>(),
    supabase.rpc("my_premium_lines"),
    // Filtered explicitly because admins can read every commission.
    supabase
      .from("commissions")
      .select("id, seller_id, rate_percent, amount, created_at")
      .eq("beneficiary_id", auth.user.id)
      .order("created_at", { ascending: false }),
    supabase.from("notifications").select("id, body, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("properties").select("id, name, status, price, location").order("created_at", { ascending: false }),
  ]);

  const me = profile.data;
  if (!me) redirect("/login?error=" + encodeURIComponent("Your profile could not be loaded."));

  const premiumLines = (lines.data ?? []) as Line[];
  const earned = (commissions.data ?? []) as Commission[];
  const estates = (properties.data ?? []) as Property[];
  const lineName = new Map(premiumLines.map((line) => [line.id, line.full_name]));
  const total = earned.reduce((sum, c) => sum + Number(c.amount), 0);

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const refLink = `${protocol}://${host}/?ref=${me.ref_code}`;

  return (
    <PortalShell userName={me.full_name} isAdmin={me.is_admin}>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon="&#9881;" title={`Welcome Back ${me.full_name}`} />
        <StatTile icon="&#128100;" title={`${me.full_name} Member since ${monthYear(me.created_at)}`} />
        <StatTile icon="&#128722;" title="COMMISSION" value="Instant Payment" />
        <StatTile icon="&#128101;" title="VERIFIED" value="Consultant" />
      </div>

      <section className={`${panel} mb-5`}>
        <div className={panelHead}>
          <h2 className={panelTitle}>Our Properties And Prices</h2>
          <span className="text-sm text-zinc-500">{me.full_name}</span>
        </div>
        {estates.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-zinc-600">No properties have been listed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-zinc-200">
                  <th className={`${th} text-base normal-case tracking-normal text-zinc-700`}>Properties</th>
                  <th className={`${th} text-base normal-case tracking-normal text-zinc-700`}>Status</th>
                  <th className={`${th} text-base normal-case tracking-normal text-zinc-700`}>Price</th>
                  <th className={`${th} text-base normal-case tracking-normal text-zinc-700`}>Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {estates.map((estate) => (
                  <tr key={estate.id}>
                    <td className={`${td} py-4`}>{estate.name}</td>
                    <td className={`${td} py-4`}>
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold text-white ${statusPill[estate.status] ?? "bg-zinc-500"}`}
                      >
                        {estate.status}
                      </span>
                    </td>
                    <td className={`${td} py-4`}>{money(estate.price)}</td>
                    <td className={`${td} py-4`}>{estate.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Your referral link</h2>
          </div>
          <div className="px-5 pb-5">
            <input readOnly value={refLink} className={input} />
            <p className="mt-2 text-sm text-zinc-600">
              Anyone who registers with this link becomes your premium-line. Your code: <strong>{me.ref_code}</strong>
            </p>
          </div>
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Your premium-star</h2>
          </div>
          <div className="px-5 pb-5">
            {star.data ? (
              <p className="text-sm text-zinc-800">
                <strong>{star.data.full_name}</strong>
                <br />
                {star.data.email}
                {star.data.phone && <> &middot; {star.data.phone}</>}
              </p>
            ) : (
              <p className="text-sm text-zinc-600">You joined without a referral link, so you have no premium-star.</p>
            )}
          </div>
        </section>

        <section id="premium-lines" className={`${panel} lg:col-span-2`}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Your premium-lines ({premiumLines.length})</h2>
          </div>
          {premiumLines.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-zinc-600">Nobody has joined with your link yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-zinc-200">
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

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Your commissions</h2>
          </div>
          <div className="px-5 pb-5">
            <p className="mb-3 text-2xl font-bold text-orange-600">{money(total)}</p>
            {earned.length === 0 ? (
              <p className="text-sm text-zinc-600">No commission yet. You earn when a premium-line sells land or a house.</p>
            ) : (
              <ul className="divide-y divide-zinc-100 text-sm">
                {earned.map((c) => (
                  <li key={c.id} className="flex justify-between gap-3 py-2">
                    <span>
                      {lineName.get(c.seller_id)} &middot; {c.rate_percent}% &middot; {day(c.created_at)}
                    </span>
                    <strong>{money(c.amount)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Notifications</h2>
          </div>
          <div className="px-5 pb-5">
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
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
