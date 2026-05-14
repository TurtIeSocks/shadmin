import type { ReactElement, ReactNode } from "react";
import {
  Children,
  createContext,
  createElement,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  DataTableBaseProps,
  ExtractRecordPaths,
  HintedString,
  Identifier,
  RaRecord,
  SortPayload,
} from "ra-core";
import {
  DataTableBase,
  DataTableRenderContext,
  DataTableStoreContext,
  FieldTitle,
  RecordContextProvider,
  useDataTableCallbacksContext,
  useDataTableConfigContext,
  useDataTableDataContext,
  useDataTableRenderContext,
  useDataTableSelectedIdsContext,
  useDataTableSortContext,
  useDataTableStoreContext,
  useGetPathForRecordCallback,
  useRecordContext,
  useResourceContext,
  useStore,
  useTimeout,
  useTranslate,
  useTranslateLabel,
} from "ra-core";
import { useNavigate } from "react-router";
import {
  ArrowDownAZ,
  ArrowUpZA,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import get from "lodash/get";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ColumnsSelector,
  ColumnsSelectorItem,
} from "@/components/admin/columns-button";
import { NumberField } from "@/components/admin/number-field";
import {
  BulkActionsToolbar,
  BulkActionsToolbarChildren,
} from "@/components/admin/bulk-actions-toolbar";
import type { UnknownValue } from "@/lib/unknown-types";

const defaultBulkActionButtons = <BulkActionsToolbarChildren />;
const emptyHiddenColumns: string[] = [];

interface DataTableExpandContextValue<RecordType extends RaRecord = RaRecord> {
  expand: ReactElement | null;
  expandedIds: Identifier[];
  toggleExpand: (id: Identifier) => void;
  isRowExpandable?: (record: RecordType) => boolean;
}

const DataTableExpandContext =
  createContext<DataTableExpandContextValue | null>(null);

const useDataTableExpandContext = () => useContext(DataTableExpandContext);

/**
 * A powerful data table with sorting, selection, and column customization.
 *
 * Displays records in a table with built-in support for column sorting, bulk selection, row clicks,
 * and column visibility controls. Use DataTable.Col to define columns.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 *
 * @example
 * import { List, DataTable, ReferenceField, EditButton } from '@/components/admin';
 *
 * export const PostList = () => (
 *   <List>
 *     <DataTable>
 *       <DataTable.Col source="id" />
 *       <DataTable.Col label="User">
 *         <ReferenceField source="user_id" reference="users" />
 *       </DataTable.Col>
 *       <DataTable.Col source="title" />
 *       <DataTable.Col>
 *         <EditButton />
 *       </DataTable.Col>
 *     </DataTable>
 *   </List>
 * );
 */
