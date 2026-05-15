"use client";

import type { ReactElement, ReactNode } from "react";
import { Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { Labeled } from "./labeled";

/**
 * A simple vertical layout for Show views that auto-labels every field child.
 *
 * Each direct child is wrapped in a `<Labeled>` component so that field labels
 * are rendered automatically from the field's `source` prop — matching
 * react-admin's `SimpleShowLayout` behaviour.
 *
 * Suppress a label by passing `label={false}` on the child field, or skip
 * auto-labeling for a specific child by wrapping it in `<Labeled label={false}>`.
 *
 * @see {@link https://marmelab.com/react-admin/SimpleShowLayout.html}
 *
 * @example
 * import { Show, SimpleShowLayout, TextField, NumberField } from '@/components/admin';
 *
 * const PostShow = () => (
 *   <Show>
 *     <SimpleShowLayout>
 *       <TextField source="title" />
 *       <TextField source="author" />
 *       <NumberField source="views" />
 *     </SimpleShowLayout>
 *   </Show>
 * );
 */
export const SimpleShowLayout = ({
  children,
  className,
}: SimpleShowLayoutProps) => (
  <div className={cn("flex flex-col gap-4", className)}>
    {Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      return <Labeled>{child as ReactElement}</Labeled>;
    })}
  </div>
);

export interface SimpleShowLayoutProps {
  children?: ReactNode;
  className?: string;
}
