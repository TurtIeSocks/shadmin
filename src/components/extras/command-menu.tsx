"use client";

import {
  type ReactNode,
  useCallback,
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
import { useTheme } from "@/hooks/use-theme";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  CommandMenuContext,
  RECENTS_KEY,
  type CommandAction,
  type CommandMenuContextValue,
  type RecentEntry,
} from "./command-menu-context";

export interface CommandMenuProps {
  hotkey?: string[] | false;
  resources?: string[];
  searchFields?: Record<string, string>;
  perResourceLimit?: number;
  recentsLimit?: number;
  actions?: CommandAction[];
  placeholder?: string;
  searchDebounceMs?: number;
  /**
   * Optional children render inside the CommandMenu's context provider but
   * outside the dialog. Typically used for helper components that need to call
   * `useCommandMenu()` or `useRegisterCommand()`.
   */
  children?: ReactNode;
}

const DEFAULT_HOTKEYS = ["mod+k"];

/**
 * Parses a `"mod+k"` style binding and checks whether the given keyboard event
 * matches. `mod` matches `metaKey || ctrlKey`. Bindings without `"mod"` (e.g.
 * `"f1"`) match the bare key regardless of modifier state — be aware of this
 * when registering single-key bindings that overlap with modifier combinations.
 */
const matchesHotkey = (event: KeyboardEvent, binding: string) => {
  const parts = binding
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());
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

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

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

const Shell = ({
  isMobile,
  isOpen,
  onOpenChange,
  children,
}: {
  isMobile: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) => {
  const translate = useTranslate();
  const title = translate("ra.command.title", { _: "Command menu" });
  const description = translate("ra.command.aria_description", {
    _: "Search or run a command",
  });
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SheetDescription className="sr-only">{description}</SheetDescription>
          <Command>{children}</Command>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange} title={title}>
      {children}
    </CommandDialog>
  );
};

const CommandMenuFooter = () => {
  const translate = useTranslate();
  return (
    <div className="flex items-center justify-end gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
      <KbdGroup>
        <Kbd>↑↓</Kbd>
        <span>
          {translate("ra.command.footer.navigate", { _: "Navigate" })}
        </span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>↵</Kbd>
        <span>{translate("ra.command.footer.select", { _: "Select" })}</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Esc</Kbd>
        <span>{translate("ra.command.footer.close", { _: "Close" })}</span>
      </KbdGroup>
    </div>
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
  const translate = useTranslate();
  const isMobile = useIsMobile();
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

  const handleOpenChange = useCallback((next: boolean) => {
    setIsOpen(next);
    if (!next) setQuery("");
  }, []);

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
    [
      isOpen,
      open,
      close,
      toggle,
      setQuery,
      registerCommand,
      unregisterCommand,
      registeredCommands,
    ],
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
      <Shell
        isMobile={isMobile}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={
            placeholder ??
            translate("ra.command.placeholder", {
              _: "Search or run a command…",
            })
          }
        />
        <CommandList>
          <CommandEmpty>
            {translate("ra.command.empty", { _: "No results." })}
          </CommandEmpty>
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
        <CommandMenuFooter />
      </Shell>
      {children}
    </CommandMenuContext.Provider>
  );
};
