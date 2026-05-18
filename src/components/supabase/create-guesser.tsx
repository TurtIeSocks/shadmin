import * as React from "react";
import type { ReactNode } from "react";
import { CreateBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import {
  CreateView,
  type CreateProps,
  type CreateViewProps,
} from "@/components/admin/create";
import { Loading } from "@/components/admin/loading";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { editFieldTypes } from "./edit-field-types";

type SupabaseCreateGuesserProps = Omit<CreateProps, "children"> & {
  enableLog?: boolean;
};

function SupabaseCreateGuesser(props: SupabaseCreateGuesserProps) {
  const {
    mutationOptions,
    resource,
    record,
    transform,
    redirect,
    disableAuthentication,
    ...rest
  } = props;
  return (
    <CreateBase
      resource={resource}
      record={record}
      redirect={redirect}
      transform={transform}
      mutationOptions={mutationOptions}
      disableAuthentication={disableAuthentication}
    >
      <SupabaseCreateGuesserView {...rest} />
    </CreateBase>
  );
};

const SupabaseCreateGuesserView = (
  props: Omit<CreateViewProps, "children"> & { enableLog?: boolean },
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseCreateGuesser must be used within a ResourceContext",
    );
  }

  React.useEffect(() => {
    if (isPending || error || !schema) return;
    const def = schema.definitions?.[resource];
    const requiredFields = def?.required ?? [];
    if (!def || !def.properties) {
      throw new Error(
        `The resource ${resource} is not defined in the API schema`,
      );
    }
    const inferredInputs = Object.keys(def.properties)
      .filter((s) => s !== "id")
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) => {
        const prop = def.properties?.[s];
        if (!prop)
          return new InferredElement(editFieldTypes.string, { source: s });
        return inferElementFromType({
          name: s,
          types: editFieldTypes,
          description: prop.description,
          format: prop.format,
          type: typeof prop.type === "string" ? prop.type : "string",
          requiredFields,
          schema,
        });
      });
    const form = new InferredElement(editFieldTypes.form, null, inferredInputs);
    setChild(form.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed Create:\n\nexport const ${capitalize(
        singularize(resource),
      )}Create = () => (\n    <Create>\n${form.getRepresentation()}\n    </Create>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <CreateView {...rest}>{child}</CreateView>;
};

export { type SupabaseCreateGuesserProps, SupabaseCreateGuesser };
