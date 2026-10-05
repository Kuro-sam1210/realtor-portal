// Demo mode: with no Supabase project configured the portal runs on the sample data below
// and saves nothing.
export const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;
export const DEMO_COOKIE = "demo_member";
export const DEMO_NOTICE = "Demo mode: this is sample data, so nothing was saved.";

const ME = "u1";
const STAR = "u0";

export const demoStar = { full_name: "Adaeze Okonkwo", email: "adaeze@example.com", phone: "0803 000 0001" };

export const demoMembers = (myName: string) => [
  { id: STAR, ...demoStar, ref_code: "571712", premium_star_id: null, bank_name: "GTBank", account_name: "Adaeze Okonkwo", account_number: "0123456789", city: "Lagos", created_at: "2026-08-03T09:00:00Z" },
  { id: ME, full_name: myName, email: "you@example.com", phone: "0803 000 0002", ref_code: "204816", premium_star_id: STAR, bank_name: "Access Bank", account_name: myName, account_number: "0234567891", city: "Abuja", created_at: "2026-08-20T09:00:00Z" },
  { id: "u2", full_name: "Tunde Bakare", email: "tunde@example.com", phone: "0803 000 0003", ref_code: "318245", premium_star_id: ME, bank_name: "Zenith Bank", account_name: "Tunde Bakare", account_number: "0345678912", city: "Ibadan", created_at: "2026-09-02T09:00:00Z" },
  { id: "u3", full_name: "Ngozi Eze", email: "ngozi@example.com", phone: "0803 000 0004", ref_code: "460973", premium_star_id: ME, bank_name: "UBA", account_name: "Ngozi Eze", account_number: "0456789123", city: "Enugu", created_at: "2026-09-14T09:00:00Z" },
  { id: "u4", full_name: "Ibrahim Musa", email: "ibrahim@example.com", phone: "0803 000 0005", ref_code: "752108", premium_star_id: ME, bank_name: "First Bank", account_name: "Ibrahim Musa", account_number: "0567891234", city: "Kano", created_at: "2026-09-29T09:00:00Z" },
];

export const demoRate = 5;

export const demoSales = [
  { id: 3, seller_id: "u3", property_type: "house", description: "4-bedroom duplex, Independence Layout", amount: 48000000, sold_on: "2026-10-01" },
  { id: 2, seller_id: "u2", property_type: "land", description: "2 plots, Akobo Estate", amount: 12500000, sold_on: "2026-09-18" },
  { id: 1, seller_id: ME, property_type: "land", description: "1 plot, Lugbe", amount: 8000000, sold_on: "2026-09-05" },
];

export const demoCommissions = [
  { id: 3, sale_id: 3, beneficiary_id: ME, seller_id: "u3", rate_percent: 5, amount: 2400000, created_at: "2026-10-01T12:00:00Z" },
  { id: 2, sale_id: 2, beneficiary_id: ME, seller_id: "u2", rate_percent: 5, amount: 625000, created_at: "2026-09-18T12:00:00Z" },
  { id: 1, sale_id: 1, beneficiary_id: STAR, seller_id: ME, rate_percent: 5, amount: 400000, created_at: "2026-09-05T12:00:00Z" },
];

export const demoNotifications = [
  { id: 5, body: "Ngozi Eze sold a house for 48,000,000.00. Your commission: 2,400,000.00 (5%).", created_at: "2026-10-01T12:00:00Z" },
  { id: 4, body: "Ibrahim Musa joined with your link and is now your premium-line.", created_at: "2026-09-29T09:00:00Z" },
  { id: 3, body: "Tunde Bakare sold a land for 12,500,000.00. Your commission: 625,000.00 (5%).", created_at: "2026-09-18T12:00:00Z" },
  { id: 2, body: "Ngozi Eze joined with your link and is now your premium-line.", created_at: "2026-09-14T09:00:00Z" },
  { id: 1, body: "Tunde Bakare joined with your link and is now your premium-line.", created_at: "2026-09-02T09:00:00Z" },
];

export const DEMO_ME = ME;
