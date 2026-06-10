import { Sparkles } from "lucide-react";
import { ResourceProps } from "ra-core";

import { OnboardingCreate } from "./OnboardingCreate";
import { OnboardingList } from "./OnboardingList";
import { OnboardingShow } from "./OnboardingShow";

export const onboarding: ResourceProps = {
  name: "onboardings",
  list: OnboardingList,
  show: OnboardingShow,
  create: OnboardingCreate,
  recordRepresentation: (record) => record.user,
  icon: Sparkles,
};

export { onboardingsSeed } from "./onboardings-seed";
