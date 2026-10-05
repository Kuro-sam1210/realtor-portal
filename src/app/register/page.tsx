import Link from "next/link";
import { register } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { GROUP_NAME, button, card, input, label } from "@/lib/ui";

const fields: { name: string; title: string; type?: string; required?: boolean }[] = [
  { name: "full_name", title: "Full Name", required: true },
  { name: "email", title: "Email", type: "email", required: true },
  { name: "password", title: "Password", type: "password", required: true },
  { name: "phone", title: "Phone", type: "tel", required: true },
  { name: "city", title: "City" },
  { name: "date_of_birth", title: "Date of birth", type: "date" },
  { name: "state_of_origin", title: "State of Origin" },
  { name: "country", title: "Country" },
  { name: "bank_name", title: "Bank Name" },
  { name: "account_name", title: "Account Name" },
  { name: "account_number", title: "Account Number" },
];

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const { ref = "", error } = await searchParams;

  let premiumStar: string | null = null;
  if (ref) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("ref_owner", { code: ref });
    premiumStar = data ?? null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-center text-xl font-bold text-emerald-800">{GROUP_NAME}</h1>
      <p className="mb-6 text-center text-sm text-zinc-600">Realtor registration</p>

      <form action={register} className={card}>
        {ref && (
          <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {premiumStar ? (
              <>
                Your premium-star: <strong>{premiumStar}</strong>
              </>
            ) : (
              "This referral link is not valid. You can still register without one."
            )}
          </p>
        )}
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <input type="hidden" name="ref" value={premiumStar ? ref : ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className={label}>
                {field.title}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                minLength={field.name === "password" ? 6 : undefined}
                className={input}
              />
            </div>
          ))}
          <div>
            <label htmlFor="gender" className={label}>
              Gender
            </label>
            <select id="gender" name="gender" className={input} defaultValue="">
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" name="terms" required /> I agree to terms
        </label>

        <button type="submit" className={`${button} mt-5 w-full`}>
          Register
        </button>
        <p className="mt-4 text-center text-sm text-zinc-600">
          Already has an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
