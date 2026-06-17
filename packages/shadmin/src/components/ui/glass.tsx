import {
  type ComponentPropsWithoutRef,
  createElement,
  type ElementType,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { useGlassPointer } from "@/hooks/use-glass-pointer";
import { cn } from "@/lib/utils";

/** Fidelity level — how many optical layers are switched on (see glass.css). */
export type GlassLevel = 1 | 2 | 3;

/** Theme preset — overrides the token block via `[data-glass-theme]`. */
export type GlassTheme = "dark" | "light" | "tinted";

export interface GlassClassOptions {
  /** Fidelity level (default 1). 2 adds specular + depth; 3 adds SVG refraction. */
  level?: GlassLevel;
  /** Enable pointer-tracking specular (`glass--interactive`; pair with useGlassPointer). */
  interactive?: boolean;
  /** Extra classes, merged after the generated glass classes. */
  className?: string;
}

/**
 * Compose the glass contract classes from a level/interactive intent. The level
 * stacks cumulatively, mirroring glass.css: 2 → `glass glass--l2`; 3 →
 * `glass glass--l2 glass--l3`. Apply to ANY element — including a shadcn
 * primitive — without hand-writing the `glass--lN` strings:
 *
 * ```tsx
 * <Card className={glassClasses({ level: 2 })}>…</Card>
 * ```
 */
export function glassClasses({
  level,
  interactive,
  className,
}: GlassClassOptions = {}): string {
  const levelClass =
    level && level >= 3
      ? "glass--l2 glass--l3"
      : level === 2
        ? "glass--l2"
        : undefined;
  return cn("glass", levelClass, interactive && "glass--interactive", className);
}

export interface GlassPanelOwnProps extends GlassClassOptions {
  /** Theme preset; sets `data-glass-theme`. Omit to inherit (light = :root). */
  theme?: GlassTheme;
  children?: ReactNode;
}

type GlassPanelProps<T extends ElementType> = GlassPanelOwnProps & {
  /** Render as a different element/component. Default `div`. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | keyof GlassPanelOwnProps>;

function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): (node: T | null) => void {
  return (node: T | null): void => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

/**
 * Generic glass surface — the unopinionated wrapper that applies the `.glass`
 * material at a chosen `level` to any element. NOT a card/button family: skin
 * existing shadcn primitives with `glassClasses` / `data-glass`; reach for this
 * only for a bespoke surface (a sidebar, a hero panel, a toolbar). When
 * `interactive`, it auto-wires `useGlassPointer` and merges that ref with any
 * forwarded ref.
 */
function GlassPanelInner<T extends ElementType = "div">(
  props: GlassPanelProps<T>,
  ref: ForwardedRef<Element>,
): ReactElement {
  const { as, level, theme, interactive, className, children, ...rest } =
    props as GlassPanelProps<ElementType>;
  const Tag = (as ?? "div") as ElementType;

  // Hook runs every render (no-op when not interactive); merge its ref with the
  // forwarded ref only when interactive so the consumer's ref is preserved.
  const pointerRef = useGlassPointer<HTMLElement>();
  const mergedRef = interactive
    ? mergeRefs<Element>(ref, pointerRef as Ref<Element>)
    : ref;

  return createElement(
    Tag,
    {
      ref: mergedRef,
      className: glassClasses({ level, interactive, className }),
      "data-glass-theme": theme,
      ...rest,
    },
    children,
  );
}

const GlassPanel = forwardRef(GlassPanelInner) as <
  T extends ElementType = "div",
>(
  props: GlassPanelProps<T> & { ref?: Ref<Element> },
) => ReactElement;

export { GlassPanel };
