import { LocalesMenuButton } from "shadmin/components/admin";

export default function Example() {
  return (
    <LocalesMenuButton
      languages={[
        { locale: "en", name: "English" },
        { locale: "fr", name: "Français" },
        { locale: "es", name: "Español" },
      ]}
    />
  );
}
