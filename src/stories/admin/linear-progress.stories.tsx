import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { LinearProgress } from "@/components/admin/linear-progress";

export default {
  title: "UI & Layout/LinearProgress",
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
  timeout,
}: {
  theme: "system" | "light" | "dark";
  timeout?: number;
}) => (
  <StoryWrapper theme={theme}>
    <div className="p-8">
      <LinearProgress timeout={timeout} />
    </div>
  </StoryWrapper>
);

Basic.args = {
  theme: "system",
  timeout: 1000,
};

Basic.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
  timeout: {
    type: "number",
  },
};

export const NoDelay = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <div className="p-8">
      <LinearProgress timeout={0} />
    </div>
  </StoryWrapper>
);

NoDelay.args = {
  theme: "system",
};

NoDelay.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
};
