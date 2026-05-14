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
import { useNavigate } from "react-router";
import {
  useGetList,
  useGetRecordRepresentation,
  useGetResourceLabel,
  useResourceDefinitions,
  useTranslate,
  type RaRecord,
} from "ra-core";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  setQuery: (query: string) => void;
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

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const CommandMenuResourceResults = ({
  resource,
  query,
  searchField = "q",
  perPage,
  onSelect,
}: {
  resource: string;
  query: string;
  searchField?: string;
  perPage: number;
  onSelect: () => void;
}) => {
  const navigate = useNavigate();
  const getRepresentation = useGetRecordRepresentation(resource);
  const { data } = useGetList<RaRecord>(
    resource,
    {
      filter: { [searchField]: query },
      pagination: { page: 1, perPage },
    },
    { enabled: query.length > 0 },
  );
  if (!data || data.length === 0) return null;
  return (
    <>
      {data.map((record) => (
        <CommandItem
          key={`${resource}:${record.id}`}
          value={`record:${resource}:${record.id}:${String(getRepresentation(record))}`}
          onSelect={() => {
            navigate(`/${resource}/${record.id}/show`);
            onSelect();
          }}
        >
          {getRepresentation(record)}
        </CommandItem>
      ))}
    </>
  );
};

const CommandMenuRecords = ({
  query,
  resources,
  searchFields,
  perResourceLimit,
  onSelect,
}: {
  query: string;
  resources?: string[];
  searchFields?: Record<string, string>;
  perResourceLimit: number;
  onSelect: () => void;
}) => {
  const definitions = useResourceDefinitions();
  const translate = useTranslate();
  if (!query) return null;
  const allowed = Object.keys(definitions).filter(
    (name) => !resources || resources.includes(name),
  );
  if (allowed.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.records", { _: "Records" })}
    >
      {allowed.map((name) => (
        <CommandMenuResourceResults
          key={name}
          resource={name}
          query={query}
          searchField={searchFields?.[name] ?? "q"}
          perPage={perResourceLimit}
          onSelect={onSelect}
        />
      ))}
    </CommandGroup>
  );
};

const CommandMenuResources = ({
  resources,
  onSelect,
}: {
  resources?: string[];
  onSelect: () => void;
}) => {
  const definitions = useResourceDefinitions();
  const getLabel = useGetResourceLabel();
  const navigate = useNavigate();
  const translate = useTranslate();
  const allowed = Object.keys(definitions).filter(
    (name) => !resources || resources.includes(name),
  );
  if (allowed.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.resources", { _: "Resources" })}
    >
      {allowed.map((name) => (
        <CommandItem
          key={name}
          value={`resource:${name}`}
          onSelect={() => {
            navigate(`/${name}`);
            onSelect();
          }}
        >
          {getLabel(name, 2)}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export const CommandMenu = ({
  hotkey = DEFAULT_HOTKEYS,
  searchDebounceMs = 200,
  perResourceLimit = 5,
  placeholder,
  resources,
  searchFields,
  children,
}: CommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, searchDebounceMs);
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
      setQuery,
      registerCommand,
      unregisterCommand,
      registeredCommands,
    }),
    [isOpen, open, close, toggle, setQuery, registerCommand, unregisterCommand, registeredCommands],
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
  }, []); // handler reads latest hotkey via ref

  return (
    <CommandMenuContext.Provider value={value}>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={placeholder ?? "Search or run a command…"}
        />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandMenuRecords
            query={debouncedQuery}
            resources={resources}
            searchFields={searchFields}
            perResourceLimit={perResourceLimit}
            onSelect={close}
          />
          <CommandMenuResources resources={resources} onSelect={close} />
        </CommandList>
      </CommandDialog>
      {children}
    </CommandMenuContext.Provider>
  );
};
