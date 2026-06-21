import { AuthError } from "shadmin/components/admin";

export default function Example() {
  return (
    <AuthError
      title="Authentication Error"
      message="Your session has expired. Please sign in again."
    />
  );
}
