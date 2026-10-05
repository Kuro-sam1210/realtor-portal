import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// False until .env.local carries real keys. Lets the app boot so the UI can be
// worked on before the Supabase project is wired up.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const SUPABASE_MISSING =
  "Supabase is not configured yet. Copy .env.local.example to .env.local, add your project URL and anon key, then restart the dev server.";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    url!,
    anonKey!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only.
          }
        },
      },
    },
  );
}
