import Link from "next/link";
import { AuthLayout } from "@/app/_components/AuthLayout";
import { requestPasswordReset } from "@/app/actions";
import { authButton, authInput, authLabel } from "@/lib/ui";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthLayout>
      <form action={requestPasswordReset}>
        <p className="mb-6 text-base text-zinc-600">
          Enter the email you registered with and we will send you a reset link.
        </p>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <label htmlFor="email" className={authLabel}>
          Email
        </label>
        <input id="email" name="email" type="email" placeholder="Email" required className={authInput} />

        <button type="submit" className={`${authButton} mt-6`}>
          Send reset link
        </button>

        <p className="mt-8 text-center text-base text-zinc-700">
          <strong>Remembered it ?</strong>{" "}
          <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
