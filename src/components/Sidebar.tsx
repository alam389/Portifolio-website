"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/data";

const links = [
  { href: "/", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/journey", label: "Journey" },
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
            className={`origin-left rounded-md px-2.5 py-2 md:px-3 text-sm transition-[transform,color,background-color] duration-200 ease-out hover:scale-[1.06] focus-visible:scale-[1.06] motion-reduce:transition-colors motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100 ${
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
      {/* Mobile: top bar with inline links. The name is dropped so all four
          links fit at 375px; the About page already introduces Anthony. */}
      <header className="relative z-20 border-b border-foreground/10 bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
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
