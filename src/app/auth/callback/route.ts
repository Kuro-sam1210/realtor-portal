import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Landing point for the email confirmation link.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code && isSupabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("error", "That confirmation link is invalid or has expired.");
  return NextResponse.redirect(login);
}
