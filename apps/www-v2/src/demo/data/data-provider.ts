import fakeRestDataProvider from "ra-data-fakerest";
import { buildSeedData } from "./seed";

export const dataProvider = fakeRestDataProvider(
  buildSeedData(),
  import.meta.env.DEV,
  300,
);
