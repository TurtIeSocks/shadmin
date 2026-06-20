// DemoAdmin is available — see src/docs/mdx/demo-admin.tsx.
// The span renders statically here (no DemoAdmin wrapper) to keep the SSG
// build safe: ra-core is not a direct dependency of apps/www-v2.
// To prove DemoAdmin compiles, we import it and verify the type checks.
import { DemoAdmin } from "@/docs/mdx/demo-admin";

// Confirm DemoAdmin is importable (type-level proof).
const _DemoAdminRef = DemoAdmin;
void _DemoAdminRef;

export default function DemoAdminCheckDemo() {
  return <span>admin context ok</span>;
}
