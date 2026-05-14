"use client";

import {
  createContext,
  type ComponentType,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UploadIcon } from "lucide-react";
import { useResourceContext, useTranslate } from "ra-core";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useFormContext } from "react-hook-form";
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
  children?: ReactNode;
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

export const useCsvImport = () => {
  const ctx = useContext(CsvImportContext);
  if (!ctx) throw new Error("useCsvImport must be used inside <CsvImport>");
  return ctx;
};

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

const CsvImportUploadStep = () => {
  const { parsedRows, setParsedRows, setHeaders } = useCsvImport();
  const translate = useTranslate();
  const form = useFormContext();
  const [error, setError] = useState<string | null>(null);

  // Keep a ref so the validate closure always reads the current row count
  // without needing to re-register on every parse (avoids infinite effect loops).
  const parsedRowsCountRef = useRef(parsedRows.length);
  parsedRowsCountRef.current = parsedRows.length;

  useEffect(() => {
    if (!form) return;
    form.register("__csv_upload_gate", {
      validate: () => parsedRowsCountRef.current > 0,
    });
    return () => {
      form.unregister("__csv_upload_gate");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

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
        error: (err: Error) => setError(err.message),
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
        <input {...getInputProps()} data-testid="csv-file-input" />
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

const CsvImportMapStep = () => {
  const { schema, headers, mapping, setMapping } = useCsvImport();
  const translate = useTranslate();

  const fields = useMemo(
    () => (schema ? Object.keys(schema.shape) : []),
    [schema],
  );
  const requiredFields = useMemo(
    () =>
      schema
        ? Object.entries(schema.shape)
            .filter(([, def]) => !(def as z.ZodTypeAny).isOptional())
            .map(([k]) => k)
        : [],
    [schema],
  );

  // Auto-match on first render when mapping is empty
  const headersKey = headers.join("|");
  useEffect(() => {
    if (Object.keys(mapping).length > 0 || fields.length === 0) return;
    const next: Record<string, string> = {};
    for (const field of fields) {
      const match = fuzzyMatch(field, headers);
      if (match) next[field] = match;
    }
    if (Object.keys(next).length > 0) setMapping(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headersKey, fields.length]);

  const hasUnmappedRequired = requiredFields.some((f) => !mapping[f]);

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field) => (
        <div key={field} className="grid grid-cols-2 items-center gap-2">
          <label
            htmlFor={`csv-field-${field}`}
            className={`text-sm ${
              requiredFields.includes(field)
                ? "font-medium"
                : "text-muted-foreground"
            }`}
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
            onChange={(e) =>
              setMapping({ ...mapping, [field]: e.target.value })
            }
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
      {hasUnmappedRequired ? (
        <div className="text-sm text-destructive">
          {translate("ra.csv_import.required_unmapped", {
            _: "Required fields are not mapped",
          })}
        </div>
      ) : null}
    </div>
  );
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
                  {v.ok ? "" : (v as Extract<RowValidation, { ok: false }>).issues.join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
  children,
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
            <CsvImportUploadStep />
          </WizardForm.Step>
          <WizardForm.Step label={translate("ra.csv_import.step.map", { _: "Map columns" })}>
            <CsvImportMapStep />
          </WizardForm.Step>
          <WizardForm.Step label={translate("ra.csv_import.step.preview", { _: "Preview" })}>
            <CsvImportPreviewStep />
          </WizardForm.Step>
        </WizardForm>
      ) : null}
      {children}
    </CsvImportContext.Provider>
  );
};
