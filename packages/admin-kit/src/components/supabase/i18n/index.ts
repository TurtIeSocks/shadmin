import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultEnglishMessages from "ra-language-english";
import { raSupabaseEnglishMessages } from "./en";
import { raSupabaseFrenchMessages } from "./fr";

export { raSupabaseEnglishMessages, raSupabaseFrenchMessages };

/**
 * Polyglot i18n provider preloaded with the kit's default English
 * messages plus the Supabase-specific `ra-supabase.*` keys.
 *
 * Used as the default i18nProvider in `<AdminGuesser>` when the
 * consumer does not pass one. Override by passing an `i18nProvider`
 * prop to `<AdminGuesser>` (e.g. one that merges French messages too).
 */
const defaultSupabaseI18nProvider = polyglotI18nProvider(
  () => ({
    ...defaultEnglishMessages,
    ...raSupabaseEnglishMessages,
  }),
  "en",
  [{ name: "en", value: "English" }],
  { allowMissing: true },
);

export { defaultSupabaseI18nProvider };
