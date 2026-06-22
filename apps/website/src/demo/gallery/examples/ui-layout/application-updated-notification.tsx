import { ApplicationUpdatedNotification } from "shadmin/components/admin";

export default function Example() {
  return (
    <ApplicationUpdatedNotification
      message="A new version of this application is available."
      buttonLabel="Reload"
      onReload={() => {}}
    />
  );
}
