"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function DeleteResourceButton({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (
      !window.confirm(
        "Remove this resource from the catalogue? Students who already have it keep access.",
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/resources/${resourceId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={loading}
      aria-label="Remove resource"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
    >
      {loading ? <Spinner size={14} /> : <Trash2 size={15} />}
    </button>
  );
}
