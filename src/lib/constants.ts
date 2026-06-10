import type { ResourceType } from "@prisma/client";

/**
 * Working product name — placeholder, change in one place.
 * (CLAUDE.md ships with "[Temporary Name Placeholder]".)
 */
export const APP_NAME = "Almanac";
export const APP_TAGLINE = "The trusted academic library for Indian students";
export const APP_DESCRIPTION =
  "Discover, verify and learn from high-quality study notes, PYQs and resources shared by top students across Indian colleges.";

/** Platform commission taken from each paid sale (0.15 = 15%). */
export const PLATFORM_COMMISSION_RATE = 0.15;

/** Pricing guardrails for paid resources, in rupees. */
export const MIN_PRICE_INR = 10;
export const MAX_PRICE_INR = 2000;

/**
 * Subscription plans. Access to every resource is unlocked while a student has
 * an active subscription. Prices are in paise (₹1 = 100 paise).
 */
export const SUBSCRIPTION_PLANS = {
  MONTHLY: { label: "Monthly", months: 1, priceInPaise: 9900, tagline: "Billed once a month" },
  SIX_MONTH: { label: "6 months", months: 6, priceInPaise: 49900, tagline: "Save vs monthly" },
  YEARLY: { label: "Yearly", months: 12, priceInPaise: 89900, tagline: "Best value" },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;
export const PLAN_KEYS = Object.keys(SUBSCRIPTION_PLANS) as PlanKey[];

/** Number of leading pages exposed in the public preview PDF. */
export const PREVIEW_PAGE_COUNT = 3;

/** Upload limits. */
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024; // 30 MB

/** Supabase Storage bucket names. */
export const BUCKET_ORIGINALS = "originals";
export const BUCKET_PREVIEWS = "previews";

export const UNIVERSITIES: string[] = [
  "Anna University",
  "Visvesvaraya Technological University (VTU)",
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
  "Savitribai Phule Pune University (SPPU)",
  "University of Mumbai",
  "Jawaharlal Nehru Technological University (JNTU)",
  "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
  "Maulana Abul Kalam Azad University of Technology (MAKAUT)",
  "Gujarat Technological University (GTU)",
  "University of Delhi (DU)",
  "Indian Institute of Technology (IIT)",
  "National Institute of Technology (NIT)",
  "All India Institute of Medical Sciences (AIIMS)",
  "Manipal Academy of Higher Education",
  "Other",
];

export const BRANCHES: string[] = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biotechnology",
  "MBBS (Medicine)",
  "BDS (Dental)",
  "Pharmacy",
  "Other",
];

export const SEMESTERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const EXAM_TYPES: string[] = [
  "Mid-Semester",
  "End-Semester",
  "University Exam",
  "Internal Assessment",
  "Practical / Lab",
  "Entrance / NEET",
  "Not exam-specific",
];

/** Common subjects offered as a datalist; the field stays free text. */
export const SUBJECT_SUGGESTIONS: string[] = [
  "Data Structures",
  "Operating Systems",
  "Database Management Systems",
  "Computer Networks",
  "Engineering Mathematics",
  "Digital Electronics",
  "Thermodynamics",
  "Strength of Materials",
  "Signals & Systems",
  "Microprocessors",
  "Human Anatomy",
  "Physiology",
  "Biochemistry",
  "Pharmacology",
  "Pathology",
];

export const RESOURCE_TYPE_META: Record<
  ResourceType,
  { label: string; short: string }
> = {
  HANDWRITTEN: { label: "Handwritten Notes", short: "Handwritten" },
  TYPED: { label: "Typed Notes", short: "Typed" },
  PPT_SUMMARY: { label: "PPT Summary", short: "PPT" },
  LAB_RECORD: { label: "Lab Record", short: "Lab" },
  PYQ: { label: "Previous Year Questions", short: "PYQ" },
  FORMULA_SHEET: { label: "Formula Sheet", short: "Formulae" },
  FLASHCARDS: { label: "Flashcards", short: "Flashcards" },
};

export const RESOURCE_TYPES = Object.keys(RESOURCE_TYPE_META) as ResourceType[];

export const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "popular", label: "Most downloaded" },
  { value: "rating", label: "Highest rated" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
