"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Upload, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

type Props = {
  links: { href: string; label: string }[];
  signedIn: boolean;
};

export function MobileNav({ links, signedIn }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-2"
        aria-label="Menu"
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-line bg-surface p-4 shadow-card">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {signedIn ? (
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "secondary", className: "w-full" })}
              >
                <Upload size={16} /> Upload a resource
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/creator"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "ghost", className: "w-full" })}
                >
                  For creators
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "secondary", className: "w-full" })}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "primary", className: "w-full" })}
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
