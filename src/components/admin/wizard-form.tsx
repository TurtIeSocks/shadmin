"use client";

import { Children, isValidElement, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { Form } from "ra-core";
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
          <div className="flex flex-col gap-4">{steps}</div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function WizardFormStep(props: WizardStepProps) {
  const { className, children } = props;
  return (
    <div className={cn("flex flex-col gap-4", className)}>{children}</div>
  );
}

WizardFormStep.displayName = "WizardForm.Step";

WizardForm.Step = WizardFormStep;
