import { createContext, useContext } from "react";
import { z } from "zod";

export const CsvImportContext = createContext<CsvImportContextValue | null>(
  null,
);

export interface CsvImportContextValue {
  parsedRows: Array<Record<string, unknown>>;
  setParsedRows: (rows: Array<Record<string, unknown>>) => void;
  headers: string[];
  setHeaders: (h: string[]) => void;
  mapping: Record<string, string>;
  setMapping: (m: Record<string, string>) => void;
  report: ImportReport | null;
  setReport: (r: ImportReport | null) => void;
  schema?: z.ZodObject<z.ZodRawShape>;
  transform?: CsvTransform;
  batchSize: number;
  resource: string;
  onComplete?: (r: ImportReport) => void;
  onError?: (e: Error) => void;
}

export interface ImportReport {
  total: number;
  created: number;
  failed: number;
  errors: Array<{
    rowIndex: number;
    row: Record<string, unknown>;
    reason: string;
  }>;
}

export type CsvTransform = (
  row: Record<string, unknown>,
  index: number,
) => Record<string, unknown>;

export const useCsvImport = () => {
  const ctx = useContext(CsvImportContext);
  if (!ctx) throw new Error("useCsvImport must be used inside <CsvImport>");
  return ctx;
};
