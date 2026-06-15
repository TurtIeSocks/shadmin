import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { Star } from "lucide-react";
import { i18nProvider } from "@/lib/i18n-provider";
import {
  Admin,
  EditGuesser,
  List,
  ShowGuesser,
  SimpleList,
} from "@/components/admin";

export default {
  title: "Lists/SimpleList/Reviews",
};

const data = {
  reviews: [
    {
      id: 1,
      customer_id: 101,
      customer_name: "Léa Martin",
      product_id: 7,
      product_reference: "ABC-007",
      rating: 5,
      comment: "Absolutely love this product! Great quality and shipped fast.",
      date: "2025-12-04T10:15:00Z",
      status: "accepted",
    },
    {
      id: 2,
      customer_id: 102,
      customer_name: "Marcus Lee",
      product_id: 12,
      product_reference: "XYZ-012",
      rating: 3,
      comment: "Decent for the price but the color was off.",
      date: "2025-12-02T14:42:00Z",
      status: "pending",
    },
    {
      id: 3,
      customer_id: 103,
      customer_name: "Hana Suzuki",
      product_id: 4,
      product_reference: "DEF-004",
      rating: 1,
      comment: "Arrived broken. Customer service was helpful though.",
      date: "2025-11-28T08:00:00Z",
      status: "rejected",
    },
    {
      id: 4,
      customer_id: 104,
      customer_name: "Diego Pérez",
      product_id: 21,
      product_reference: "GHI-021",
      rating: 4,
      comment: "Works as advertised. Would buy again.",
      date: "2025-11-21T17:30:00Z",
      status: "accepted",
    },
  ],
};

type Review = (typeof data.reviews)[number];

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestMemoryRouter initialEntries={["/reviews"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="reviews"
        list={<List pagination={false}>{children}</List>}
        show={ShowGuesser}
        edit={EditGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const StarBadge = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-1">
    {Array.from({ length: rating }).map((_, idx) => (
      <Star key={idx} className="size-3.5 fill-yellow-400 text-yellow-400" />
    ))}
  </span>
);

export const Basic = () => (
  <Wrapper>
    <SimpleList<Review>
      primaryText={(record) => record.customer_name}
      secondaryText={(record) => record.comment}
      tertiaryText={(record) => dateFormatter.format(new Date(record.date))}
    />
  </Wrapper>
);

export const WithRatingIcon = () => (
  <Wrapper>
    <SimpleList<Review>
      primaryText={(record) => record.customer_name}
      secondaryText={(record) => record.comment}
      tertiaryText={(record) => dateFormatter.format(new Date(record.date))}
      rightIcon={(record) => <StarBadge rating={record.rating} />}
    />
  </Wrapper>
);

export const WithLeftIcon = () => (
  <Wrapper>
    <SimpleList<Review>
      leftIcon={(record) => (
        <span
          className={
            record.status === "accepted"
              ? "size-2 rounded-full bg-green-400"
              : record.status === "rejected"
                ? "size-2 rounded-full bg-red-400"
                : "size-2 rounded-full bg-yellow-400"
          }
        />
      )}
      primaryText={(record) => record.customer_name}
      secondaryText={(record) => record.comment}
      tertiaryText={(record) => dateFormatter.format(new Date(record.date))}
    />
  </Wrapper>
);
