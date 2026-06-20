"use client";

import { type ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { useStore, useTranslate } from "shadmin-core";
import { Button } from "@/components/ui/button";

interface TourStep {
  target: string;
  title?: ReactNode;
  content: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  id: string;
  steps: TourStep[];
  autoStart?: boolean;
  onComplete?: () => void;
  placement?: "auto" | "top" | "bottom" | "left" | "right";
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const tourStoreKey = (id: string) => `tour.${id}.completed`;

const useTargetRect = (selector: string, active: boolean): Rect | null => {
  const [rect, setRect] = useState<Rect | null>(null);
  useLayoutEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    const update = () => {
      const el = document.querySelector(selector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const interval = window.setInterval(update, 250);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.clearInterval(interval);
    };
  }, [selector, active]);
  return rect;
};

const computeTooltipPosition = (
  rect: Rect,
  placement: TourStep["placement"],
): { top: number; left: number } => {
  const margin = 12;
  switch (placement) {
    case "top":
      return { top: rect.top - margin, left: rect.left + rect.width / 2 };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - margin };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width + margin,
      };
    default:
      return {
        top: rect.top + rect.height + margin,
        left: rect.left + rect.width / 2,
      };
  }
};

const OnboardingTour = ({
  id,
  steps,
  autoStart = true,
  onComplete,
  placement: defaultPlacement = "auto",
}: OnboardingTourProps) => {
  const translate = useTranslate();
  const [completed, setCompleted] = useStore<boolean>(tourStoreKey(id), false);
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (autoStart && !completed) {
      setActive(true);
    }
  }, [autoStart, completed]);

  const currentStep = steps[stepIdx];
  const placement =
    currentStep?.placement ??
    (defaultPlacement === "auto" ? "bottom" : defaultPlacement);
  const rect = useTargetRect(currentStep?.target ?? "", active);

  const finish = () => {
    setCompleted(true);
    setActive(false);
    setStepIdx(0);
    onComplete?.();
  };

  // Keyboard parity for the click-to-dismiss backdrop: Escape ends the tour.
  // biome-ignore lint/correctness/useExhaustiveDependencies: finish only reads stable setters; re-binding the listener on every render is unnecessary
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  if (!active || !currentStep) return null;

  const tooltip = rect ? computeTooltipPosition(rect, placement) : null;
  const isLast = stepIdx === steps.length - 1;
  const isFirst = stepIdx === 0;

  return (
    <div
      data-slot="onboarding-tour"
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Spotlight overlay */}
      {rect ? (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: modal scrim; click-to-dismiss is a mouse convenience, keyboard users dismiss via Escape (document handler above) and the visible Skip button */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal scrim; click-to-dismiss is a mouse convenience, keyboard parity is provided by the Escape handler and the Skip button */}
          <div
            className="pointer-events-auto fixed inset-0 bg-black/50 transition-opacity"
            style={{
              clipPath: `polygon(
                0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                ${rect.left}px ${rect.top}px,
                ${rect.left}px ${rect.top + rect.height}px,
                ${rect.left + rect.width}px ${rect.top + rect.height}px,
                ${rect.left + rect.width}px ${rect.top}px,
                ${rect.left}px ${rect.top}px
              )`,
            }}
            onClick={finish}
          />
          <div
            className="pointer-events-none fixed rounded-md ring-2 ring-primary"
            style={{
              top: rect.top - 4,
              left: rect.left - 4,
              width: rect.width + 8,
              height: rect.height + 8,
            }}
          />
        </>
      ) : (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: modal scrim; click-to-dismiss is a mouse convenience, keyboard users dismiss via Escape (document handler above) and the visible Skip button */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal scrim; click-to-dismiss is a mouse convenience, keyboard parity is provided by the Escape handler and the Skip button */}
          <div
            className="pointer-events-auto fixed inset-0 bg-black/50"
            onClick={finish}
          />
        </>
      )}
      {/* Tooltip card */}
      {tooltip ? (
        <div
          data-slot="tour-card"
          className="pointer-events-auto fixed max-w-sm -translate-x-1/2 rounded-md border bg-background p-4 shadow-xl"
          style={{ top: tooltip.top, left: tooltip.left }}
        >
          {currentStep.title ? (
            <div className="mb-1 text-sm font-medium">{currentStep.title}</div>
          ) : null}
          <div className="mb-3 text-sm text-muted-foreground">
            {currentStep.content}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              {stepIdx + 1} / {steps.length}
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={finish}>
                {translate("ra.tour.skip", { _: "Skip" })}
              </Button>
              {!isFirst ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStepIdx((i) => i - 1)}
                >
                  {translate("ra.tour.back", { _: "Back" })}
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                onClick={() => (isLast ? finish() : setStepIdx((i) => i + 1))}
              >
                {isLast
                  ? translate("ra.tour.finish", { _: "Finish" })
                  : translate("ra.tour.next", { _: "Next" })}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { type TourStep, type OnboardingTourProps, OnboardingTour };
