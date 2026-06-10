import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  DataProviderContext,
  type DataProvider,
  useDataProvider,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DataProviderDevtoolsContext,
  type DataProviderLog,
} from "./data-provider-devtools-context";

interface DataProviderDevtoolsProps {
  children: ReactNode;
  /** Initial open state. Default `true`. */
  defaultOpen?: boolean;
  /** Maximum logs retained. Default `50`. */
  maxLogs?: number;
  /** Keyboard shortcut to toggle. Default `"ctrl+shift+d"`. */
  keyboardShortcut?: string;
}

/**
 * Wraps the surrounding `<DataProviderContext>` so every call to the data
 * provider is captured and surfaced in a floating panel. Children that read
 * `useDataProvider()` automatically get the tracked instance.
 *
 * @example
 * <DataProviderDevtools>
 *   <List resource="posts">{...}</List>
 * </DataProviderDevtools>
 */
const DataProviderDevtools = ({
  children,
  defaultOpen = true,
  maxLogs = 50,
  keyboardShortcut = "ctrl+shift+d",
}: DataProviderDevtoolsProps) => {
  const base = useDataProvider();
  const [logs, setLogs] = useState<DataProviderLog[]>([]);
  const [open, setOpen] = useState(defaultOpen);
  const idRef = useRef(0);

  const append = useCallback(
    (entry: DataProviderLog) => {
      setLogs((cur) => {
        const next = [...cur, entry];
        return next.length > maxLogs ? next.slice(-maxLogs) : next;
      });
    },
    [maxLogs],
  );

  const wrapped = useMemo<DataProvider>(() => {
    const handler: ProxyHandler<DataProvider> = {
      get(target, prop) {
        const value = (target as unknown as Record<string, unknown>)[
          prop as string
        ];
        if (typeof value !== "function") return value;
        return async (resource: string, params: unknown) => {
          const id = ++idRef.current;
          const t0 = performance.now();
          try {
            const result = await (value as (...args: unknown[]) => unknown)(
              resource,
              params,
            );
            append({
              id,
              method: String(prop),
              resource,
              params,
              status: "ok",
              durationMs: performance.now() - t0,
              result,
              at: new Date().toISOString(),
            });
            return result;
          } catch (err) {
            append({
              id,
              method: String(prop),
              resource,
              params,
              status: "error",
              durationMs: performance.now() - t0,
              error: err instanceof Error ? err.message : String(err),
              at: new Date().toISOString(),
            });
            throw err;
          }
        };
      },
    };
    return new Proxy(base, handler);
  }, [base, append]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const want = parseShortcut(keyboardShortcut);
      if (
        e.ctrlKey === want.ctrl &&
        e.shiftKey === want.shift &&
        e.altKey === want.alt &&
        e.metaKey === want.meta &&
        e.key.toLowerCase() === want.key
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyboardShortcut]);

  return (
    <DataProviderContext.Provider value={wrapped}>
      <DataProviderDevtoolsContext.Provider
        value={{ logs, clear: () => setLogs([]) }}
      >
        {children}
        <Panel
          open={open}
          maxLogs={maxLogs}
          logs={logs}
          onClear={() => setLogs([])}
          onToggle={() => setOpen((o) => !o)}
        />
      </DataProviderDevtoolsContext.Provider>
    </DataProviderContext.Provider>
  );
};

const Panel = ({
  open,
  maxLogs,
  logs,
  onClear,
  onToggle,
}: {
  open: boolean;
  maxLogs: number;
  logs: DataProviderLog[];
  onClear: () => void;
  onToggle: () => void;
}) => {
  return (
    <Card
      data-devtools-panel
      data-open={open ? "true" : "false"}
      data-max-logs={maxLogs}
      className={cn(
        "fixed bottom-4 right-4 z-50 w-96 max-h-[60vh] overflow-y-auto shadow-xl transition",
        !open && "translate-y-[calc(100%+1rem)]",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="text-sm">Data Provider</CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
          <Button size="sm" variant="ghost" onClick={onToggle}>
            {open ? "Hide" : "Show"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No calls yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {logs.map((log) => (
              <li
                key={log.id}
                className={cn(
                  "rounded border p-2 font-mono text-xs",
                  log.status === "error" && "border-red-500/50 bg-red-500/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span>
                    <span className="font-semibold">{log.method}</span>{" "}
                    <span className="text-muted-foreground">
                      {log.resource}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {log.durationMs.toFixed(1)}ms
                  </span>
                </div>
                {log.status === "error" && (
                  <p className="mt-1 text-red-700">{log.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

function parseShortcut(s: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
} {
  const parts = s
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());
  return {
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    key: parts[parts.length - 1],
  };
}

export { type DataProviderDevtoolsProps, DataProviderDevtools };
