/** Shared brand motion ease — matches docs-index.tsx. */
export const ease = "cubic-bezier(0.32,0.72,0,1)";

/** framer-motion tuple form of the same curve. */
export const easeArr = [0.32, 0.72, 0, 1] as const;

/** Canonical external/internal links used across the landing. */
export const links = {
  install: "/docs/getting-started/install",
  demo: "/demo",
  docs: "/docs",
  dataProviders: "/docs/app-config/data-providers",
  github: "https://github.com/TurtIeSocks/shadmin",
} as const;
