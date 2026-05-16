import { Ready } from "@/components/admin/ready";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default {
  title: "UI & Layout/Ready",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

/**
 * The Ready component is a splash screen shown when an Admin has no Resources.
 *
 * It provides quick links to documentation, demo, and GitHub. The component
 * is self-contained and renders no chrome (no theme/i18n/router context
 * required), so the story can render it directly inside a ThemeProvider for
 * consistent styling.
 *
 * Use this story to verify the layout/text/gradient renders correctly when
 * an Admin is bootstrapped without any `<Resource>` children.
 */
export const Basic = () => (
  <ThemeProvider>
    <Ready />
  </ThemeProvider>
);

export const Dark = () => (
  <ThemeProvider defaultTheme="dark">
    <Ready />
  </ThemeProvider>
);

export const Light = () => (
  <ThemeProvider defaultTheme="light">
    <Ready />
  </ThemeProvider>
);
