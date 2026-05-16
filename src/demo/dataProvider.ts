import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";
import { tasksSeed } from "./planning";
import { reportsSeed } from "./analytics";

const data = {
  ...generateData(),
  places: placesSeed,
  tasks: tasksSeed,
  reports: reportsSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
