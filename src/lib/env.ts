/**
 * Centralised, lazily-read environment access.
 *
 * NEXT_PUBLIC_* vars must be accessed with STATIC `process.env.X` so Next.js
 * inlines them into the client bundle — dynamic `process.env[name]` access
 * is never inlined and shows up as `undefined` in the browser.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. See .env.example and SETUP.md.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: () =>
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () =>
    required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  supabaseServiceKey: () =>
    required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  razorpayKeyId: () =>
    required("RAZORPAY_KEY_ID", process.env.RAZORPAY_KEY_ID),
  razorpayKeySecret: () =>
    required("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET),
  razorpayWebhookSecret: () =>
    required("RAZORPAY_WEBHOOK_SECRET", process.env.RAZORPAY_WEBHOOK_SECRET),
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** True when Supabase env is present — lets pages render a friendly notice instead of crashing. */
export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
