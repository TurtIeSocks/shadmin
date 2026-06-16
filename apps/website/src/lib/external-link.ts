/**
 * Attributes for a link that opens in a new tab without leaking the opener /
 * referrer. Spread onto an anchor: `<a href={…} {...EXTERNAL_LINK}>`.
 */
export const EXTERNAL_LINK = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
