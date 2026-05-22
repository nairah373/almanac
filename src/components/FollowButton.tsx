"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function FollowButton({
  creatorId,
  creatorUsername,
  initialFollowing,
  isSignedIn,
}: {
  creatorId: string;
  creatorUsername: string;
  initialFollowing: boolean;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    return (
      <Link
        href={`/login?next=/creators/${creatorUsername}`}
        className={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        <UserPlus size={15} />
        Follow
      </Link>
    );
  }

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId }),
      });
      const data = (await res.json()) as { following?: boolean };
      if (res.ok) {
        setFollowing(Boolean(data.following));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Spinner size={14} />
      ) : following ? (
        <Check size={15} />
      ) : (
        <UserPlus size={15} />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
