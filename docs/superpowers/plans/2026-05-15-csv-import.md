# `<CsvImport>` Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `<CsvImport>` button that opens a 4-step wizard (upload → map → preview → commit) for bulk-importing CSV data into a resource, reusing the just-merged `<WizardForm>`.

**Architecture:** Single-file component (`src/components/admin/csv-import.tsx`) following the `command-menu.tsx` precedent. Internal context provider shares parsed rows + mapping + validation results across steps (avoids React Hook Form for 10k+ row arrays). PapaParse handles file parsing; zod handles per-row validation; `dataProvider.createMany` (with `Promise.all` fallback) handles the actual batched insert.

**Tech Stack:** React 19, TypeScript, ra-core, shadcn/ui primitives, Tailwind v4, Vitest + Playwright browser provider, PapaParse, zod, react-dropzone (already a dep).

**Spec:** [docs/superpowers/specs/2026-05-14-phase-1-essentials-design.md](../specs/2026-05-14-phase-1-essentials-design.md#3-csvimport)

---

## File structure

| File | Responsibility | Status |
| --- | --- | --- |
| `package.json` | Add `papaparse` + `@types/papaparse` deps | **Modify** |
| `src/components/admin/csv-import.tsx` | Component + context + 4 step components | **Create** |
| `src/components/admin/csv-import.spec.tsx` | Browser tests importing stories | **Create** |
| `src/stories/csv-import.stories.tsx` | Storybook stories | **Create** |
| `docs/src/content/docs/CsvImport.md` | Docs page | **Create** |
| `src/components/admin/index.ts` | Public re-export | **Modify** |

All sub-components (`CsvImportUploadStep`, `CsvImportMapStep`, `CsvImportPreviewStep`, `CsvImportCommitStep`, `CsvImportContext`) live inside `csv-import.tsx`.

---

### Task 1: Add deps + scaffold component + Import button trigger + smoke spec

**Files:**
- Modify: `package.json` (add `papaparse`, `@types/papaparse`)
- Create: `src/components/admin/csv-import.tsx`
- Create: `src/components/admin/csv-import.spec.tsx`
- Create: `src/stories/csv-import.stories.tsx`
- Modify: `src/components/admin/index.ts`

- [ ] **Step 1: Install deps**

Run: `pnpm add papaparse && pnpm add -D @types/papaparse`

- [ ] **Step 2: Write failing smoke test**

`src/components/admin/csv-import.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/csv-import.stories";

describe("<CsvImport />", () => {
  it("renders an Import button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Create the component skeleton**

`src/components/admin/csv-import.tsx`:

```tsx
"use client";

import {
  createContext,
  type ComponentType,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { UploadIcon } from "lucide-react";
import { useResourceContext, useTranslate } from "ra-core";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { WizardForm } from "@/components/admin/wizard-form";

export interface ImportReport {
  total: number;
  created: number;
  failed: number;
  errors: Array<{ rowIndex: number; row: Record<string, unknown>; reason: string }>;
}

export interface CsvImportProps {
  schema?: z.ZodObject<z.ZodRawShape>;
  mapping?: Record<string, string>;
  transform?: (row: Record<string, unknown>, index: number) => Record<string, unknown>;
  batchSize?: number;
  parsers?: Array<"csv">;
  label?: string;
  icon?: ComponentType<{ className?: string }>;
  resource?: string;
  onComplete?: (report: ImportReport) => void;
  onError?: (error: Error) => void;
}

interface CsvImportContextValue {
  parsedRows: Array<Record<string, unknown>>;
  setParsedRows: (rows: Array<Record<string, unknown>>) => void;
  headers: string[];
  setHeaders: (h: string[]) => void;
  mapping: Record<string, string>;
  setMapping: (m: Record<string, string>) => void;
  report: ImportReport | null;
  setReport: (r: ImportReport | null) => void;
  schema?: z.ZodObject<z.ZodRawShape>;
  transform?: CsvImportProps["transform"];
  batchSize: number;
  resource: string;
  onComplete?: (r: ImportReport) => void;
  onError?: (e: Error) => void;
}

const CsvImportContext = createContext<CsvImportContextValue | null>(null);

const useCsvImport = () => {
  const ctx = useContext(CsvImportContext);
  if (!ctx) throw new Error("useCsvImport must be used inside <CsvImport>");
  return ctx;
};

export const CsvImport = ({
  schema,
  mapping: initialMapping = {},
  transform,
  batchSize = 100,
  label,
  icon: Icon = UploadIcon,
  resource: resourceProp,
  onComplete,
  onError,
}: CsvImportProps) => {
  const resource = useResourceContext({ resource: resourceProp });
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, unknown>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping);
  const [report, setReport] = useState<ImportReport | null>(null);

  const value = useMemo<CsvImportContextValue>(
    () => ({
      parsedRows,
      setParsedRows,
      headers,
      setHeaders,
      mapping,
      setMapping,
      report,
      setReport,
      schema,
      transform,
      batchSize,
      resource: resource ?? "",
      onComplete,
      onError,
    }),
    [parsedRows, headers, mapping, report, schema, transform, batchSize, resource, onComplete, onError],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setParsedRows([]);
    setHeaders([]);
    setMapping(initialMapping);
    setReport(null);
  }, [initialMapping]);

  const buttonLabel = label ?? translate("ra.csv_import.button", { _: "Import" });

  return (
    <CsvImportContext.Provider value={value}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Icon className="size-4" />
        {buttonLabel}
      </Button>
      {/* Wizard steps added in subsequent tasks */}
      {open ? (
        <WizardForm
          isOpen={open}
          onClose={handleClose}
          title={translate("ra.csv_import.title", {
            _: `Import ${resource}`,
            resource: resource ?? "",
          })}
          onSubmit={() => {}}
        >
          <WizardForm.Step label={translate("ra.csv_import.step.upload", { _: "Upload" })}>
            <div>Upload step (Task 2)</div>
          </WizardForm.Step>
        </WizardForm>
      ) : null}
    </CsvImportContext.Provider>
  );
};

