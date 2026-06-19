/**
 * MDX component map — referenced by vite.config.ts `providerImportSource`.
 *
 * @mdx-js/rollup expects this module to export `useMDXComponents`
 * (the standard MDX provider contract).
 */
import type { MDXComponents } from "mdx/types";
import { Link } from "react-router-dom";
import { MdxPre } from "./code-block";
import { Tabs, TabItem } from "./tabs";
import { Callout } from "./callout";
import { PropsTable } from "./props-table";

// ── Link shim: internal → react-router Link, external → <a> ────────────────

function MdxLink({
  href,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"a"> & { href?: string }) {
  const url = href ?? "";
  // Internal = root-relative path (what remark-relative-links produces from
  // `./page`) or an in-page anchor. Everything else — http(s), mailto, and any
  // surviving `../` — goes to a plain <a> (react-router <Link> would mis-resolve
  // `../` against the current route).
  const isInternal = url.startsWith("/") || url.startsWith("#");
  if (isInternal) {
    return (
      <Link to={url} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

// ── Image shim ───────────────────────────────────────────────────────────────

function MdxImg({ src, alt, ...rest }: React.ComponentPropsWithoutRef<"img">) {
  return (
    <img
      src={src}
      alt={alt ?? ""}
      className="my-4 max-w-full rounded-lg border border-border/40"
      loading="lazy"
      {...rest}
    />
  );
}

// ── Inline code (not inside a pre) ──────────────────────────────────────────

function MdxCode({ children, ...rest }: React.ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className="font-mono text-[0.875em] bg-muted/60 rounded px-1.5 py-0.5 text-foreground"
      {...rest}
    >
      {children}
    </code>
  );
}

// ── Component map ────────────────────────────────────────────────────────────

const components: MDXComponents = {
  // HTML overrides
  a: MdxLink,
  img: MdxImg,
  pre: MdxPre,
  code: MdxCode,
  // Starlight-compat global components
  Tabs,
  TabItem,
  Callout,
  PropsTable,
};

/**
 * Required by @mdx-js/rollup `providerImportSource` contract.
 * Downstream MDX files call `useMDXComponents()` to get the map.
 */
export function useMDXComponents(inherited: MDXComponents = {}): MDXComponents {
  return { ...inherited, ...components };
}
