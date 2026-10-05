export const GROUP_NAME = "HYPEWINDS PREMIUM REALTORS HUP";

export const input =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";
export const label = "mb-1 block text-sm font-medium text-zinc-700";
export const button =
  "rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800";
export const card = "rounded-lg border border-zinc-200 bg-white p-5 shadow-sm";
export const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500";
export const td = "px-3 py-2 text-sm text-zinc-800";

export const money = (value: number | string) =>
  Number(value).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const day = (value: string) => new Date(value).toLocaleDateString("en-GB");