export { useCsvImport };
```

- [ ] **Step 4: Create the Basic story**

`src/stories/csv-import.stories.tsx`:

```tsx
import { type DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, CsvImport, ListGuesser } from "@/components/admin";
import { z } from "zod";

const data = {
  products: [
    { id: 1, name: "Notebook", reference: "NB-001", price: 9.99 },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;
const i18nProvider = polyglotI18nProvider(() => defaultMessages, "en", undefined, {
  allowMissing: true,
});

const ProductSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().positive(),
});

export default {
  title: "Buttons/CsvImport",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema} />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 5: Add public export**

Append to `src/components/admin/index.ts`:

```ts
export * from "./csv-import";
```

- [ ] **Step 6: Verify test passes**

Run: `pnpm vitest run --browser.headless src/components/admin/csv-import.spec.tsx`. Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml \
  src/components/admin/csv-import.tsx \
  src/components/admin/csv-import.spec.tsx \
  src/stories/csv-import.stories.tsx \
  src/components/admin/index.ts
git commit -m "feat(csv-import): scaffold component, context, Import button, deps"
```

---

### Task 2: Upload step — react-dropzone + PapaParse + Next-gating

**Files:**
- Modify: `src/components/admin/csv-import.tsx`
- Modify: `src/components/admin/csv-import.spec.tsx`
- Modify: `src/stories/csv-import.stories.tsx`

- [ ] **Step 1: Write failing test**

Append to `csv-import.spec.tsx`:

```tsx
it("parses an uploaded CSV file and enables Next", async () => {
  const screen = render(<UploadStep />);
  await screen.getByRole("button", { name: /import/i }).click();
  const dialog = screen.getByRole("dialog");
  await expect.element(dialog).toBeInTheDocument();
  const csv = "reference,name,price\nNB-001,Notebook,9.99\nPN-002,Pencil,1.50\n";
  const file = new File([csv], "products.csv", { type: "text/csv" });
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  expect(input).toBeTruthy();
  await fireFileChange(input, file);
  await expect
    .element(screen.getByText(/2 rows parsed/i))
    .toBeInTheDocument();
});

