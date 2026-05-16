import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";
import { tasksSeed } from "./planning";
import { reportsSeed } from "./analytics";
import { documentsSeed } from "./workspace";
import { onboardingsSeed } from "./onboarding";
import { subscriptionsSeed } from "./subscriptions";
import { apiKeysSeed } from "./api-keys";
import { webhooksSeed } from "./webhooks";
import { scheduledJobsSeed } from "./scheduled-jobs";
import { approvalsSeed } from "./approvals";
import { orderCommentsSeed } from "./orders/comments-seed";

const generated = generateData();

// Seed deterministic E.164 US phone numbers for customers. Using a stable
// formula keyed off the customer id keeps demo data reproducible across runs
// without pulling in @faker-js/faker just for this one field.
const customersWithPhone = generated.customers.map((customer) => {
  const seed = (customer.id * 7919 + 1234567) % 9000000;
  const national = String(2000000000 + seed).padStart(10, "0");
  return { ...customer, phone: `+1${national}` };
});

// Seed deterministic hex colors for categories from a fixed palette so the
// demo's ColorField/ColorInput have realistic values without adding a faker
// dependency. Cycles via modulo to keep assignments stable across reloads.
const CATEGORY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];
const categoriesWithColor = generated.categories.map((category, i) => ({
  ...category,
  color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
}));

const data = {
  ...generated,
  customers: customersWithPhone,
  categories: categoriesWithColor,
  places: placesSeed,
  tasks: tasksSeed,
  reports: reportsSeed,
  documents: documentsSeed,
  onboardings: onboardingsSeed,
  subscriptions: subscriptionsSeed,
  api_keys: apiKeysSeed,
  webhooks: webhooksSeed,
  scheduled_jobs: scheduledJobsSeed,
  approvals: approvalsSeed,
  order_comments: orderCommentsSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
