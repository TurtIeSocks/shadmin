import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { HideOnScroll } from "@/components/admin/hide-on-scroll";

export default {
  title: "Layout/HideOnScroll",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const StoryWrapper = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "system" | "light" | "dark";
}) => <ThemeProvider defaultTheme={theme}>{children}</ThemeProvider>;

export const Basic = ({
  theme,
  threshold,
}: {
  theme: "system" | "light" | "dark";
  threshold?: number;
}) => (
  <StoryWrapper theme={theme}>
    <HideOnScroll threshold={threshold}>
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4">
        Header — hidden on scroll down
      </header>
    </HideOnScroll>
    <div className="p-4 space-y-4">
      {Array.from({ length: 50 }, (_, i) => (
        <p key={i} className="text-muted-foreground">
          Scroll down to hide the header. Scroll up to reveal it. ({i + 1})
        </p>
      ))}
    </div>
  </StoryWrapper>
);

Basic.args = {
  theme: "system",
  threshold: 100,
};

Basic.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
  threshold: {
    type: "number",
  },
};
