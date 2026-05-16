import { List, TreeList } from "@/components/admin";

/**
 * Categories list rendered as a hierarchical tree.
 *
 * The retail demo dataset's categories are flat (no `parent_id`), so the tree
 * collapses to a single level — but this exercises `<TreeList>` end-to-end and
 * acts as a copy/paste starting point for projects whose category schemas DO
 * include `parent_id`.
 */
export const CategoryList = () => (
  <List pagination={false} perPage={50} actions={false}>
    <TreeList
      parentSource="parent_id"
      titleSource="name"
      defaultExpanded
    />
  </List>
);
