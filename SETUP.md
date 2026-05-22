# Almanac — Setup Guide

Follow these steps to run Almanac locally and prepare it for launch.
Almanac is a Next.js app backed by **Supabase** (database, auth, file storage)
and **Razorpay** (payments).

---

## 1. Prerequisites

- **Node.js 20+** and npm
- A free **Supabase** account — https://supabase.com
- A **Razorpay** account in test mode — https://razorpay.com

```bash
npm install
cp .env.example .env
```

Fill in `.env` as you complete the steps below.

---

## 2. Supabase

### 2a. Create the project
1. Create a new project at https://supabase.com/dashboard.
2. Choose a database password and **save it** — you need it for the connection string.

### 2b. API keys → `.env`
**Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret)*

### 2c. Database connection → `.env`
**Project Settings → Database → Connection string**:
- **Transaction / pooled** string (port `6543`) → `DATABASE_URL`
  (append `?pgbouncer=true` if it is not already there)
- **Direct** string (port `5432`) → `DIRECT_URL`

### 2d. Storage buckets
**Storage → Create bucket** — create two buckets:
| Bucket | Public? |
|----------|---------|
| `originals` | **Private** (uncheck "Public bucket") |
| `previews` | **Public** |

Originals are served only through the watermarked download route; previews are
shown publicly on resource pages.

### 2e. Authentication
**Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (your domain in production)
- **Redirect URLs**: add `http://localhost:3000/auth/callback`

**Google sign-in (recommended):** Authentication → Providers → Google → enable,
and paste a Google OAuth client ID/secret (from Google Cloud Console, with
`https://<your-project-ref>.supabase.co/auth/v1/callback` as the authorised
redirect URI).

Email/password works with no extra setup. With email confirmation enabled,
users receive a link that returns them through `/auth/callback`.

### 2f. Push the database schema
```bash
npm run db:push      # creates all tables from prisma/schema.prisma
npm run db:seed      # optional — demo creators & resources
```
> Seeded resources are catalogue-only (no uploaded PDF) so their preview and
> download will not work. Upload a real resource through the app to test the
> full flow.

---

## 3. Razorpay (test mode)

1. In the Razorpay dashboard, switch to **Test Mode**.
2. **Settings → API Keys → Generate Test Key**:
   - Key ID → `RAZORPAY_KEY_ID` **and** `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - Key Secret → `RAZORPAY_KEY_SECRET`
3. **Settings → Webhooks → Add New Webhook**:
   - URL: `http://localhost:3000/api/razorpay/webhook`
     (use your real domain in production; for local testing expose your port
     with a tunnel such as `ngrok`)
   - Active events: `payment.captured` and `order.paid`
   - Set a **secret** → `RAZORPAY_WEBHOOK_SECRET`

Test card for checkout: **4111 1111 1111 1111**, any future expiry, any CVV.

---

## 4. Run

```bash
npm run dev
```
Open http://localhost:3000.

Useful scripts:
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Browse data in Prisma Studio |

---

## 5. End-to-end test checklist

1. Sign up two accounts (one creator, one buyer) — Google or email.
2. As the creator, open **/upload** and publish a real PDF. Confirm the preview
   is generated and the resource appears in **/browse**.
3. As the buyer, search and filter on **/browse**, open the resource, and
   confirm only the first pages preview.
4. Buy a paid resource with the test card; confirm the webhook marks it paid
   and it appears under **Dashboard → My library**.
5. Download it and confirm the PDF is watermarked with the buyer's identity.
6. Leave a rating and review; confirm it shows on the resource and updates the
   creator's stats.

---

## 6. Going to production

- Deploy to **Vercel**; add every variable from `.env` to the project settings.
- Set `NEXT_PUBLIC_SITE_URL` to your real domain.
- Add the production domain to Supabase **Site URL** and **Redirect URLs**, and
  to the Google OAuth authorised origins.
- Point the Razorpay webhook at `https://yourdomain/api/razorpay/webhook`.
- To accept real money, complete Razorpay business verification and swap the
  test keys for live keys.

### Before a public launch (not code)
- Publish Terms of Service, a Privacy Policy and an academic-integrity notice.
- Provide a content-reporting / takedown path for infringing uploads.
- Review tax obligations on creator earnings.
