"use client";

import { Children, cloneElement, isValidElement, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Form, FormGroupContextProvider } from "ra-core";
import type { FormProps } from "ra-core";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    progress: _progress,
    toolbar: _toolbar,
    ...formProps
  } = props;

  const steps = useMemo(
    () =>
      (Children.toArray(children) as ReactElement<WizardStepProps>[]).filter(
        isValidElement,
      ),
    [children],
  );

  const [currentStep] = useState(0);

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
