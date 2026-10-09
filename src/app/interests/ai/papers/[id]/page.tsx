import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { papers } from "@/data";

// Only papers with a summary get a page; drafts never ship (same rule as the
// Interests list).
const showDrafts = process.env.NODE_ENV !== "production";
const summarized = papers.filter((p) => p.summary && (showDrafts || !p.draft));

export const dynamicParams = false;

export function generateStaticParams() {
  return summarized.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const paper = summarized.find((p) => p.id === id);
  return paper
    ? { title: `${paper.title} | Anthony Lam`, description: paper.summary?.overview }
    : {};
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-mono text-xs tracking-wide text-foreground/50 uppercase">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-foreground/85">
          <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-foreground/40" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function PaperPage({ params }: Props) {
  const { id } = await params;
  const paper = summarized.find((p) => p.id === id);
  if (!paper?.summary) notFound();
  const { summary } = paper;

  return (
    <article>
      <Link
        href="/interests/ai"
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← AI
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{paper.title}</h1>
      <p className="mt-2 font-mono text-xs text-foreground/50">
        {paper.authors} · {paper.venue ? `${paper.venue} ` : ""}
        {paper.year}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <ul aria-label="Topics" className="flex flex-wrap gap-1.5">
          {paper.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-foreground/15 px-2.5 py-0.5 text-xs text-foreground/70"
            >
              {tag}
            </li>
          ))}
        </ul>
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline-offset-4 hover:underline"
        >
          Read the paper <span aria-hidden className="text-foreground/40">↗</span>
        </a>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-foreground/85">{summary.overview}</p>

      {summary.stats && summary.stats.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {summary.stats.map((s) => (
            <div key={s.label} className="rounded-md bg-foreground/5 px-3 py-2.5">
              <dt className="text-xs text-foreground/50">{s.label}</dt>
              <dd className="mt-0.5 font-mono text-lg">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Block title="The problem">
        <p className="text-foreground/85">{summary.problem}</p>
      </Block>
      <Block title="Approach">
        <Points items={summary.approach} />
      </Block>
      <Block title="Findings">
        <Points items={summary.findings} />
      </Block>
      {summary.limitations && summary.limitations.length > 0 && (
        <Block title="Limitations">
          <Points items={summary.limitations} />
        </Block>
      )}

      {paper.takeaway && (
        <Block title="My take">
          <p className="text-foreground/85">{paper.takeaway}</p>
        </Block>
      )}

      <p className="mt-12 text-xs text-foreground/45">
        A summary of what the paper itself reports. Read the original for the full argument.
      </p>
    </article>
  );
}