export function DataTable<RecordType extends RaRecord = RaRecord>(
  props: DataTableProps<RecordType>,
) {
  const {
    children,
    className,
    rowClassName,
    bulkActionButtons = defaultBulkActionButtons,
    bulkActionsToolbar,
    expand,
    expandSingle = false,
    isRowExpandable,
    ...rest
  } = props;
  const hasBulkActions = !!bulkActionsToolbar || bulkActionButtons !== false;
  const [expandedIds, setExpandedIds] = useState<Identifier[]>([]);
  const toggleExpand = useCallback(
    (id: Identifier) => {
      setExpandedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        return expandSingle ? [id] : [...prev, id];
      });
    },
    [expandSingle],
  );
  const expandContextValue = useMemo<DataTableExpandContextValue | null>(
    () =>
      expand
        ? {
            expand,
            expandedIds,
            toggleExpand,
            isRowExpandable: isRowExpandable as (record: RaRecord) => boolean,
          }
        : null,
    [expand, expandedIds, toggleExpand, isRowExpandable],
  );
  const resourceFromContext = useResourceContext(props);
  const storeKey = props.storeKey || `${resourceFromContext}.datatable`;
  const hiddenColumns = rest.hiddenColumns ?? emptyHiddenColumns;
  const [columnRanks] = useStore<number[]>(`${storeKey}_columnRanks`);
  const columns = columnRanks
    ? reorderChildren(children, columnRanks)
    : children;
  const nbColumns = Children.count(children);

  // Provide DataTableStoreContext explicitly so that ColumnsSelector keeps
  // working alongside (rather than inside) DataTableBase. DataTableBase
  // short-circuits its children rendering when isPending or data is empty,
  // so anything that must stay mounted across data states lives outside it.
  const storeContextValue = useMemo(
    () => ({ storeKey, defaultHiddenColumns: hiddenColumns }),
    [storeKey, hiddenColumns],
  );

  return (
    <DataTableExpandContext.Provider value={expandContextValue}>
      <DataTableBase<RecordType>
        hasBulkActions={hasBulkActions}
        loading={
          <DataTableLoadingSkeleton
            className={className}
            hasBulkActions={hasBulkActions}
            nbColumns={nbColumns}
          />
        }
        empty={
          <div className={cn("rounded-md border p-4", className)}>
            <DataTableEmpty />
          </div>
        }
        {...rest}
      >
        <div className={cn("rounded-md border", className)}>
          <Table>
            <DataTableRenderContext.Provider value="header">
              <DataTableHead>{columns}</DataTableHead>
            </DataTableRenderContext.Provider>
            <DataTableBody<RecordType> rowClassName={rowClassName}>
              {columns}
            </DataTableBody>
          </Table>
        </div>
      </DataTableBase>
      {/*
        BulkActionsToolbar and ColumnsSelector are rendered outside
        DataTableBase so they stay mounted in every data state — including
        empty and loading, where DataTableBase short-circuits its children.
        ColumnsSelector reads DataTableStoreContext via useDataTableStoreContext,
        which we provide here; BulkActionsToolbar only depends on the outer
        useListContext (from <List>), so it works regardless.
      */}
      <DataTableStoreContext.Provider value={storeContextValue}>
        {bulkActionsToolbar ??
          (bulkActionButtons !== false && (
            <BulkActionsToolbar>
              {isValidElement(bulkActionButtons)
                ? bulkActionButtons
                : defaultBulkActionButtons}
            </BulkActionsToolbar>
          ))}
        <DataTableRenderContext.Provider value="columnsSelector">
          <ColumnsSelector>{children}</ColumnsSelector>
        </DataTableRenderContext.Provider>
      </DataTableStoreContext.Provider>
    </DataTableExpandContext.Provider>
  );
}

DataTable.Col = DataTableColumn;
DataTable.NumberCol = DataTableNumberColumn;

