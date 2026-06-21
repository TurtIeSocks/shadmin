import { Confirm } from "shadmin/components/admin";

export default function Example() {
  return (
    <Confirm
      isOpen
      title="Delete record?"
      content="This action cannot be undone."
      onClose={() => {}}
      onConfirm={() => {}}
    />
  );
}
