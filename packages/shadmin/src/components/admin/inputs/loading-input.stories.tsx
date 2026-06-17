import React from "react";
import { CoreAdminContext } from "shadmin-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { LoadingInput, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Edition/LoadingInput",
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <div className="p-4 max-w-md">{children}</div>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <LoadingInput label="Title" />
  </Wrapper>
);

export const WithHelperText = () => (
  <Wrapper>
    <LoadingInput label="Title" helperText="Fetching choices…" />
  </Wrapper>
);

export const FullWidth = () => (
  <Wrapper>
    <LoadingInput label="Title" fullWidth />
  </Wrapper>
);

export const ShortTimeout = () => (
  <Wrapper>
    <LoadingInput label="Loading instantly" timeout={0} />
  </Wrapper>
);
