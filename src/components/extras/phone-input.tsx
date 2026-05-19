import type * as React from "react";
import { useEffect, useState } from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * Phone input that stores E.164 (`+14155552671`) and renders a country
 * selector plus a national-format text input.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/phone-input/ PhoneInput documentation}
 *
 * @example
 * import { Edit, SimpleForm, PhoneInput } from '@/components/admin';
 *
 * const CustomerEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <PhoneInput source="phone" defaultCountry="US" />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
function PhoneInput(props: PhoneInputProps) {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    defaultCountry = "US",
    allowedCountries,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const countries = allowedCountries ?? (getCountries() as CountryCode[]);

  const initial = inferCountry(String(field.value ?? ""), defaultCountry);
  const [country, setCountry] = useState<CountryCode>(initial);
  const [display, setDisplay] = useState<string>(
    formatNational(String(field.value ?? ""), country),
  );

  useEffect(() => {
    const c = inferCountry(String(field.value ?? ""), defaultCountry);
    setCountry(c);
    setDisplay(formatNational(String(field.value ?? ""), c));
  }, [field.value, defaultCountry]);

  const writeBack = (nationalText: string, cc: CountryCode) => {
    setDisplay(nationalText);
    try {
      const parsed = parsePhoneNumber(nationalText, cc);
      field.onChange(parsed.number);
    } catch {
      field.onChange(nationalText);
    }
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
        <div className={cn("flex items-center gap-2", className)} {...rest}>
          <select
            data-country-select
            value={country}
            onChange={(e) => {
              const cc = e.target.value as CountryCode;
              setCountry(cc);
              writeBack(display, cc);
            }}
            disabled={disabled}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c} +{getCountryCallingCode(c)}
              </option>
            ))}
          </select>
          <Input
            type="tel"
            value={display}
            disabled={disabled}
            onChange={(e) => {
              const formatter = new AsYouType(country);
              const formatted = formatter.input(e.target.value);
              writeBack(formatted, country);
            }}
            onBlur={field.onBlur}
            className="flex-1"
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

function inferCountry(value: string, fallback: CountryCode): CountryCode {
  try {
    const p = parsePhoneNumber(value);
    if (p.country) return p.country;
  } catch {
    /* ignore */
  }
  return fallback;
}

function formatNational(value: string, country: CountryCode): string {
  try {
    return parsePhoneNumber(value, country).formatNational();
  } catch {
    return value;
  }
}

interface PhoneInputProps
  extends
    InputProps,
    Omit<React.ComponentProps<"div">, "defaultValue" | "onBlur" | "onChange"> {
  defaultCountry?: CountryCode;
  allowedCountries?: readonly CountryCode[];
  disabled?: boolean;
}

export { PhoneInput, type PhoneInputProps };
