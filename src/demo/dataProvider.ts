import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";
import { tasksSeed } from "./planning";
import { reportsSeed } from "./analytics";
import { documentsSeed } from "./workspace";
import { onboardingsSeed } from "./onboarding";

const generated = generateData();

// Seed deterministic E.164 US phone numbers for customers. Using a stable
// formula keyed off the customer id keeps demo data reproducible across runs
// without pulling in @faker-js/faker just for this one field.
const customersWithPhone = generated.customers.map((customer) => {
  const seed = (customer.id * 7919 + 1234567) % 9000000;
  const national = String(2000000000 + seed).padStart(10, "0");
  return { ...customer, phone: `+1${national}` };
});

const data = {
  ...generated,
  customers: customersWithPhone,
  places: placesSeed,
  tasks: tasksSeed,
  reports: reportsSeed,
  documents: documentsSeed,
  onboardings: onboardingsSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
