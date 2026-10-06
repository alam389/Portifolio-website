"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code,
  FileText,
  House,
  Link as LinkIcon,
  Mail,
  Route,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { profile } from "@/data";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "About", icon: House },
  { href: "/experience", label: "Experience", icon: FileText },
  { href: "/projects", label: "Projects", icon: Code },
  { href: "/journey", label: "Journey", icon: Route },
];

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

// lucide v1 dropped brand marks, so these two are inline.
function GitHubIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

// Socials come from profile.ts; unknown labels fall back to a plain link icon.
const socialIcons: Record<string, ComponentType<IconProps>> = {
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
  Email: Mail,
};

const initials = profile.name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2);

const item =
  "group relative flex size-11 items-center justify-center rounded-xl border md:size-9 md:rounded-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-foreground/40";
const idle =
  "border-transparent text-foreground/55 hover:bg-foreground/5 hover:text-foreground focus-visible:text-foreground";
const current = "border-foreground/10 bg-foreground/10 text-foreground";

function Tip({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap rounded-md border border-foreground/10 bg-neutral-900 px-2 py-1 text-xs text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: floating full-height rail, inset from the left edge */}
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-14 flex-col items-center rounded-[20px] border border-foreground/10 bg-neutral-900/90 py-3 shadow-lg shadow-black/40 backdrop-blur-md md:flex">
        <Link
          href="/"
          aria-label={`${profile.name}, home`}
          className="mb-3 flex size-8 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold tracking-tight text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40"
        >
          {initials}
        </Link>

        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = href === pathname;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    className={`${item} ${isActive ? current : idle}`}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                    <Tip label={label} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ul aria-label="Links" className="mt-auto flex flex-col gap-1 border-t border-foreground/10 pt-2">
          {profile.socials.map(({ label, href }) => {
            const Icon = socialIcons[label] ?? LinkIcon;
            const external = href.startsWith("http");
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-label={label}
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  className={`${item} ${idle}`}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                  <Tip label={label} />
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile: fixed bottom bar with the page links */}
      <nav
        aria-label="Main"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 rounded-[28px] border border-foreground/10 bg-neutral-900/90 p-2 shadow-lg shadow-black/40 backdrop-blur-md md:hidden"
      >
        <ul className="flex gap-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = href === pathname;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={`${item} ${isActive ? current : idle}`}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
