import { Sparkles } from "lucide-react";
import { useTranslate } from "ra-core";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ApplicationUpdatedNotificationProps {
  className?: string;
  message?: string;
  buttonLabel?: string;
  onReload?: () => void;
}

/**
 * A floating banner informing the user that a new version of the application
 * is available, with a button to reload the page.
 *
 * Designed to be rendered as the default notification of
 * [`<CheckForApplicationUpdate>`](./CheckForApplicationUpdate.md), but it can
 * also be used standalone to advertise an available update.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/applicationupdatednotification/ ApplicationUpdatedNotification documentation}
 *
 * @example
 * import { ApplicationUpdatedNotification } from "@/components/admin/application-updated-notification";
 *
 * const Notice = () => <ApplicationUpdatedNotification />;
 */
export const ApplicationUpdatedNotification = (
  props: ApplicationUpdatedNotificationProps,
) => {
  const {
    className,
    message = "ra.notification.application_update_available",
    buttonLabel = "ra.action.reload",
    onReload,
  } = props;

  const translate = useTranslate();

  const handleReload = () => {
    if (onReload) {
      onReload();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <Card
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] flex-row items-center gap-3 px-4 py-3",
        className,
      )}
    >
      <Sparkles className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
      <p className="text-sm flex-1">{translate(message, { _: message })}</p>
      <Button size="sm" onClick={handleReload}>
        {translate(buttonLabel, { _: buttonLabel })}
      </Button>
    </Card>
  );
};
