import { useTranslatableContext } from "ra-core";

import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TranslatableFieldsTab } from "@/components/admin/translatable-fields-tab";

/**
 * Default locale selector for the `<TranslatableFields>` component.
 *
 * Reads the list of locales from the `TranslatableContext` and renders one
 * `<TranslatableFieldsTab>` per locale, wrapped in a shadcn `<TabsList>`.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/translatablefields/ TranslatableFields documentation}
 *
 * @example
 * <TranslatableFields
 *     locales={['en', 'fr']}
 *     selector={<TranslatableFieldsTabs />}
 * >
 *     <TextField source="name" />
 * </TranslatableFields>
 */
export const TranslatableFieldsTabs = (props: TranslatableFieldsTabsProps) => {
  const { groupKey, className } = props;
  const { locales } = useTranslatableContext();

  return (
    <TabsList
      className={cn("w-full justify-start rounded-b-none h-auto", className)}
    >
      {locales.map((locale) => (
        <TranslatableFieldsTab
          key={locale}
          locale={locale}
          groupKey={groupKey}
        />
      ))}
    </TabsList>
  );
};

export interface TranslatableFieldsTabsProps {
  groupKey?: string;
  className?: string;
}
