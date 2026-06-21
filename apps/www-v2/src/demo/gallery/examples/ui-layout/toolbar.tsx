import { Form } from "shadmin-core";
import { Toolbar, SaveButton } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="max-w-sm border rounded p-4">
      <Form>
        <Toolbar>
          <SaveButton />
        </Toolbar>
      </Form>
    </div>
  );
}
