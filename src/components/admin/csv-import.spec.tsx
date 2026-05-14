import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, MapStep, UploadStep } from "@/stories/csv-import.stories";

describe("<CsvImport />", () => {
  it("renders an Import button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
  });

  it("auto-matches CSV headers to schema fields", async () => {
    const screen = render(<MapStep />);
    await screen.getByRole("button", { name: /import/i }).click();
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
  });

  it("parses an uploaded CSV file and shows row count", async () => {
    const screen = render(<UploadStep />);
    await screen.getByRole("button", { name: /import/i }).click();
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    const csv = "reference,name,price\nNB-001,Notebook,9.99\nPN-002,Pencil,1.50\n";
    const file = new File([csv], "products.csv", { type: "text/csv" });
    const input = document.querySelector('[data-testid="csv-file-input"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    const dt = new DataTransfer();
    dt.items.add(file);
    Object.defineProperty(input, "files", { value: dt.files, writable: false });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect
      .element(screen.getByText(/2 rows parsed/i))
      .toBeInTheDocument();
  });
});
