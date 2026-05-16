"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

export interface CommandAction {
  id: string;
  label: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  group?: "resources" | "records" | "actions" | string;
  keywords?: string[];
  shortcut?: string;
  when?: () => boolean;
  onSelect: () => void | Promise<void>;
}

export interface RecentEntry {
  type: "record" | "resource";
  resource: string;
  id?: number | string;
  label: string;
  path: string;
}

export const RECENTS_KEY = "command-menu.recents";

export interface CommandMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  registerCommand: (action: CommandAction) => void;
  unregisterCommand: (id: string) => void;
  registeredCommands: CommandAction[];
}

export const CommandMenuContext = createContext<CommandMenuContextValue | null>(
  null,
);

export const useCommandMenu = () => {
  const ctx = useContext(CommandMenuContext);
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
export const useRegisterCommand = (action: CommandAction) => {
  const { registerCommand, unregisterCommand } = useCommandMenu();
  useEffect(() => {
    registerCommand(action);
    return () => unregisterCommand(action.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id]);
};
