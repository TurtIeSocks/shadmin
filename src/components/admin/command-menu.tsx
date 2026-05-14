"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CommandDialog } from "@/components/ui/command";

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

export interface CommandMenuProps {
  hotkey?: string[] | false;
  resources?: string[];
  searchFields?: Record<string, string>;
  perResourceLimit?: number;
  recentsLimit?: number;
  actions?: CommandAction[];
  placeholder?: string;
  searchDebounceMs?: number;
  groups?: Array<"records" | "resources" | "actions">;
  /**
   * Optional children render inside the CommandMenu's context provider but
   * outside the dialog. Typically used for helper components that need to call
   * `useCommandMenu()` or `useRegisterCommand()`.
   */
  children?: ReactNode;
}

interface CommandMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registerCommand: (action: CommandAction) => void;
  unregisterCommand: (id: string) => void;
  registeredCommands: CommandAction[];
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

const DEFAULT_HOTKEYS = ["mod+k"];

/**
 * Parses a `"mod+k"` style binding and checks whether the given keyboard event
 * matches. `mod` matches `metaKey || ctrlKey`. Bindings without `"mod"` (e.g.
 * `"f1"`) match the bare key regardless of modifier state — be aware of this
 * when registering single-key bindings that overlap with modifier combinations.
 */
const matchesHotkey = (event: KeyboardEvent, binding: string) => {
  const parts = binding.toLowerCase().split("+").map((p) => p.trim());
  const key = parts[parts.length - 1];
  const wantMod = parts.includes("mod");
  const wantShift = parts.includes("shift");
  const wantAlt = parts.includes("alt");
  const modMatches = wantMod ? event.metaKey || event.ctrlKey : true;
  return (
    event.key.toLowerCase() === key &&
    modMatches &&
    event.shiftKey === wantShift &&
    event.altKey === wantAlt
  );
};

export const useCommandMenu = () => {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error(
      "useCommandMenu() must be used inside <CommandMenu>. Mount <CommandMenu /> at the Admin shell first.",
    );
  }
  return ctx;
};

export const CommandMenu = ({
  hotkey = DEFAULT_HOTKEYS,
  children,
}: CommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [registeredCommands, setRegisteredCommands] = useState<CommandAction[]>(
    [],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const registerCommand = useCallback((action: CommandAction) => {
    setRegisteredCommands((prev) => [
      ...prev.filter((a) => a.id !== action.id),
      action,
    ]);
  }, []);
  const unregisterCommand = useCallback((id: string) => {
    setRegisteredCommands((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<CommandMenuContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      registerCommand,
      unregisterCommand,
      registeredCommands,
    }),
    [isOpen, open, close, toggle, registerCommand, unregisterCommand, registeredCommands],
  );

  const hotkeyRef = useRef(hotkey);
  useEffect(() => {
    hotkeyRef.current = hotkey;
  }, [hotkey]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const current = hotkeyRef.current;
      if (current === false || current.length === 0) return;
      if (current.some((b) => matchesHotkey(event, b))) {
        event.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- handler reads latest hotkey via ref

  return (
    <CommandMenuContext.Provider value={value}>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">
        {/* Sub-components added in later tasks */}
      </CommandDialog>
      {children}
    </CommandMenuContext.Provider>
  );
};
