import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

import { placesSeed } from "./map";

const data = {
  ...generateData(),
  places: placesSeed,
};

export const dataProvider = fakeRestDataProvider(data, true, 500);
