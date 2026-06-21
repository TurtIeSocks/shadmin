import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "shadmin/components/ui/breadcrumb";
import { navTree } from "./nav-content";
import type { DocGroup, DocNode } from "./types";

/** Walk the tree to find the group containing `slug` and the matching leaf/group. */
function findBreadcrumb(
  slug: string,
): { section: DocGroup; page: DocNode } | null {
  for (const section of navTree) {
    for (const child of section.children) {
      if (child.kind === "leaf" && child.slug === slug) {
        return { section, page: child };
      }
      if (child.kind === "group") {
        // Check group index slug
        if (child.indexSlug === slug || child.dir === slug) {
          return { section, page: child };
        }
        // Check group children
        for (const grandchild of child.children) {
          if (grandchild.kind === "leaf" && grandchild.slug === slug) {
            return { section, page: grandchild };
          }
        }
      }
    }
    // Check if slug matches the section index
    if (section.indexSlug === slug || section.dir === slug) {
      return { section, page: section };
    }
  }
  return null;
}

interface DocsBreadcrumbProps {
  /** Active doc slug (e.g. "getting-started/install") */
  slug: string;
}

export function DocsBreadcrumb({ slug }: DocsBreadcrumbProps) {
  if (!slug) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Documentation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const found = findBreadcrumb(slug);
  if (!found) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/docs">Docs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const { section, page } = found;
  const isSection = page === section;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/docs">{section.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {!isSection && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
