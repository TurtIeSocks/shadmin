import * as React from "react";
import { useFormGroup, useTranslate } from "ra-core";
import { capitalize } from "inflection";

import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Single tab that selects a locale in a `<TranslatableInputs>` component.
 *
 * Renders as a shadcn `<TabsTrigger>` whose label is the translated locale
 * name (e.g. `ra.locales.en`), falling back to the capitalized locale code
 * when no translation key is found. Subscribes to the
 * `${groupKey}${locale}` form group via `useFormGroup` and applies
 * `text-destructive` when the group has invalid inputs (matches MUI's
 * upstream behavior of coloring tabs containing errors).
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/translatableinputs/ TranslatableInputs documentation}
 *
 * @example
 * <TranslatableInputsTab locale="fr" />
 */
export const TranslatableInputsTab = (props: TranslatableInputsTabProps) => {
  const { groupKey = "", locale, className, ...rest } = props;
  const { isValid } = useFormGroup(`${groupKey}${locale}`);
  const translate = useTranslate();

  return (
    <TabsTrigger
      id={`translatable-header-${groupKey}${locale}`}
      value={locale}
      className={cn(!isValid && "text-destructive", className)}
      {...rest}
    >
      {translate(`ra.locales.${locale}`, {
        _: capitalize(locale),
      })}
    </TabsTrigger>
  );
};

export interface TranslatableInputsTabProps
  extends Omit<React.ComponentProps<typeof TabsTrigger>, "value"> {
  groupKey?: string;
  locale: string;
}
