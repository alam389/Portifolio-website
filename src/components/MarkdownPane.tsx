// Server component: renders build-time shiki HTML (DESIGN.md §2.3).
// Prose styling via @tailwindcss/typography, tuned to the editor theme.

export function MarkdownPane({ html }: { html: string }) {
  return (
    <article
      className="prose max-w-3xl dark:prose-invert prose-headings:scroll-mt-6 prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none prose-code:font-normal prose-pre:bg-transparent prose-pre:p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
