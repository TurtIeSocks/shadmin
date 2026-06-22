import {
  RecordContextProvider,
  ResourceContextProvider,
  useTranslate,
} from "shadmin-core";
import {
  LocalesMenuButton,
  SimpleForm,
  TextInput,
  TranslatableInputs,
} from "shadmin/components/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "shadmin/components/ui/card";

// Sample record whose translatable fields carry per-locale values. The
// TranslatableInputs block below renders one en/fr tab pair per field.
const sampleProduct = {
  id: 1,
  reference: "Abstract Sunset",
  description: {
    en: "A bold abstract poster in warm tones. Ships rolled in a sturdy tube.",
    fr: "Une affiche abstraite audacieuse aux tons chauds. Livrée roulée dans un tube solide.",
  },
  width: {
    en: "Print size and framing options",
    fr: "Format d'impression et options d'encadrement",
  },
};

const LOCALES = [
  { locale: "en", name: "English" },
  { locale: "fr", name: "Français" },
];

// Panel of standard ra.* keys resolved through useTranslate(). Every label
// here re-renders when the locale flips, so it doubles as a live proof that
// the switch took effect across the whole interface (not just this demo).
function TranslatedLabels() {
  const translate = useTranslate();
  const rows: [string, string][] = [
    ["ra.action.save", translate("ra.action.save")],
    ["ra.action.edit", translate("ra.action.edit")],
    ["ra.action.delete", translate("ra.action.delete")],
    ["ra.action.create", translate("ra.action.create")],
    ["ra.action.export", translate("ra.action.export")],
    ["ra.action.search", translate("ra.action.search")],
    ["ra.navigation.next", translate("ra.navigation.next")],
    ["ra.navigation.previous", translate("ra.navigation.previous")],
    ["ra.message.loading", translate("ra.message.loading")],
    ["ra.boolean.true", translate("ra.boolean.true")],
  ];
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rows.map(([key, value]) => (
        <div
          key={key}
          className="flex items-baseline justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2"
        >
          <dt className="font-mono text-xs text-muted-foreground">{key}</dt>
          <dd className="text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * I18N feature — locale switching (English / Français).
 *
 * A LocalesMenuButton in the header flips the active locale for the whole
 * subtree. Two surfaces react to the change:
 *  - the ra.* keyword panel, resolved live through useTranslate();
 *  - a TranslatableInputs form block, which exposes one tab per locale so the
 *    per-language values of a record's fields are edited side by side.
 */
export default function I18nDemo() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Internationalization</h2>
          <p className="text-sm text-muted-foreground">
            Switch the locale with the menu on the right — every label below
            updates instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border px-2 py-1">
          <span className="text-xs text-muted-foreground">Locale</span>
          <LocalesMenuButton languages={LOCALES} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interface strings</CardTitle>
        </CardHeader>
        <CardContent>
          <TranslatedLabels />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Per-locale content (TranslatableInputs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceContextProvider value="products">
            <RecordContextProvider value={sampleProduct}>
              <SimpleForm toolbar={null}>
                <TranslatableInputs locales={["en", "fr"]}>
                  <TextInput source="description" multiline />
                  <TextInput source="width" label="Caption" />
                </TranslatableInputs>
              </SimpleForm>
            </RecordContextProvider>
          </ResourceContextProvider>
        </CardContent>
      </Card>
    </div>
  );
}
