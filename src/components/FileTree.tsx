"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  tree,
  type TreeNode,
  type FolderNode,
} from "../../content/manifest";
import { ChevronIcon, FileIcon, FolderIcon } from "./Icons";

// Pragmatic native semantics (DESIGN.md §2.7): files are <a>, folders are
// <button aria-expanded>. No role="tree" / roving tabindex — on purpose.

const INDENT = 12; // px per depth level

export function FileTree({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="font-mono text-[13px] leading-6">
      {tree.map((node) => (
        <Node key={keyOf(node)} node={node} depth={0} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function keyOf(node: TreeNode): string {
  return node.type === "file" ? node.slug : `folder:${node.label}`;
}

// Choreographed load: each node's stagger delay follows visual (depth-first)
// order. Deterministic — same on server and client.
function flatKeys(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) =>
    n.type === "file" ? [keyOf(n)] : [keyOf(n), ...flatKeys(n.children)],
  );
}
const ORDER = flatKeys(tree);
const delayOf = (node: TreeNode) => ORDER.indexOf(keyOf(node)) * 30 + 80;

function Node({
  node,
  depth,
  onNavigate,
}: {
  node: TreeNode;
  depth: number;
  onNavigate?: () => void;
}) {
  if (node.type === "folder") {
    return <Folder node={node} depth={depth} onNavigate={onNavigate} />;
  }
  return <File node={node} depth={depth} onNavigate={onNavigate} />;
}

function File({
  node,
  depth,
  onNavigate,
}: {
  node: Extract<TreeNode, { type: "file" }>;
  depth: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === node.slug;
  return (
    <li>
      <Link
        href={node.slug}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`stagger flex items-center gap-1.5 py-[3px] pr-2 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent ${
          active ? "bg-selection text-foreground" : "text-muted"
        }`}
        style={
          {
            paddingLeft: depth * INDENT + 26,
            "--stagger-delay": `${delayOf(node)}ms`,
          } as React.CSSProperties
        }
      >
        <FileIcon kind={node.kind} className="h-4 w-4 shrink-0" />
        <span className="truncate">{node.label}</span>
      </Link>
    </li>
  );
}

function Folder({
  node,
  depth,
  onNavigate,
}: {
  node: FolderNode;
  depth: number;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(true); // default expanded — recruiter scan
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="stagger flex w-full items-center gap-1 py-[3px] pr-2 text-foreground/90 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        style={
          {
            paddingLeft: depth * INDENT + 6,
            "--stagger-delay": `${delayOf(node)}ms`,
          } as React.CSSProperties
        }
      >
        <ChevronIcon
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform motion-reduce:transition-none ${
            open ? "rotate-90" : ""
          }`}
        />
        <FolderIcon open={open} className="h-4 w-4 shrink-0" />
        <span className="truncate">{node.label}</span>
      </button>
      {open && (
        <ul className="relative">
          {/* indent guide, VS Code style */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 top-0 border-l border-border"
            style={{ left: depth * INDENT + 12 }}
          />
          {node.children.map((child) => (
            <Node
              key={keyOf(child)}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
