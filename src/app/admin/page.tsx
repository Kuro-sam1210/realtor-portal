import { redirect } from "next/navigation";
import { PortalShell } from "@/app/_components/PortalShell";
import { addProperty, recordSale, setCommissionRate } from "@/app/actions";
import { getAdmin, getDashboard } from "@/lib/data";
import { button, card, day, input, label, money, td, th } from "@/lib/ui";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const viewer = await getDashboard();
  if (!viewer) redirect("/login");

  const data = await getAdmin();
  if (!data) redirect("/dashboard");

  const { members, sales, rate, properties } = data;
  const name = new Map(members.map((m) => [m.id, m.full_name]));
  const commissionBySale = new Map(data.commissions.map((c) => [c.sale_id, c]));

  return (
    <PortalShell userName={viewer.me.full_name} isAdmin>
      <h1 className="mb-4 text-3xl text-zinc-700">Admin</h1>

      {notice && <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">{notice}</p>}
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <div className="grid gap-5 md:grid-cols-3">
        <form action={recordSale} className={`${card} md:col-span-2`}>
          <h2 className="mb-3 font-semibold">Record a sale</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="seller_id" className={label}>
                Realtor who sold
              </label>
              <select id="seller_id" name="seller_id" required className={input} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.ref_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="property_type" className={label}>
                Property
              </label>
              <select id="property_type" name="property_type" className={input}>
                <option value="land">Land</option>
                <option value="house">House</option>
              </select>
            </div>
            <div>
              <label htmlFor="amount" className={label}>
                Sale amount
              </label>
              <input id="amount" name="amount" type="number" min="0.01" step="0.01" required className={input} />
            </div>
            <div>
              <label htmlFor="sold_on" className={label}>
                Date sold
              </label>
              <input id="sold_on" name="sold_on" type="date" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className={label}>
                Description
              </label>
              <input id="description" name="description" required className={input} />
            </div>
          </div>
          <button type="submit" className={`${button} mt-4`}>
            Record sale
          </button>
        </form>

        <form action={setCommissionRate} className={card}>
          <h2 className="mb-3 font-semibold">Commission rate</h2>
          <label htmlFor="commission_percent" className={label}>
            Premium-star earns (% of sale)
          </label>
          <input
            id="commission_percent"
            name="commission_percent"
            type="number"
            min="0"
            max="100"
            step="0.01"
            required
            defaultValue={rate}
            className={input}
          />
          <p className="mt-2 text-xs text-zinc-500">Applies to sales recorded from now on.</p>
          <button type="submit" className={`${button} mt-4`}>
            Save
          </button>
        </form>

        <section className={`${card} md:col-span-3`}>
          <h2 className="mb-2 font-semibold">Sales ({sales.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>Realtor</th>
                  <th className={th}>Property</th>
                  <th className={th}>Amount</th>
                  <th className={th}>Premium-star</th>
                  <th className={th}>Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sales.map((sale) => {
                  const commission = commissionBySale.get(sale.id);
                  return (
                    <tr key={sale.id}>
                      <td className={td}>{day(sale.sold_on)}</td>
                      <td className={td}>{name.get(sale.seller_id)}</td>
                      <td className={td}>
                        {sale.property_type}: {sale.description}
                      </td>
                      <td className={td}>{money(sale.amount)}</td>
                      <td className={td}>{commission ? name.get(commission.beneficiary_id) : "-"}</td>
                      <td className={td}>{commission ? money(commission.amount) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${card} md:col-span-3`}>
          <h2 className="mb-2 font-semibold">Members ({members.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Code</th>
                  <th className={th}>Premium-star</th>
                  <th className={th}>Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className={td}>{m.full_name}</td>
                    <td className={td}>{m.email}</td>
                    <td className={td}>{m.phone ?? "-"}</td>
                    <td className={td}>{m.ref_code}</td>
                    <td className={td}>{m.premium_star_id ? name.get(m.premium_star_id) : "-"}</td>
                    <td className={td}>
                      {m.bank_name ? `${m.bank_name} · ${m.account_name ?? ""} · ${m.account_number ?? ""}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form action={addProperty} className={`${card} md:col-span-3`}>
          <h2 className="mb-3 font-semibold">List a property</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="name" className={label}>
                Property name
              </label>
              <input id="name" name="name" required className={input} />
            </div>
            <div>
              <label htmlFor="status" className={label}>
                Status
              </label>
              <select id="status" name="status" className={input}>
                <option>Selling</option>
                <option>Coming Soon</option>
                <option>Sold Out</option>
              </select>
            </div>
            <div>
              <label htmlFor="price" className={label}>
                Price
              </label>
              <input id="price" name="price" type="number" min="0.01" step="0.01" required className={input} />
            </div>
            <div>
              <label htmlFor="location" className={label}>
                Location
              </label>
              <input id="location" name="location" required className={input} />
            </div>
          </div>
          <button type="submit" className={`${button} mt-4`}>
            Add property
          </button>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className={th}>Property</th>
                  <th className={th}>Status</th>
                  <th className={th}>Price</th>
                  <th className={th}>Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>{p.name}</td>
                    <td className={td}>{p.status}</td>
                    <td className={td}>{money(p.price)}</td>
                    <td className={td}>{p.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </div>
    </PortalShell>
  );
}
