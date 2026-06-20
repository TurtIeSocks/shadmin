/**
 * DemoAdmin — thin wrapper that provides a minimal ra-core admin context
 * for component previews in the docs site.
 *
 * NOTE: ra-core is not a direct dependency of apps/www-v2. To use DemoAdmin
 * in demos, ra-core must be available (e.g. via the shadmin workspace package).
 * For SSG-safe demos, prefer rendering the component directly without DemoAdmin
 * and importing DemoAdmin lazily if needed.
 *
 * This file is exported so demos CAN import it, but the _demo-admin-check demo
 * renders the span statically to stay build-safe.
 */
import type { ReactNode } from "react";

interface DemoAdminProps {
  children: ReactNode;
}

/**
 * Stub DemoAdmin for www-v2. Provides no real ra-core context — it exists as
 * a lightweight wrapper that can be augmented once ra-core is added to www-v2's
 * dependencies. For now, it renders children as-is.
 */
export function DemoAdmin({ children }: DemoAdminProps) {
  return <>{children}</>;
}

export default DemoAdmin;
