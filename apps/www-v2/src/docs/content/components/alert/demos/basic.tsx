import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "shadmin/components/ui/alert";

export default function AlertBasicDemo() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          shadmin Alert — informational banner with title and description.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
