import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  DEMO_COOKIE,
  DEMO_ME,
  demoCommissions,
  demoMembers,
  demoNotifications,
  demoRate,
  demoSales,
  demoStar,
  isDemo,
} from "@/lib/demo";

export type Line = { id: string; full_name: string; email: string; phone: string | null; city: string | null; created_at: string };
export type Earning = { id: number; seller_id: string; rate_percent: number; amount: number; created_at: string };
export type Notice = { id: number; body: string; created_at: string };
export type Member = {
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
export type Sale = { id: number; seller_id: string; property_type: string; description: string; amount: number; sold_on: string };
export type SaleCommission = { sale_id: number; beneficiary_id: string; amount: number };

async function demoName() {
  return (await cookies()).get(DEMO_COOKIE)?.value ?? null;
}

// Name behind a referral code, or null when the code is unknown.
export async function getRefOwner(code: string): Promise<string | null> {
  if (isDemo) return demoStar.full_name;
  const supabase = await createClient();
  const { data } = await supabase.rpc("ref_owner", { code });
  return data ?? null;
}

export async function isSignedIn() {
  if (isDemo) return (await demoName()) !== null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user !== null;
}

// Null when nobody is signed in.
export async function getDashboard() {
  if (isDemo) {
    const name = await demoName();
    if (!name) return null;
    return {
      me: { full_name: name, ref_code: "204816", is_admin: true },
      star: demoStar as { full_name: string; email: string; phone: string | null } | null,
      lines: demoMembers(name).filter((m) => m.premium_star_id === DEMO_ME) as Line[],
      earnings: demoCommissions.filter((c) => c.beneficiary_id === DEMO_ME) as Earning[],
      notifications: demoNotifications as Notice[],
    };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [profile, star, lines, earnings, notifications] = await Promise.all([
    supabase.from("profiles").select("full_name, ref_code, is_admin").eq("id", auth.user.id).single(),
    supabase.rpc("my_premium_star").maybeSingle<{ full_name: string; email: string; phone: string | null }>(),
    supabase.rpc("my_premium_lines"),
    // Filtered explicitly because admins can read every commission.
    supabase
      .from("commissions")
      .select("id, seller_id, rate_percent, amount, created_at")
      .eq("beneficiary_id", auth.user.id)
      .order("created_at", { ascending: false }),
    supabase.from("notifications").select("id, body, created_at").order("created_at", { ascending: false }).limit(20),
  ]);
  if (!profile.data) return null;

  return {
    me: profile.data as { full_name: string; ref_code: string; is_admin: boolean },
    star: star.data,
    lines: (lines.data ?? []) as Line[],
    earnings: (earnings.data ?? []) as Earning[],
    notifications: (notifications.data ?? []) as Notice[],
  };
}

// Null when the viewer is not an admin.
export async function getAdmin() {
  if (isDemo) {
    const name = await demoName();
    if (!name) return null;
    return {
      members: demoMembers(name) as Member[],
      sales: demoSales as Sale[],
      commissions: demoCommissions as SaleCommission[],
      rate: demoRate,
    };
  }

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;

  const [members, sales, commissions, settings] = await Promise.all([
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

  return {
    members: (members.data ?? []) as Member[],
    sales: (sales.data ?? []) as Sale[],
    commissions: (commissions.data ?? []) as SaleCommission[],
    rate: Number(settings.data?.commission_percent ?? 0),
  };
}