/**
 * Header row of a DataTable, including the select-page checkbox column.
 * Used internally by `<DataTable>`; also exported for custom DataTable compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const DataTableHead = ({ children }: { children: ReactNode }) => {
  const data = useDataTableDataContext();
  const { hasBulkActions = false } = useDataTableConfigContext();
  const { isRowSelectable, onSelect } = useDataTableCallbacksContext();
  const selectedIds = useDataTableSelectedIdsContext();
  const expandContext = useDataTableExpandContext();
  const handleToggleSelectAll = (checked: boolean | "indeterminate") => {
    if (!onSelect || !data || !selectedIds) return;
    // Narrow to checked === true: the shadcn Checkbox can emit
    // "indeterminate", and we should not treat that as "select all".
    if (checked === true) {
      onSelect(
        selectedIds.concat(
          data
            .filter(
              (record) =>
                !selectedIds.includes(record.id) &&
                (!isRowSelectable || isRowSelectable(record)),
            )
            .map((record) => record.id),
        ),
      );
    } else {
      // We should only unselect the ids present in the current page
      onSelect(
        selectedIds.filter((id) => !data.some((record) => record.id === id)),
      );
    }
  };
  const selectableIds = Array.isArray(data)
    ? (isRowSelectable
        ? data.filter((record) => isRowSelectable(record))
        : data
      ).map((record) => record.id)
    : [];
  return (
    <TableHeader>
      <TableRow>
        {hasBulkActions ? (
          <TableHead className="w-8">
            <Checkbox
              onCheckedChange={handleToggleSelectAll}
              checked={
                selectedIds &&
                selectedIds.length > 0 &&
                selectableIds.length > 0 &&
                selectableIds.every((id) => selectedIds.includes(id))
              }
              className="mb-2"
            />
          </TableHead>
        ) : null}
        {expandContext ? <TableHead className="w-8" /> : null}
        {children}
      </TableRow>
    </TableHeader>
  );
};

/**
 * Body of a DataTable. Renders one `<DataTableRow>` per record in the current page.
 * Used internally by `<DataTable>`; also exported for custom DataTable compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const DataTableBody = <RecordType extends RaRecord = RaRecord>({
  children,
  rowClassName,
}: {
  children: ReactNode;
  rowClassName?: (record: RecordType) => string | undefined;
}) => {
  const data = useDataTableDataContext();
  const { hasBulkActions = false } = useDataTableConfigContext();
  const expandContext = useDataTableExpandContext();
  const nbVisibleChildren = Children.count(children);
  const expandColSpan =
    nbVisibleChildren + (hasBulkActions ? 1 : 0) + (expandContext ? 1 : 0);
  return (
    <TableBody>
      {data?.map((record, rowIndex) => {
        const key = record.id ?? `row${rowIndex}`;
        const isExpanded = expandContext?.expandedIds.includes(record.id);
        return (
          <RecordContextProvider value={record} key={key}>
            <DataTableRow className={rowClassName?.(record)}>
              {children}
            </DataTableRow>
            {expandContext && isExpanded ? (
              <TableRow data-slot="data-table-expand-panel">
                <TableCell colSpan={expandColSpan} className="bg-muted/30">
                  {expandContext.expand}
                </TableCell>
              </TableRow>
            ) : null}
          </RecordContextProvider>
        );
      })}
    </TableBody>
  );
};

/**
 * A row in a DataTable. Wires up row click navigation and renders a row-selection checkbox when bulk actions are enabled.
 * Used internally by `<DataTableBody>`; also exported for custom DataTable compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const DataTableRow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { rowClick, handleToggleItem } = useDataTableCallbacksContext();
  const selectedIds = useDataTableSelectedIdsContext();
  const { hasBulkActions = false } = useDataTableConfigContext();
  const expandContext = useDataTableExpandContext();

  const record = useRecordContext();
  if (!record) {
    throw new Error("DataTableRow can only be used within a RecordContext");
  }

  const resource = useResourceContext();
  if (!resource) {
    throw new Error("DataTableRow can only be used within a ResourceContext");
  }

  const navigate = useNavigate();
  const getPathForRecord = useGetPathForRecordCallback();

  const handleToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!handleToggleItem) return;
      handleToggleItem(record.id, event);
    },
    [handleToggleItem, record.id],
  );

  const handleClick = useCallback(async () => {
    const temporaryLink =
      typeof rowClick === "function"
        ? rowClick(record.id, resource, record)
        : rowClick;

    const link = isPromise(temporaryLink) ? await temporaryLink : temporaryLink;

    const path = await getPathForRecord({
      record,
      resource,
      link,
    });
    if (path === false || path == null) {
      return;
    }
    navigate(path, {
      state: { _scrollToTop: true },
    });
  }, [record, resource, rowClick, navigate, getPathForRecord]);

  const isExpanded = expandContext?.expandedIds.includes(record.id) ?? false;
  const canExpand =
    expandContext != null &&
    (!expandContext.isRowExpandable || expandContext.isRowExpandable(record));
  const expandLabel = isExpanded ? "Collapse row" : "Expand row";

  return (
    <TableRow
      key={record.id}
      onClick={handleClick}
      className={cn(rowClick !== false && "cursor-pointer", className)}
    >
      {hasBulkActions ? (
        <TableCell className="flex w-8">
          <Checkbox
            checked={selectedIds?.includes(record.id)}
            onClick={handleToggle}
          />
        </TableCell>
      ) : null}
      {expandContext ? (
        <TableCell className="w-8 p-0">
          {canExpand ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(event) => {
                event.stopPropagation();
                expandContext.toggleExpand(record.id);
              }}
              aria-label={expandLabel}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </TableCell>
      ) : null}
      {children}
    </TableRow>
  );
};

function isPromise<T>(value: UnknownValue): value is Promise<T> {
  return (
    value != null && typeof (value as Promise<UnknownValue>).then === "function"
  );
}

/**
 * Default empty-state placeholder rendered when a DataTable has no records.
 * Used internally by `<DataTable>`; also exported for custom empty states.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const DataTableEmpty = () => {
  return (
    <Alert>
      <AlertDescription>No results found.</AlertDescription>
    </Alert>
  );
};

const DataTableLoadingSkeleton = ({
  className,
  hasBulkActions,
  nbColumns,
  nbFakeLines = 5,
}: {
  className?: string;
  hasBulkActions?: boolean;
  nbColumns: number;
  nbFakeLines?: number;
}) => {
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {hasBulkActions ? (
              <TableHead className="w-8">
                <Skeleton className="size-4" />
              </TableHead>
            ) : null}
            {Array.from({ length: nbColumns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: nbFakeLines }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {hasBulkActions ? (
                <TableCell className="w-8">
                  <Skeleton className="size-4" />
                </TableCell>
              ) : null}
              {Array.from({ length: nbColumns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="py-2">
                  <Skeleton className="h-4 w-full max-w-[12rem]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export interface DataTableProps<
  RecordType extends RaRecord = RaRecord,
> extends Partial<DataTableBaseProps<RecordType>> {
  children: ReactNode;
  className?: string;
  rowClassName?: (record: RecordType) => string | undefined;
  bulkActionButtons?: ReactNode;
  bulkActionsToolbar?: ReactNode;
  /**
   * Element rendered as the expand panel under each row. Receives the row's
   * record through `RecordContext`. When provided, a chevron toggle column
   * is added at the start of every row.
   */
  expand?: ReactElement;
  /**
   * When true, expanding a row collapses any previously-expanded one so
   * only a single row is expanded at a time. Defaults to `false`.
   */
  expandSingle?: boolean;
  /**
   * Predicate that decides whether a given record can be expanded. When it
   * returns `false`, the chevron toggle is hidden for that row.
   */
  isRowExpandable?: (record: RecordType) => boolean;
}

