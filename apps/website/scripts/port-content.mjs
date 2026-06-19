/**
 * port-content.mjs
 * Ports ~279 Markdown/MDX docs from apps/docs into apps/website src/docs/content/.
 * Also re-runs attr/asset transforms over the 14 existing backbone .mdx files.
 *
 * Run: node scripts/port-content.mjs
 * Test: node --test scripts/port-content.test.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_ROOT = path.resolve(__dirname, "..");
const DOCS_ROOT = path.resolve(WEBSITE_ROOT, "../../apps/docs");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SKIP_SLUGS = new Set([
  "admin",
  "create",
  "data-providers",
  "data-table",
  "edit",
  "install",
  "list",
  "quick-start-guide",
  "resource",
  "security",
  "show",
  "simple-form",
  "theming",
  "translation",
]);

export const DROP_SLUGS = new Set([
  "reference-many-to-many-field-base",
  "auto-persist-in-store-base",
  "reference-many-input-base",
  "reference-many-to-many-input-base",
  "reference-one-input-base",
  "realtime-features",
  "soft-delete-features",
]);

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

/**
 * Transform raw Markdown/MDX content for the website MDX pipeline.
 * All steps are fence-aware: code blocks pass through verbatim.
 *
 * @param {string} raw - source file contents
 * @param {string} slug - file slug (for context; not used in transforms currently)
 * @returns {string} transformed content
 */
