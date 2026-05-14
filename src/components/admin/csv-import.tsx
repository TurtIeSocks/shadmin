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
            <div>Upload step (Task 2)</div>
          </WizardForm.Step>
        </WizardForm>
      ) : null}
      {children}
    </CsvImportContext.Provider>
  );
};
