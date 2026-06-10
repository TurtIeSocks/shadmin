import {
  BooleanField,
  DateField,
  DeleteButton,
  EditButton,
  RecordField,
  Show,
  SimpleShowLayout,
} from "shadcn-admin-kit/components/admin";
import { OnboardingTour } from "shadcn-admin-kit/components/extras/onboarding-tour";

const tourSteps = [
  {
    target: '[data-tour="onboarding-user"]',
    title: "Who started the flow",
    content: "Each onboarding record is keyed to one user account.",
  },
  {
    target: '[data-tour="onboarding-progress"]',
    title: "Track progress",
    content:
      "currentStep climbs as the user finishes wizard steps. 3 / 3 plus completed=true means they're done.",
  },
  {
    target: '[data-tour="onboarding-referral"]',
    title: "Referral attribution",
    content: "Empty if the user signed up directly.",
  },
];

export const OnboardingShow = () => (
  <Show
    actions={
      <div className="flex items-center gap-2">
        <EditButton />
        <DeleteButton />
      </div>
    }
  >
    <SimpleShowLayout>
      <div data-tour="onboarding-user">
        <RecordField source="user" />
        <RecordField source="email" />
      </div>
      <div data-tour="onboarding-progress" className="flex flex-col gap-2">
        <RecordField
          source="currentStep"
          render={(record) => `${record.currentStep} / 3`}
        />
        <RecordField source="completed">
          <BooleanField source="completed" />
        </RecordField>
        <RecordField source="startedAt">
          <DateField source="startedAt" showTime />
        </RecordField>
      </div>
      <RecordField source="timezone" />
      <div data-tour="onboarding-referral">
        <RecordField
          source="referralCode"
          render={(record) =>
            record.referralCode ? String(record.referralCode) : "(none)"
          }
        />
      </div>
    </SimpleShowLayout>
    <OnboardingTour id="onboarding-show" steps={tourSteps} />
  </Show>
);
