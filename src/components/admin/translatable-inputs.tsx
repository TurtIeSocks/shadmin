import type { ReactElement, ReactNode } from "react";
import {
  TranslatableContextProvider,
  useTranslatable,
  type UseTranslatableOptions,
} from "ra-core";

import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TranslatableInputsTabContent } from "@/components/admin/translatable-inputs-tab-content";
import { TranslatableInputsTabs } from "@/components/admin/translatable-inputs-tabs";

/**
 * Edit multiple language values for any input passed as children.
 * Children automatically get their `source` rewritten to `source.${locale}`
 * via a `SourceContext`, so plain `<TextInput source="name" />` works.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/translatableinputs/ TranslatableInputs documentation}
 */
export const TranslatableInputs = (props: TranslatableInputsProps) => {
  const {
    className,
    defaultLocale,
    locales,
    groupKey = "",
    selector = <TranslatableInputsTabs groupKey={groupKey} />,
    children,
  } = props;
  const context = useTranslatable({ defaultLocale, locales });

  return (
    <TranslatableContextProvider value={context}>
      <Tabs
        value={context.selectedLocale}
        onValueChange={context.selectLocale}
        className={cn(className)}
      >
        {selector}
        {locales.map((locale) => (
          <TranslatableInputsTabContent
            key={locale}
            locale={locale}
            groupKey={groupKey}
          >
            {children}
          </TranslatableInputsTabContent>
        ))}
      </Tabs>
    </TranslatableContextProvider>
  );
};

export interface TranslatableInputsProps extends UseTranslatableOptions {
  className?: string;
  selector?: ReactElement;
  children: ReactNode;
  groupKey?: string;
}
