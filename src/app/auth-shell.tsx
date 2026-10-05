import { GROUP_NAME, label } from "@/lib/ui";

// Shared frame for the login and registration pages: dark full-page backdrop, narrow white card.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded bg-white px-10 pb-4 pt-10 shadow-xl">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded bg-brand text-2xl font-bold text-white">
          HPR
        </div>
        <h1 className="mb-6 text-base font-bold text-zinc-800">{GROUP_NAME}</h1>
        {children}
      </div>
    </main>
  );
}

export function Field({
  name,
  title,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  name: string;
  title: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className={label}>
        {title}
      </label>
      <div className="flex h-11">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full min-w-0 rounded-l-md border border-r-0 border-[#e5e5e5] px-3 text-sm text-zinc-900 outline-none"
        />
        <span className="flex items-center rounded-r-md border border-l-0 border-[#e5e5e5] px-3 text-[#b6b6b6]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
