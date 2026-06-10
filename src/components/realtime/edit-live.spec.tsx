import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "./edit-live.stories";
import { editDataProvider, editTransport } from "@/components/realtime/__fixtures__/edit-live-fixtures";

describe("<EditLive>", () => {
  it("renders the title input", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeVisible();
  });

  it("refreshes when an event arrives for the record", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/^title$/i)).toHaveValue("alpha");
    await editDataProvider.update("posts", { id: 1, data: { id: 1, title: "beta" }, previousData: { id: 1, title: "alpha" } });
    await editTransport.publish("resource/posts/1", { type: "updated", payload: { ids: [1] } });
    await expect.element(screen.getByLabelText(/^title$/i)).toHaveValue("beta");
  });
});
