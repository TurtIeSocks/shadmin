import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { Placeholder } from "@/components/admin/placeholder";

export default {
  title: "UI & Layout/Placeholder",
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

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <div className="p-8 space-y-2">
      <Placeholder className="w-24" />
      <Placeholder className="w-48" />
      <Placeholder className="w-64" />
    </div>
  </StoryWrapper>
);

Basic.args = {
  theme: "system",
};

Basic.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
};
