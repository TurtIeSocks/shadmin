import { useEffect } from "react";

const DEFAULT_TITLE = "Shadmin | Open Source App Components";

/**
 * Sets document.title for the current route. Pass a page name to get
 * "<page> | Shadmin"; pass nothing for the home default.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Shadmin` : DEFAULT_TITLE;
  }, [title]);
}
