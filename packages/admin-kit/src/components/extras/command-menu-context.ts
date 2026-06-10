"use client";

import { createContext, use, useEffect, type ReactNode } from "react";

interface CommandAction {
  id: string;
  label: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  group?: "resources" | "records" | "actions" | string;
  keywords?: string[];
  shortcut?: string;
  when?: () => boolean;
  onSelect: () => void | Promise<void>;
}

interface RecentEntry {
  type: "record" | "resource";
  resource: string;
  id?: number | string;
  label: string;
  path: string;
}

const RECENTS_KEY = "command-menu.recents";

interface CommandMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  registerCommand: (action: CommandAction) => void;
  unregisterCommand: (id: string) => void;
  registeredCommands: CommandAction[];
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

const useCommandMenu = () => {
  const ctx = use(CommandMenuContext);
  if (!ctx) {
    throw new Error(
      "useCommandMenu() must be used inside <CommandMenu>. Mount <CommandMenu /> at the Admin shell first.",
    );
  }
  return ctx;
};

/**
 * Registers a command action into the nearest `<CommandMenu>` on mount and
 * removes it on unmount. The dep array is intentionally `[action.id]` so the
 * hook does not re-register on every render when callers pass an inline object.
 * Callers are responsible for stabilising dynamic data via `useMemo`/`useCallback`
 * if the action payload (not just `id`) needs to stay fresh.
 */
const useRegisterCommand = (action: CommandAction) => {
  const { registerCommand, unregisterCommand } = useCommandMenu();
  useEffect(() => {
    registerCommand(action);
    return () => unregisterCommand(action.id);
  }, [action.id]);
};

export {
  RECENTS_KEY,
  CommandMenuContext,
  useCommandMenu,
  useRegisterCommand,
  type CommandAction,
  type RecentEntry,
  type CommandMenuContextValue,
};
