import { useState } from "react";
import {
  required,
  email as emailValidator,
  useCreate,
  useCreatePath,
  useNotify,
  useRedirect,
  useResourceContext,
} from "ra-core";

import { WizardForm } from "@/components/extras/wizard-form";
import { TextInput } from "@/components/admin/text-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";

/**
 * Create view for the demo "onboardings" resource. Showcases <WizardForm> as
 * the alternative to <SimpleForm> for guided multi-step entry. The wizard
 * opens automatically on mount; closing or cancelling redirects back to the
 * list.
 */
export const OnboardingCreate = () => {
  const [open, setOpen] = useState(true);
  const resource = useResourceContext();
  const [create] = useCreate();
  const notify = useNotify();
  const redirect = useRedirect();
  const createPath = useCreatePath();

  const handleClose = () => {
    setOpen(false);
    redirect("list", resource);
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    create(
      resource as string,
      {
        data: {
          ...values,
          startedAt: new Date().toISOString(),
          currentStep: 0,
          completed: false,
        },
      },
      {
        onSuccess: (record) => {
          notify("ra.notification.created", {
            type: "info",
            messageArgs: { smart_count: 1 },
          });
          setOpen(false);
          redirect(
            createPath({
              resource: resource as string,
              type: "show",
              id: record.id,
            }),
          );
        },
        onError: (error: unknown) => {
          notify(
            typeof error === "object" && error && "message" in error
              ? String((error as { message: unknown }).message)
              : "ra.notification.http_error",
            { type: "error" },
          );
        },
      },
    );
  };

  return (
    <WizardForm
      isOpen={open}
      onClose={handleClose}
      title="Start onboarding"
      description="Three quick steps to provision the new user."
      onSubmit={handleSubmit}
    >
      <WizardForm.Step label="Identity">
        <TextInput source="user" validate={required()} />
        <TextInput source="email" validate={[required(), emailValidator()]} />
      </WizardForm.Step>
      <WizardForm.Step label="Locale">
        <TextInput
          source="timezone"
          helperText="IANA timezone, e.g. America/Los_Angeles"
          validate={required()}
        />
      </WizardForm.Step>
      <WizardForm.Step label="Referral" optional>
        <TextInput
          source="referralCode"
          helperText="Optional. Leave blank for direct signups."
        />
        <NumberInput
          source="currentStep"
          defaultValue={0}
          min={0}
          max={3}
          helperText="Pre-fill progress if the user already completed steps elsewhere."
        />
        <BooleanInput source="completed" defaultValue={false} />
      </WizardForm.Step>
    </WizardForm>
  );
};