export function DataTableColumn<
  RecordType extends RaRecord<Identifier> = RaRecord<Identifier>,
>(props: DataTableColumnProps<RecordType>) {
  const renderContext = useDataTableRenderContext();
  switch (renderContext) {
    case "columnsSelector":
      return <ColumnsSelectorItem<RecordType> {...props} />;
    case "header":
      return <DataTableHeadCell {...props} />;
    case "data":
      return <DataTableCell {...props} />;
  }
}

/**
 * Reorder children based on columnRanks
 *
 * Note that columnRanks may be shorter than the number of children
 */
const reorderChildren = (children: ReactNode, columnRanks: number[]) =>
  Children.toArray(children).reduce((acc: ReactNode[], child, index) => {
    const rank = columnRanks.indexOf(index);
    if (rank === -1) {
      // if the column is not in columnRanks, keep it at the same index
      acc[index] = child;
    } else {
      // if the column is in columnRanks, move it to the rank index
      acc[rank] = child;
    }
    return acc;
  }, []);

/**
 * Header cell of a DataTable. Renders a column label with a click-to-sort affordance.
 * Used internally by `<DataTableColumn>`; also exported for custom header compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export function DataTableHeadCell<
  RecordType extends RaRecord<Identifier> = RaRecord<Identifier>,
>(props: DataTableColumnProps<RecordType>) {
  const {
    disableSort,
    source,
    label,
    sortByOrder,
    className,
    headerClassName,
  } = props;

  const sort = useDataTableSortContext();
  const { handleSort } = useDataTableCallbacksContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const translateLabel = useTranslateLabel();
  const { storeKey, defaultHiddenColumns } = useDataTableStoreContext();
  const [hiddenColumns] = useStore<string[]>(storeKey, defaultHiddenColumns);
  const isColumnHidden = hiddenColumns.includes(source!);
  if (isColumnHidden) return null;

  const nextSortOrder =
    sort && sort.field === source
      ? oppositeOrder[sort.order]
      : (sortByOrder ?? "ASC");
  const fieldLabel = translateLabel({
    label: typeof label === "string" ? label : undefined,
    resource,
    source,
  });
  const sortLabel = translate("ra.sort.sort_by", {
    field: fieldLabel,
    field_lower_first:
      typeof fieldLabel === "string"
        ? fieldLabel.charAt(0).toLowerCase() + fieldLabel.slice(1)
        : undefined,
    order: translate(`ra.sort.${nextSortOrder}`),
    _: translate("ra.action.sort"),
  });

  return (
    <TableHead className={cn(className, headerClassName)}>
      {handleSort && sort && !disableSort && source ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 -mr-3 h-8 data-[state=open]:bg-accent cursor-pointer"
                data-field={source}
                onClick={handleSort}
              >
                {headerClassName?.includes("text-right") ? null : (
                  <FieldTitle
                    label={label}
                    source={source}
                    resource={resource}
                  />
                )}
                {sort.field === source ? (
                  sort.order === "ASC" ? (
                    <ArrowDownAZ className="ml-2 h-6 w-6" />
                  ) : (
                    <ArrowUpZA className="ml-2 h-6 w-6" />
                  )
                ) : null}
                {headerClassName?.includes("text-right") ? (
                  <FieldTitle
                    label={label}
                    source={source}
                    resource={resource}
                  />
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{sortLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <FieldTitle label={label} source={source} resource={resource} />
      )}
    </TableHead>
  );
}

const oppositeOrder: Record<SortPayload["order"], SortPayload["order"]> = {
  ASC: "DESC",
  DESC: "ASC",
};

/**
 * Body cell of a DataTable. Resolves the cell value from `children`, `render`, `field`, or `source`.
 * Used internally by `<DataTableColumn>`; also exported for custom cell compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export function DataTableCell<
  RecordType extends RaRecord<Identifier> = RaRecord<Identifier>,
>(props: DataTableColumnProps<RecordType>) {
  const {
    children,
    render,
    field,
    source,
    className,
    cellClassName,
    conditionalClassName,
  } = props;

  const { storeKey, defaultHiddenColumns } = useDataTableStoreContext();
  const [hiddenColumns] = useStore<string[]>(storeKey, defaultHiddenColumns);
  const record = useRecordContext<RecordType>();
  const isColumnHidden = hiddenColumns.includes(source!);
  if (isColumnHidden) return null;
  if (!render && !field && !children && !source) {
    throw new Error(
      "DataTableColumn: Missing at least one of the following props: render, field, children, or source",
    );
  }

  return (
    <TableCell
      className={cn(
        "py-1",
        className,
        cellClassName,
        record && conditionalClassName?.(record),
      )}
    >
      {children ??
        (render
          ? record && render(record)
          : field
            ? createElement(field, { source })
            : get(record, source!))}
    </TableCell>
  );
}

export interface DataTableColumnProps<
  RecordType extends RaRecord<Identifier> = RaRecord<Identifier>,
> {
  className?: string;
  cellClassName?: string;
  headerClassName?: string;
  conditionalClassName?: (record: RecordType) => string | false | undefined;
  children?: ReactNode;
  render?: (record: RecordType) => React.ReactNode;
  field?: React.ElementType;
  source?: NoInfer<HintedString<ExtractRecordPaths<RecordType>>>;
  label?: React.ReactNode;
  disableSort?: boolean;
  sortByOrder?: SortPayload["order"];
}

export function DataTableNumberColumn<
  RecordType extends RaRecord<Identifier> = RaRecord<Identifier>,
>(props: DataTableNumberColumnProps<RecordType>) {
  const {
    source,
    options,
    locales,
    className,
    headerClassName,
    cellClassName,
    ...rest
  } = props;
  return (
    <DataTableColumn
      source={source}
      {...rest}
      className={className}
      headerClassName={cn("text-right", headerClassName)}
      cellClassName={cn("text-right", cellClassName)}
    >
      <NumberField source={source} options={options} locales={locales} />
    </DataTableColumn>
  );
}

export interface DataTableNumberColumnProps<
  RecordType extends RaRecord<Identifier> = RaRecord<Identifier>,
> extends DataTableColumnProps<RecordType> {
  source: NoInfer<HintedString<ExtractRecordPaths<RecordType>>>;
  locales?: string | string[];
  options?: Intl.NumberFormatOptions;
}

/**
 * Wrapper element for a DataTable. Provides standard rounded border styling.
 * Used internally by `<DataTable>`; also exported for custom DataTable compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const DataTableRoot = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("rounded-md border", className)}>{children}</div>;

/**
 * Checkbox in the DataTable header that selects/deselects all rows on the current page.
 * Used internally by `<DataTableHead>`; also exported for custom header compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const SelectPageCheckbox = ({ className }: { className?: string }) => {
  const data = useDataTableDataContext();
  const { onSelect } = useDataTableCallbacksContext();
  const selectedIds = useDataTableSelectedIdsContext();
  const handleToggleSelectAll = (checked: boolean) => {
    if (!onSelect || !data || !selectedIds) return;
    onSelect(
      checked
        ? selectedIds.concat(
            data
              .filter((record) => !selectedIds.includes(record.id))
              .map((record) => record.id),
          )
        : // We should only unselect the ids present in the current page
          selectedIds.filter((id) => !data.some((record) => record.id === id)),
    );
  };
  const selectableIds = Array.isArray(data)
    ? data.map((record) => record.id)
    : [];
  return (
    <Checkbox
      onCheckedChange={handleToggleSelectAll}
      checked={
        selectedIds &&
        selectedIds.length > 0 &&
        selectableIds.length > 0 &&
        selectableIds.every((id) => selectedIds.includes(id))
      }
      className={cn("mb-2", className)}
      aria-label="Select all rows on this page"
    />
  );
};

/**
 * Checkbox in a DataTable row that selects/deselects that row.
 * Used internally by `<DataTableRow>`; also exported for custom row compositions.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const SelectRowCheckbox = ({ className }: { className?: string }) => {
  const record = useRecordContext();
  const selectedIds = useDataTableSelectedIdsContext();
  const { handleToggleItem } = useDataTableCallbacksContext();
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!handleToggleItem || !record) return;
      handleToggleItem(record.id, event);
    },
    [handleToggleItem, record],
  );
  return (
    <Checkbox
      onClick={handleClick}
      checked={!!record && selectedIds?.includes(record.id)}
      className={cn(className)}
      aria-label="Select row"
    />
  );
};

export interface DataTableLoadingProps {
  className?: string;
  hasBulkActions?: boolean;
  nbChildren: number;
  nbFakeLines?: number;
}

/**
 * Skeleton placeholder shown while a DataTable is loading.
 * Renders `nbFakeLines` rows of grey placeholders for `nbChildren` columns.
 * Waits 1 second before showing (via `useTimeout`) to avoid flashes for fast loads.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datatable/ DataTable documentation}
 */
export const DataTableLoading = ({
  className,
  hasBulkActions,
  nbChildren,
  nbFakeLines = 5,
}: DataTableLoadingProps) => {
  const oneSecondHasPassed = useTimeout(1000);
  if (!oneSecondHasPassed) return null;
  return (
    <DataTableRoot className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {hasBulkActions && <TableHead className="w-8" />}
            {Array.from({ length: nbChildren }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: nbFakeLines }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="opacity-50">
              {hasBulkActions && <TableCell />}
              {Array.from({ length: nbChildren }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableRoot>
  );
};
