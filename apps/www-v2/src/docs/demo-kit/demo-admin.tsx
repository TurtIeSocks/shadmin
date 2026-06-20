import { CoreAdminContext } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";
import { seedData } from "./seed";
import type { ReactNode } from "react";

const dataProvider = fakeRestProvider(seedData, false);

// Minimal admin context for inline admin-block previews.
export function DemoAdmin({ children }: { children: ReactNode }) {
  return <CoreAdminContext dataProvider={dataProvider}>{children}</CoreAdminContext>;
}
