import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell, StatTile } from "@/app/_components/PortalShell";
import { getDashboard } from "@/lib/data";
import { day, input, money, monthYear, panel, panelHead, panelTitle, td, th } from "@/lib/ui";

const statusPill: Record<string, string> = {
  Selling: "bg-green-600",
  "Sold Out": "bg-zinc-500",
  "Coming Soon": "bg-brand",
};

export default async function Dashboard() {
  const data = await getDashboard();
  if (!data) redirect("/login");

  const { me, star, lines: premiumLines, earnings: earned, notifications, properties, memberSince } = data;
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
        <StatTile icon="&#128100;" title={`${me.full_name} Member since ${monthYear(memberSince)}`} />
        <StatTile icon="&#128722;" title="COMMISSION" value="Instant Payment" />
        <StatTile icon="&#128101;" title="VERIFIED" value="Consultant" />
      </div>

      <section className={`${panel} mb-5`}>
        <div className={panelHead}>
          <h2 className={panelTitle}>Our Properties And Prices</h2>
          <span className="text-sm text-zinc-500">{me.full_name}</span>
        </div>
        {properties.length === 0 ? (
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
                {properties.map((estate) => (
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
            {star ? (
              <p className="text-sm text-zinc-800">
                <strong>{star.full_name}</strong>
                <br />
                {star.email}
                {star.phone && <> &middot; {star.phone}</>}
              </p>
            ) : (
              <p className="text-sm text-zinc-600">You joined without a referral link, so you have no premium-star.</p>
            )}
          </div>
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Your commissions</h2>
          </div>
          <div className="px-5 pb-5">
            <p className="mb-3 text-2xl font-bold text-brand-dark">{money(total)}</p>
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
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
