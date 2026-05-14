import * as React from "react";
import { useFormGroup, useTranslate } from "ra-core";
import { capitalize } from "inflection";

import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Single tab that selects a locale in a `<TranslatableInputs>` component.
 * Highlights in `text-destructive` when its form group has invalid inputs.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/translatableinputs/ TranslatableInputs documentation}
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

export interface TranslatableInputsTabProps extends Omit<
  React.ComponentProps<typeof TabsTrigger>,
  "value"
> {
  groupKey?: string;
  locale: string;
}
