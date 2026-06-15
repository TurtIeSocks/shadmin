import { useRecordContext, Translate } from "ra-core";
import { z } from "zod";
import {
  BooleanField,
  ColumnsButton,
  DataTable,
  ExportButton,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  List,
  ListPagination,
  CreateButton,
} from "shadmin/components/admin";
import { InPlaceEditor } from "shadmin/components/extras";
import { CsvImport } from "shadmin/components/csv-import";
import { Badge } from "shadmin/components/ui/badge";
import { Card } from "shadmin/components/ui/card";
import { Clock, DollarSign, Mail, Users } from "lucide-react";
import {
  endOfYesterday,
  startOfWeek,
  subWeeks,
  startOfMonth,
  subMonths,
} from "date-fns";
import segments from "../segments/data";

import { FullNameField } from "./FullNameField";
import { useIsMobile } from "shadmin/hooks/use-mobile";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const smallDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

const CustomerImportSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
});

export const CustomerList = () => {
  const isMobile = useIsMobile();

  return (
    <List
      perPage={25}
      sort={{ field: "last_seen", order: "DESC" }}
      pagination={false}
      actions={
        <div className="flex items-center gap-2">
          <CreateButton />
          <CsvImport schema={CustomerImportSchema} />
          <ColumnsButton />
          <ExportButton />
        </div>
      }
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="lg:w-4xl">
          <DataTable>
            <DataTable.Col
              label="resources.customers.fields.name"
              source="last_name"
            >
              <FullNameField />
            </DataTable.Col>
            <DataTable.Col
              source="nb_orders"
              label="resources.customers.fields.orders"
              className="hidden md:table-cell text-right"
              render={(record) =>
                record.nb_orders > 0 ? record.nb_orders : ""
              }
            />
            <DataTable.NumberCol
              source="total_spent"
              options={{ style: "currency", currency: "USD" }}
              conditionalClassName={(record) =>
                record.total_spent > 500 && "dark:text-green-500 text-lime-700"
              }
              className="hidden md:table-cell"
            />
            <DataTable.Col
              source="last_seen"
              render={(record) =>
                isMobile
                  ? smallDateTimeFormatter.format(new Date(record.last_seen))
                  : dateTimeFormatter.format(new Date(record.last_seen))
              }
            />
            <DataTable.Col
              source="email"
              label="resources.customers.fields.email"
              className="hidden lg:table-cell"
            >
              <InPlaceEditor source="email" />
            </DataTable.Col>
            <DataTable.Col
              source="has_newsletter"
              className="hidden md:table-cell"
            >
              <BooleanField source="has_newsletter" />
            </DataTable.Col>
            <DataTable.Col
              label="resources.customers.fields.groups"
              className="hidden md:table-cell"
            >
              <SegmentList />
            </DataTable.Col>
          </DataTable>
          <ListPagination className="justify-start mt-2" />
        </div>
      </div>
    </List>
  );
};

const SegmentList = () => {
  const record = useRecordContext();
  if (!record || !record.groups) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {record.groups.map((segment: string) => (
        <Badge variant="outline" key={segment}>
          <Translate
            i18nKey={segments.find((s) => s.id === segment)?.name || segment}
          />
        </Badge>
      ))}
    </div>
  );
};

const SidebarFilters = () => (
  <Card className="min-w-48 p-4 hidden md:block">
    <FilterLiveSearch />
    <FilterList
      label="resources.customers.filters.last_visited"
      icon={<Clock size={16} />}
    >
      <FilterListItem
        label="resources.customers.filters.today"
        value={{
          last_seen_gte: endOfYesterday().toISOString(),
          last_seen_lte: undefined,
        }}
      />
      <FilterListItem
        label="resources.customers.filters.this_week"
        value={{
          last_seen_gte: startOfWeek(new Date()).toISOString(),
          last_seen_lte: undefined,
        }}
      />
      <FilterListItem
        label="resources.customers.filters.last_week"
        value={{
          last_seen_gte: subWeeks(startOfWeek(new Date()), 1).toISOString(),
          last_seen_lte: startOfWeek(new Date()).toISOString(),
        }}
      />
      <FilterListItem
        label="resources.customers.filters.this_month"
        value={{
          last_seen_gte: startOfMonth(new Date()).toISOString(),
          last_seen_lte: undefined,
        }}
      />
      <FilterListItem
        label="resources.customers.filters.last_month"
        value={{
          last_seen_gte: subMonths(startOfMonth(new Date()), 1).toISOString(),
          last_seen_lte: startOfMonth(new Date()).toISOString(),
        }}
      />
      <FilterListItem
        label="resources.customers.filters.earlier"
        value={{
          last_seen_gte: undefined,
          last_seen_lte: subMonths(startOfMonth(new Date()), 1).toISOString(),
        }}
      />
    </FilterList>
    <FilterList
      label="resources.customers.filters.has_ordered"
      icon={<DollarSign size={16} />}
    >
      <FilterListItem
        label="ra.boolean.true"
        value={{
          nb_orders_gte: 1,
          nb_orders_lte: undefined,
        }}
      />
      <FilterListItem
        label="ra.boolean.false"
        value={{
          nb_orders_gte: undefined,
          nb_orders_lte: 0,
        }}
      />
    </FilterList>
    <FilterList
      label="resources.customers.filters.has_newsletter"
      icon={<Mail size={16} />}
    >
      <FilterListItem
        label="ra.boolean.true"
        value={{ has_newsletter: true }}
      />
      <FilterListItem
        label="ra.boolean.false"
        value={{ has_newsletter: false }}
      />
    </FilterList>
    <FilterList
      label="resources.customers.filters.group"
      icon={<Users size={16} />}
    >
      {segments.map((segment) => (
        <FilterListItem
          key={segment.id}
          label={segment.name}
          value={{ groups: segment.id }}
        />
      ))}
    </FilterList>
  </Card>
);
