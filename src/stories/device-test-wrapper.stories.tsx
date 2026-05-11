import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { DeviceTestWrapper } from "@/components/admin/device-test-wrapper";

export default {
  title: "Layout/DeviceTestWrapper",
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
  width,
}: {
  theme: "system" | "light" | "dark";
  width: "xs" | "sm" | "md" | "lg" | "xl";
}) => (
  <StoryWrapper theme={theme}>
    <DeviceTestWrapper width={width}>
      <div className="border border-dashed border-border p-4">
        Simulated width: <strong>{width}</strong>
      </div>
    </DeviceTestWrapper>
  </StoryWrapper>
);

Basic.args = {
  theme: "system",
  width: "md",
};

Basic.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
  width: {
    type: "select",
    options: ["xs", "sm", "md", "lg", "xl"],
  },
};
