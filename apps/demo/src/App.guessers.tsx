import { dataProvider } from "./dataProvider";
import { Admin } from "shadcn-admin-kit/components/admin/admin";
import { ListGuesser } from "shadcn-admin-kit/components/admin/list-guesser";
import { ShowGuesser } from "shadcn-admin-kit/components/admin/show-guesser";
import { EditGuesser } from "shadcn-admin-kit/components/admin/edit-guesser";
import { Resource } from "shadcn-admin-kit/components/admin/resource";

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
