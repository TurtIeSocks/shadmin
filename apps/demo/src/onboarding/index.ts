import { Sparkles } from "lucide-react";
import { ResourceProps } from "ra-core";

import { OnboardingCreate } from "./onboarding-create";
import { OnboardingList } from "./onboarding-list";
import { OnboardingShow } from "./onboarding-show";

export const onboarding: ResourceProps = {
  name: "onboardings",
  list: OnboardingList,
  show: OnboardingShow,
  create: OnboardingCreate,
  recordRepresentation: (record) => record.user,
  icon: Sparkles,
};

export { onboardingsSeed } from "./onboardings-seed";
