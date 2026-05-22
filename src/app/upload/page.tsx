import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Eye, Fingerprint, IndianRupee } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { UploadForm } from "@/components/UploadForm";
import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload a resource",
  description: "Share your study notes and earn from every download.",
};

const GUIDELINES = [
  { icon: Eye, text: "The first 3 pages become a free preview for buyers." },
  { icon: IndianRupee, text: "You keep 85% of every sale — paid out per order." },
  {
    icon: Fingerprint,
    text: "Downloads are watermarked with the buyer's identity.",
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
        <div className="grid gap-3 rounded-2xl border border-line bg-surface-2 p-4 sm:grid-cols-3">
          {GUIDELINES.map((g) => (
            <div key={g.text} className="flex items-start gap-2.5">
              <g.icon size={16} className="mt-0.5 shrink-0 text-gold" />
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
