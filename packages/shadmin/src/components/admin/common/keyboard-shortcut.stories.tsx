import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { KeyboardShortcut } from "@/components/admin/common/keyboard-shortcut";

export default {
  title: "UI & Layout/KeyboardShortcut",
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
  keyboardShortcut,
}: {
  theme: "system" | "light" | "dark";
  keyboardShortcut: string;
}) => (
  <StoryWrapper theme={theme}>
    <div className="p-8">
      <KeyboardShortcut keyboardShortcut={keyboardShortcut} />
    </div>
  </StoryWrapper>
);

Basic.args = {
  theme: "system",
  keyboardShortcut: "mod+k",
};

Basic.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
  keyboardShortcut: {
    type: "string",
  },
};

export const Sequence = ({ theme }: { theme: "system" | "light" | "dark" }) => (
  <StoryWrapper theme={theme}>
    <div className="p-8">
      <KeyboardShortcut keyboardShortcut="shift+ctrl+a>b" />
    </div>
  </StoryWrapper>
);

Sequence.args = {
  theme: "system",
};

Sequence.argTypes = {
  theme: {
    type: "select",
    options: ["light", "dark", "system"],
  },
};
