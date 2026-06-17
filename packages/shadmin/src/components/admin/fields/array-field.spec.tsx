import { RecordContextProvider, useListContext } from "shadmin-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ArrayField } from "@/components/admin/fields/array-field";

import { Basic, Empty } from "@/components/admin/fields/array-field.stories";

const TEST_RECORD = {
  id: "record-1",
  values: [{ id: "value-1" }, { id: "value-2" }, { id: "value-3" }],
};

function TestConsumer() {
  const { data = [] } = useListContext<(typeof TEST_RECORD.values)[number]>();
  return (
    <ul>
      {data.map((value) => (
        <li key={value.id} aria-label={value.id}>
          {value.id}
        </li>
      ))}
    </ul>
  );
}

describe("ArrayField", () => {
  it("should pass the value to the list context", async () => {
    const screen = render(
      <RecordContextProvider value={TEST_RECORD}>
        <ArrayField source="values">
          <TestConsumer />
        </ArrayField>
      </RecordContextProvider>,
    );

    await expect.element(screen.getByRole("list")).toBeInTheDocument();
    for (const value of TEST_RECORD.values) {
      await expect
        .element(screen.getByRole("listitem", { name: value.id }))
        .toHaveTextContent(value.id);
    }
  });

  it("should pass empty list to the list context when no data is provided", async () => {
    const screen = render(
      <RecordContextProvider value={{ id: "empty-record", values: [] }}>
        <ArrayField source="values">
          <TestConsumer />
        </ArrayField>
      </RecordContextProvider>,
    );

    await expect.element(screen.getByRole("list")).toBeInTheDocument();
    await expect.element(screen.getByRole("listitem")).not.toBeInTheDocument();
  });

  it("should pass an empty list to the list context when source does not exist", async () => {
    const screen = render(
      <RecordContextProvider value={{ id: "empty-record" }}>
        <ArrayField source="values">
          <TestConsumer />
        </ArrayField>
      </RecordContextProvider>,
    );

    await expect.element(screen.getByRole("list")).toBeInTheDocument();
    await expect.element(screen.getByRole("listitem")).not.toBeInTheDocument();
  });

  it("renders each child field for every array item (story)", async () => {
    const screen = render(<Basic />);
    // The story renders BadgeFields from the `tags` array (Sci-Fi, Comedy, British)
    await expect.element(screen.getByText("Sci-Fi")).toBeInTheDocument();
    await expect.element(screen.getByText("Comedy")).toBeInTheDocument();
    await expect.element(screen.getByText("British")).toBeInTheDocument();
  });

  it("renders nothing for the children when the array is empty (story)", async () => {
    const screen = render(<Empty />);
    // No badges should render
    await expect.element(screen.getByText("Sci-Fi")).not.toBeInTheDocument();
  });
});
