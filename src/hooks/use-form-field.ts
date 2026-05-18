import { createContext, use, useMemo } from "react";
import { useFormContext } from "react-hook-form";

export type FormItemContextValue = {
  id: string;
  name: string;
};

export const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

export const useFormField = () => {
  const { getFieldState, formState } = useFormContext();
  const { id, name } = use(FormItemContext);

  const fieldState = getFieldState(name, formState);

  return useMemo(
    () => ({
      formItemId: id,
      formDescriptionId: `${id}-description`,
      formMessageId: `${id}-message`,
      ...fieldState,
    }),
    [id, fieldState],
  );
};
