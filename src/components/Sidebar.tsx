"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/data";

const links = [
  { href: "/", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const nav = (
    <nav aria-label="Main" className="flex gap-1 md:flex-col">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-foreground/10 font-medium text-foreground"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile: top bar with inline links */}
      <header className="flex items-center justify-between gap-4 border-b border-foreground/10 px-4 py-3 md:hidden">
        <Link href="/" className="text-sm font-semibold">
          {profile.name}
        </Link>
        {nav}
      </header>

      {/* Desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between border-r border-foreground/10 p-6 md:flex">
        <div className="flex flex-col gap-8">
          <div>
            <Link href="/" className="text-lg font-semibold">
              {profile.name}
            </Link>
            <p className="text-sm text-foreground/60">{profile.role}</p>
          </div>
          {nav}
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {profile.socials.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-foreground/60 transition-colors hover:text-foreground"
              >
                {label} ↗
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
