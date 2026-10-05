import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Referral links point here: /?ref=CODE
export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  if (ref) redirect(`/register?ref=${encodeURIComponent(ref)}`);

  if (!isSupabaseConfigured) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  redirect(data.user ? "/dashboard" : "/login");
}
