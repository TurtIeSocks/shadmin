import { AuthLayout } from "shadmin/components/admin";

export default function Example() {
  return (
    <AuthLayout title="Sign In" subtitle="Enter your credentials to continue.">
      <div className="rounded border p-6 text-sm text-muted-foreground">
        Login form goes here.
      </div>
    </AuthLayout>
  );
}
