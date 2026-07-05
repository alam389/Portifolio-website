import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allFiles, findBySlug } from "../../../content/manifest";
import { getMeta, getPage } from "@/lib/content";
import { MarkdownPane } from "@/components/MarkdownPane";
import { Minimap } from "@/components/Minimap";

// Optional catch-all: every manifest file becomes a static route (DESIGN.md §2.2).
// "/" resolves to about.md; unknown slugs 404.

interface Props {
  params: Promise<{ slug?: string[] }>;
}

const toSlug = (parts?: string[]) => "/" + (parts?.join("/") ?? "");

export const dynamicParams = false;

export function generateStaticParams() {
  return allFiles().map((f) => ({
    slug: f.slug === "/" ? [] : f.slug.slice(1).split("/"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = toSlug((await params).slug);
  const node = findBySlug(slug);
  if (!node) return {};
  const fm = await getMeta(node);
  return {
    // "/" omits title → falls back to the layout default (profile-derived).
    ...(slug === "/" ? {} : { title: fm.title }),
    description: fm.description,
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const slug = toSlug((await params).slug);
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <div
      className={`content-enter relative px-6 py-8 md:px-16 md:py-10 ${
        page.node.kind === "md" ? "gutter" : ""
      }`}
    >
      <Minimap />
      <MarkdownPane html={page.html} />
    </div>
  );
}
