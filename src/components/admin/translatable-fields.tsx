import type { ReactElement, ReactNode } from "react";
import {
  TranslatableContextProvider,
  useRecordContext,
  useResourceContext,
  useTranslatable,
  type RaRecord,
  type UseTranslatableOptions,
} from "ra-core";

import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TranslatableFieldsTabContent } from "@/components/admin/translatable-fields-tab-content";
import { TranslatableFieldsTabs } from "@/components/admin/translatable-fields-tabs";

/**
 * Provides a way to show multiple languages for any field passed as children.
 *
 * Expects the translatable values to have the following structure:
 * ```
 * {
 *   name: {
 *     en: 'The english value',
 *     fr: 'The french value',
 *     tlh: 'The klingon value',
 *   },
 *   description: {
 *     en: 'The english value',
 *     fr: 'The french value',
 *     tlh: 'The klingon value',
 *   }
 * }
 * ```
 *
 * Children read from a fresh `RecordContext` filtered to the active locale,
 * and a `SourceContext` rewrites their `source` prop from `name` to
 * `name.${locale}` automatically — so you can use plain field components
 * such as `<TextField source="name" />` and they will pick the correct
 * locale value.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/translatablefields/ TranslatableFields documentation}
 *
 * @example
 * import { TranslatableFields, TextField } from '@/components/admin';
 *
 * <TranslatableFields locales={['en', 'fr']}>
 *     <TextField source="name" />
 *     <TextField source="description" />
 * </TranslatableFields>
 *
 * @example <caption>With a custom language selector</caption>
 * import { useTranslatableContext } from 'ra-core';
 *
 * const MyLanguageSelector = () => {
 *     const { locales, selectedLocale, selectLocale } = useTranslatableContext();
 *     return (
 *         <select
 *             value={selectedLocale}
 *             onChange={(e) => selectLocale(e.target.value)}
 *         >
 *             {locales.map((locale) => (
 *                 <option key={locale} value={locale}>{locale}</option>
 *             ))}
 *         </select>
 *     );
 * };
 *
 * <TranslatableFields
 *     locales={['en', 'fr']}
 *     selector={<MyLanguageSelector />}
 * >
 *     <TextField source="name" />
 * </TranslatableFields>
 */
export const TranslatableFields = (props: TranslatableFieldsProps) => {
  const {
    defaultLocale,
    locales,
    groupKey = "",
    selector = <TranslatableFieldsTabs groupKey={groupKey} />,
    children,
    className,
    resource: resourceProp,
  } = props;

  const record = useRecordContext(props);
  if (!record) {
    throw new Error(
      `<TranslatableFields> was called outside of a RecordContext and without a record prop. You must set the record prop.`,
    );
  }

  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error(
      `<TranslatableFields> was called outside of a ResourceContext and without a resource prop. You must set the resource prop.`,
    );
  }

  const context = useTranslatable({ defaultLocale, locales });

  return (
    <TranslatableContextProvider value={context}>
      <Tabs
        value={context.selectedLocale}
        onValueChange={context.selectLocale}
        className={cn("w-full", className)}
      >
        {selector}
        {locales.map((locale) => (
          <TranslatableFieldsTabContent
            key={locale}
            locale={locale}
            record={record}
            resource={resourceProp}
            groupKey={groupKey}
          >
            {children}
          </TranslatableFieldsTabContent>
        ))}
      </Tabs>
    </TranslatableContextProvider>
  );
};

export interface TranslatableFieldsProps extends UseTranslatableOptions {
  children: ReactNode;
  className?: string;
  record?: RaRecord;
  resource?: string;
  selector?: ReactElement;
  groupKey?: string;
}
