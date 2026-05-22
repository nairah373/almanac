"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { BRANCHES, UNIVERSITIES } from "@/lib/constants";

type ProfileInput = {
  fullName: string;
  username: string;
  university: string | null;
  branch: string | null;
  bio: string | null;
};

export function ProfileSettings({ profile }: { profile: ProfileInput }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(fd.get("fullName") || ""),
          username: String(fd.get("username") || ""),
          university: String(fd.get("university") || "") || undefined,
          branch: String(fd.get("branch") || "") || undefined,
          bio: String(fd.get("bio") || "") || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save profile.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-line bg-surface p-6"
    >
      <Input
        label="Full name"
        name="fullName"
        defaultValue={profile.fullName}
        minLength={2}
        maxLength={80}
        required
      />
      <Input
        label="Username"
        name="username"
        defaultValue={profile.username}
        minLength={3}
        maxLength={20}
        hint="Lowercase letters, numbers and underscores. Shown as @username."
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="University"
          name="university"
          defaultValue={profile.university ?? ""}
        >
          <option value="">Not set</option>
          {UNIVERSITIES.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
        <Select
          label="Branch"
          name="branch"
          defaultValue={profile.branch ?? ""}
        >
          <option value="">Not set</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label="Bio"
        name="bio"
        defaultValue={profile.bio ?? ""}
        maxLength={400}
        placeholder="A short line about you — your college, year and what you share."
      />

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Profile saved.</p>}

      <Button type="submit" disabled={loading}>
        {loading && <Spinner size={16} />}
        Save changes
      </Button>
    </form>
  );
}
