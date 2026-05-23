import Link from "next/link";
import { Upload } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { MobileNav } from "@/components/MobileNav";
import { buttonVariants } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/creators", label: "Top Creators" },
];

export async function Navbar() {
  const profile = await getCurrentProfile().catch(() => null);

  return (
    <header className="glass sticky top-0 z-40 border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-ink-soft transition hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <Link
                href="/upload"
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  className: "hidden sm:inline-flex",
                })}
              >
                <Upload size={15} />
                Upload
              </Link>
              <UserMenu
                name={profile.fullName}
                username={profile.username}
                email={profile.email}
                avatarUrl={profile.avatarUrl}
              />
            </>
          ) : (
            <>
              <Link
                href="/creator"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "hidden lg:inline-flex",
                })}
              >
                For creators
              </Link>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "hidden md:inline-flex",
                })}
              >
                Sign in
              </Link>
            </>
          )}
          <MobileNav links={NAV_LINKS} signedIn={Boolean(profile)} />
        </div>
      </div>
    </header>
  );
}
