import React from "react";
import { CoreAdminContext } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";
import { DiffViewer } from "@/components/extras/diff-viewer";

export default {
  title: "Extras/DiffViewer",
  parameters: { docs: { codePanel: true } },
};

const before = { name: "Notebook", price: 9.99, stock: 12, sku: "NB-001" };
const after = {
  name: "Notebook Pro",
  price: 14.99,
  stock: 12,
  category: "Electronics",
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>{children}</CoreAdminContext>
  </ThemeProvider>
);

export const SideBySide = () => (
  <Wrapper>
    <div className="p-4">
      <DiffViewer before={before} after={after} />
    </div>
  </Wrapper>
);

export const Inline = () => (
  <Wrapper>
    <div className="p-4">
      <DiffViewer before={before} after={after} mode="inline" />
    </div>
  </Wrapper>
);

export const WithLabels = () => (
  <Wrapper>
    <div className="p-4">
      <DiffViewer
        before={before}
        after={after}
        labels={{
          name: "Product Name",
          price: "Unit Price",
          sku: "Stock Code",
          category: "Category",
        }}
      />
    </div>
  </Wrapper>
);

export const WithFormatters = () => (
  <Wrapper>
    <div className="p-4">
      <DiffViewer
        before={{ price: 9.99, tags: ["sale", "new"] }}
        after={{ price: 14.99, tags: ["sale", "featured"] }}
        labels={{ price: "Unit Price", tags: "Tags" }}
        formatters={{
          price: (v) => (typeof v === "number" ? `$${v.toFixed(2)}` : "—"),
          tags: (v) => (Array.isArray(v) ? v.join(", ") : "—"),
        }}
      />
    </div>
  </Wrapper>
);

export const SpecificFields = () => (
  <Wrapper>
    <div className="p-4">
      <DiffViewer
        before={before}
        after={after}
        fields={["name", "price"]}
        labels={{ name: "Product Name", price: "Unit Price" }}
      />
    </div>
  </Wrapper>
);

export const Basic = SideBySide;
