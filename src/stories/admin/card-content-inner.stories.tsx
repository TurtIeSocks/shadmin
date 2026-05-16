import { ReactNode } from "react";
import { ThemeProvider } from "@/components/admin";
import { Card } from "@/components/ui/card";
import { CardContentInner } from "@/components/admin/card-content-inner";

export default {
  title: "UI & Layout/CardContentInner",
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
      <Card>
        <CardContentInner>
          <h3 className="text-lg font-semibold">First section</h3>
          <p className="text-sm text-muted-foreground">
            Some content for the first block.
          </p>
        </CardContentInner>
        <CardContentInner>
          <h3 className="text-lg font-semibold">Second section</h3>
          <p className="text-sm text-muted-foreground">
            Some content for the second block.
          </p>
        </CardContentInner>
        <CardContentInner>
          <h3 className="text-lg font-semibold">Third section</h3>
          <p className="text-sm text-muted-foreground">
            Some content for the third block.
          </p>
        </CardContentInner>
      </Card>
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
