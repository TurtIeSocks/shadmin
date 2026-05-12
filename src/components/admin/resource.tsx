import type { ReactElement } from "react";
import type {
  ResourceDefinition,
  ResourceProps as RaResourceProps,
} from "ra-core";
import { Resource as RaResource } from "ra-core";

export interface ResourceProps extends RaResourceProps {
  /**
   * Sidebar group label used by the default `<Menu>`.
   *
   * Resources with the same group are rendered together under a labeled
   * section. Resources without a group are rendered last without a label.
   */
  group?: string;
}

export interface ResourceDefinitionWithGroup extends ResourceDefinition {
  readonly group?: string;
}

interface RaResourceComponent {
  (props: RaResourceProps): ReactElement;
  raName: string;
  registerResource: (
    props: RaResourceProps,
    permissions?: unknown,
  ) => ResourceDefinition;
}

interface ResourceComponent {
  (props: ResourceProps): ReactElement;
  raName: string;
  registerResource: (
    props: ResourceProps,
    permissions?: unknown,
  ) => ResourceDefinitionWithGroup;
}

const CoreResource = RaResource as unknown as RaResourceComponent;

export const Resource = Object.assign(
  function Resource({ group: _group, ...props }: ResourceProps) {
    return <CoreResource {...props} />;
  },
  {
    raName: "Resource",
    registerResource: (
      props: ResourceProps,
      permissions?: unknown,
    ): ResourceDefinitionWithGroup => ({
      ...CoreResource.registerResource(props, permissions),
      ...(props.group ? { group: props.group } : {}),
    }),
  },
) satisfies ResourceComponent;
