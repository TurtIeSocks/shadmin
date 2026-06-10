import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AutoConfigFormProps {
  schema: z.ZodType;
  attrs: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

/**
 * Walk the `.default()` / `.optional()` / `.nullable()` wrapper chain down to the
 * inner type. Zod v4 nests the wrapped type under `_def.innerType`; verified
 * against zod@4 — a `z.enum().default()` unwraps to `ZodEnum`, a
 * `z.boolean().default()` to `ZodBoolean`, a `z.number().optional()` to
 * `ZodNumber`. `instanceof` checks then classify the field.
 */
function unwrap(field: z.ZodType): z.ZodType {
  let f = field as z.ZodType & { _def?: { innerType?: z.ZodType } };
  let guard = 0;
  while (f?._def?.innerType && guard++ < 10) {
    f = f._def.innerType as typeof f;
  }
  return f;
}

interface ShapeLike {
  shape: Record<string, z.ZodType>;
}

/**
 * Minimal config form derived from a Zod object schema:
 * - `z.enum` → `<Select>`
 * - `z.boolean` → `<Switch>`
 * - `z.string` / `z.number` / fallback → `<Input>` (number-coerced for numbers)
 *
 * Emits a single-key patch per change via `onChange`.
 */
export function AutoConfigForm({ schema, attrs, onChange }: AutoConfigFormProps) {
  const shape = (schema as unknown as ShapeLike).shape ?? {};

  return (
    <div className="flex w-56 flex-col gap-3">
      {Object.entries(shape).map(([key, raw]) => {
        const field = unwrap(raw);
        const value = attrs[key];

        if (field instanceof z.ZodEnum) {
          const options = field.options as string[];
          return (
            <div key={key} className="flex flex-col gap-1">
              <Label className="text-xs capitalize">{key}</Label>
              <Select
                value={value == null ? undefined : String(value)}
                onValueChange={(v) => onChange({ [key]: v })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field instanceof z.ZodBoolean) {
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2"
            >
              <Label className="text-xs capitalize" htmlFor={`cfg-${key}`}>
                {key}
              </Label>
              <Switch
                id={`cfg-${key}`}
                aria-label={key}
                checked={Boolean(value)}
                onCheckedChange={(checked) => onChange({ [key]: checked })}
              />
            </div>
          );
        }

        const isNumber = field instanceof z.ZodNumber;
        return (
          <div key={key} className="flex flex-col gap-1">
            <Label className="text-xs capitalize" htmlFor={`cfg-${key}`}>
              {key}
            </Label>
            <Input
              id={`cfg-${key}`}
              type={isNumber ? "number" : "text"}
              className="h-8"
              value={value == null ? "" : String(value)}
              onChange={(e) =>
                onChange({
                  [key]: isNumber
                    ? e.target.value === ""
                      ? null
                      : Number(e.target.value)
                    : e.target.value,
                })
              }
            />
          </div>
        );
      })}
    </div>
  );
}
