import { ComponentGallery } from "@/demo/component-gallery/ComponentGallery";
import { CoreAdminContext, TestMemoryRouter } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";

const dataProvider = {
  getList: async () => ({ data: [], total: 0 }),
} as never;

export const CoverageStory = ({ component }: { component: string }) => (
  <TestMemoryRouter>
    <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
      <div className="min-h-screen bg-background p-6 text-foreground">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{component}</h1>
            <p className="text-sm text-muted-foreground">
              Public component coverage entry. Open the demo gallery for grouped
              examples and the docs page for prop-level behavior.
            </p>
          </div>
        </div>
        <ComponentGallery />
      </div>
    </CoreAdminContext>
  </TestMemoryRouter>
);
