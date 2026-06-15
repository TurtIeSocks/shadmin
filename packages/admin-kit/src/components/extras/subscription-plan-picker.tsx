import type { InputProps } from "ra-core";
import {
  FieldTitle,
  useInput,
  useResourceContext,
  ValidationError,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputHelperText } from "@/components/admin/input-helper-text";
import type { SubscriptionPlan } from "./subscription-plan-field";
import { cn } from "@/lib/utils";

/**
 * Card-grid plan picker. One card per `plans` entry, clicking a card writes
 * its `id` to the form field. Highlights the current plan and (optionally)
 * a recommended plan.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/subscription-plan-picker SubscriptionPlanPicker documentation}
 *
 * @example
 * import { SubscriptionPlanPicker } from '@/components/admin';
 *
 * <SubscriptionPlanPicker
 *   source="planId"
 *   plans={PLANS}
 *   recommendedPlanId="pro"
 * />
 */
function SubscriptionPlanPicker(props: SubscriptionPlanPickerProps) {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    plans,
    recommendedPlanId,
    disabled,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const { onChange: _stripChange, onBlur: _stripBlur, ...sansHandlers } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, fieldState, isRequired } = useInput(sansHandlers);

  const invalid = fieldState.invalid;
  const errorMessage =
    fieldState.error?.root?.message ?? fieldState.error?.message;

  const currentId = (field.value as string | null | undefined) ?? null;

  return (
    <FieldSet
      className={cn("gap-3", className)}
      data-invalid={invalid || undefined}
    >
      {label !== false && (
        <FieldLegend variant="label">
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FieldLegend>
      )}
      <div
        id={id}
        role="radiogroup"
        className="grid gap-3 sm:grid-cols-3"
        aria-disabled={disabled}
        aria-invalid={invalid || undefined}
      >
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={currentId === plan.id}
            recommended={recommendedPlanId === plan.id}
            disabled={disabled}
            onSelect={() => !disabled && field.onChange(plan.id)}
          />
        ))}
      </div>
      <InputHelperText helperText={helperText} />
      <FieldError>
        {invalid && errorMessage ? (
          <ValidationError error={errorMessage} />
        ) : null}
      </FieldError>
    </FieldSet>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  selected: boolean;
  recommended: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const PlanCard = ({
  plan,
  selected,
  recommended,
  disabled,
  onSelect,
}: PlanCardProps) => {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
  }).format(plan.price);

  return (
    <Card
      data-plan-card={plan.id}
      data-selected={selected ? "true" : "false"}
      data-recommended={recommended ? "true" : "false"}
      className={cn(
        "transition",
        selected && "border-primary ring-2 ring-primary",
        recommended && !selected && "border-primary/50",
      )}
      role="radio"
      aria-checked={selected}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          {recommended && (
            <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Recommended
            </span>
          )}
        </CardTitle>
        <div className="text-2xl font-semibold tabular-nums">
          {formatted}
          <span className="text-sm font-normal text-muted-foreground">
            /{plan.interval}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {plan.features && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          className="mt-4 w-full"
          variant={selected ? "default" : "outline"}
          onClick={onSelect}
          disabled={disabled}
        >
          {selected ? "Current" : "Select"}
        </Button>
      </CardContent>
    </Card>
  );
};

interface SubscriptionPlanPickerProps extends InputProps {
  plans: readonly SubscriptionPlan[];
  recommendedPlanId?: string;
  disabled?: boolean;
  className?: string;
}

export { SubscriptionPlanPicker, type SubscriptionPlanPickerProps };
