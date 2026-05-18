import React from "react";
import { useForm } from "react-hook-form";
import { CoreAdminContext, Form as RaForm } from "ra-core";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default {
  title: "Data Edition/Form",
};

const RaWrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RaForm record={{ title: "Hello", slug: "" }} onSubmit={() => undefined}>
        {children}
      </RaForm>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <RaWrapper>
    <FormField id="title" name="title">
      <FormLabel>Title</FormLabel>
      <FormControl>
        <Input defaultValue="Hello" />
      </FormControl>
      <FormError />
    </FormField>
  </RaWrapper>
);

export const WithDescription = () => (
  <RaWrapper>
    <FormField id="slug" name="slug">
      <FormLabel>Slug</FormLabel>
      <FormControl>
        <Input placeholder="my-post" />
      </FormControl>
      <FormDescription>
        The unique URL fragment for this resource.
      </FormDescription>
      <FormError />
    </FormField>
  </RaWrapper>
);

export const Standalone = () => {
  const methods = useForm({
    defaultValues: { firstName: "Ada", lastName: "Lovelace" },
  });
  return (
    <ThemeProvider>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(() => undefined)}
          className="flex flex-col gap-4"
        >
          <FormField id="firstName" name="firstName">
            <FormLabel>First name</FormLabel>
            <FormControl>
              <Input {...methods.register("firstName")} />
            </FormControl>
            <FormDescription>Given name.</FormDescription>
            <FormError />
          </FormField>
          <FormField id="lastName" name="lastName">
            <FormLabel>Last name</FormLabel>
            <FormControl>
              <Input {...methods.register("lastName")} />
            </FormControl>
            <FormError />
          </FormField>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </ThemeProvider>
  );
};

export const WithError = () => {
  const methods = useForm({
    defaultValues: { email: "" },
    mode: "onChange",
  });
  React.useEffect(() => {
    methods.setError("email", {
      type: "manual",
      message: "Email is required",
    });
  }, [methods]);
  return (
    <ThemeProvider>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(() => undefined)}
          className="flex flex-col gap-4"
        >
          <FormField id="email" name="email">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...methods.register("email")} />
            </FormControl>
            <FormError />
          </FormField>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </ThemeProvider>
  );
};
