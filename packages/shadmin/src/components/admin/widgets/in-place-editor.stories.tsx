import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  memoryStore,
} from "shadmin-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { MemoryRouter } from "react-router";
import { i18nProvider } from "@/lib/i18n-provider";
import { TextField, TextInput, ThemeProvider } from "@/components/admin";
import { InPlaceEditor } from "@/components/admin/widgets/in-place-editor";

export default {
  title: "Extras/InPlaceEditor",
};

const record = {
  id: 1,
  title: "Hello world",
  description: "A short description",
};

const dataProvider = fakeRestDataProvider({ posts: [record] });

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          <RecordContextProvider value={record}>
            <div className="p-4">{children}</div>
          </RecordContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <InPlaceEditor source="title" />
  </Wrapper>
);

export const WithButtons = () => (
  <Wrapper>
    <InPlaceEditor source="title" showButtons cancelOnBlur={false} />
  </Wrapper>
);

export const CustomEditor = () => (
  <Wrapper>
    <InPlaceEditor
      source="description"
      editor={
        <TextInput
          source="description"
          multiline
          rows={3}
          label={false}
          helperText={false}
          autoFocus
        />
      }
    />
  </Wrapper>
);

export const CustomDisplay = () => (
  <Wrapper>
    <InPlaceEditor source="title">
      <TextField source="title" className="text-lg font-semibold" />
    </InPlaceEditor>
  </Wrapper>
);

export const Optimistic = () => (
  <Wrapper>
    <InPlaceEditor source="title" mutationMode="optimistic" />
  </Wrapper>
);
