import { useMemo } from "react";
import type { ResourceProps } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { SupabaseListGuesser } from "./list-guesser";
import { SupabaseShowGuesser } from "./show-guesser";
import { SupabaseEditGuesser } from "./edit-guesser";
import { SupabaseCreateGuesser } from "./create-guesser";

/**
 * Walks the Supabase OpenAPI schema and produces `<Resource>` props
 * for each resource, wiring up the matching Supabase guesser for
 * each available HTTP verb. Used by `<AdminGuesser>` when the
 * caller does not supply explicit `<Resource>` children.
 *
 * Returns an empty array until `useAPISchema()` resolves.
 */
export const useCrudGuesser = (): ResourceProps[] => {
  const { data: schema, error, isPending } = useAPISchema();
  return useMemo<ResourceProps[]>(() => {
    if (isPending || error || !schema) return [];
    const resourceNames = Object.keys(schema.definitions ?? {});
    return resourceNames.map((name) => {
      const paths = schema.paths?.[`/${name}`] ?? {};
      return {
        name,
        list: paths.get ? SupabaseListGuesser : undefined,
        show: paths.get ? SupabaseShowGuesser : undefined,
        edit: paths.patch ? SupabaseEditGuesser : undefined,
        create: paths.post ? SupabaseCreateGuesser : undefined,
      } satisfies ResourceProps;
    });
  }, [schema, isPending, error]);
};
