import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/data";

// Referral links point here: /?ref=CODE
export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  if (ref) redirect(`/register?ref=${encodeURIComponent(ref)}`);

  redirect((await isSignedIn()) ? "/dashboard" : "/login");
}
