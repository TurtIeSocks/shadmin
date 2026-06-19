import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InstallCommands } from "./types";

interface InstallCommandProps {
  install: InstallCommands;
}

type PackageManager = keyof InstallCommands;

const TABS: { key: PackageManager; label: string }[] = [
  { key: "pnpm", label: "pnpm" },
  { key: "npm", label: "npm" },
  { key: "yarn", label: "yarn" },
  { key: "bun", label: "bun" },
];

export function InstallCommand({ install }: InstallCommandProps) {
  const [active, setActive] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);

  const command = install[active];

  function handleCopy() {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border/40 px-1 pt-1 gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors",
              active === tab.key
                ? "bg-foreground/8 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Command + copy */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <code className="text-sm font-mono text-foreground break-all">
          {command}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy install command"
          className={cn(
            "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
            copied
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/8",
          )}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
