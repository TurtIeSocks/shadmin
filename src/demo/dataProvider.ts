import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";
import { tasksSeed } from "./planning";
import { reportsSeed } from "./analytics";
import { documentsSeed } from "./workspace";
import { onboardingsSeed } from "./onboarding";

const generated = generateData();

// Add a `metadata` JSON field to a few seed products so the
// MonacoJsonInput on the products edit page has something to show.
const productsWithMetadata = generated.products.map((product, idx) => {
  if (idx === 0) {
    return {
      ...product,
      metadata: { sku: `SKU-${product.reference}`, weight_grams: 250 },
    };
  }
  if (idx === 1) {
    return {
      ...product,
      metadata: {
        sku: `SKU-${product.reference}`,
        weight_grams: 800,
        tags: ["bestseller", "new"],
      },
    };
  }
  if (idx === 2) {
    return {
      ...product,
      metadata: { sku: `SKU-${product.reference}`, weight_grams: 120 },
    };
  }
  return product;
});

const data = {
  ...generated,
  products: productsWithMetadata,
  places: placesSeed,
  tasks: tasksSeed,
  reports: reportsSeed,
  documents: documentsSeed,
  onboardings: onboardingsSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
