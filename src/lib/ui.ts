export const GROUP_NAME = "HYPEWINDS PREMIUM REALTORS HUP";

export const input =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500";
export const label = "mb-1 block text-sm font-medium text-zinc-700";
export const button =
  "rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600";
export const card = "rounded-lg border border-zinc-200 bg-white p-5 shadow-sm";
export const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500";
export const td = "px-3 py-2 text-sm text-zinc-800";

// Roomier field and CTA used on the split-screen auth pages.
export const authInput =
  "w-full rounded-md border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
export const authLabel = "mb-2 block text-base text-zinc-700";
export const authButton =
  "w-full rounded-md bg-sky-500 px-4 py-3 text-base font-bold text-white hover:bg-sky-600";

// Panel with the cyan rule across its top, used for dashboard sections.
export const panel = "border-t-2 border-cyan-400 bg-white shadow-sm";
export const panelHead = "flex items-center justify-between gap-3 px-5 py-4";
export const panelTitle = "text-lg text-zinc-700";
export const link = "font-semibold text-orange-600 hover:text-orange-700";

export const money = (value: number | string) =>
  Number(value).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const day = (value: string) => new Date(value).toLocaleDateString("en-GB");

// "Oct. 2026", as shown on the member-since tile.
export const monthYear = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { month: "short", year: "numeric" }).replace(/^(\w+)/, "$1.");
