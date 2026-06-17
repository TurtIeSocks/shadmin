import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  NotificationContextProvider,
  UndoableMutationsContextProvider,
  useNotify,
} from "shadmin-core";
import { toast } from "sonner";

import { Notification } from "@/components/admin/feedback/notification";
import { Undoable } from "@/components/admin/feedback/notification.stories";

const CustomDurationNotifyButton = ({
  autoHideDuration,
}: {
  autoHideDuration: number | null;
}) => {
  const notify = useNotify();

  return (
    <button
      onClick={() =>
        notify("Custom duration message", {
          autoHideDuration,
        })
      }
    >
      Trigger notification
    </button>
  );
};

const renderNotificationWithAutoHideDuration = (
  autoHideDuration: number | null,
) =>
  render(
    <NotificationContextProvider>
      <UndoableMutationsContextProvider>
        <CustomDurationNotifyButton autoHideDuration={autoHideDuration} />
        <Notification />
      </UndoableMutationsContextProvider>
    </NotificationContextProvider>,
  );

describe("Notification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    toast.dismiss();
  });

  it("should undo several notifications correctly", async () => {
    const screen = render(<Undoable />);
    const button = screen.getByText("Trigger mutation");

    // Trigger first notification and undo it before queuing the next one,
    // since the notification queue is now one-at-a-time.
    await button.click();
    await expect
      .element(screen.getByText("mutation 1 triggered"))
      .toBeVisible();
    // Sonner animates toasts in over ~400ms; force the click so the test
    // doesn't retry-storm while the button is still moving into place.
    await screen.getByText("ra.action.undo").click({ force: true });
    await expect
      .element(screen.getByText("mutation 1 undone"))
      .toBeInTheDocument();
    // Wait for the first toast (and its undo button) to be fully dismissed
    // so the queue can release the slot for the next notification.
    await expect
      .element(screen.getByText("ra.action.undo"))
      .not.toBeInTheDocument();

    // Trigger the second notification only after the first has been dismissed.
    await button.click();
    await expect
      .element(screen.getByText("mutation 2 triggered"))
      .toBeVisible();
    await screen.getByText("ra.action.undo").click({ force: true });
    await expect
      .element(screen.getByText("mutation 2 undone"))
      .toBeInTheDocument();

    // Neither mutation should have been "executed" - both were undone.
    await expect
      .element(screen.getByText("mutation 1 executed"))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByText("mutation 2 executed"))
      .not.toBeInTheDocument();
  });

  it("should pass autoHideDuration to sonner duration", async () => {
    const infoSpy = vi.spyOn(toast, "info");
    const screen = renderNotificationWithAutoHideDuration(10_000);

    await screen.getByText("Trigger notification").click();

    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls.at(-1)?.[1]?.duration).toBe(10_000);
  });

  it("should map null autoHideDuration to a persistent toast", async () => {
    const infoSpy = vi.spyOn(toast, "info");
    const screen = renderNotificationWithAutoHideDuration(null);

    await screen.getByText("Trigger notification").click();

    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls.at(-1)?.[1]?.duration).toBe(Infinity);
  });
});
