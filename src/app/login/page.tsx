import Link from "next/link";
import { AuthLayout } from "@/app/_components/AuthLayout";
import { login } from "@/app/actions";
import { authButton, authInput, authLabel } from "@/lib/ui";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <AuthLayout>
      <form action={login}>
        {notice && <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-900">{notice}</p>}
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <label htmlFor="email" className={authLabel}>
          Email
        </label>
        <input id="email" name="email" type="email" placeholder="Email" required className={authInput} />

        <label htmlFor="password" className={`${authLabel} mt-6`}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
          className={authInput}
        />

        <button type="submit" className={`${authButton} mt-6`}>
          Login
        </button>

        <p className="mt-4 text-right">
          <Link href="/forgot-password" className="text-base text-zinc-600 hover:text-zinc-900">
            Forgot Password
          </Link>
        </p>

        <p className="mt-8 text-center text-base text-zinc-700">
          <strong>Not a member ?</strong>{" "}
          <Link href="/register" className="text-zinc-600 hover:text-zinc-900">
            Create new account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
