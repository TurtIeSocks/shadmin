import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features?: readonly string[];
}

/**
 * Displays the user's current subscription plan as a compact badge showing
 * plan name + price. Looks up the plan from a `plans` array by id.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/subscription-plan-field/ SubscriptionPlanField documentation}
 *
 * @example
 * import { SubscriptionPlanField } from '@/components/admin';
 *
 * const PLANS = [
 *   { id: "free", name: "Free", price: 0, currency: "USD", interval: "month" },
 *   { id: "pro", name: "Pro", price: 29, currency: "USD", interval: "month" },
 * ];
 *
 * <SubscriptionPlanField source="planId" plans={PLANS} />
 */
export const SubscriptionPlanField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  empty,
  plans,
  className,
  ...rest
}: SubscriptionPlanFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();
  const plan = plans.find((p) => p.id === value);

  if (!plan) {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
  }).format(plan.price);

  return (
    <Badge
      variant="secondary"
      className={className}
      {...sanitizeFieldRestProps(rest)}
    >
      <span className="font-medium">{plan.name}</span>
      <span className="ml-2 text-xs text-muted-foreground">
        {formatted}/{plan.interval}
      </span>
    </Badge>
  );
};

export interface SubscriptionPlanFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>,
    Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Available plans to look up by id. */
  plans: readonly SubscriptionPlan[];
}
