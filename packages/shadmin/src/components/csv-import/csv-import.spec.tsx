import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  CommitStep,
  CommitWithErrors,
  MapStep,
  PreviewStep,
} from "./csv-import.stories";

describe("<CsvImport />", () => {
  it("renders an Import button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /import/i }))
      .toBeInTheDocument();
  });

  it("auto-matches CSV headers to schema fields", async () => {
    const screen = render(<MapStep />);
    // await screen.getByRole("button", { name: /import/i }).click();
    // Advance from upload step to map step (Next button)
    await screen.getByRole("button", { name: /next/i }).click();
    // The "reference" field's select should have "Reference" auto-selected
    const referenceSelect = document.querySelector(
      '[data-csv-field="reference"]',
    ) as HTMLSelectElement | null;
    expect(referenceSelect?.value).toBe("Reference");
    // "price" also auto-matches (exact case-insensitive)
    const priceSelect = document.querySelector(
      '[data-csv-field="price"]',
    ) as HTMLSelectElement | null;
    expect(priceSelect?.value).toBe("price");
  }, 5_000);

  it("validates rows against schema and shows valid/error counters", async () => {
    const screen = render(<PreviewStep />);
    // await screen.getByRole("button", { name: /import/i }).click();
    // Advance: upload → map
    // await screen.getByRole("button", { name: /next/i }).click();
    // Advance: map → preview
    await screen.getByRole("button", { name: /next/i }).click();
    await expect.element(screen.getByText(/1 valid/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/1 errors/i)).toBeInTheDocument();
  }, 5_000);

  it("parses an uploaded CSV file and shows row count", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("button", { name: /import/i }).click();
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    const csv =
      "reference,name,price\nNB-001,Notebook,9.99\nPN-002,Pencil,1.50\n";
    const file = new File([csv], "products.csv", { type: "text/csv" });
    const input = document.querySelector(
      '[data-testid="csv-file-input"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    const dt = new DataTransfer();
    dt.items.add(file);
    Object.defineProperty(input, "files", {
      value: dt.files,
      writable: false,
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect
      .element(screen.getByText(/2 rows parsed/i))
      .toBeInTheDocument();
  }, 5_000);

  it("commits valid rows via dataProvider.create and shows complete", async () => {
    // CommitStep story auto-advances to step 4 (commit), which auto-imports
    // on mount and shows "Import complete" when done — no extra click needed.
    const screen = render(<CommitStep />);
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    await expect
      .element(screen.getByText(/import complete/i))
      .toBeInTheDocument();
  }, 5_000);

  it("shows the error download button after commit when errors exist", async () => {
    // CommitWithErrors story auto-advances to step 4 (commit)
    const screen = render(<CommitWithErrors />);
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    // await screen.getByRole("button", { name: /next/i }).click();
    await expect
      .element(screen.getByRole("button", { name: /download error report/i }))
      .toBeInTheDocument();
  }, 5_000);
}, 10_000);
