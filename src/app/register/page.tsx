import Link from "next/link";
import { register } from "@/app/actions";
import { AuthShell, Field } from "@/app/auth-shell";
import { getRefOwner } from "@/lib/data";
import { button } from "@/lib/ui";

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const { ref = "", error } = await searchParams;
  const premiumStar = ref ? await getRefOwner(ref) : null;

  return (
    <AuthShell>
      <form action={register}>
        {ref && (
          <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">
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

        <Field name="full_name" title="Full Name" placeholder="First name last Name" required />
        <Field name="email" title="Email" type="email" placeholder="Email" required />
        <Field name="password" title="Password" type="password" placeholder="Password" required minLength={6} />
        <Field name="phone" title="Phone" type="tel" placeholder="Mobile Number" required />
        <Field name="city" title="City" placeholder="city" />
        <Field name="date_of_birth" title="Date of birth" type="date" />
        <Field name="state_of_origin" title="State of Origin" placeholder="state" />
        <Field name="gender" title="Gender" placeholder="Gender" />
        <Field name="country" title="Country" placeholder="Country" />
        <Field name="bank_name" title="Bank Name" placeholder="Bank name" />
        <Field name="account_name" title="Account Name" placeholder="Account name" />
        <Field name="account_number" title="Account Number" placeholder="Account number" />

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" name="terms" required /> I agree to terms
        </label>

        <button type="submit" className={`${button} mt-5 w-full py-3`}>
          Register
        </button>
        <p className="my-5 text-center text-sm text-zinc-600">
          Already has an account ?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
