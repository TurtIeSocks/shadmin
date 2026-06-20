import fakeRestProvider from "ra-data-fakerest";
import { fakeTransport } from "shadmin-core";
import { realtimeDataProvider } from "shadmin-core";

const seed = { posts: [{ id: 1, title: "alpha" }] };

export const editTransport = fakeTransport();
export const editDataProvider = realtimeDataProvider(
  fakeRestProvider(seed, false),
  editTransport,
);
