"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import { Form, FormGroupContextProvider, useTranslate } from "ra-core";
import type { FormProps } from "ra-core";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/save-button";
import { cn } from "@/lib/utils";

export type WizardProgressMode = "steps" | "dots" | "none";

export interface WizardFormProps
  extends Omit<FormProps, "children" | "id"> {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  progress?: WizardProgressMode;
  toolbar?: ReactNode | false;
  children: ReactNode;
}

export interface WizardStepProps {
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
}

const WizardContext = createContext<WizardContextValue | null>(null);

function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardForm>");
  return ctx;
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
export function WizardForm(props: WizardFormProps) {
  const {
    isOpen,
    onClose,
    title,
    description,
    className,
    children,
    toolbar,
    progress: _progress,
    ...formProps
  } = props;

  const steps = useMemo(
    () =>
      (Children.toArray(children) as ReactElement<WizardStepProps>[]).filter(
        isValidElement,
      ),
    [children],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const ctx: WizardContextValue = {
    currentStep,
    totalSteps,
    isFirst,
    isLast,
    goNext: () => setCurrentStep((i) => Math.min(i + 1, totalSteps - 1)),
    goBack: () => setCurrentStep((i) => Math.max(i - 1, 0)),
    goTo: (index) =>
      setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1))),
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...formProps}>
          <WizardContext.Provider value={ctx}>
            <div className="flex flex-col gap-4">
              {steps.map((step, index) => {
                const stepKey = `wizard-step-${index}`;
                return cloneElement(step, {
                  key: stepKey,
                  __stepIndex: index,
                  __stepKey: stepKey,
                  __hidden: index !== currentStep,
                });
              })}
            </div>
            {toolbar === false ? null : toolbar ?? <WizardToolbar />}
          </WizardContext.Provider>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function WizardFormStep(props: WizardStepProps) {
  const { className, children, __stepKey, __hidden } = props;
  if (!__stepKey) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    );
  }
  return (
    <FormGroupContextProvider name={__stepKey}>
      <div
        role="group"
        data-wizard-step={__stepKey}
        aria-hidden={__hidden || undefined}
        style={__hidden ? { display: "none" } : undefined}
        className={cn("flex flex-col gap-4", className)}
      >
        {children}
      </div>
    </FormGroupContextProvider>
  );
}

WizardFormStep.displayName = "WizardForm.Step";

WizardForm.Step = WizardFormStep;

/**
 * Default toolbar for <WizardForm>.
 * Renders Cancel / Back / Next / Save based on wizard position.
 */
export function WizardToolbar() {
  const translate = useTranslate();
  const { isFirst, isLast, goNext, goBack } = useWizard();
  return (
    <DialogFooter className="gap-2 sm:gap-2">
      <CancelButton />
      {!isFirst ? (
        <Button type="button" variant="outline" onClick={goBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translate("ra.action.back", { _: "Back" })}
        </Button>
      ) : null}
      {!isLast ? (
        <Button type="button" onClick={goNext}>
          {translate("ra.action.next", { _: "Next" })}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <SaveButton />
      )}
    </DialogFooter>
  );
}
