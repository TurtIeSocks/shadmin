import { dataProvider } from "./dataProvider";
import { Admin } from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";
import { EditGuesser } from "@/components/admin/edit-guesser";
import { Resource } from "@/components/admin/resource";

function App() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource
        name="products"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
        recordRepresentation="reference"
      />
      <Resource
        name="categories"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
        recordRepresentation="name"
      />
    </Admin>
  );
}

export default App;
