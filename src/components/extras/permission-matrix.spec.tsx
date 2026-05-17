import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, ReadOnly } from "@/stories/extras/permission-matrix.stories";

describe("<PermissionMatrix />", () => {
  it("renders one tab per role", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByRole("tab", { name: "admin" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "editor" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "viewer" }))
      .toBeInTheDocument();
  });

  it("clicking a cell calls onChange with the updated state", async () => {
    const screen = render(<Basic theme="system" />);
    // The first tab (admin) is active by default. Click the "list" checkbox for "products".
    const checkbox = screen.getByRole("checkbox", {
      name: "admin list products",
    });
    await checkbox.click();
    // The state display below the matrix should now show the updated state.
    const pre = screen.getByTestId("state-display");
    await expect.element(pre).toBeInTheDocument();
    const text = await pre.element().textContent;
    const parsed = JSON.parse(text ?? "{}");
    expect(parsed?.admin?.products?.list).toBe(true);
  });

  it("clicking All toggles all actions for that resource", async () => {
    const screen = render(<Basic theme="system" />);
    // Click the All checkbox for "products" in the "admin" tab.
    const allCheckbox = screen.getByRole("checkbox", {
      name: "admin all products",
    });
    await allCheckbox.click();
    const pre = screen.getByTestId("state-display");
    await expect.element(pre).toBeInTheDocument();
    const text = await pre.element().textContent;
    const parsed = JSON.parse(text ?? "{}");
    // All actions should now be true for admin/products.
    const productPerms = parsed?.admin?.products ?? {};
    expect(productPerms.list).toBe(true);
    expect(productPerms.show).toBe(true);
    expect(productPerms.create).toBe(true);
    expect(productPerms.edit).toBe(true);
    expect(productPerms.delete).toBe(true);
  });

  it("checkboxes are disabled in readOnly mode", async () => {
    const screen = render(<ReadOnly theme="system" />);
    const checkboxes = screen.getByRole("checkbox", {
      name: "admin list products",
    });
    await expect.element(checkboxes).toBeDisabled();
  });
});
