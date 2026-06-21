import type { DocGroup, DocNode } from "./types";

export function findGroup(nodes: DocNode[], dir: string): DocGroup | undefined {
  for (const n of nodes) {
    if (n.kind !== "group") continue;
    if (n.dir === dir) return n;
    const found = findGroup(n.children, dir);
    if (found) return found;
  }
  return undefined;
}

/** Prev/next sibling sub-page within `slug`'s parent group. Only meaningful for
 *  split sub-pages, whose parent dir is itself nested (contains a "/"). */
export function prevNext(
  slug: string,
  tree: DocGroup[],
): { prev?: string; next?: string } {
  const parentDir = slug.split("/").slice(0, -1).join("/");
  if (!parentDir.includes("/")) return {}; // section-level page, not a split set
  const group = findGroup(tree, parentDir);
  if (!group) return {};
  const leaves = group.children
    .filter((c): c is import("./types").DocLeaf => c.kind === "leaf")
    .map((c) => c.slug);
  const i = leaves.indexOf(slug);
  if (i === -1) return {};
  const result: { prev?: string; next?: string } = {};
  if (i > 0) result.prev = leaves[i - 1];
  if (i < leaves.length - 1) result.next = leaves[i + 1];
  return result;
}
