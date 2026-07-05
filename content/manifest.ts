// Hand-authored file-tree manifest (DESIGN.md §3.2).
// Declares tree order, labels, kinds, and slug → file mapping. Adding a
// content file = adding one node here. A file not listed here is staged.

export type FileKind = "md" | "json" | "tsx" | "txt";

export interface FileNode {
  type: "file";
  kind: FileKind;
  /** Label shown in the tree / tab (VS Code style, with extension). */
  label: string;
  /** Route path. "/" is about.md (DESIGN.md §2.2 — about is the homepage). */
  slug: string;
  /** Path relative to /content (authored files). */
  file?: string;
  /** Path relative to the repo root — real site source, rendered verbatim. */
  source?: string;
  /** Title/description for non-markdown files (md files carry frontmatter). */
  meta?: { title: string; description: string };
}

export interface FolderNode {
  type: "folder";
  label: string;
  children: TreeNode[];
}

export type TreeNode = FileNode | FolderNode;

export const tree: TreeNode[] = [
  { type: "file", kind: "md", label: "about.md", slug: "/", file: "about.md" },
  {
    type: "folder",
    label: "src",
    children: [
      {
        type: "folder",
        label: "components",
        children: [
          {
            type: "file",
            kind: "tsx",
            label: "FileTree.tsx",
            slug: "/src/components/file-tree",
            source: "src/components/FileTree.tsx",
            meta: {
              title: "FileTree.tsx",
              description:
                "The actual source of this site's file tree component — the portfolio contains itself.",
            },
          },
          {
            type: "file",
            kind: "tsx",
            label: "BootScreen.tsx",
            slug: "/src/components/boot-screen",
            source: "src/components/BootScreen.tsx",
            meta: {
              title: "BootScreen.tsx",
              description:
                "The actual source of the git-clone boot animation you saw on load.",
            },
          },
        ],
      },
    ],
  },
  {
    type: "folder",
    label: "projects",
    children: [
      {
        type: "folder",
        label: "mal-athena",
        children: [
          {
            type: "file",
            kind: "md",
            label: "README.md",
            slug: "/projects/mal-athena",
            file: "projects/mal-athena/README.md",
          },
          {
            type: "file",
            kind: "md",
            label: "architecture.md",
            slug: "/projects/mal-athena/architecture",
            file: "projects/mal-athena/architecture.md",
          },
          {
            type: "file",
            kind: "md",
            label: "hardware-selection.md",
            slug: "/projects/mal-athena/hardware-selection",
            file: "projects/mal-athena/hardware-selection.md",
          },
        ],
      },
      {
        type: "folder",
        label: "ask-kiyoko",
        children: [
          {
            type: "file",
            kind: "md",
            label: "README.md",
            slug: "/projects/ask-kiyoko",
            file: "projects/ask-kiyoko/README.md",
          },
          {
            type: "file",
            kind: "md",
            label: "rag-scoping.md",
            slug: "/projects/ask-kiyoko/rag-scoping",
            file: "projects/ask-kiyoko/rag-scoping.md",
          },
        ],
      },
      {
        type: "folder",
        label: "dispatch-ui",
        children: [
          {
            type: "file",
            kind: "md",
            label: "README.md",
            slug: "/projects/dispatch-ui",
            file: "projects/dispatch-ui/README.md",
          },
        ],
      },
    ],
  },
  {
    type: "folder",
    label: "recruiter",
    children: [
      {
        type: "file",
        kind: "json",
        label: "hire_me.json",
        slug: "/recruiter/hire-me",
        file: "recruiter/hire_me.json",
        meta: {
          title: "hire_me.json",
          description:
            "Availability, contact, and interests — machine-readable, recruiter-friendly.",
        },
      },
      {
        type: "file",
        kind: "json",
        label: "skills.json",
        slug: "/recruiter/skills",
        file: "recruiter/skills.json",
        meta: {
          title: "skills.json",
          description:
            "Languages, frameworks, and current focus areas as structured data.",
        },
      },
      {
        type: "file",
        kind: "txt",
        label: "career_path.txt",
        slug: "/recruiter/career-path",
        file: "recruiter/career_path.txt",
        meta: {
          title: "career_path.txt",
          description:
            "Experience timeline — McGregor Allsop, EmpowHERto, Western University.",
        },
      },
    ],
  },
  {
    type: "file",
    kind: "json",
    label: "package.json",
    slug: "/package",
    file: "package.json",
    meta: {
      title: "package.json",
      description:
        "anthony-lam@4.0.0 — skills as dependencies. Run `npm run hire`.",
    },
  },
  {
    type: "file",
    kind: "json",
    label: "package-lock.json",
    slug: "/package-lock",
    file: "package-lock.json",
    meta: {
      title: "package-lock.json",
      description: "Skills locked in through hands-on projects.",
    },
  },
  {
    type: "file",
    kind: "md",
    label: "contact.md",
    slug: "/contact",
    file: "contact.md",
  },
];

/** Depth-first list of all file nodes (drives generateStaticParams + tab labels). */
export function allFiles(nodes: TreeNode[] = tree): FileNode[] {
  return nodes.flatMap((node) =>
    node.type === "file" ? [node] : allFiles(node.children),
  );
}

export function findBySlug(slug: string): FileNode | undefined {
  return allFiles().find((f) => f.slug === slug);
}
