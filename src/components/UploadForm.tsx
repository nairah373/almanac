"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import {
  BRANCHES,
  BUCKET_ORIGINALS,
  EXAM_TYPES,
  MAX_PRICE_INR,
  MAX_UPLOAD_BYTES,
  MIN_PRICE_INR,
  RESOURCE_TYPE_META,
  RESOURCE_TYPES,
  SEMESTERS,
  SUBJECT_SUGGESTIONS,
  UNIVERSITIES,
} from "@/lib/constants";

type Phase = "idle" | "creating" | "uploading" | "publishing";

const PHASE_LABEL: Record<Exclude<Phase, "idle">, string> = {
  creating: "Preparing your upload…",
  uploading: "Uploading your file…",
  publishing: "Generating the preview…",
};

type CreateResponse = {
  error?: string;
  resourceId?: string;
  uploadPath?: string;
  uploadToken?: string;
};

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = phase !== "idle";

  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  function pickFile(f: File | null) {
    setError(null);
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Only PDF, JPG or PNG files are supported.");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setError(`File must be under ${formatBytes(MAX_UPLOAD_BYTES)}.`);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please attach a PDF file.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const priceInRupees = Number(fd.get("priceInRupees") || 0);
    if (
      !isFree &&
      (priceInRupees < MIN_PRICE_INR || priceInRupees > MAX_PRICE_INR)
    ) {
      setError(`Price must be between ₹${MIN_PRICE_INR} and ₹${MAX_PRICE_INR}.`);
      return;
    }

    const examType = String(fd.get("examType") || "");
    const payload = {
      title: String(fd.get("title") || ""),
      description: String(fd.get("description") || ""),
      resourceType: String(fd.get("resourceType") || ""),
      university: String(fd.get("university") || ""),
      branch: String(fd.get("branch") || ""),
      semester: Number(fd.get("semester") || 1),
      subject: String(fd.get("subject") || ""),
      moduleName: String(fd.get("moduleName") || "") || undefined,
      examType:
        examType && examType !== "Not exam-specific" ? examType : undefined,
      isFree,
      priceInRupees: isFree ? 0 : priceInRupees,
      fileSizeBytes: file.size,
    };

    try {
      setPhase("creating");
      const createRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const createData = (await createRes.json()) as CreateResponse;
      if (!createRes.ok || !createData.uploadPath || !createData.uploadToken) {
        throw new Error(createData.error || "Could not start the upload.");
      }

      setPhase("uploading");
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage
        .from(BUCKET_ORIGINALS)
        .uploadToSignedUrl(createData.uploadPath, createData.uploadToken, file, {
          contentType: file.type,
        });
      if (upErr) throw new Error(upErr.message);

      setPhase("publishing");
      const pubRes = await fetch(
        `/api/resources/${createData.resourceId}/publish`,
        { method: "POST" },
      );
      const pubData = (await pubRes.json()) as { error?: string };
      if (!pubRes.ok) {
        throw new Error(pubData.error || "Could not publish the resource.");
      }

      router.push(`/resources/${createData.resourceId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setPhase("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── File ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold text-ink">1 · The document</h2>
        <p className="mt-1 text-xs text-muted">
          PDF, JPG or PNG — up to {formatBytes(MAX_UPLOAD_BYTES)}. Images are
          auto-converted to a single-page PDF and the first pages become a free
          preview.
        </p>

        {file ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-bg p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-bg">
              <FileText size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {file.name}
              </p>
              <p className="text-xs text-faint">{formatBytes(file.size)}</p>
            </div>
            {!busy && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition",
              dragOver
                ? "border-ink bg-surface-2"
                : "border-line-strong hover:border-ink",
            )}
          >
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <UploadCloud size={26} className="text-muted" />
            <p className="mt-3 text-sm font-medium text-ink">
              Drag &amp; drop a PDF or image here
            </p>
            <p className="mt-0.5 text-xs text-faint">
              PDF, JPG or PNG — or click to browse
            </p>
          </label>
        )}
      </section>

      {/* ── Details ──────────────────────────────────────── */}
      <section className="space-y-4 rounded-2xl border border-line bg-surface p-6">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            2 · About this resource
          </h2>
          <p className="mt-1 text-xs text-muted">
            Accurate tags help students find your work.
          </p>
        </div>

        <Input
          label="Title"
          name="title"
          placeholder="e.g. Operating Systems — Complete Unit 1–3 Notes"
          minLength={6}
          maxLength={140}
          required
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="What does this cover? Which topics, which exam, how detailed?"
          minLength={20}
          maxLength={2000}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Resource type" name="resourceType" required defaultValue="">
            <option value="" disabled>
              Select a type
            </option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {RESOURCE_TYPE_META[t].label}
              </option>
            ))}
          </Select>
          <Select label="University" name="university" required defaultValue="">
            <option value="" disabled>
              Select a university
            </option>
            {UNIVERSITIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Select label="Branch" name="branch" required defaultValue="">
            <option value="" disabled>
              Select a branch
            </option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select label="Semester" name="semester" required defaultValue="">
            <option value="" disabled>
              Select a semester
            </option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Select>
          <div>
            <Input
              label="Subject"
              name="subject"
              placeholder="e.g. Operating Systems"
              list="subject-suggestions"
              minLength={2}
              maxLength={120}
              required
            />
            <datalist id="subject-suggestions">
              {SUBJECT_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <Input
            label="Module / unit (optional)"
            name="moduleName"
            placeholder="e.g. Unit 2 — Process Scheduling"
            maxLength={120}
          />
          <Select label="Exam relevance (optional)" name="examType" defaultValue="">
            <option value="">Not exam-specific</option>
            {EXAM_TYPES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section className="space-y-4 rounded-2xl border border-line bg-surface p-6">
        <div>
          <h2 className="text-sm font-semibold text-ink">3 · Pricing</h2>
          <p className="mt-1 text-xs text-muted">
            You keep 85% of every sale. Free resources still build your
            reputation.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-line bg-bg p-3">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 accent-ink"
          />
          <span className="text-sm text-ink">
            Offer this resource for free
          </span>
        </label>

        {!isFree && (
          <Input
            label="Price (₹)"
            name="priceInRupees"
            type="number"
            min={MIN_PRICE_INR}
            max={MAX_PRICE_INR}
            step={1}
            placeholder={`Between ${MIN_PRICE_INR} and ${MAX_PRICE_INR}`}
            hint={`Students pay this once. You earn 85%.`}
          />
        )}
      </section>

      {error && (
        <p className="rounded-xl bg-danger/8 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy && <Spinner size={16} />}
          {busy ? PHASE_LABEL[phase] : "Publish resource"}
        </Button>
        {busy && (
          <span className="text-xs text-faint">
            Please keep this page open.
          </span>
        )}
      </div>
    </form>
  );
}
