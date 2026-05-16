import { ThemeProvider, defaultTheme } from "@/components/admin";
import { ThemeStudio } from "@/components/extras/theme-studio";

export default {
  title: "Extras/ThemeStudio",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Background sample text — edit the variables to preview changes live.
      </p>
      <ThemeStudio theme={defaultTheme} />
    </div>
  </ThemeProvider>
);

export const ColorOnly = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Filtered to color variables only.
      </p>
      <ThemeStudio theme={defaultTheme} filter="color" />
    </div>
  </ThemeProvider>
);

export const SizeOnly = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Filtered to size variables (rem / px / %).
      </p>
      <ThemeStudio theme={defaultTheme} filter="size" />
    </div>
  </ThemeProvider>
);

export const NoExport = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Export button hidden via <code>showExport=false</code>.
      </p>
      <ThemeStudio theme={defaultTheme} showExport={false} />
    </div>
  </ThemeProvider>
);
