import Link from "next/link";
import { redirect } from "next/navigation";
import { recordSale, setCommissionRate } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { GROUP_NAME, button, card, day, input, label, money, td, th } from "@/lib/ui";

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  ref_code: string;
  premium_star_id: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
};
type Sale = { id: number; seller_id: string; property_type: string; description: string; amount: number; sold_on: string };
type Commission = { sale_id: number; beneficiary_id: string; amount: number };

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/dashboard");

  const [membersResult, salesResult, commissionsResult, settings] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, ref_code, premium_star_id, bank_name, account_name, account_number")
      .order("full_name"),
    supabase
      .from("sales")
      .select("id, seller_id, property_type, description, amount, sold_on")
      .order("created_at", { ascending: false }),
    supabase.from("commissions").select("sale_id, beneficiary_id, amount"),
    supabase.from("settings").select("commission_percent").single(),
  ]);

  const members = (membersResult.data ?? []) as Member[];
  const sales = (salesResult.data ?? []) as Sale[];
  const name = new Map(members.map((m) => [m.id, m.full_name]));
  const commissionBySale = new Map(((commissionsResult.data ?? []) as Commission[]).map((c) => [c.sale_id, c]));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-emerald-800">{GROUP_NAME} · Admin</h1>
        <Link href="/dashboard" className="text-sm font-semibold text-emerald-700">
          Dashboard
        </Link>
      </header>

      {notice && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p>}
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
            defaultValue={settings.data?.commission_percent}
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
            <table className="w-full">
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
            <table className="w-full">
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
      </div>
    </main>
  );
}
