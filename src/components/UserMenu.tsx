"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Upload, User } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
};

export function UserMenu({ name, username, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const items = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/upload", icon: Upload, label: "Upload resource" },
    { href: `/creators/${username}`, icon: User, label: "My profile" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full ring-offset-2 ring-offset-bg transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <Avatar name={name} src={avatarUrl} size={36} />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-hidden
            tabIndex={-1}
          />
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-lift">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-ink">{name}</p>
              <p className="truncate text-xs text-faint">{email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
              >
                <item.icon size={16} strokeWidth={1.75} />
                {item.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition hover:bg-danger/8"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
