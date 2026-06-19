import React from "react";
import { CoreAdminContext, memoryStore } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { RefreshCcw } from "lucide-react";
import { RefreshIconButton, ThemeProvider } from "@/components/admin";
import { TooltipProvider } from "@/components/ui/tooltip";

export default {
  title: "UI & Layout/RefreshIconButton",
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <TooltipProvider>
        <CoreAdminContext
          i18nProvider={polyglotI18nProvider(
            () => defaultMessages,
            "en",
            undefined,
            { allowMissing: true },
          )}
          store={memoryStore()}
        >
          {children}
        </CoreAdminContext>
      </TooltipProvider>
    </ThemeProvider>
  </MemoryRouter>
);

export const Default = () => (
  <Wrapper>
    <RefreshIconButton />
  </Wrapper>
);

export const CustomLabel = () => (
  <Wrapper>
    <RefreshIconButton label="Reload data" />
  </Wrapper>
);

export const CustomIcon = () => (
  <Wrapper>
    <RefreshIconButton icon={<RefreshCcw />} />
  </Wrapper>
);

export const Basic = Default;
