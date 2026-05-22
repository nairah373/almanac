# Almanac

**The trusted academic library for Indian students.**

A premium, calm marketplace where students, creators and coaching collectives
upload, discover and monetise high-quality study material — handwritten notes,
typed notes, PYQs, formula sheets, lab records, PPT summaries and flashcards.

The product vision and brand direction live in [`CLAUDE.md`](./CLAUDE.md).

---

## What's built

- **Discovery** — fast search and filtering by university, branch, semester,
  subject, module, resource type, exam relevance, price and rating.
- **Trust** — every resource shows the uploader's identity, college,
  verification status, ratings, downloads and a free first-pages preview.
- **Marketplace** — free and paid resources, Razorpay checkout (test mode),
  signature-verified payments and a payment webhook.
- **Watermarked downloads** — the full PDF is stamped with the buyer's identity
  on every page, so leaked copies stay traceable.
- **Creator economy** — public creator profiles with reputation tiers
  (New → Rising → Trusted → Elite), followers, ratings and earnings.
- **Ratings & reviews** — gated to students who actually downloaded a resource.
- **Dashboard** — buyer library, creator uploads with sales/earnings, and
  profile settings.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 — a monochrome "paper" design system |
| Auth | Supabase Auth (Google + email/password) |
| Database | Supabase Postgres via Prisma ORM |
| File storage | Supabase Storage (private originals, public previews) |
| Payments | Razorpay (test mode) |
| PDF | `pdf-lib` — preview extraction & download watermarking |

## Getting started

See **[SETUP.md](./SETUP.md)** for the full step-by-step guide (Supabase,
Razorpay, environment variables, schema, seed data).

```bash
npm install
cp .env.example .env      # then fill in the values — see SETUP.md
npm run db:push           # create database tables
npm run db:seed           # optional demo data
npm run dev
```

## Project structure

```
prisma/schema.prisma      Data model (Profile, Resource, Purchase, Review, Follow)
prisma/seed.ts            Demo data
src/lib/                  Supabase clients, auth, queries, Razorpay, PDF, storage
src/components/           UI primitives and feature components
src/app/                  Pages (landing, browse, resource, upload, dashboard,
                          creators, auth) and API route handlers
src/app/api/              resources · checkout · razorpay/webhook · download ·
                          reviews · follow · profile
```

## Roadmap (deferred)

Per the agreed scope, these are intentionally **not** in this version:
admin moderation panel, plagiarism detection, saved collections, and a full
creator payout/withdrawal flow. Earnings are tracked; moving money out is the
next milestone.
