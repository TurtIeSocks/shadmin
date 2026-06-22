import { CardContentInner } from "shadmin/components/admin";
import { Card } from "shadmin/components/ui/card";

export default function Example() {
  return (
    <Card className="max-w-sm">
      <CardContentInner>First section content</CardContentInner>
      <CardContentInner>Second section content</CardContentInner>
      <CardContentInner>Third section content</CardContentInner>
    </Card>
  );
}
