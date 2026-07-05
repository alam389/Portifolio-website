import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { findBySlug, type FileNode } from "../../content/manifest";

// The single content seam (DESIGN.md §2.1): fs + gray-matter + unified/shiki,
// all at build time. Markdown renders as prose; json/tsx/txt render as a
// full-file highlighted source view (same shiki pipeline, fenced wrapper).

const CONTENT_DIR = path.join(process.cwd(), "content");

const SOURCE_LANG = { json: "json", tsx: "tsx", txt: "text" } as const;

// Minimal IntelliJ-style TextMate themes (New UI dark / IntelliJ Light) —
// shiki has no JetBrains themes bundled, so we define the token colors inline.
const IJ_DARK = {
  name: "ij-newui-dark",
  type: "dark" as const,
  colors: { "editor.background": "#1e1f22", "editor.foreground": "#bcbec4" },
  settings: [],
  tokenColors: [
    { settings: { foreground: "#bcbec4" } },
    { scope: ["comment"], settings: { foreground: "#7a7e85", fontStyle: "italic" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#6aab73" } },
    { scope: ["constant.numeric"], settings: { foreground: "#2aacb8" } },
    { scope: ["keyword", "storage", "storage.type"], settings: { foreground: "#cf8e6d" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#56a8f5" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"], settings: { foreground: "#ffc66d" } },
    { scope: ["support.type.property-name", "meta.object-literal.key"], settings: { foreground: "#c77dbb" } },
    { scope: ["constant.language", "variable.language"], settings: { foreground: "#c77dbb" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#d5b778" } },
  ],
};

const IJ_LIGHT = {
  name: "ij-light",
  type: "light" as const,
  colors: { "editor.background": "#ffffff", "editor.foreground": "#080808" },
  settings: [],
  tokenColors: [
    { settings: { foreground: "#080808" } },
    { scope: ["comment"], settings: { foreground: "#8c8c8c", fontStyle: "italic" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#067d17" } },
    { scope: ["constant.numeric"], settings: { foreground: "#1750eb" } },
    { scope: ["keyword", "storage", "storage.type"], settings: { foreground: "#0033b3" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#00627a" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"], settings: { foreground: "#000000" } },
    { scope: ["support.type.property-name", "meta.object-literal.key"], settings: { foreground: "#871094" } },
    { scope: ["constant.language", "variable.language"], settings: { foreground: "#871094" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#0033b3" } },
  ],
};

export interface Frontmatter {
  title: string;
  description: string;
}

export interface Page {
  node: FileNode;
  frontmatter: Frontmatter;
  html: string;
}

function filePath(node: FileNode): string {
  return node.source
    ? path.join(process.cwd(), node.source)
    : path.join(CONTENT_DIR, node.file ?? "");
}

export async function getMeta(node: FileNode): Promise<Frontmatter> {
  if (node.kind !== "md") {
    return node.meta ?? { title: node.label, description: "" };
  }
  const raw = await fs.readFile(filePath(node), "utf8");
  return matter(raw).data as Frontmatter;
}

async function renderMarkdown(markdown: string): Promise<string> {
  const out = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      // Dual themes → CSS variables, switched by the .dark class (DESIGN.md §2.4).
      theme: { dark: IJ_DARK, light: IJ_LIGHT },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);
  return String(out);
}

export async function getPage(slug: string): Promise<Page | null> {
  const node = findBySlug(slug);
  if (!node) return null;
  const raw = await fs.readFile(filePath(node), "utf8");

  if (node.kind === "md") {
    const { data, content } = matter(raw);
    return {
      node,
      frontmatter: data as Frontmatter,
      html: await renderMarkdown(content),
    };
  }

  // Source view: wrap the raw file in a fence (5 backticks — survives any
  // inline backticks in the source) and reuse the same pipeline.
  const fenced =
    "`````" + SOURCE_LANG[node.kind] + " showLineNumbers\n" +
    raw.trimEnd() +
    "\n`````";
  return {
    node,
    frontmatter: await getMeta(node),
    html: await renderMarkdown(fenced),
  };
}
