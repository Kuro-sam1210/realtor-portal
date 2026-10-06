import { redirect } from "next/navigation";
import { PortalShell, StatTile } from "@/app/_components/PortalShell";
import { getDashboard } from "@/lib/data";
import { money, monthYear, panel, panelHead, panelTitle, td, th } from "@/lib/ui";

const statusPill: Record<string, string> = {
  Selling: "bg-green-600",
  "Sold Out": "bg-zinc-500",
  "Coming Soon": "bg-brand",
};

export default async function Dashboard() {
  const data = await getDashboard();
  if (!data) redirect("/login");

  const { me, properties, memberSince } = data;

  return (
    <PortalShell userName={me.full_name} isAdmin={me.is_admin}>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon="gear" title={`Welcome Back ${me.full_name}`} />
        <StatTile icon="user" title={`${me.full_name} Member since ${monthYear(memberSince)}`} />
        <StatTile icon="cart" title="COMMISSION" value="Instant Payment" />
        <StatTile icon="users" title="VERIFIED" value="Consultant" />
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
            <table className="w-full min-w-[560px]">
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

    </PortalShell>
  );
}
