import Link from "next/link";
import { login } from "@/app/actions";
import { AuthShell, Field } from "@/app/auth-shell";
import { button } from "@/lib/ui";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <AuthShell>
      <form action={login}>
        {notice && <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">{notice}</p>}
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <Field name="email" title="Email" type="email" placeholder="Email" required />
        <Field name="password" title="Password" type="password" placeholder="Password" required />

        <button type="submit" className={`${button} mt-2 w-full py-3`}>
          Login
        </button>
        <p className="my-5 text-center text-sm text-zinc-600">
          No account yet ?{" "}
          <Link href="/register" className="font-semibold text-brand">
            Register
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
