import { DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";
import { BookOpen, Star } from "lucide-react";
import { i18nProvider } from "@/lib/i18n-provider";
import { Admin, List, ShowGuesser, SimpleList } from "@/components/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default {
  title: "Page components/SimpleList",
};

const data = {
  books: [
    {
      id: 1,
      title: "War and Peace",
      author: "Leo Tolstoy",
      year: 1869,
      rating: 5,
    },
    {
      id: 2,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      year: 1813,
      rating: 4,
    },
    {
      id: 3,
      title: "The Picture of Dorian Gray",
      author: "Oscar Wilde",
      year: 1890,
      rating: 4,
    },
    {
      id: 4,
      title: "Le Petit Prince",
      author: "Gustave Flaubert",
      year: 1856,
      rating: 5,
    },
    {
      id: 5,
      title: "The Alchemist",
      author: "Antoine de Saint-Exupéry",
      year: 1943,
      rating: 5,
    },
  ],
};

type Book = (typeof data.books)[number];

const dataProvider = fakeRestDataProvider(data) as DataProvider;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestMemoryRouter initialEntries={["/books"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="books"
        list={<List pagination={false}>{children}</List>}
        show={ShowGuesser}
        edit={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <SimpleList<Book>
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
    />
  </Wrapper>
);

export const WithTertiaryText = () => (
  <Wrapper>
    <SimpleList<Book>
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
      tertiaryText={(record) => record.year}
    />
  </Wrapper>
);

export const WithLeftAvatar = () => (
  <Wrapper>
    <SimpleList<Book>
      leftAvatar={(record) => (
        <Avatar>
          <AvatarFallback>{record.title.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
    />
  </Wrapper>
);

export const WithLeftIcon = () => (
  <Wrapper>
    <SimpleList<Book>
      leftIcon={() => <BookOpen className="size-5 text-muted-foreground" />}
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
    />
  </Wrapper>
);

export const WithRightIcon = () => (
  <Wrapper>
    <SimpleList<Book>
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
      rightIcon={(record) => (
        <div className="flex items-center gap-1 text-sm">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          {record.rating}
        </div>
      )}
    />
  </Wrapper>
);

export const ShowLink = () => (
  <Wrapper>
    <SimpleList<Book>
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
      linkType="show"
    />
  </Wrapper>
);

export const NoLink = () => (
  <Wrapper>
    <SimpleList<Book>
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
      linkType={false}
    />
  </Wrapper>
);
