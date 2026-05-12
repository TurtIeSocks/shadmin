import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  HighlightToggle,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type RealmPlugin,
} from "@mdxeditor/editor";

/**
 * Plugin preset used by `MdxField` for read-only markdown rendering.
 * Excludes the toolbar plugin.
 */
export const defaultFieldPlugins: RealmPlugin[] = [
  headingsPlugin(),
  imagePlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  listsPlugin(),
  markdownShortcutPlugin(),
  quotePlugin(),
  tablePlugin(),
  thematicBreakPlugin(),
];

/**
 * Plugin preset used by `MdxInput`. Builds on `defaultFieldPlugins` and adds
 * the toolbar plugin with the default toolbar contents.
 */
export const defaultInputPlugins: RealmPlugin[] = [
  ...defaultFieldPlugins,
  toolbarPlugin({
    toolbarContents: () => (
      <div className="ra-mdx-toolbar-container flex w-full flex-wrap items-center justify-center gap-1">
        <UndoRedo />
        <Separator />
        <BoldItalicUnderlineToggles />
        <HighlightToggle />
        <Separator />
        <StrikeThroughSupSubToggles />
        <Separator />
        <ListsToggle />
        <Separator />
        <BlockTypeSelect />
        <Separator />
        <CreateLink />
        <InsertImage />
        <Separator />
        <InsertTable />
        <InsertThematicBreak />
        <Separator />
        <CodeToggle />
      </div>
    ),
  }),
];
