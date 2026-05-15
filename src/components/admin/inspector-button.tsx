import { forwardRef, type ComponentProps, type MouseEventHandler } from "react";
import { useTranslate, usePreferencesEditor } from "ra-core";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Icon button that toggles the preferences edit mode on or off.
 *
 * When clicked while edit mode is disabled, calls `enable()` from
 * {@link usePreferencesEditor} which makes every {@link Configurable} in the
 * page show its hover affordance and outline. When clicked while edit mode is
 * enabled, calls `disable()` and clears the currently selected preference key.
 *
 * Renders a ghost icon `<Button>` with a {@link Settings} icon and a tooltip
 * showing the translated label.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/inspector/ Inspector documentation}
 *
 * @example
 * import { InspectorButton } from "@/components/admin";
 *
 * const UserMenu = () => (
 *   <header>
 *     <InspectorButton />
 *   </header>
 * );
 */
export const InspectorButton = forwardRef<
  HTMLButtonElement,
  InspectorButtonProps
>(({ label = "ra.configurable.configureMode", ...props }, ref) => {
  const { enable, disable, setPreferenceKey, isEnabled } =
    usePreferencesEditor();
  const translate = useTranslate();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    props.onClick?.(event);
    if (event.defaultPrevented) return;
    if (isEnabled) {
      disable();
      setPreferenceKey(null);
    } else {
      enable();
    }
  };

  const translatedLabel = translate(label, { _: "Configure mode" });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          aria-label={translatedLabel}
          aria-pressed={isEnabled}
          {...props}
          onClick={handleClick}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{translatedLabel}</TooltipContent>
    </Tooltip>
  );
});

InspectorButton.displayName = "InspectorButton";

export interface InspectorButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "children"
> {
  /** Translation key for the tooltip and aria-label. */
  label?: string;
}
