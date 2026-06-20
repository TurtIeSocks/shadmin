import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { I18nContext, type I18nProvider } from "shadmin-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Wraps an i18n provider so missing-key calls (where `translate(key)` returns
 * the key itself) are captured and surfaced in a floating panel.
 *
 * The panel allows inline editing of captured keys; Export copies a flat JSON
 * patch to the clipboard suitable for merging into a locale file.
 *
 * v1 only sees keys looked up via the React `useTranslate()` hook reachable
 * from this component's subtree.
 *
 * @example
 * <I18nKeyEditor baseProvider={i18nProvider}>
 *   <Resource name="posts" />
 * </I18nKeyEditor>
 */
const I18nKeyEditor = ({
  children,
  baseProvider,
  defaultOpen = true,
  showExport = true,
}: I18nKeyEditorProps) => {
  const [missing, setMissing] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const record = useCallback((key: string) => {
    // Defer the state update: translate() may be called synchronously during
    // a child's render, and setMissing-while-rendering would emit a React
    // warning. queueMicrotask lets the current render finish first.
    queueMicrotask(() => {
      setMissing((cur) => (key in cur ? cur : { ...cur, [key]: "" }));
    });
  }, []);

  const wrapped = useMemo<I18nProvider>(() => {
    return {
      ...baseProvider,
      translate(key: string, options?: Record<string, unknown>) {
        const out = baseProvider.translate(key, options);
        // polyglot returns the key when missing + allowMissing
        if (typeof out === "string" && out === key) {
          record(key);
        }
        return out;
      },
    };
  }, [baseProvider, record]);

  const handleExport = async () => {
    const json = JSON.stringify(
      Object.fromEntries(
        Object.entries(missing).filter(([, v]) => v.trim().length > 0),
      ),
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const entries = Object.entries(missing);

  return (
    <I18nContext.Provider value={wrapped}>
      {children}
      <Card
        data-i18n-panel
        data-open={open ? "true" : "false"}
        className={cn(
          "fixed bottom-4 left-4 z-50 w-96 max-h-[60vh] overflow-y-auto shadow-xl transition",
          !open && "translate-y-[calc(100%+1rem)]",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <CardTitle className="text-sm">
            Missing keys ({entries.length})
          </CardTitle>
          <div className="flex gap-1">
            {showExport && (
              <Button
                size="sm"
                variant="outline"
                data-i18n-export
                onClick={handleExport}
              >
                {copied ? "Copied!" : "Export"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No missing keys captured yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {entries.map(([key, val]) => (
                <li key={key} className="flex flex-col gap-1">
                  <span className="font-mono text-xs">{key}</span>
                  <Input
                    value={val}
                    onChange={(e) =>
                      setMissing((cur) => ({ ...cur, [key]: e.target.value }))
                    }
                    placeholder="Translation…"
                    className="text-xs"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </I18nContext.Provider>
  );
};

interface I18nKeyEditorProps {
  children: ReactNode;
  /** The original i18nProvider being wrapped. */
  baseProvider: I18nProvider;
  /** Initial panel state. */
  defaultOpen?: boolean;
  /** Show the Export-to-clipboard button. */
  showExport?: boolean;
}

export { I18nKeyEditor, type I18nKeyEditorProps };
