import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "shadmin/components/ui/dropdown-menu";
import { Button } from "shadmin/components/ui/button";
import { Logout } from "shadmin/components/admin";

export default function Example() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          User menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Logout />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
