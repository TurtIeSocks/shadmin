"use client";

import jsonServerProvider from "ra-data-json-server";
import { Admin } from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/guessers/list-guesser";
import { ShowGuesser } from "@/components/admin/guessers/show-guesser";
import { EditGuesser } from "@/components/admin/guessers/edit-guesser";
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
