/**
 * Centralised, lazily-read environment access.
 * Reads happen inside functions so a missing value never crashes module load
 * (important for `next build` before secrets are configured).
 */

function need(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. See .env.example and SETUP.md.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: () => need("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => need("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: () => need("SUPABASE_SERVICE_ROLE_KEY"),
  razorpayKeyId: () => need("RAZORPAY_KEY_ID"),
  razorpayKeySecret: () => need("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: () => need("RAZORPAY_WEBHOOK_SECRET"),
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** True when Supabase env is present — lets pages render a friendly notice instead of crashing. */
export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
