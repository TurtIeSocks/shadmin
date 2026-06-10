import * as React from "react";
import type { ReactNode } from "react";
import { ShowBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import {
  ShowView,
  type ShowProps,
  type ShowViewProps,
} from "@/components/admin/show";
import { Loading } from "@/components/admin/loading";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { showFieldTypes } from "./show-field-types";

type SupabaseShowGuesserProps = Omit<ShowProps, "children"> & {
  enableLog?: boolean;
};

function SupabaseShowGuesser(props: SupabaseShowGuesserProps) {
  const { id, disableAuthentication, queryOptions, resource, ...rest } = props;
  return (
    <ShowBase
      id={id}
      disableAuthentication={disableAuthentication}
      queryOptions={queryOptions}
      resource={resource}
    >
      <SupabaseShowGuesserView {...rest} />
    </ShowBase>
  );
}

const SupabaseShowGuesserView = (
  props: Omit<ShowViewProps, "children"> & { enableLog?: boolean },
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseShowGuesser must be used within a ResourceContext",
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
    const inferred = Object.keys(def.properties)
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) => {
        const prop = def.properties?.[s];
        if (!prop)
          return new InferredElement(showFieldTypes.string, { source: s });
        return inferElementFromType({
          name: s,
          types: showFieldTypes,
          description: prop.description,
          format: prop.format,
          type: typeof prop.type === "string" ? prop.type : "string",
          schema,
        });
      });
    const layout = new InferredElement(showFieldTypes.show, null, inferred);
    setChild(layout.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed Show:\n\nexport const ${capitalize(
        singularize(resource),
      )}Show = () => (\n    <Show>\n${layout.getRepresentation()}\n    </Show>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <ShowView {...rest}>{child}</ShowView>;
};

export { type SupabaseShowGuesserProps, SupabaseShowGuesser };
