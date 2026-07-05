// Tiny inline icon set (DESIGN.md §2.5) — no icon-library dependency.
// File-type glyphs pull colors from the theme's syntax tokens.

import type { FileKind } from "../../content/manifest";

interface IconProps {
  className?: string;
}

/** Dispatches the right glyph for a manifest file kind. */
export function FileIcon({ kind, className }: IconProps & { kind: FileKind }) {
  switch (kind) {
    case "json":
      return <JsonIcon className={className} />;
    case "tsx":
      return <ReactIcon className={className} />;
    case "txt":
      return <TxtIcon className={className} />;
    default:
      return <MarkdownFileIcon className={className} />;
  }
}

export function JsonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M6.2 2.6c-1.3 0-1.9.6-1.9 1.8v1.4c0 .9-.4 1.4-1.4 1.6v1.2c1 .2 1.4.7 1.4 1.6v1.4c0 1.2.6 1.8 1.9 1.8"
        fill="none"
        stroke="var(--syn-yellow)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M9.8 2.6c1.3 0 1.9.6 1.9 1.8v1.4c0 .9.4 1.4 1.4 1.6v1.2c-1 .2-1.4.7-1.4 1.6v1.4c0 1.2-.6 1.8-1.9 1.8"
        fill="none"
        stroke="var(--syn-yellow)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ReactIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="1.2" fill="var(--syn-aqua)" />
      <ellipse cx="8" cy="8" rx="6.4" ry="2.5" fill="none" stroke="var(--syn-aqua)" strokeWidth="0.9" />
      <ellipse cx="8" cy="8" rx="6.4" ry="2.5" fill="none" stroke="var(--syn-aqua)" strokeWidth="0.9" transform="rotate(60 8 8)" />
      <ellipse cx="8" cy="8" rx="6.4" ry="2.5" fill="none" stroke="var(--syn-aqua)" strokeWidth="0.9" transform="rotate(-60 8 8)" />
    </svg>
  );
}

export function TxtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="3" y="1.8" width="10" height="12.4" rx="1.2" fill="none" stroke="var(--muted)" strokeWidth="1.1" />
      <path d="M5.3 5h5.4M5.3 7.5h5.4M5.3 10h3.4" stroke="var(--muted)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function FilesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="5" y="1.8" width="9" height="10.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 14.2H3.2c-.7 0-1.2-.5-1.2-1.2V5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="1.8" y="3.2" width="12.4" height="9.6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="m2.5 4.5 5.5 4.3 5.5-4.3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function RunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M4.5 3.2v9.6l8.2-4.8z" fill="currentColor" />
    </svg>
  );
}

export function GithubMarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

export function MarkdownFileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect
        x="1"
        y="3.5"
        width="14"
        height="9"
        rx="1.5"
        fill="none"
        stroke="var(--icon-md)"
        strokeWidth="1.2"
      />
      <path
        d="M3.1 10.2V5.8h1.2l1.35 1.75L7 5.8h1.2v4.4H7V7.7L5.65 9.35 4.3 7.7v2.5H3.1Z"
        fill="var(--icon-md)"
      />
      <path d="M11.6 5.8v2.5h1.5L11 10.6 8.9 8.3h1.5V5.8h1.2Z" fill="var(--icon-md)" />
    </svg>
  );
}

export function FolderIcon({ open, className }: IconProps & { open?: boolean }) {
  return open ? (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M1.5 4.5c0-.55.45-1 1-1h3l1.2 1.3h6.3c.55 0 1 .45 1 1v.7H3.6l-1.6 6H2.5c-.55 0-1-.45-1-1v-7Z"
        fill="var(--icon-folder)"
        opacity="0.55"
      />
      <path
        d="M4.2 7.5h10.3l-1.7 5.5c-.13.42-.52.7-.96.7H2.6l1.6-6.2Z"
        fill="var(--icon-folder)"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M1.5 4.5c0-.55.45-1 1-1h3l1.2 1.3h6.8c.55 0 1 .45 1 1v6.7c0 .55-.45 1-1 1h-11c-.55 0-1-.45-1-1v-8Z"
        fill="var(--icon-folder)"
      />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M6 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M2 4.5h12M2 8h12M2 11.5h12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M4.5 4.5l7 7m0-7l-7 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BranchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="4.5" cy="3.5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4.5" cy="12.5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.5" cy="5.5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.5 5.1v5.8M11.5 7.1c0 2.6-3.2 2.4-5 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
