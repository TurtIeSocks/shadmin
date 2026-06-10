import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  memoryStore,
} from "ra-core";
import { MemoryRouter } from "react-router";
import { Star } from "lucide-react";
import { i18nProvider } from "@/lib/i18n-provider";
import { SimpleListItem, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Display/SimpleListItem",
};

const record = {
  id: 42,
  title: "War and Peace",
  author: "Leo Tolstoy",
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext i18nProvider={i18nProvider} store={memoryStore()}>
        <ResourceContextProvider value="books">
          <RecordContextProvider value={record}>
            <ul className="w-96">{children}</ul>
          </RecordContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <SimpleListItem>
      <div className="flex-1">
        <div className="font-medium">{record.title}</div>
        <div className="text-sm text-muted-foreground">{record.author}</div>
      </div>
    </SimpleListItem>
  </Wrapper>
);

export const WithIcon = () => (
  <Wrapper>
    <SimpleListItem>
      <Star className="size-4" />
      <div className="flex-1">
        <div className="font-medium">{record.title}</div>
        <div className="text-sm text-muted-foreground">{record.author}</div>
      </div>
    </SimpleListItem>
  </Wrapper>
);

export const NoLink = () => (
  <Wrapper>
    <SimpleListItem linkType={false}>
      <div className="flex-1">
        <div className="font-medium">{record.title}</div>
        <div className="text-sm text-muted-foreground">{record.author}</div>
      </div>
    </SimpleListItem>
  </Wrapper>
);

export const ShowLink = () => (
  <Wrapper>
    <SimpleListItem linkType="show">
      <div className="flex-1">
        <div className="font-medium">{record.title}</div>
        <div className="text-sm text-muted-foreground">{record.author}</div>
      </div>
    </SimpleListItem>
  </Wrapper>
);
