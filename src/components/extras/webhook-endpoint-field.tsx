import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue } from "ra-core";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { cn } from "@/lib/utils";

export interface WebhookEndpoint {
  url: string;
  secret: string;
  eventTypes: readonly string[];
  lastDelivery?: {
    status: "ok" | "failed" | "pending";
    at: string;
  };
}

type DeliveryStatus = "ok" | "failed" | "pending";

/**
 * Displays a webhook endpoint's URL and last-delivery status badge.
 * The signing secret is never rendered.
 *
 * @example
 * <WebhookEndpointField source="endpoint" />
 */
export const WebhookEndpointField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  className,
  ...rest
}: WebhookEndpointFieldProps<RecordType>) => {
  const value = useFieldValue({ defaultValue, source, record });

  if (!value || typeof value !== "object") return null;
  const endpoint = value as WebhookEndpoint;
  const status: DeliveryStatus = endpoint.lastDelivery?.status ?? "pending";

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="font-mono text-sm">{endpoint.url}</span>
      <span
        data-webhook-status
        data-status={status}
        className={cn(
          "rounded px-2 py-0.5 text-xs font-medium",
          status === "ok" && "bg-green-500/10 text-green-700",
          status === "failed" && "bg-red-500/10 text-red-700",
          status === "pending" && "bg-muted text-muted-foreground",
        )}
      >
        {status.toUpperCase()}
      </span>
    </span>
  );
};

export interface WebhookEndpointFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {}
