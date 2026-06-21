import { Confirm } from "shadmin/components/admin/feedback/confirm";

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
