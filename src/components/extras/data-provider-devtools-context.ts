import { createContext, useContext } from "react";

export interface DataProviderLog {
  id: number;
  method: string;
  resource: string;
  params: unknown;
  durationMs: number;
  status: "ok" | "error";
  error?: string;
  result?: unknown;
  at: string;
}

export interface DataProviderDevtoolsContextValue {
  logs: DataProviderLog[];
  clear: () => void;
}

export const DataProviderDevtoolsContext =
  createContext<DataProviderDevtoolsContextValue | null>(null);

/**
 * Reads the captured logs from the surrounding `<DataProviderDevtools>`.
 * Returns `null` when not inside a devtools provider.
 */
export function useDataProviderDevtools() {
  return useContext(DataProviderDevtoolsContext);
}
