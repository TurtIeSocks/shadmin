import * as React from "react";
import type { ReactNode } from "react";
import { ListBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import {
  ListView,
  type ListProps,
  type ListViewProps,
} from "@/components/admin/list";
import { Loading } from "@/components/admin/loading";
import { GuesserEmpty } from "@/components/admin/guesser-empty";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { listFieldTypes } from "./list-field-types";

export type SupabaseListGuesserProps = ListProps & { enableLog?: boolean };

/**
 * Supabase-aware drop-in `<List>` for resources whose shape is
 * described by the Supabase OpenAPI schema. Detects foreign keys
 * (rendered as `<ReferenceField>`) and timestamps (rendered as
 * `<DateField>`). When the resource provides no records yet,
 * renders the kit's `<GuesserEmpty>` so the developer knows how to
 * seed data.
 *
 * Logs the equivalent hand-written `<List>` source to the console
 * unless `enableLog={false}`.
 */
export const SupabaseListGuesser = (props: SupabaseListGuesserProps) => {
  const {
    debounce,
    disableAuthentication,
    disableSyncWithLocation,
    empty,
    exporter,
    filter,
    filterDefaultValues,
    perPage,
    queryOptions,
    resource,
    sort,
    storeKey,
    ...rest
  } = props;
  return (
    <ListBase
      debounce={debounce}
      disableAuthentication={disableAuthentication}
      disableSyncWithLocation={disableSyncWithLocation}
      empty={empty === undefined ? <GuesserEmpty /> : empty}
      exporter={exporter}
      filter={filter}
      filterDefaultValues={filterDefaultValues}
      perPage={perPage}
      queryOptions={queryOptions}
      resource={resource}
      sort={sort}
      storeKey={storeKey}
    >
      <SupabaseListGuesserView {...rest} />
    </ListBase>
  );
};

const SupabaseListGuesserView = (
  props: ListViewProps & { enableLog?: boolean },
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseListGuesser must be used within a ResourceContext",
    );
  }

  React.useEffect(() => {
    if (isPending || error || !schema) return;
    const def = schema.definitions?.[resource];
    if (!def || !def.properties) {
      throw new Error(
        `The resource ${resource} is not defined in the API schema`,
      );
    }
    const inferredFields = Object.keys(def.properties)
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) => {
        const prop = def.properties?.[s];
        if (!prop)
          return new InferredElement(listFieldTypes.string, { source: s });
        return inferElementFromType({
          name: s,
          types: listFieldTypes,
          description: prop.description,
          format: prop.format,
          type: typeof prop.type === "string" ? prop.type : "string",
          schema,
        });
      });
    const table = new InferredElement(
      listFieldTypes.table,
      null,
      inferredFields,
    );
    setChild(table.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed List:\n\nexport const ${capitalize(
        singularize(resource),
      )}List = () => (\n    <List>\n${table.getRepresentation()}\n    </List>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <ListView {...rest}>{child}</ListView>;
};
