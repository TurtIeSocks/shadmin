import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { ReferenceError } from "@/components/admin/reference-error";

export default {
  title: "Input/ReferenceError",
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
    <div className="p-8 max-w-md">
      <ReferenceError
        label="Author"
        error={new Error("Failed to load reference 'authors'")}
      />
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
