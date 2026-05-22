# Almanac — Competitor Review & Roadmap

A review of the note-selling platforms in the market and a prioritised to-do
list of what to add next. Items already shipped in this codebase are marked
**✓ done**; everything else is a checkbox.

---

## 1. The market

| Platform | Model | What stands out |
|----------|-------|-----------------|
| **Studocu** | Freemium · upload-to-unlock + premium subscription | 50M+ documents; heavy 2026 AI suite — lecture recorder, instant summaries, "study assistant" chat, auto-quizzes, mock-exam generator, camera solver |
| **Course Hero** | Subscription (~$39.99/mo, credit-expiry model) | Step-by-step textbook solutions, Chat-with-PDF, AI-generated tests & flashcards, 30-min online tutoring |
| **Stuvia** | Open marketplace, seller sets price (70% to seller) | Bundles (combine documents at a discount), filter by school/course/type, strong SEO |
| **DocMerit / Oxbridge / Notes2u** | Marketplace | High seller cut (75–85%); Notes2u ≈ 20% commission + small txn fee |
| **Notesgen / Padhle / WishallBook / Studigoo** | India-focused marketplaces | PYQs, test series, question banks; "upload once, sell many"; multi-university reach |
| **Studypool / Docsity** | Pay-per-view / points | Sell tutoring + homework help, not just files |

**Takeaways shaping the roadmap**
- Table stakes: upload, free+paid, course-level search, preview, ratings, creator profiles — **Almanac has these.**
- The frontier everyone is racing to: **AI study tools** (summaries, quizzes, mock exams, chat-with-document).
- India players win on **PYQs / test series / question banks** and multi-university reach.
- Marketplace credibility needs **payouts, moderation, legal/refund pages, seller analytics, bundles & discounts** — these are the real gaps for Almanac.

---

## 2. Already shipped in Almanac ✓

- ✓ Google + email authentication
- ✓ Drag-and-drop upload, metadata tagging, automatic first-pages preview
- ✓ Free **and** paid resources; Razorpay checkout (test mode) + signature verify + webhook
- ✓ Search & filters: university, branch, semester, subject, type, exam relevance, price, rating
- ✓ Watermarked downloads (buyer identity stamped on every page)
- ✓ Ratings & reviews (gated to people who downloaded)
- ✓ Creator profiles, reputation tiers, followers, leaderboard
- ✓ Dashboard: library, uploads with sales/earnings, profile settings
- ✓ SEO (per-resource metadata, sitemap, robots)

---

## 3. CORE to-do — needed for a credible public launch

### 3.1 Launch blockers (do first)
- [ ] **Legal & compliance pages** — Terms of Service, Privacy Policy, Refund/Cancellation policy, Contact Us. *Razorpay requires these to approve a live account; also Indian law.*
- [ ] **Creator payout flow** — let creators withdraw earnings (Razorpay Route / RazorpayX linked accounts); payout history, minimum threshold, KYC capture.
- [ ] **Content moderation & reporting** — "Report resource" button, admin review queue, takedown/remove action, copyright-claim handling.
- [ ] **Transactional email** — purchase receipt to buyer, "you made a sale" to creator, review-received notice (Resend / Supabase email).
- [ ] **Error & loading states** — `error.tsx`, `loading.tsx`, friendly 500 page; graceful "service unavailable" when DB/payments are down.

### 3.2 Trust & quality
- [ ] **College / email verification flow** — verify a student email or upload proof to earn the verified badge (field already exists, no flow yet).
- [ ] **Upload review step** — auto-checks (real PDF, page count, not blank) + optional manual approval before a resource goes public.
- [ ] **Duplicate / re-upload detection** — file hashing to block obvious copies.
- [ ] **Rate limiting & anti-abuse** — throttle uploads, checkout, reviews, follow APIs.

### 3.3 Discovery & conversion
- [ ] **Scalable search** — move rating sort/filter off the in-memory scan; add a Postgres full-text index and a materialised rating column.
- [ ] **Resource thumbnails** — render a cover image of page 1 for cards (faster, more visual than metadata-only cards).
- [ ] **Wishlist / saved collections** — let students bookmark resources into named collections.
- [ ] **"Students also bought / related resources"** — basic recommendations on the detail page.
- [ ] **Bundles** — let a creator package multiple resources at a discounted price (Stuvia-style).
- [ ] **Discount codes / coupons** — creator- or platform-level promo codes.

### 3.4 Seller experience
- [ ] **Creator analytics** — views, preview-to-purchase conversion, downloads over time, traffic by university.
- [ ] **Edit a published resource** — currently you can only delete; allow editing metadata/price and replacing the file.
- [ ] **Resource drafts** — save and finish an upload later.

### 3.5 Platform hygiene
- [ ] **Accessibility pass** — focus states, keyboard nav, alt text, colour contrast.
- [ ] **Mobile polish & PWA** — installable, offline shell, faster previews on mobile.
- [ ] **Analytics & monitoring** — product analytics (PostHog) + error tracking (Sentry).
- [ ] **Automated tests** — unit tests for commission/reputation/PDF, an e2e happy-path.

---

## 4. NON-CORE to-do — differentiators & future phases

### 4.1 AI study tools *(the competitive frontier — CLAUDE.md Phase 3)*
- [ ] AI summary of a resource ("explain this in 10 bullet points")
- [ ] Auto-generated practice quizzes from a document
- [ ] Mock-exam generator from uploaded notes
- [ ] "Chat with this resource" study assistant
- [ ] Flashcard generation from notes
- [ ] Smart recommendations & a personalised study feed

### 4.2 Business model expansion *(CLAUDE.md Phase 2/future)*
- [ ] Premium subscription (unlimited access tier)
- [ ] Creator memberships / elite-creator program with revenue share
- [ ] Institutional & coaching-centre accounts (bulk upload, branded storefront)
- [ ] Multi-currency + Stripe for international students

### 4.3 Community & growth
- [ ] Referral program (referral links, buyer/creator rewards)
- [ ] Following feed & activity (new uploads from creators you follow)
- [ ] Q&A / doubt-solving and peer tutoring (Studypool/Course Hero style)
- [ ] Plagiarism detection via a third-party similarity API
- [ ] Comments / questions on a resource
- [ ] Gamification — streaks, contributor milestones, seasonal leaderboards

### 4.4 Content & reach
- [ ] More formats — PPT/DOCX/scanned images converted to PDF
- [ ] Dedicated PYQ / test-series / question-bank sections (Indian-market strength)
- [ ] Native mobile app (React Native / Expo)
- [ ] Multi-language UI (Hindi + regional languages)

---

## 5. Suggested sequence

1. **Sprint 1 — Launch readiness:** legal pages → payouts → moderation/reporting → transactional email → error states.
2. **Sprint 2 — Trust & discovery:** college verification → scalable search → thumbnails → wishlist/collections.
3. **Sprint 3 — Seller growth:** creator analytics → edit resource → bundles → discount codes.
4. **Sprint 4 — Differentiate:** first AI feature (resource summary + quiz) → recommendations → referral program.
5. **Later phases:** subscriptions, tutoring/Q&A, institutional accounts, mobile app.

---

## References
- Studocu 2026 AI features — tech.eu, aitools-directory
- Course Hero features & pricing — G2, myengineeringbuddy
- Indian platforms (Notesgen, Padhle, WishallBook, Studigoo) — truehost.co.in, studigoo.com
- Marketplace seller mechanics (analytics, payouts, referrals, bundles) — Whatnot Engineering, Notes2u
