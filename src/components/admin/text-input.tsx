import { X } from "lucide-react";
import type { InputProps } from "ra-core";
import {
  useInput,
  useResourceContext,
  FieldTitle,
  useTranslate,
} from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { sanitizeInputRestProps } from "@/lib/sanitize-input-rest-props";
import { cn } from "@/lib/utils";

type TextInputProps = InputProps & {
  multiline?: boolean;
  inputClassName?: string;
  resettable?: boolean;
} & React.ComponentProps<"textarea"> &
  React.ComponentProps<"input">;

/**
 * Single-line or multiline text input for string values.
 *
 * Use `<TextInput>` for short text fields like titles or names. Set `multiline` to `true`
 * for longer content like descriptions or comments. Wraps shadcn's `<Input>` or `<Textarea>`
 * component depending on the `multiline` prop.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/textinput/ TextInput documentation}
 *
 * @example
 * import { Edit, SimpleForm, TextInput } from '@/components/admin';
 *
 * const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <TextInput source="title" />
 *       <TextInput source="description" multiline rows={4} />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
function TextInput(props: TextInputProps) {
  const resource = useResourceContext(props);
  const {
    label,
    source,
    multiline,
    className,
    inputClassName,
    helperText,
    resettable = false,
    type = "text",
    ...rest
  } = props;
  const { id, field, isRequired } = useInput({ ...props, type });
  const translate = useTranslate();

  const hasValue = field.value != null && field.value !== "";

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    field.onChange("");
  };

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        {multiline ? (
          <Textarea
            {...sanitizeInputRestProps(rest)}
            {...field}
            className={inputClassName}
          />
        ) : resettable ? (
          <div className="relative flex items-center">
            <Input
              {...sanitizeInputRestProps(rest)}
              {...field}
              type={type}
              className={cn(inputClassName, hasValue && "pr-8")}
            />
            {hasValue && (
              <button
                type="button"
                aria-label={translate("ra.action.clear_input_value", {
                  _: "Clear",
                })}
                className="absolute right-2 p-0 text-muted-foreground opacity-50 hover:opacity-100 hover:bg-transparent"
                onClick={handleReset}
                tabIndex={-1}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <Input
            {...sanitizeInputRestProps(rest)}
            {...field}
            type={type}
            className={inputClassName}
          />
        )}
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
}

export { TextInput, type TextInputProps };
