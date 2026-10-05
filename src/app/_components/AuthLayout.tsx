import type { ReactNode } from "react";

// Split screen: form on the left, estate photo on the right.
// Drop a photo at public/login-hero.jpg to replace the gradient fallback.
export function AuthLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex flex-1">
      <div className={`flex w-full items-center justify-center px-6 py-12 ${wide ? "lg:w-[70%]" : "lg:w-[55%]"}`}>
        <div className={`w-full ${wide ? "max-w-xl" : "max-w-sm"}`}>
          <Wordmark />
          {children}
        </div>
      </div>

      <div
        aria-hidden
        className="hidden flex-1 bg-slate-700 bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(15,23,42,0.35), rgba(8,47,73,0.55)), url('/login-hero.jpg')",
        }}
      />
    </div>
  );
}

function Wordmark() {
  return (
    <div className="mb-12">
      <p className="text-4xl font-extrabold leading-none tracking-tight text-sky-400">HYPEWINDS</p>
      <p className="mt-1 text-xs font-semibold tracking-[0.35em] text-sky-400">PREMIUM REALTORS HUP</p>
    </div>
  );
}
