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
 * Provides a way to edit multiple languages for any input passed as children.
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
 * Children read from a `SourceContext` that rewrites their `source` prop
 * from `name` to `name.${locale}` automatically — so you can use plain
 * input components such as `<TextInput source="name" />` and the form will
 * write to / read from the correct locale value. Tab panels stay mounted
 * across locale switches so form state is preserved.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/translatableinputs/ TranslatableInputs documentation}
 *
 * @example
 * import { TranslatableInputs, TextInput } from '@/components/admin';
 *
 * <TranslatableInputs locales={['en', 'fr']}>
 *     <TextInput source="title" />
 *     <TextInput source="description" multiline />
 * </TranslatableInputs>
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
 * <TranslatableInputs
 *     locales={['en', 'fr']}
 *     selector={<MyLanguageSelector />}
 * >
 *     <TextInput source="title" />
 * </TranslatableInputs>
 */
export const TranslatableInputs = (props: TranslatableInputsProps) => {
  const {
    className,
    defaultLocale,
    fullWidth,
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
        className={cn(fullWidth ? "w-full" : undefined, className)}
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
  fullWidth?: boolean;
  groupKey?: string;
}
