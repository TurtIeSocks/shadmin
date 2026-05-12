"use client";

import jsonServerProvider from "ra-data-json-server";
import { Admin } from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";
import { EditGuesser } from "@/components/admin/edit-guesser";
import { Resource } from "@/components/admin/resource";

const dataProvider = jsonServerProvider(
  "https://jsonplaceholder.typicode.com/",
);

export const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource
      name="posts"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
  </Admin>
);
