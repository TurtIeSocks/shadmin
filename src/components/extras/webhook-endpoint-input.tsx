import { useState } from "react";
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { InputHelperText } from "@/components/admin/input-helper-text";
import type { WebhookEndpoint } from "./webhook-endpoint-field";
import { cn } from "@/lib/utils";

/**
 * Composite input for a webhook endpoint. Edits the URL, signing secret, and
 * event-type subscriptions. Optionally renders a test-ping button.
 *
 * Storage shape: `{ url, secret, eventTypes, lastDelivery? }`.
 *
 * @example
 * <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
 */
export const WebhookEndpointInput = (props: WebhookEndpointInputProps) => {
  const {
    label,
    source,
    className,
    resource: resourceProp,
    helperText,
    eventTypes,
    onTestPing,
    disabled,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });

  const {
    onChange: _stripChange,
    onBlur: _stripBlur,
    ...sansHandlers
  } = props;
  void _stripChange;
  void _stripBlur;
  const { id, field, isRequired } = useInput(sansHandlers);

  const value = (field.value as WebhookEndpoint | null) ?? {
    url: "",
    secret: "",
    eventTypes: [],
  };

  const [pinging, setPinging] = useState(false);

  const update = (patch: Partial<WebhookEndpoint>) => {
    field.onChange({ ...value, ...patch });
  };

  const toggleEvent = (event: string, checked: boolean) => {
    const set = new Set(value.eventTypes);
    if (checked) set.add(event);
    else set.delete(event);
    update({ eventTypes: Array.from(set) });
  };

  const handlePing = async () => {
    if (!onTestPing) return;
    setPinging(true);
    try {
      await onTestPing(value.url, value.secret);
    } finally {
      setPinging(false);
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
        <div className={cn("flex flex-col gap-3", className)}>
          <Input
            type="url"
            data-webhook-url
            value={value.url}
            onChange={(e) => update({ url: e.target.value })}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder="https://example.com/webhook"
          />
          <Input
            type="password"
            data-webhook-secret
            value={value.secret}
            onChange={(e) => update({ secret: e.target.value })}
            disabled={disabled}
            placeholder="Signing secret"
          />
          <div className="flex flex-wrap gap-3">
            {eventTypes.map((event) => (
              <label
                key={event}
                className="flex items-center gap-2 text-sm font-mono"
              >
                <Checkbox
                  data-event-checkbox
                  checked={value.eventTypes.includes(event)}
                  onCheckedChange={(c) => toggleEvent(event, c === true)}
                  disabled={disabled}
                />
                {event}
              </label>
            ))}
          </div>
          {onTestPing && (
            <Button
              type="button"
              variant="outline"
              data-test-ping-button
              onClick={handlePing}
              disabled={disabled || pinging || !value.url}
            >
              {pinging ? "Pinging…" : "Send test ping"}
            </Button>
          )}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface WebhookEndpointInputProps extends InputProps {
  /** Available event-type strings to surface as checkboxes. */
  eventTypes: readonly string[];
  /** Optional test-ping handler. When set, renders the test-ping button. */
  onTestPing?: (url: string, secret: string) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}
