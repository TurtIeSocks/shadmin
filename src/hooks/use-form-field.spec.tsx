import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";
import { useEffect, type PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { FormItemContext, useFormField } from "./use-form-field";

const wrapper =
  (id: string, name: string) =>
  ({ children }: PropsWithChildren) => {
    const FormWrapper = ({ children }: PropsWithChildren) => {
      const methods = useForm({ defaultValues: { [name]: "" } });
      return (
        <FormProvider {...methods}>
          <FormItemContext.Provider value={{ id, name }}>
            {children}
          </FormItemContext.Provider>
        </FormProvider>
      );
    };
    return <FormWrapper>{children}</FormWrapper>;
  };

describe("useFormField", () => {
  it("derives stable ARIA ids from the FormItemContext id", () => {
    const { result } = renderHook(() => useFormField(), {
      wrapper: wrapper("first-name", "firstName"),
    });

    expect(result.current.formItemId).toBe("first-name");
    expect(result.current.formDescriptionId).toBe("first-name-description");
    expect(result.current.formMessageId).toBe("first-name-message");
  });

  it("reports invalid=false and no error when the field is pristine", () => {
    const { result } = renderHook(() => useFormField(), {
      wrapper: wrapper("title", "title"),
    });

    expect(result.current.invalid).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("reflects an error set on the form for the registered field name", async () => {
    const Wrapper = ({ children }: PropsWithChildren) => {
      const methods = useForm({ defaultValues: { title: "" } });
      useEffect(() => {
        methods.setError("title", { type: "manual", message: "required" });
      }, [methods]);
      return (
        <FormProvider {...methods}>
          <FormItemContext.Provider value={{ id: "title", name: "title" }}>
            {children}
          </FormItemContext.Provider>
        </FormProvider>
      );
    };
    const { result } = renderHook(() => useFormField(), { wrapper: Wrapper });

    await expect.poll(() => result.current.invalid).toBe(true);
    expect(result.current.error?.message).toBe("required");
  });
});
