"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE, DEMO_NOTICE, isDemo } from "@/lib/demo";
import { isMailConfigured, sendWelcomeEmail } from "@/lib/email";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

// Members never choose a password; the portal generates one and mails it.
// Avoids look-alike characters so it survives being retyped from an email.
function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function fail(path: string, message: string, extra = ""): never {
  redirect(`${path}?error=${encodeURIComponent(message)}${extra}`);
}

export async function register(form: FormData) {
  const ref = text(form, "ref");
  const refQuery = ref ? `&ref=${encodeURIComponent(ref)}` : "";
  const email = text(form, "email");
  const fullName = text(form, "full_name");
  const password = generatePassword();

  if (!fullName || !email) {
    fail("/register", "Full name and email are required.", refQuery);
  }
  if (form.get("terms") !== "on") {
    fail("/register", "You must agree to the terms.", refQuery);
  }
  // The password only ever reaches the member by email, so without a mail
  // provider the account would be created and immediately unreachable.
  if (!isDemo && !isMailConfigured) {
    fail("/register", "Registration is unavailable right now. Please contact the group admin.", refQuery);
  }

  if (isDemo) {
    (await cookies()).set(DEMO_COOKIE, fullName, { httpOnly: true, sameSite: "lax" });
    redirect("/dashboard");
  }

  const supabase = await createClient();

  if (ref) {
    const { data: owner } = await supabase.rpc("ref_owner", { code: ref });
    if (!owner) fail("/register", "That referral link is not valid.");
  }

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        ref,
        full_name: fullName,
        phone: text(form, "phone"),
        city: text(form, "city"),
        date_of_birth: text(form, "date_of_birth"),
        state_of_origin: text(form, "state_of_origin"),
        gender: text(form, "gender"),
        country: text(form, "country"),
        bank_name: text(form, "bank_name"),
        account_name: text(form, "account_name"),
        account_number: text(form, "account_number"),
      },
    },
  });

  if (error) fail("/register", error.message, refQuery);

  // The trigger has created the profile and its referral code by now.
  const { data: cid } = data.user
    ? await supabase.rpc("ref_code_for_user", { uid: data.user.id })
    : { data: null };

  // The generated password exists nowhere else, so a failed send leaves the
  // member locked out. Say so rather than dropping them at a login they
  // cannot pass.
  try {
    await sendWelcomeEmail({ fullName, cid: cid ?? "", email, password, refLink: `${origin}/?ref=${cid}` });
  } catch (mailError) {
    console.error(mailError);
    fail("/login", "Your account was created but the welcome email failed. Please contact the group admin.");
  }

  redirect(
    `/login?notice=${encodeURIComponent("Check your email for your CID and password, then log in.")}`,
  );
}

export async function login(form: FormData) {
  if (isDemo) {
    (await cookies()).set(DEMO_COOKIE, "Demo Realtor", { httpOnly: true, sameSite: "lax" });
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  if (error) fail("/login", error.message);
  redirect("/dashboard");
}

export async function logout() {
  if (isDemo) {
    (await cookies()).delete(DEMO_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Admin-only: enforced by row level security, not by this function.
export async function recordSale(form: FormData) {
  if (isDemo) redirect("/admin?notice=" + encodeURIComponent(DEMO_NOTICE));

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const amount = Number(text(form, "amount"));
  const sellerId = text(form, "seller_id");
  const description = text(form, "description");
  if (!sellerId || !description || !Number.isFinite(amount) || amount <= 0) {
    fail("/admin", "Seller, description and a positive amount are required.");
  }

  const { error } = await supabase.from("sales").insert({
    seller_id: sellerId,
    property_type: text(form, "property_type"),
    description,
    amount,
    sold_on: text(form, "sold_on") || undefined,
    recorded_by: auth.user.id,
  });
  if (error) fail("/admin", error.message);

  revalidatePath("/admin");
  redirect("/admin?notice=" + encodeURIComponent("Sale recorded."));
}

// Admin-only: enforced by row level security, not by this function.
export async function addProperty(form: FormData) {
  if (isDemo) redirect("/admin?notice=" + encodeURIComponent(DEMO_NOTICE));

  const name = text(form, "name");
  const location = text(form, "location");
  const price = Number(text(form, "price"));
  if (!name || !location || !Number.isFinite(price) || price <= 0) {
    fail("/admin", "Property name, location and a positive price are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert({
    name,
    location,
    price,
    status: text(form, "status") || "Selling",
  });
  if (error) fail("/admin", error.message);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?notice=" + encodeURIComponent("Property listed."));
}

export async function setCommissionRate(form: FormData) {
  if (isDemo) redirect("/admin?notice=" + encodeURIComponent(DEMO_NOTICE));

  const rate = Number(text(form, "commission_percent"));
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    fail("/admin", "Commission rate must be between 0 and 100.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .update({ commission_percent: rate })
    .eq("id", true)
    .select();
  if (error) fail("/admin", error.message);
  if (!data?.length) fail("/admin", "Only an admin can change the commission rate.");

  revalidatePath("/admin");
  redirect("/admin?notice=" + encodeURIComponent("Commission rate updated."));
}
