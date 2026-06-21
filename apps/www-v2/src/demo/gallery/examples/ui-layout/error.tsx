import { Error } from "shadmin/components/admin";

export default function Example() {
  return (
    <Error
      error={new Error("Something went wrong while loading the resource.")}
      resetErrorBoundary={() => {}}
    />
  );
}
