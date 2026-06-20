import { createContext, useContext } from "react";

interface DataProviderLog {
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

interface DataProviderDevtoolsContextValue {
  logs: DataProviderLog[];
  clear: () => void;
}

const DataProviderDevtoolsContext =
  createContext<DataProviderDevtoolsContextValue | null>(null);

/**
 * Reads the captured logs from the surrounding `<DataProviderDevtools>`.
 * Returns `null` when not inside a devtools provider.
 */
function useDataProviderDevtools() {
  return useContext(DataProviderDevtoolsContext);
}

export {
  DataProviderDevtoolsContext,
  useDataProviderDevtools,
  type DataProviderLog,
  type DataProviderDevtoolsContextValue,
};
