import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";
import { tasksSeed } from "./planning";
import { reportsSeed } from "./analytics";
import { documentsSeed } from "./workspace";
import { onboardingsSeed } from "./onboarding";

const data = {
  ...generateData(),
  places: placesSeed,
  tasks: tasksSeed,
  reports: reportsSeed,
  documents: documentsSeed,
  onboardings: onboardingsSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