export function transformContent(raw, _slug) {
  const lines = raw.split("\n");
  const out = [];

  let inFence = false;
  let inFrontmatter = false;
  let frontmatterDone = false;
  let frontmatterCount = 0;

  // Pass 1: collect asset-import identifiers (ident → /docs/images/rest)
  // We need a full-file scan first to build the map, then process line-by-line.
  /** @type {Map<string, string>} */
  const assetImports = new Map();

  // Scan for asset imports outside fences
  {
    let scanFence = false;
    let scanFM = false;
    let scanFMCount = 0;
    let scanFMDone = false;

    for (const line of lines) {
      // Frontmatter detection
      if (!scanFMDone) {
        if (!scanFM && line.trim() === "---") {
          scanFM = true;
          scanFMCount++;
          continue;
        }
        if (scanFM && line.trim() === "---") {
          scanFMCount++;
          if (scanFMCount >= 2) {
            scanFMDone = true;
            scanFM = false;
          }
          continue;
        }
        if (scanFM) continue; // inside frontmatter
      }

      // Fence toggle
      if (/^\s*```/.test(line)) {
        scanFence = !scanFence;
        continue;
      }
      if (scanFence) continue;

      // Asset import detection: import IDENT from './images/REST';
      const assetMatch = line.match(
        /^import\s+(\w+)\s+from\s+['"]\.\/images\/([^'"]+)['"]\s*;?\s*$/,
      );
      if (assetMatch) {
        const [, ident, rest] = assetMatch;
        assetImports.set(ident, `/docs/images/${rest}`);
      }
    }
  }

  // Pass 2: line-by-line transform
  for (const line of lines) {
    // --- Frontmatter handling ---
    if (!frontmatterDone) {
      if (!inFrontmatter && line.trim() === "---") {
        inFrontmatter = true;
        frontmatterCount++;
        out.push(line);
        continue;
      }
      if (inFrontmatter && line.trim() === "---") {
        frontmatterCount++;
        if (frontmatterCount >= 2) {
          frontmatterDone = true;
          inFrontmatter = false;
        }
        out.push(line);
        continue;
      }
      if (inFrontmatter) {
        out.push(line); // frontmatter body — keep as-is
        continue;
      }
    }

    // --- Fence toggle (outside frontmatter) ---
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }

    // --- Fenced: emit verbatim ---
    if (inFence) {
      out.push(line);
      continue;
    }

    // --- Non-fenced transforms ---

    // Step 3a: Strip Astro-only imports
    if (
      line.includes(
        'import PropsTable from "../../components/props-table.astro"',
      ) ||
      line.includes(
        "import PropsTable from '../../components/props-table.astro'",
      ) ||
      line.includes(
        "import { Tabs, TabItem } from '@astrojs/starlight/components'",
      ) ||
      line.includes(
        'import { Tabs, TabItem } from "@astrojs/starlight/components"',
      )
    ) {
      continue; // strip line
    }

    // Step 3b: Strip asset import lines (already recorded in assetImports)
    if (assetImports.size > 0) {
      const assetImportMatch = line.match(
        /^import\s+(\w+)\s+from\s+['"]\.\/images\/([^'"]+)['"]\s*;?\s*$/,
      );
      if (assetImportMatch && assetImports.has(assetImportMatch[1])) {
        continue; // strip line
      }
    }

    let transformed = line;

    // Step 4: Asset-import inlining — replace {IDENT} with "/docs/images/REST"
    if (assetImports.size > 0) {
      for (const [ident, resolvedPath] of assetImports) {
        // Replace {IDENT} occurrences (in attribute positions or standalone)
        // Use a global replace — handle both src={ident} and standalone {ident}
        transformed = transformed.replaceAll(`{${ident}}`, `"${resolvedPath}"`);
      }
    }

    // Step 5: Asset path rewrite — ./images/ → /docs/images/
    // Markdown links: ](./images/...)
    transformed = transformed.replace(/\]\(\.\/images\//g, "](/docs/images/");
    // HTML src attrs (double-quote and single-quote)
    transformed = transformed.replace(
      /src="\.\/images\//g,
      'src="/docs/images/',
    );
    transformed = transformed.replace(
      /src='\.\/images\//g,
      "src='/docs/images/",
    );

    // Step 6: HTML attr normalization — only on lines containing an HTML open tag
    if (/<[a-z]/.test(transformed)) {
      transformed = normalizeAttrs(transformed);
    }

    out.push(transformed);
  }

  return out.join("\n");
}

/**
 * Normalize JSX-invalid HTML attributes on a single line.
 * Uses word-boundary-style patterns to be idempotent.
 * Only replaces standalone attribute names (preceded by space/start, followed by = or end).
 *
 * @param {string} line
 * @returns {string}
 */
function normalizeAttrs(line) {
  // Each replacement: [pattern, replacement]
  // Ordered so longer matches don't get partially hit by shorter ones.
  const replacements = [
    // class= → className= (word boundary: not preceded by 'e', not followed by 'N' already)
    // Use negative lookbehind for 'e' to avoid hitting 'className' → 'classNameName'
    [/(?<![a-zA-Z])class=/g, "className="],
    // for= → htmlFor= (not preceded by 'l' to avoid 'htmlFor' re-hit)
    [/(?<![a-zA-Z])for=/g, "htmlFor="],
    // autoplay → autoPlay (not preceded by capital P to avoid re-hit)
    [/\bautoplay\b/g, "autoPlay"],
    // playsinline → playsInline
    [/\bplaysinline\b/g, "playsInline"],
    // frameborder → frameBorder
    [/\bframeborder\b/g, "frameBorder"],
    // allowfullscreen → allowFullScreen
    [/\ballowfullscreen\b/g, "allowFullScreen"],
    // srcset → srcSet
    [/\bsrcset\b/g, "srcSet"],
    // tabindex → tabIndex
    [/\btabindex\b/g, "tabIndex"],
    // colspan → colSpan
    [/\bcolspan\b/g, "colSpan"],
    // rowspan → rowSpan
    [/\browspan\b/g, "rowSpan"],
  ];

  let result = line;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const contentSrcFlat = path.join(DOCS_ROOT, "src/content/docs");
  const contentSrcSupabase = path.join(DOCS_ROOT, "src/content/docs/supabase");
  const contentDest = path.join(WEBSITE_ROOT, "src/docs/content");

  const imagesSrc1 = path.join(DOCS_ROOT, "src/content/docs/images");
  const imagesSrc2 = path.join(DOCS_ROOT, "public/images");
  const imagesDest = path.join(WEBSITE_ROOT, "public/docs/images");

  const propsSrc = path.join(DOCS_ROOT, "src/content/docs/props");
  const propsDest = path.join(contentDest, "props");

  // Ensure dest dirs exist
  fs.mkdirSync(path.join(contentDest, "supabase"), { recursive: true });
  fs.mkdirSync(imagesDest, { recursive: true });
  fs.mkdirSync(propsDest, { recursive: true });

  let ported = 0;
  let skipped = 0;
  let dropped = 0;

  // --- Process flat content files ---
  const flatEntries = fs.readdirSync(contentSrcFlat).filter((f) => {
    const ext = path.extname(f);
    return (ext === ".md" || ext === ".mdx") && f !== "supabase";
  });

  for (const entry of flatEntries) {
    const slug = path.basename(entry, path.extname(entry));

    if (SKIP_SLUGS.has(slug)) {
      skipped++;
      continue;
    }
    if (DROP_SLUGS.has(slug)) {
      dropped++;
      continue;
    }

    const raw = fs.readFileSync(path.join(contentSrcFlat, entry), "utf8");
    const transformed = transformContent(raw, slug);
    fs.writeFileSync(
      path.join(contentDest, `${slug}.mdx`),
      transformed,
      "utf8",
    );
    ported++;
  }

  // --- Process supabase content files ---
  const supabaseEntries = fs.readdirSync(contentSrcSupabase).filter((f) => {
    const ext = path.extname(f);
    return ext === ".md" || ext === ".mdx";
  });

  for (const entry of supabaseEntries) {
    const base = path.basename(entry, path.extname(entry));
    const slug = `supabase/${base}`;

    if (SKIP_SLUGS.has(slug) || SKIP_SLUGS.has(base)) {
      skipped++;
      continue;
    }
    if (DROP_SLUGS.has(slug) || DROP_SLUGS.has(base)) {
      dropped++;
      continue;
    }

    const raw = fs.readFileSync(path.join(contentSrcSupabase, entry), "utf8");
    const transformed = transformContent(raw, slug);
    fs.writeFileSync(
      path.join(contentDest, "supabase", `${base}.mdx`),
      transformed,
      "utf8",
    );
    ported++;
  }

  // --- Re-run transforms over existing 14 backbone files ---
  const backboneFiles = fs.readdirSync(contentDest).filter((f) => {
    const ext = path.extname(f);
    return (ext === ".mdx" || ext === ".md") && f !== "supabase";
  });

  for (const f of backboneFiles) {
    const slug = path.basename(f, path.extname(f));
    if (!SKIP_SLUGS.has(slug)) continue; // only backbone
    const fPath = path.join(contentDest, f);
    const raw = fs.readFileSync(fPath, "utf8");
    const transformed = transformContent(raw, slug);
    if (transformed !== raw) {
      fs.writeFileSync(fPath, transformed, "utf8");
    }
  }

  // --- Copy images ---
  // Both sources flatten into same dest (docs/images/)
  let assets = 0;

  if (fs.existsSync(imagesSrc1)) {
    fs.cpSync(imagesSrc1, imagesDest, { recursive: true });
    assets += countFiles(imagesDest);
  }
  if (fs.existsSync(imagesSrc2)) {
    // public/images/** → public/docs/images/**
    fs.cpSync(imagesSrc2, imagesDest, { recursive: true });
  }
  assets = countFiles(imagesDest);

  // --- Copy props ---
  fs.cpSync(propsSrc, propsDest, { recursive: true });
  const props = countFiles(propsDest);

  console.log(
    `ported ${ported}, skipped ${skipped}, dropped ${dropped}, assets ${assets}, props ${props}`,
  );
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

// Run main when invoked directly
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
