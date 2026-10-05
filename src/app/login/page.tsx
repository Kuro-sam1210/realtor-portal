import Link from "next/link";
import { login } from "@/app/actions";
import { GROUP_NAME, button, card, input, label } from "@/lib/ui";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-xl font-bold text-emerald-800">{GROUP_NAME}</h1>
      <p className="mb-6 text-center text-sm text-zinc-600">Realtor login</p>

      <form action={login} className={card}>
        {notice && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p>}
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <label htmlFor="email" className={label}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={input} />

        <label htmlFor="password" className={`${label} mt-4`}>
          Password
        </label>
        <input id="password" name="password" type="password" required className={input} />

        <button type="submit" className={`${button} mt-5 w-full`}>
          Login
        </button>
        <p className="mt-4 text-center text-sm text-zinc-600">
          No account yet?{" "}
          <Link href="/register" className="font-semibold text-emerald-700">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