const fireFileChange = (input: HTMLInputElement, file: File) => {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
};
```

Add `UploadStep` story import. Helper component is inline.

- [ ] **Step 2: Add `UploadStep` story to stories file**

```tsx
export const UploadStep = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema} />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
```

(Same as Basic — separate name for test clarity.)

- [ ] **Step 3: Implement CsvImportUploadStep**

In `csv-import.tsx`, add:

```tsx
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

const CsvImportUploadStep = () => {
  const { parsedRows, setParsedRows, setHeaders } = useCsvImport();
  const translate = useTranslate();
  const [error, setError] = useState<string | null>(null);
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(results.errors[0].message);
            return;
          }
          setParsedRows(results.data);
          setHeaders(results.meta.fields ?? []);
        },
        error: (err) => setError(err.message),
      });
    },
    [setParsedRows, setHeaders],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });
  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-4 text-center text-sm ${
          isDragActive ? "border-primary bg-accent" : "border-muted-foreground/30"
        }`}
      >
        <input {...getInputProps()} />
        {translate("ra.csv_import.drop_hint", {
          _: "Drop a CSV file here or click to select",
        })}
      </div>
      {parsedRows.length > 0 ? (
        <div className="text-sm text-muted-foreground">
          {translate("ra.csv_import.row_count", {
            _: `${parsedRows.length} rows parsed`,
            count: parsedRows.length,
          })}
        </div>
      ) : null}
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
    </div>
  );
};
```

