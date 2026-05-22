"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import {
  BRANCHES,
  EXAM_TYPES,
  RESOURCE_TYPE_META,
  RESOURCE_TYPES,
  SEMESTERS,
  SORT_OPTIONS,
  UNIVERSITIES,
} from "@/lib/constants";

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4.5", label: "4.5 & above" },
  { value: "4", label: "4.0 & above" },
  { value: "3", label: "3.0 & above" },
];

export function BrowseFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function commit(next: URLSearchParams) {
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/browse?${qs}` : "/browse");
  }

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    commit(next);
  }

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    update("q", query.trim());
  }

  const get = (k: string) => params.get(k) ?? "";
  const activeCount = [...params.keys()].filter((k) => k !== "page").length;

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch}>
        <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 focus-within:border-ink">
          <Search size={16} className="shrink-0 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources"
            className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            aria-label="Search resources"
          />
        </div>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.push("/browse");
            }}
            className="flex items-center gap-1 text-xs text-muted transition hover:text-ink"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <Select
          label="Sort by"
          value={get("sort")}
          onChange={(e) => update("sort", e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value === "recent" ? "" : o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          label="Price"
          value={get("price")}
          onChange={(e) => update("price", e.target.value)}
        >
          <option value="">Free &amp; paid</option>
          <option value="free">Free only</option>
          <option value="paid">Paid only</option>
        </Select>

        <Select
          label="Resource type"
          value={get("type")}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">All types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {RESOURCE_TYPE_META[t].label}
            </option>
          ))}
        </Select>

        <Select
          label="University"
          value={get("university")}
          onChange={(e) => update("university", e.target.value)}
        >
          <option value="">All universities</option>
          {UNIVERSITIES.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>

        <Select
          label="Branch"
          value={get("branch")}
          onChange={(e) => update("branch", e.target.value)}
        >
          <option value="">All branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>

        <Select
          label="Semester"
          value={get("semester")}
          onChange={(e) => update("semester", e.target.value)}
        >
          <option value="">All semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </Select>

        <Select
          label="Exam relevance"
          value={get("examType")}
          onChange={(e) => update("examType", e.target.value)}
        >
          <option value="">Any</option>
          {EXAM_TYPES.filter((e) => e !== "Not exam-specific").map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>

        <Select
          label="Rating"
          value={get("rating")}
          onChange={(e) => update("rating", e.target.value)}
        >
          {RATING_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Subject"
        placeholder="Type a subject…"
        defaultValue={get("subject")}
        onBlur={(e) => update("subject", e.target.value.trim())}
      />
    </div>
  );
}
