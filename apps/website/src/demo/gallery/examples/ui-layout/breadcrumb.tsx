import { BreadcrumbPage } from "shadmin/components/admin";
import {
  Breadcrumb as BaseBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "shadmin/components/ui/breadcrumb";

export default function Example() {
  return (
    <BaseBreadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <span className="text-muted-foreground">Home</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span className="text-muted-foreground">Posts</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbPage>Edit Post</BreadcrumbPage>
      </BreadcrumbList>
    </BaseBreadcrumb>
  );
}
