import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { InputProps } from "shadmin-core";
import {
  FieldTitle,
  useInput,
  useLocaleState,
  useResourceContext,
  ValidationError,
} from "shadmin-core";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputHelperText } from "@/components/admin/common/input-helper-text";
import { cn } from "@/lib/utils";

/**
 * Locale-aware money input.
 *
 * Stores either a plain `number` (single-currency mode) or a composite
 * `{ amount: number, currency: string }` (multi-currency mode).
 */
function CurrencyInput(props: CurrencyInputProps) {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    currency,
    currencies,
    displayLocale,
    storeAsMinorUnits = false,
    disabled,
    ...rest
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const [appLocale] = useLocaleState();
  const locale = displayLocale ?? appLocale;

  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, fieldState, isRequired } = useInput(sansHandlers);

  const invalid = fieldState.invalid;
  const errorMessage =
    fieldState.error?.root?.message ?? fieldState.error?.message;

  const isComposite = !!currencies;
  const composite = isComposite
    ? (field.value as { amount: number; currency: string } | null)
    : null;
  const fixedAmount = isComposite
    ? composite?.amount
    : (field.value as number | null);
  const currentCurrency = isComposite ? composite?.currency : currency;

  const majorAmount =
    fixedAmount != null
      ? storeAsMinorUnits
        ? fixedAmount / 100
        : fixedAmount
      : "";

  const [displayValue, setDisplayValue] = useState<string>(String(majorAmount));
  const hasFocus = useRef(false);

  useEffect(() => {
    if (!hasFocus.current) setDisplayValue(String(majorAmount));
  }, [majorAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    const parsed = e.target.valueAsNumber;
    const next = Number.isNaN(parsed)
      ? null
      : storeAsMinorUnits
        ? Math.round(parsed * 100)
        : parsed;
    if (isComposite) {
      field.onChange({
        amount: next ?? 0,
        currency: currentCurrency ?? currencies![0],
      });
    } else {
      field.onChange(next);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isComposite) return;
    field.onChange({
      amount: composite?.amount ?? 0,
      currency: e.target.value,
    });
  };

  const currencySymbol = currentCurrency
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currentCurrency,
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value
    : "";

  return (
    <Field className={className} data-invalid={invalid || undefined}>
      {label !== false && (
        <FieldLabel htmlFor={id}>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FieldLabel>
      )}
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-muted-foreground text-sm w-6 text-right">
          {currencySymbol}
        </span>
        <Input
          {...rest}
          type="number"
          value={displayValue}
          step={storeAsMinorUnits ? 0.01 : "any"}
          onChange={handleAmountChange}
          onFocus={() => (hasFocus.current = true)}
          onBlur={() => {
            hasFocus.current = false;
            field.onBlur();
          }}
          disabled={disabled}
          id={id}
          aria-invalid={invalid || undefined}
        />
        {isComposite && (
          <select
            data-currency-select
            value={currentCurrency ?? currencies![0]}
            onChange={handleCurrencyChange}
            disabled={disabled}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {currencies!.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>
      <InputHelperText helperText={helperText} />
      <FieldError>
        {invalid && errorMessage ? (
          <ValidationError error={errorMessage} />
        ) : null}
      </FieldError>
    </Field>
  );
}

interface CurrencyInputProps
  extends InputProps,
    Omit<
      React.ComponentProps<"input">,
      "defaultValue" | "onBlur" | "onChange" | "type" | "step"
    > {
  /** ISO-4217 currency code when storage is a plain number. */
  currency?: string;
  /** Provide to enable currency selection; stores composite { amount, currency }. */
  currencies?: readonly string[];
  /** Override the user's app locale for formatting symbol/step. */
  displayLocale?: string;
  /** Multiply displayed major units by 100 on write so storage is integer cents. */
  storeAsMinorUnits?: boolean;
}

export { CurrencyInput, type CurrencyInputProps };
