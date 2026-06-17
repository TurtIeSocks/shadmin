import { type Ref, useEffect, useRef } from "react";

/**
 * Returns a ref to attach to a `.glass--interactive` element. On `pointermove`
 * it sets the element's `--mx`/`--my` custom properties (as percentages) so the
 * CSS specular highlight follows the cursor.
 *
 * Guarded by `matchMedia('(prefers-reduced-motion: reduce)')`: when the user
 * prefers reduced motion, no listener is attached and the highlight stays at the
 * token default (50% 50%). SSR-safe — all DOM access is inside `useEffect`.
 *
 * @example
 * const ref = useGlassPointer<HTMLDivElement>();
 * return <div ref={ref} className="glass glass--l2 glass--interactive">…</div>;
 */
export function useGlassPointer<T extends HTMLElement = HTMLElement>(): Ref<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (el == null || typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;

    const onPointerMove = (event: PointerEvent): void => {
      if (frame !== 0) return; // throttle to one write per animation frame
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const mx = ((event.clientX - rect.left) / rect.width) * 100;
        const my = ((event.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
      });
    };

    const onPointerLeave = (): void => {
      // Ease the highlight back to center when the pointer leaves.
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    const attach = (): void => {
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onPointerLeave);
    };

    const detach = (): void => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    // Respect the live preference: bind only when motion is allowed, and
    // re-evaluate if the user toggles the setting while mounted.
    const sync = (): void => {
      detach();
      if (!reduceMotion.matches) attach();
    };

    sync();
    reduceMotion.addEventListener("change", sync);

    return () => {
      detach();
      reduceMotion.removeEventListener("change", sync);
    };
  }, []);

  return ref;
}
