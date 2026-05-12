import React from "react";
import { CoreAdminContext, ListContextProvider, useList } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { SingleFieldList, ThemeProvider, TextField } from "@/components/admin";

export default {
  title: "Lists/SingleFieldList",
};

type Tag = { id: number; name: string; color: string };

const tags: Tag[] = [
  { id: 1, name: "React", color: "#61DAFB" },
  { id: 2, name: "TypeScript", color: "#3178C6" },
  { id: 3, name: "Storybook", color: "#FF4785" },
  { id: 4, name: "Vite", color: "#646CFF" },
];

const Wrapper = ({ children }: React.PropsWithChildren) => {
  const listContext = useList({
    data: tags,
  });

  return (
    <ThemeProvider>
      <CoreAdminContext i18nProvider={i18nProvider}>
        <ListContextProvider value={listContext}>
          {children}
        </ListContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  );
};

export const Basic = () => (
  <Wrapper>
    <SingleFieldList />
  </Wrapper>
);

export const WithChildren = () => (
  <Wrapper>
    <SingleFieldList>
      <TextField source="name" />
    </SingleFieldList>
  </Wrapper>
);

export const WithRenderProp = () => (
  <Wrapper>
    <SingleFieldList<Tag>
      render={(record) => (
        <div
          className="px-3 py-1 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: record.color }}
        >
          {record.name}
        </div>
      )}
    />
  </Wrapper>
);

export const NoGap = () => (
  <Wrapper>
    <SingleFieldList className="gap-0" />
  </Wrapper>
);
