import { dataProvider } from "./dataProvider";
import { Admin } from "shadmin/components/admin/admin";
import { ListGuesser } from "shadmin/components/admin/list-guesser";
import { ShowGuesser } from "shadmin/components/admin/show-guesser";
import { EditGuesser } from "shadmin/components/admin/edit-guesser";
import { Resource } from "shadmin/components/admin/resource";

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