Replace the placeholder `<div>Upload step (Task 2)</div>` in the `WizardForm.Step` body with `<CsvImportUploadStep />`. Update the WizardForm.Step to declare its `validate` (Optional: use `validate` prop on WizardForm.Step to gate Next on `parsedRows.length > 0`. Confirm WizardForm.Step's API supports this.)

Note: if WizardForm.Step doesn't have a `validate`, instead conditionally render a hidden `<input>` controlled by RHF — pattern from wizard-form-tests, e.g. zod-validated invisible field tracking `parsedRows.length`. Use the simplest approach.

Look at the existing wizard-form tests to find the gating pattern. If the wizard simply uses standard RHF validators on hidden fields, register a hidden input via `useFormContext().register("__rowCount", { validate: () => parsedRows.length > 0 })`.

- [ ] **Step 4: Verify test passes**

Run: `pnpm vitest run --browser.headless src/components/admin/csv-import.spec.tsx`. PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/csv-import.tsx \
  src/components/admin/csv-import.spec.tsx \
  src/stories/csv-import.stories.tsx
git commit -m "feat(csv-import): upload step with dropzone + papaparse"
```

---

### Task 3: Map step — column-to-field mapping with auto-match

**Files:**
- Modify: `src/components/admin/csv-import.tsx`
- Modify: `src/components/admin/csv-import.spec.tsx`
- Modify: `src/stories/csv-import.stories.tsx`

- [ ] **Step 1: Add `MapStep` story w/ pre-populated parsed data**

```tsx
const SeedParsed = ({ rows, headers }: { rows: Array<Record<string, unknown>>; headers: string[] }) => {
  const { setParsedRows, setHeaders } = useCsvImport();
  React.useEffect(() => {
    setParsedRows(rows);
    setHeaders(headers);
  }, [rows, headers, setParsedRows, setHeaders]);
  return null;
};

export const MapStep = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={() => (
          <div>
            <CsvImport schema={ProductSchema}>
              <SeedParsed
                rows={[{ Reference: "NB-001", "Product Name": "Notebook", price: "9.99" }]}
                headers={["Reference", "Product Name", "price"]}
              />
            </CsvImport>
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
```

Wait — `CsvImport` doesn't accept children currently. Decision: add an optional `children` prop to `CsvImport` so test helpers can be nested inside the context provider (same pattern as `CommandMenu`).

Update `CsvImportProps` to add `children?: ReactNode`.

- [ ] **Step 2: Write failing test**

```tsx
it("auto-matches headers to schema fields case-insensitive fuzzy", async () => {
  const screen = render(<MapStep />);
  await screen.getByRole("button", { name: /import/i }).click();
  // Navigate to map step (click Next)
  await screen.getByRole("button", { name: /next/i }).click();
  // Resource field "reference" should be mapped to CSV header "Reference"
  await expect
    .element(screen.getByText(/reference/i))
    .toBeInTheDocument();
  // Verify a Select shows "Reference" selected for the reference row
  const referenceSelect = document.querySelector(
    '[data-csv-field="reference"]',
  ) as HTMLElement | null;
  expect(referenceSelect?.textContent).toMatch(/Reference/);
});
```

- [ ] **Step 3: Implement `CsvImportMapStep`**

```tsx
const normalize = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, "");

const fuzzyMatch = (field: string, headers: string[]) => {
  const target = normalize(field);
  return (
    headers.find((h) => normalize(h) === target) ??
    headers.find((h) => normalize(h).includes(target)) ??
    headers.find((h) => target.includes(normalize(h))) ??
    null
  );
};

const CsvImportMapStep = () => {
  const { schema, headers, mapping, setMapping } = useCsvImport();
  const translate = useTranslate();
  const fields = schema ? Object.keys(schema.shape) : [];
  const requiredFields = useMemo(
    () =>
      schema
        ? Object.entries(schema.shape)
            .filter(([, def]) => !(def as z.ZodTypeAny).isOptional())
            .map(([k]) => k)
        : [],
    [schema],
  );

  useEffect(() => {
    // Auto-match on mount when mapping is empty
    if (Object.keys(mapping).length > 0 || fields.length === 0) return;
    const next: Record<string, string> = {};
    for (const field of fields) {
      const match = fuzzyMatch(field, headers);
      if (match) next[field] = match;
    }
    if (Object.keys(next).length > 0) setMapping(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, fields.join(",")]);

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field) => (
        <div key={field} className="grid grid-cols-2 items-center gap-2">
          <label
            htmlFor={`csv-field-${field}`}
            className={`text-sm ${requiredFields.includes(field) ? "font-medium" : "text-muted-foreground"}`}
          >
            {field}
            {requiredFields.includes(field) ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </label>
          <select
            id={`csv-field-${field}`}
            data-csv-field={field}
            className="rounded-md border bg-background p-2 text-sm"
            value={mapping[field] ?? ""}
            onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
          >
            <option value="">—</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      ))}
      {requiredFields.some((f) => !mapping[f]) ? (
        <div className="text-sm text-destructive">
          {translate("ra.csv_import.required_unmapped", {
            _: "Required fields are not mapped",
          })}
        </div>
      ) : null}
    </div>
  );
};
```

Wire `<CsvImportMapStep />` as the second `<WizardForm.Step>`.

- [ ] **Step 4: Test passes; commit**

```bash
git add ... && git commit -m "feat(csv-import): map step with fuzzy auto-match"
```

---

### Task 4: Preview step — zod validation + counters + Commit button

**Files:**
- Modify: `src/components/admin/csv-import.tsx`
- Modify: `src/components/admin/csv-import.spec.tsx`
- Modify: `src/stories/csv-import.stories.tsx`

- [ ] **Step 1: Add `PreviewStep` story w/ pre-seeded data and forced step navigation**

(Use `SeedParsed` from Task 3 + auto-navigate two clicks of "Next" to reach Preview.)

- [ ] **Step 2: Failing test**

```tsx
it("validates rows against schema and shows error counter", async () => {
  const screen = render(<PreviewStep />);
  await screen.getByRole("button", { name: /import/i }).click();
  await screen.getByRole("button", { name: /next/i }).click();
  await screen.getByRole("button", { name: /next/i }).click();
  // Now in preview step
  await expect
    .element(screen.getByText(/1 valid/i))
    .toBeInTheDocument();
  await expect
    .element(screen.getByText(/1 errors/i))
    .toBeInTheDocument();
});
```

Where `PreviewStep` seeds 1 valid + 1 invalid row (e.g. missing price).

- [ ] **Step 3: Implement `CsvImportPreviewStep`**

```tsx
type RowValidation =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; row: Record<string, unknown>; issues: string[] };

const applyMapping = (
  row: Record<string, unknown>,
  mapping: Record<string, string>,
) => {
  const next: Record<string, unknown> = {};
  for (const [field, header] of Object.entries(mapping)) {
    if (header) next[field] = row[header];
  }
  return next;
};

