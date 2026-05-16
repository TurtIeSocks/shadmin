import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";
import { tasksSeed } from "./planning";

const data = {
  ...generateData(),
  places: placesSeed,
  tasks: tasksSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
