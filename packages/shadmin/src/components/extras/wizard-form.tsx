"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import {
  Form,
  FormGroupContextProvider,
  useFormGroups,
  useTranslate,
} from "ra-core";
import type { FormProps } from "ra-core";
import { useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight, CircleX } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/admin/save-button";
import { cn } from "@/lib/utils";

type WizardProgressMode = "steps" | "dots" | "none";

interface WizardFormProps extends Omit<FormProps, "children" | "id"> {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  progress?: WizardProgressMode;
  toolbar?: ReactNode | false;
  children: ReactNode;
}

interface WizardStepProps {
  label: string | ReactElement;
  description?: string | ReactElement;
  optional?: boolean;
  validateOnNext?: boolean;
  className?: string;
  children?: ReactNode;
  // Injected by WizardForm at render time. Not part of the public API.
  __stepIndex?: number;
  __stepKey?: string;
  __hidden?: boolean;
}

interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
  stepFlags: Array<{ optional: boolean; validateOnNext: boolean }>;
  onClose: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

function useWizard() {
  const ctx = use(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardForm>");
  return ctx;
}

const stepKeyFor = (index: number) => `wizard-step-${index}`;

/**
 * Renders a horizontal list of step labels. Highlights the active step
 * with aria-current="step". Pass mode="dots" for a compact indicator
 * or mode="none" to hide entirely.
 */
function WizardProgress({
  labels,
  mode,
}: {
  labels: Array<string | ReactElement>;
  mode: WizardProgressMode;
}) {
  const translate = useTranslate();
  const { currentStep } = useWizard();
  if (mode === "none") return null;

  return (
    <ol
      className={cn(
        "flex w-full items-center gap-2 text-sm text-muted-foreground",
        mode === "dots" && "justify-center",
      )}
    >
      {labels.map((label, index) => {
        const active = index === currentStep;
        const text =
          typeof label === "string" ? translate(label, { _: label }) : label;
        return (
          <li
            key={typeof label === "string" ? label : index}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-center gap-2",
              active && "text-foreground font-medium",
            )}
          >
            {mode === "dots" ? (
              <>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    active ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  aria-hidden="true"
                />
                <span className="sr-only">{text}</span>
              </>
            ) : (
              <>
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{text}</span>
              </>
            )}
            {index < labels.length - 1 && mode === "steps" ? (
              <span className="h-px w-4 bg-border" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Watches react-hook-form errors. When a submission produces errors, finds the
 * lowest-index step whose form group contains an errored field (or one of its
 * children) and navigates there. No-op when no errors are present.
 *
 * This is a component, not a hook, because it must read FormContext, which is
 * provided by <Form> below WizardForm.
 */
function WizardErrorJumper() {
  const form = useFormContext();
  const formGroups = useFormGroups();
  const { goTo, totalSteps } = useWizard();
  const submitCount = form.formState.submitCount;

  // biome-ignore lint/correctness/useExhaustiveDependencies: submitCount is the canonical submission signal; errors/goTo are read imperatively and must not retrigger this jump-to-error effect
  useEffect(() => {
    if (submitCount === 0) return;
    if (!formGroups) return;
    const errorFieldNames = Object.keys(form.formState.errors ?? {});
    if (errorFieldNames.length === 0) return;
    for (let i = 0; i < totalSteps; i++) {
      const groupFields = formGroups.getGroupFields(stepKeyFor(i));
      const hasError = groupFields.some((field) =>
        errorFieldNames.some(
          (err) => field === err || field.startsWith(`${err}.`),
        ),
      );
      if (hasError) {
        goTo(i);
        return;
      }
    }
    // submitCount is the canonical "a submission happened" signal; errors are
    // read imperatively inside so we don't need to track them as deps.
  }, [submitCount, formGroups, totalSteps]);

  return null;
}

/**
 * Modal multi-step form. Compose with `<WizardForm.Step>` children.
 *
 * @example
 * <WizardForm isOpen={open} onClose={close} title="Create">
 *   <WizardForm.Step label="Identity">
 *     <TextInput source="name" />
 *   </WizardForm.Step>
 * </WizardForm>
 */
function WizardForm(props: WizardFormProps) {
  const {
    isOpen,
    onClose,
    title,
    description,
    className,
    children,
    toolbar,
    progress = "steps",
    ...formProps
  } = props;

  const steps = useMemo(
    () =>
      (Children.toArray(children) as ReactElement<WizardStepProps>[]).filter(
        isValidElement,
      ),
    [children],
  );

  const stepFlags = useMemo(
    () =>
      steps.map((step) => ({
        optional: Boolean(step.props.optional),
        validateOnNext: step.props.validateOnNext !== false,
      })),
    [steps],
  );

  const labels = useMemo(() => steps.map((s) => s.props.label), [steps]);

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const ctx = useMemo<WizardContextValue>(
    () => ({
      currentStep,
      totalSteps,
      isFirst,
      isLast,
      goNext: () => setCurrentStep((i) => Math.min(i + 1, totalSteps - 1)),
      goBack: () => setCurrentStep((i) => Math.max(i - 1, 0)),
      goTo: (index) =>
        setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1))),
      stepFlags,
      onClose,
    }),
    [currentStep, totalSteps, isFirst, isLast, stepFlags, onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn("sm:max-w-2xl", className)}
        // Only opt out of radix's describedby auto-wire when no description is
        // provided; otherwise let radix link DialogDescription via id.
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...formProps}>
          <WizardContext.Provider value={ctx}>
            <WizardErrorJumper />
            <WizardProgress labels={labels} mode={progress} />
            <div className="flex flex-col gap-4">
              {steps.map((step, index) => {
                const stepKey = stepKeyFor(index);
                return cloneElement(step, {
                  key: stepKey,
                  __stepIndex: index,
                  __stepKey: stepKey,
                  __hidden: index !== currentStep,
                });
              })}
            </div>
            {toolbar === false ? null : (toolbar ?? <WizardToolbar />)}
          </WizardContext.Provider>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function WizardFormStep(props: WizardStepProps) {
  const { className, children, description, __stepKey, __hidden } = props;
  if (!__stepKey) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    );
  }
  return (
    <FormGroupContextProvider name={__stepKey}>
      <fieldset
        data-wizard-step={__stepKey}
        aria-hidden={__hidden || undefined}
        style={__hidden ? { display: "none" } : undefined}
        className={cn("flex flex-col gap-4", className)}
      >
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </fieldset>
    </FormGroupContextProvider>
  );
}

WizardFormStep.displayName = "WizardForm.Step";

WizardForm.Step = WizardFormStep;

/**
 * Default toolbar for <WizardForm>.
 * Renders Cancel / Back / Next / Save based on wizard position.
 */
function WizardToolbar() {
  const translate = useTranslate();
  const ctx = useWizard();
  const { isFirst, isLast, goNext, goBack, currentStep } = ctx;
  const form = useFormContext();
  const formGroups = useFormGroups();
  const stepKey = stepKeyFor(currentStep);

  const handleNext = async () => {
    const flags = ctx.stepFlags[currentStep];
    if (!flags || flags.optional || !flags.validateOnNext) {
      goNext();
      return;
    }
    // Validate just the fields registered in this step's group.
    // Falls back to validate-all if the group has no registered fields yet
    // (e.g., before children have mounted).
    const fieldNames = formGroups?.getGroupFields(stepKey) ?? [];
    const isValid =
      fieldNames.length > 0
        ? await form.trigger(fieldNames)
        : await form.trigger();
    if (isValid) goNext();
  };

  return (
    <DialogFooter className="gap-2 sm:gap-2">
      <Button
        name="cancel"
        type="button"
        variant="ghost"
        className="cursor-pointer"
        onClick={() => {
          form.reset();
          ctx.onClose();
        }}
      >
        <CircleX />
        {translate("ra.action.cancel", { _: "Cancel" })}
      </Button>
      {!isFirst ? (
        <Button name="back" type="button" variant="outline" onClick={goBack}>
          <ArrowLeft />
          {translate("ra.action.wizard_back", { _: "Back" })}
        </Button>
      ) : null}
      {!isLast ? (
        <Button name="next" type="button" onClick={handleNext}>
          {translate("ra.action.wizard_next", { _: "Next" })}
          <ArrowRight />
        </Button>
      ) : (
        <SaveButton />
      )}
    </DialogFooter>
  );
}

export {
  type WizardProgressMode,
  type WizardFormProps,
  type WizardStepProps,
  WizardForm,
  WizardFormStep,
  WizardToolbar,
};
