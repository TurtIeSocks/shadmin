import {
  BooleanInput,
  Edit,
  NumberInput,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";

/** Reviews edit — allow moderators to update rating, approval, and comment. */
export const ReviewsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-xl">
      <NumberInput source="rating" min={0} max={5} />
      <BooleanInput source="approved" />
      <TextInput source="comment" multiline />
    </SimpleForm>
  </Edit>
);
