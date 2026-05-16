import React from "react";
import { CoreAdminContext, Form, RecordContextProvider } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import { ImageInput, ImageField, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Edition/ImageInput",
};

const record = {
  id: 1,
  title: "Data Edition/ImageInput",
  picture: {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop",
    title: "Data Edition/ImageInput",
  },
  pictures: [
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop",
      title: "Data Edition/ImageInput",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop&sat=-100",
      title: "Data Edition/ImageInput",
    },
  ],
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={record}>
        <Form>{children}</Form>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <ImageInput source="picture" />
  </Wrapper>
);

export const Multiple = () => (
  <Wrapper>
    <ImageInput source="pictures" multiple />
  </Wrapper>
);

export const WithCustomChild = () => (
  <Wrapper>
    <ImageInput source="pictures" multiple>
      <ImageField
        source="src"
        title="title"
        className="[&_img]:h-32 [&_img]:w-32 [&_img]:rounded-md [&_img]:object-cover"
      />
    </ImageInput>
  </Wrapper>
);

export const WithLabel = () => (
  <Wrapper>
    <ImageInput source="pictures" multiple label="Product photos" />
  </Wrapper>
);

export const WithHelperText = () => (
  <Wrapper>
    <ImageInput
      source="pictures"
      multiple
      helperText="JPG or PNG, up to 5MB each"
    />
  </Wrapper>
);
