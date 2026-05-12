import React from "react";
import {
  CoreAdminContext,
  Form,
  RecordContextProvider,
  ResourceContextProvider,
  memoryStore,
} from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { useWatch } from "react-hook-form";
import { MemoryRouter } from "react-router";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  DataTable,
  DatagridInput,
  ReferenceArrayInput,
  ThemeProvider,
} from "@/components/admin";

export default {
  title: "Inputs/DatagridInput",
};

const users = [
  { id: 1, firstName: "Ada", lastName: "Lovelace" },
  { id: 2, firstName: "Alan", lastName: "Turing" },
  { id: 3, firstName: "Grace", lastName: "Hopper" },
  { id: 4, firstName: "Linus", lastName: "Torvalds" },
  { id: 5, firstName: "Margaret", lastName: "Hamilton" },
];

const team = { id: 1, name: "Founders", members: [1, 3] };

const dataProvider = fakeRestDataProvider({
  users,
  teams: [team],
});

const FormValues = () => {
  const values = useWatch();
  return (
    <pre className="text-xs bg-muted p-2 rounded mt-4">
      {JSON.stringify(values, null, 2)}
    </pre>
  );
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="teams">
          <RecordContextProvider value={team}>
            <Form record={team}>
              <div className="p-4">{children}</div>
            </Form>
          </RecordContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <DatagridInput source="members" choices={users}>
      <DataTable.Col source="firstName" />
      <DataTable.Col source="lastName" />
    </DatagridInput>
    <FormValues />
  </Wrapper>
);

export const WithReferenceArrayInput = () => (
  <Wrapper>
    <ReferenceArrayInput source="members" reference="users">
      <DatagridInput>
        <DataTable.Col source="firstName" />
        <DataTable.Col source="lastName" />
      </DatagridInput>
    </ReferenceArrayInput>
    <FormValues />
  </Wrapper>
);

export const WithHelperText = () => (
  <Wrapper>
    <DatagridInput
      source="members"
      choices={users}
      helperText="Pick at least one team member"
    >
      <DataTable.Col source="firstName" />
      <DataTable.Col source="lastName" />
    </DatagridInput>
    <FormValues />
  </Wrapper>
);
