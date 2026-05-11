import { useState } from "react";
import {
  usePreferencesEditor,
  useTranslate,
  useRemoveItemsFromStore,
  PreferenceKeyContextProvider,
} from "ra-core";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { InspectorRoot } from "./inspector-root";

/**
 * Floating panel that renders the editor of the currently selected
 * {@link Configurable}.
 *
 * Reads `editor`, `title`, `preferenceKey`, and the `isEnabled` flag from
 * {@link usePreferencesEditor}. When `isEnabled` is `false`, this component
 * renders nothing.
 *
 * - The Close button calls `disable()` to exit edit mode.
 * - The Trash button removes every preference under the current key prefix
 *   via {@link useRemoveItemsFromStore} and bumps an internal version counter
 *   so the editor re-mounts and re-reads its defaults.
 *
 * @remarks
 * Deviation from the upstream `ra-ui-materialui` `Inspector`: the panel is
 * pinned to the top-right corner of the viewport. The upstream component is
 * a draggable Material UI dialog whose position is persisted in the store.
 * Drag-and-drop positioning is intentionally omitted here to keep the
 * component shadcn-native.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/inspector/ Inspector documentation}
 *
 * @example
 * import { Inspector, InspectorButton } from "@/components/admin";
 *
 * const Layout = ({ children }) => (
 *   <>
 *     <header>
 *       <InspectorButton />
 *     </header>
 *     {children}
 *     <Inspector />
 *   </>
 * );
 */
export const Inspector = ({ className }: InspectorProps = {}) => {
  const { isEnabled, disable, title, titleOptions, editor, preferenceKey } =
    usePreferencesEditor();
  const removeItems = useRemoveItemsFromStore(preferenceKey);
  const translate = useTranslate();
  const [version, setVersion] = useState(0);

  const handleReset = () => {
    removeItems();
    // force re-mount of the editor so it picks up default values
    setVersion((v) => v + 1);
  };

  if (!isEnabled) return null;

  return (
    <div
      role="dialog"
      aria-label={
        title
          ? translate(title, { _: "Inspector", ...titleOptions })
          : translate("ra.configurable.inspector.title", { _: "Inspector" })
      }
      className={cn(
        "fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]",
        "rounded-md border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
          {title
            ? translate(title, { _: "Inspector", ...titleOptions })
            : translate("ra.configurable.inspector.title", {
                _: "Inspector",
              })}
        </span>
        <div className="flex items-center gap-1">
          {preferenceKey && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={translate("ra.action.remove", { _: "Remove" })}
              onClick={handleReset}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={translate("ra.action.close", { _: "Close" })}
            onClick={disable}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3 max-h-[75vh] overflow-y-auto" key={version}>
        <PreferenceKeyContextProvider value={preferenceKey}>
          {editor ?? <InspectorRoot />}
        </PreferenceKeyContextProvider>
      </div>
    </div>
  );
};

Inspector.displayName = "Inspector";

export interface InspectorProps {
  /** Extra classes appended to the inspector card. */
  className?: string;
}
