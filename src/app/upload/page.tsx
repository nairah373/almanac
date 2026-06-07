import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Eye, Fingerprint, Gift } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { UploadForm } from "@/components/UploadForm";
import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload a resource",
  description: "Share your study notes for free and help students everywhere.",
};

const GUIDELINES = [
  {
    icon: Eye,
    tile: "bg-indigo-100 text-indigo-600",
    text: "First 3 pages auto-generate as a free preview.",
  },
  {
    icon: Gift,
    tile: "bg-emerald-100 text-emerald-600",
    text: "Free for every student — no paywalls, ever.",
  },
  {
    icon: Fingerprint,
    tile: "bg-amber-100 text-amber-600",
    text: "Downloads are watermarked with the student's identity.",
  },
];

export default async function UploadPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/upload");

  return (
    <div>
      <PageHero
        containerClassName="max-w-3xl"
        eyebrow="Become a creator"
        title="Share a resource"
        description="Upload once, help students everywhere, and build your reputation as a creator."
      />

      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {GUIDELINES.map((g) => (
            <div
              key={g.text}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${g.tile}`}
              >
                <g.icon size={16} strokeWidth={1.75} />
              </div>
              <span className="text-xs leading-relaxed text-ink-soft">
                {g.text}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <UploadForm />
        </div>
      </div>
    </div>
  );
}
