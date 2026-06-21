import { Error as ErrorView } from "shadmin/components/admin";

export default function Example() {
  return (
    <ErrorView
      error={new Error("Something went wrong while loading the resource.")}
      resetErrorBoundary={() => {}}
    />
  );
}
