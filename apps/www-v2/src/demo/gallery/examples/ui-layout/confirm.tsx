import { useState } from "react";
import { Confirm } from "shadmin/components/admin/feedback/confirm";
import { Button } from "shadmin/components/ui/button";

export default function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        Delete record
      </Button>
      <Confirm
        isOpen={isOpen}
        title="Delete record?"
        content="This action cannot be undone."
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
      />
    </div>
  );
}