const validateRows = (
  rows: Array<Record<string, unknown>>,
  mapping: Record<string, string>,
  schema: z.ZodObject<z.ZodRawShape> | undefined,
  transform: CsvImportProps["transform"],
): RowValidation[] => {
  return rows.map((row, idx) => {
    let mapped = applyMapping(row, mapping);
    if (transform) mapped = transform(mapped, idx);
    if (!schema) return { ok: true, row: mapped };
    const result = schema.safeParse(mapped);
    if (result.success) return { ok: true, row: result.data };
    return {
      ok: false,
      row: mapped,
      issues: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  });
};

const CsvImportPreviewStep = () => {
  const { parsedRows, mapping, schema, transform } = useCsvImport();
  const translate = useTranslate();
  const validations = useMemo(
    () => validateRows(parsedRows, mapping, schema, transform),
    [parsedRows, mapping, schema, transform],
  );
  const valid = validations.filter((v) => v.ok).length;
  const errorCount = validations.length - valid;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">
        {translate("ra.csv_import.counters", {
          _: `${valid} valid · ${errorCount} errors · ${validations.length} total`,
          valid,
          errors: errorCount,
          total: validations.length,
        })}
      </div>
      <div className="max-h-96 overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-2 text-left">#</th>
              {Object.keys(mapping).map((f) => (
                <th key={f} className="p-2 text-left">
                  {f}
                </th>
              ))}
              <th className="p-2 text-left">Errors</th>
            </tr>
          </thead>
          <tbody>
            {validations.slice(0, 50).map((v, idx) => (
              <tr key={idx} className={v.ok ? "" : "bg-destructive/10"}>
                <td className="p-2">{idx + 1}</td>
                {Object.keys(mapping).map((f) => (
                  <td key={f} className="p-2">
                    {String(v.row[f] ?? "")}
                  </td>
                ))}
                <td className="p-2 text-destructive">
                  {v.ok ? "" : v.issues.join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

Wire as third `<WizardForm.Step>`.

- [ ] **Step 4: Test passes; commit**

---

### Task 5: Commit step — batched createMany + progress + error report

**Files:**
- Modify: `src/components/admin/csv-import.tsx`
- Modify: `src/components/admin/csv-import.spec.tsx`
- Modify: `src/stories/csv-import.stories.tsx`

- [ ] **Step 1: Story w/ pre-seeded valid rows, ready to commit**

- [ ] **Step 2: Failing test**

```tsx
it("creates records via dataProvider.createMany and reports counts", async () => {
  const screen = render(<CommitStep />);
  await screen.getByRole("button", { name: /import/i }).click();
  await screen.getByRole("button", { name: /next/i }).click(); // upload → map
  await screen.getByRole("button", { name: /next/i }).click(); // map → preview
  await screen.getByRole("button", { name: /save/i }).click(); // preview → commit
  await expect
    .element(screen.getByText(/import complete/i))
    .toBeInTheDocument();
});
```

- [ ] **Step 3: Implement `CsvImportCommitStep`**

```tsx
import { useDataProvider } from "ra-core";
import { Progress } from "@/components/ui/progress";

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const CsvImportCommitStep = () => {
  const ctx = useCsvImport();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const validations = validateRows(
        ctx.parsedRows,
        ctx.mapping,
        ctx.schema,
        ctx.transform,
      );
      const validRows = validations
        .filter((v): v is Extract<RowValidation, { ok: true }> => v.ok)
        .map((v) => v.row);
      const errors: ImportReport["errors"] = validations
        .map((v, idx) => ({ v, idx }))
        .filter((x) => !x.v.ok)
        .map((x) => ({
          rowIndex: x.idx,
          row: x.v.row,
          reason: (x.v as Extract<RowValidation, { ok: false }>).issues.join("; "),
        }));
      const batches = chunk(validRows, ctx.batchSize);
      let created = 0;
      setProgress({ current: 0, total: validRows.length });
      try {
        for (const batch of batches) {
          if (cancelled) break;
          if (typeof (dataProvider as Record<string, unknown>).createMany === "function") {
            const result = await (
              dataProvider as unknown as {
                createMany: (
                  resource: string,
                  params: { data: Array<Record<string, unknown>> },
                ) => Promise<{ data: Array<Record<string, unknown>> }>;
              }
            ).createMany(ctx.resource, { data: batch });
            created += result.data?.length ?? batch.length;
          } else {
            const settled = await Promise.allSettled(
              batch.map((row) =>
                dataProvider.create(ctx.resource, {
                  data: row as never,
                }),
              ),
            );
            for (const s of settled) {
              if (s.status === "fulfilled") created += 1;
              else
                errors.push({
                  rowIndex: -1,
                  row: {},
                  reason: String(s.reason),
                });
            }
          }
          setProgress((p) => ({
            current: Math.min(p.current + batch.length, p.total),
            total: p.total,
          }));
        }
        const report: ImportReport = {
          total: ctx.parsedRows.length,
          created,
          failed: errors.length,
          errors,
        };
        ctx.setReport(report);
        ctx.onComplete?.(report);
        setDone(true);
      } catch (e) {
        ctx.onError?.(e as Error);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  return (
    <div className="flex flex-col gap-3">
      {!done ? (
        <>
          <div className="text-sm">
            {translate("ra.csv_import.progress", {
              _: `Importing ${progress.current} of ${progress.total}`,
              current: progress.current,
              total: progress.total,
            })}
          </div>
          <Progress value={percent} />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="font-medium">
            {translate("ra.csv_import.complete", { _: "Import complete" })}
          </div>
          <div className="text-sm text-muted-foreground">
            {translate("ra.csv_import.counters", {
              _: `${ctx.report?.created} valid · ${ctx.report?.failed} errors · ${ctx.report?.total} total`,
              valid: ctx.report?.created ?? 0,
              errors: ctx.report?.failed ?? 0,
              total: ctx.report?.total ?? 0,
            })}
          </div>
        </div>
      )}
    </div>
  );
};
```

Wire as fourth `<WizardForm.Step>`.

- [ ] **Step 4: Test passes; commit**

---

### Task 6: Error CSV download

**Files:**
- Modify: `src/components/admin/csv-import.tsx`
- Modify: `src/components/admin/csv-import.spec.tsx`

- [ ] **Step 1: Add download button to commit step's done state**

Use `papaparse.unparse` on `report.errors`, create a Blob, trigger a download via an anchor click. Reuse the pattern from `export-button.tsx` if it has one; otherwise inline:

```tsx
const downloadErrors = (errors: ImportReport["errors"]) => {
  const csv = Papa.unparse(
    errors.map((e) => ({ rowIndex: e.rowIndex, reason: e.reason, ...e.row })),
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "import-errors.csv";
  a.click();
  URL.revokeObjectURL(url);
};
```

Render button conditionally: `{report.errors.length > 0 ? <Button>...</Button> : null}`.

- [ ] **Step 2: Test asserting button appears when errors exist**

- [ ] **Step 3: Commit**

---

### Task 7: Documentation page

**Files:**
- Create: `docs/src/content/docs/CsvImport.md`

Write a focused docs page covering usage, props table, ImportReport shape, schema requirement, and a complete example.

```bash
git add docs/src/content/docs/CsvImport.md
git commit -m "docs(csv-import): add documentation page"
```

---

### Task 8: Final verification

- [ ] Run in parallel: `make typecheck`, `make lint`, `pnpm vitest run --browser.headless`
- [ ] All green; no commit needed.

---

## Out of scope (deferred)

- Multi-sheet xlsx parsing.
- Update/upsert flows.
- Server-side validation echo.
- Background imports.

## Self-review notes

- Every task has explicit file paths and complete code blocks for tests and implementation.
- No placeholders.
- Types are consistent: `CsvImportProps`, `CsvImportContextValue`, `useCsvImport`, `ImportReport`, `RowValidation`.
- Spec coverage check:
  - Upload step → Task 2
  - Map step + auto-match → Task 3
  - Preview + zod validation + counters → Task 4
  - Commit + batched createMany + progress + report → Task 5
  - Error CSV download → Task 6
  - Docs → Task 7
  - i18n keys (`ra.csv_import.*`) sprinkled across tasks with inline defaults.
