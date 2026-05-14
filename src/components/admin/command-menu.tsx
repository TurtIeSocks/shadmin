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
  useCanAccess,
  useGetList,
  useGetRecordRepresentation,
  useGetResourceLabel,
  useLogout,
  useRefresh,
  useResourceDefinitions,
  useStore,
  useTranslate,
  type RaRecord,
} from "ra-core";
import { useTheme } from "@/components/admin/use-theme";
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

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export interface RecentEntry {
  type: "record" | "resource";
  resource: string;
  id?: number | string;
  label: string;
  path: string;
}

export const RECENTS_KEY = "command-menu.recents";

const useRecents = (limit: number) => {
  const [recents, setRecents] = useStore<RecentEntry[]>(RECENTS_KEY, []);
  const remember = useCallback(
    (entry: RecentEntry) => {
      setRecents((prev) => {
        const filtered = prev.filter(
          (e) =>
            !(
              e.type === entry.type &&
              e.resource === entry.resource &&
              e.id === entry.id
            ),
        );
        return [entry, ...filtered].slice(0, limit);
      });
    },
    [setRecents, limit],
  );
  return { recents, remember };
};

const CommandMenuRecents = ({
  recents,
  onSelect,
}: {
  recents: RecentEntry[];
  onSelect: (entry: RecentEntry) => void;
}) => {
  const translate = useTranslate();
  if (recents.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.recents", { _: "Recent" })}
    >
      {recents.map((entry) => (
        <CommandItem
          key={`recent:${entry.type}:${entry.resource}:${entry.id ?? ""}`}
          value={`recent:${entry.type}:${entry.resource}:${entry.id ?? ""}`}
          onSelect={() => onSelect(entry)}
        >
          {entry.label}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

const ResourceItemGate = ({
  resource,
  children,
}: {
  resource: string;
  children: ReactNode;
}) => {
  const { canAccess, isPending } = useCanAccess({
    resource,
    action: "list",
  });
  if (isPending || !canAccess) return null;
  return <>{children}</>;
};

const CommandMenuResourceResults = ({
  resource,
  query,
  searchField = "q",
  perPage,
  onSelect,
  remember,
}: {
  resource: string;
  query: string;
  searchField?: string;
  perPage: number;
  onSelect: () => void;
  remember: (entry: RecentEntry) => void;
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
            remember({
              type: "record",
              resource,
              id: record.id,
              label: String(getRepresentation(record)),
              path: `/${resource}/${record.id}/show`,
            });
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
  remember,
}: {
  query: string;
  resources?: string[];
  searchFields?: Record<string, string>;
  perResourceLimit: number;
  onSelect: () => void;
  remember: (entry: RecentEntry) => void;
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
        <ResourceItemGate key={name} resource={name}>
          <CommandMenuResourceResults
            resource={name}
            query={query}
            searchField={searchFields?.[name] ?? "q"}
            perPage={perResourceLimit}
            onSelect={onSelect}
            remember={remember}
          />
        </ResourceItemGate>
      ))}
    </CommandGroup>
  );
};

const CommandMenuResources = ({
  resources,
  onSelect,
  remember,
}: {
  resources?: string[];
  onSelect: () => void;
  remember: (entry: RecentEntry) => void;
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
        <ResourceItemGate key={name} resource={name}>
          <CommandItem
            value={`resource:${name}`}
            onSelect={() => {
              remember({
                type: "resource",
                resource: name,
                label: getLabel(name, 2),
                path: `/${name}`,
              });
              navigate(`/${name}`);
              onSelect();
            }}
          >
            {getLabel(name, 2)}
          </CommandItem>
        </ResourceItemGate>
      ))}
    </CommandGroup>
  );
};

const useBuiltinActions = (): CommandAction[] => {
  const logout = useLogout();
  const refresh = useRefresh();
  const [, setTheme] = useTheme();
  const translate = useTranslate();
  return useMemo(
    () => [
      {
        id: "ra.command.action.refresh",
        label: translate("ra.command.action.refresh", { _: "Refresh data" }),
        group: "actions",
        onSelect: () => refresh(),
      },
      {
        id: "ra.command.action.theme_light",
        label: translate("ra.command.action.theme_light", {
          _: "Switch to light theme",
        }),
        group: "actions",
        onSelect: () => setTheme("light"),
      },
      {
        id: "ra.command.action.theme_dark",
        label: translate("ra.command.action.theme_dark", {
          _: "Switch to dark theme",
        }),
        group: "actions",
        onSelect: () => setTheme("dark"),
      },
      {
        id: "ra.command.action.theme_system",
        label: translate("ra.command.action.theme_system", {
          _: "Use system theme",
        }),
        group: "actions",
        onSelect: () => setTheme("system"),
      },
      {
        id: "ra.command.action.logout",
        label: translate("ra.auth.logout", { _: "Log out" }),
        group: "actions",
        onSelect: () => logout(),
      },
    ],
    [logout, refresh, setTheme, translate],
  );
};

const CommandMenuActions = ({
  extra,
  registered,
  onSelect,
}: {
  extra?: CommandAction[];
  registered: CommandAction[];
  onSelect: () => void;
}) => {
  const translate = useTranslate();
  const builtins = useBuiltinActions();
  const visible = useMemo(
    () =>
      [...builtins, ...(extra ?? []), ...registered].filter(
        (a) => !a.when || a.when(),
      ),
    [builtins, extra, registered],
  );
  if (visible.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.actions", { _: "Actions" })}
    >
      {visible.map((action) => (
        <CommandItem
          key={action.id}
          value={`action:${action.id}`}
          keywords={action.keywords}
          onSelect={async () => {
            try {
              await action.onSelect();
            } finally {
              onSelect();
            }
          }}
        >
          {action.icon ? <action.icon className="size-4" /> : null}
          {action.label}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export const CommandMenu = ({
  hotkey = DEFAULT_HOTKEYS,
  searchDebounceMs = 200,
  perResourceLimit = 5,
  recentsLimit = 10,
  placeholder,
  resources,
  searchFields,
  actions,
  children,
}: CommandMenuProps) => {
  const navigate = useNavigate();
  const { recents, remember } = useRecents(recentsLimit);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, searchDebounceMs);
  const [registeredCommands, setRegisteredCommands] = useState<CommandAction[]>(
    [],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);
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
      <CommandDialog
        open={isOpen}
        onOpenChange={(next) => {
          setIsOpen(next);
          if (!next) setQuery("");
        }}
        title="Command menu"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={placeholder ?? "Search or run a command…"}
        />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {!debouncedQuery && (
            <CommandMenuRecents
              recents={recents}
              onSelect={(entry) => {
                navigate(entry.path);
                close();
              }}
            />
          )}
          <CommandMenuRecords
            query={debouncedQuery}
            resources={resources}
            searchFields={searchFields}
            perResourceLimit={perResourceLimit}
            onSelect={close}
            remember={remember}
          />
          <CommandMenuResources
            resources={resources}
            onSelect={close}
            remember={remember}
          />
          <CommandMenuActions
            extra={actions}
            registered={registeredCommands}
            onSelect={close}
          />
        </CommandList>
      </CommandDialog>
      {children}
    </CommandMenuContext.Provider>
  );
};
