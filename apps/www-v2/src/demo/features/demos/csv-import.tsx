import { z } from "zod";
import { ResourceContextProvider, useNotify, useRefresh } from "shadmin-core";
import { DataTable, List, NumberField } from "shadmin/components/admin";
import { CsvImport, type ImportReport } from "shadmin/components/csv-import";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "shadmin/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shadmin/components/ui/card";
import { FileSpreadsheetIcon } from "lucide-react";

// The shape a row must satisfy to be imported. CsvImport fuzzy-matches CSV
// headers to these field names on the "Map columns" step, then validates each
// row against this schema on the "Preview" step before committing. Optional
// fields (category_id) may be left unmapped; required ones (marked *) cannot.
const ProductSchema = z.object({
  reference: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  category_id: z.coerce.number().int().positive().optional(),
});

// A ready-to-paste sample so the expected columns are unmistakable. The
// dialog's dropzone accepts a real .csv file shaped exactly like this.
const SAMPLE_CSV = `reference,price,stock,category_id
SKU-9001,29.99,120,1
SKU-9002,9.5,0,2
SKU-9003,149,8,3`;

/**
 * CSV Import feature — a live products list with the CsvImport wizard wired to
 * the demo data provider. The 4-step dialog (Upload → Map columns → Preview →
 * Import) parses a CSV, fuzzy-maps its headers onto the schema, validates every
 * row, then bulk-creates the valid ones. On completion the list refreshes so
 * the freshly imported rows appear inline.
 */
export default function CsvImportDemo() {
  const refresh = useRefresh();
  const notify = useNotify();

  const handleComplete = (report: ImportReport) => {
    notify(
      `Imported ${report.created} of ${report.total} rows` +
        (report.failed ? ` (${report.failed} skipped)` : ""),
      { type: report.failed ? "warning" : "success" },
    );
    // CsvImport creates records directly via the data provider; refresh tells
    // the list's query to re-fetch so the new rows show up immediately.
    refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Import products from CSV</CardTitle>
              <CardDescription>
                Upload a spreadsheet, map its columns to product fields, preview
                validation, then bulk-create — all without leaving the list.
              </CardDescription>
            </div>
            {/* CsvImport reads its target resource from context, so wrap the
                button in a ResourceContextProvider for "products". */}
            <ResourceContextProvider value="products">
              <CsvImport
                schema={ProductSchema}
                label="Import CSV"
                icon={FileSpreadsheetIcon}
                onComplete={handleComplete}
              />
            </ResourceContextProvider>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileSpreadsheetIcon className="size-4" />
            <AlertTitle>Expected columns</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <span>
                  <code className="font-medium">reference</code> (text,
                  required), <code className="font-medium">price</code> (number
                  &gt; 0, required), <code className="font-medium">stock</code>{" "}
                  (whole number, required),{" "}
                  <code className="font-medium">category_id</code> (number,
                  optional). Headers are fuzzy-matched, so{" "}
                  <code>Reference</code> or <code>product_ref</code> map onto{" "}
                  <code>reference</code> automatically.
                </span>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                  {SAMPLE_CSV}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* The live target list. List supplies its own resource context and
          paginated query; imported rows land here after the refresh above. */}
      <List
        resource="products"
        perPage={8}
        sort={{ field: "id", order: "DESC" }}
        title={false}
      >
        <DataTable>
          <DataTable.Col source="reference" label="Reference" />
          <DataTable.Col source="price" label="Price">
            <NumberField
              source="price"
              options={{ style: "currency", currency: "USD" }}
            />
          </DataTable.Col>
          <DataTable.Col source="stock" label="Stock" />
          <DataTable.Col
            source="category_id"
            label="Category"
            className="hidden lg:table-cell"
          />
        </DataTable>
      </List>
    </div>
  );
}
