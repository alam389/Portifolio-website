"use client";

import { profile } from "@/data";
import { FilesIcon, GithubMarkIcon, MailIcon } from "./Icons";

// VS Code activity bar (.impeccable.md: authentic editor details). Icons are
// honest: Explorer is the active view; GitHub/mail are real links; theme
// toggle lives at the bottom (desktop). Hidden < md (drawer covers mobile).

export function ActivityBar() {
  const github = profile.socials.find((s) => s.label === "GitHub")?.href;
  return (
    <nav
      aria-label="Primary"
      className="hidden w-12 shrink-0 flex-col items-center border-r border-border bg-activitybar py-1 md:flex"
    >
      <span
        className="relative flex h-11 w-full items-center justify-center text-foreground"
        title="Explorer"
      >
        <span
          className="absolute bottom-2 left-0 top-2 w-[2px] bg-accent"
          aria-hidden="true"
        />
        <FilesIcon className="h-5 w-5" />
      </span>
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          className="flex h-11 w-full items-center justify-center text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
        >
          <GithubMarkIcon className="h-5 w-5" />
        </a>
      )}
      <a
        href={`mailto:${profile.email}`}
        aria-label="Email Anthony"
        className="flex h-11 w-full items-center justify-center text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
      >
        <MailIcon className="h-5 w-5" />
      </a>
    </nav>
  );
}
