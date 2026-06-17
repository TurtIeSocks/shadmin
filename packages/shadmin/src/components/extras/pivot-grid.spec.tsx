import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin } from "@/components/admin";
import { PivotGrid } from "@/components/extras";
import { List } from "@/components/admin/list";
import { Basic, Count } from "./pivot-grid.stories";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  {
    allowMissing: true,
  },
);

describe("<PivotGrid />", () => {
  it("renders cells with correct aggregated values for sum aggregator", async () => {
    const screen = render(<Basic />);
    // Wait for data to load — the grid header should appear
    await expect.element(screen.getByText("region")).toBeInTheDocument();

    // North + pending = 120 + 80 = 200
    const northPending = document.querySelector('[data-cell="North::pending"]');
    expect(northPending?.textContent?.trim()).toBe("200");

    // South + shipped = 300 + 150 = 450
    const southShipped = document.querySelector('[data-cell="South::shipped"]');
    expect(southShipped?.textContent?.trim()).toBe("450");

    // East + delivered = 400
    const eastDelivered = document.querySelector(
      '[data-cell="East::delivered"]',
    );
    expect(eastDelivered?.textContent?.trim()).toBe("400");
  });

  it("count aggregator works when valueField is omitted", async () => {
    const screen = render(<Count />);
    await expect.element(screen.getByText("region")).toBeInTheDocument();

    // North has 1 pending and 1 shipped → count of pending = 2 (both pending)
    // North: pending=2, shipped=1
    const northPending = document.querySelector('[data-cell="North::pending"]');
    expect(northPending?.textContent?.trim()).toBe("2");

    const northShipped = document.querySelector('[data-cell="North::shipped"]');
    expect(northShipped?.textContent?.trim()).toBe("1");

    // South: pending=1, shipped=2
    const southPending = document.querySelector('[data-cell="South::pending"]');
    expect(southPending?.textContent?.trim()).toBe("1");

    const southShipped = document.querySelector('[data-cell="South::shipped"]');
    expect(southShipped?.textContent?.trim()).toBe("2");
  });

  it("empty data renders empty label", async () => {
    const dp = fakeRestDataProvider({ items: [] }) as DataProvider;
    const screen = render(
      <TestMemoryRouter initialEntries={["/items"]}>
        <Admin
          dataProvider={dp}
          i18nProvider={i18nProvider}
          store={memoryStore()}
        >
          <Resource
            name="items"
            list={() => (
              <List perPage={500}>
                <PivotGrid
                  rowField="region"
                  columnField="status"
                  valueField="amount"
                  aggregator="sum"
                  emptyLabel="Nothing here"
                />
              </List>
            )}
            recordRepresentation="id"
          />
        </Admin>
      </TestMemoryRouter>,
    );

    await expect.element(screen.getByText("Nothing here")).toBeInTheDocument();

    const emptySlot = document.querySelector('[data-slot="pivot-grid-empty"]');
    expect(emptySlot).toBeTruthy();
  });

  it("row and column totals are correct for sum aggregator", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("region")).toBeInTheDocument();

    // North row total = 120 + 80 + 200 = 400
    const northTotal = document.querySelector('[data-cell="North::__total"]');
    expect(northTotal?.textContent?.trim()).toBe("400");

    // Grand total = sum of all amounts = 120+80+200+50+300+150+90+400+220+180 = 1790
    const grandTotal = document.querySelector('[data-cell="grand-total"]');
    expect(grandTotal?.textContent?.trim()).toBe("1790");
  });

  it("renders em dash for empty intersections", async () => {
    const dp = fakeRestDataProvider({
      orders: [
        { id: 1, region: "North", status: "pending", amount: 100 },
        { id: 2, region: "South", status: "shipped", amount: 200 },
      ],
    }) as DataProvider;

    const screen = render(
      <TestMemoryRouter initialEntries={["/orders"]}>
        <Admin
          dataProvider={dp}
          i18nProvider={i18nProvider}
          store={memoryStore()}
        >
          <Resource
            name="orders"
            list={() => (
              <List perPage={500}>
                <PivotGrid
                  rowField="region"
                  columnField="status"
                  valueField="amount"
                  aggregator="sum"
                />
              </List>
            )}
            recordRepresentation="id"
          />
        </Admin>
      </TestMemoryRouter>,
    );

    await expect.element(screen.getByText("region")).toBeInTheDocument();

    // North::shipped has no data → em dash
    const northShipped = document.querySelector('[data-cell="North::shipped"]');
    expect(northShipped?.textContent?.trim()).toBe("—");

    // South::pending has no data → em dash
    const southPending = document.querySelector('[data-cell="South::pending"]');
    expect(southPending?.textContent?.trim()).toBe("—");
  });
});
