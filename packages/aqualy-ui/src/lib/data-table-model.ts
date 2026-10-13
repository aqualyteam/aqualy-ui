"use client"

import { useEffect, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";

export interface DataTableState {
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  pagination: PaginationState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
}
export type FilterSpec =
  | {
      kind: "facet";
      columnId: string;
      label: string;
      options: { value: string; label: string }[];
      counts?: Record<string, number>;
    }
  | {
      kind: "number";
      columnId: string;
      label: string;
      unit?: string;
      min?: number;
      max?: number;
    }
  | { kind: "date"; columnId: string; label: string; defaultMonth?: string }
  | { kind: "text"; columnId: string; label: string; placeholder?: string }
  | { kind: "boolean"; columnId: string; label: string };
export interface RangeValue {
  min?: number;
  max?: number;
}
export interface DateRangeValue {
  from?: string;
  to?: string;
}
export function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}
export function numberRange(value: unknown): RangeValue {
  if (typeof value !== "object" || value === null) return {};
  return {
    min:
      "min" in value &&
      typeof value.min === "number" &&
      Number.isFinite(value.min)
        ? value.min
        : undefined,
    max:
      "max" in value &&
      typeof value.max === "number" &&
      Number.isFinite(value.max)
        ? value.max
        : undefined,
  };
}
export function dateRange(value: unknown): DateRangeValue {
  if (typeof value !== "object" || value === null) return {};
  return {
    from:
      "from" in value && typeof value.from === "string"
        ? value.from
        : undefined,
    to: "to" in value && typeof value.to === "string" ? value.to : undefined,
  };
}
export function isFilterActive(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object" && value !== null)
    return Object.values(value).some((v) => v !== undefined && v !== "");
  return value !== undefined && value !== null && value !== "";
}
// Facets are OR within one column. TanStack applies AND between columns.
export function facetFilter<T>(row: Row<T>, id: string, value: unknown) {
  const values = stringList(value);
  return !values.length || values.includes(String(row.getValue(id)));
}
facetFilter.autoRemove = (value: unknown) => !stringList(value).length;
export function numericRangeFilter<T>(row: Row<T>, id: string, value: unknown) {
  const { min, max } = numberRange(value);
  const number = row.getValue<unknown>(id);
  return (
    typeof number === "number" &&
    (min === undefined || number >= min) &&
    (max === undefined || number <= max)
  );
}
numericRangeFilter.autoRemove = (value: unknown) => !isFilterActive(value);
// ISO calendar dates are compared inclusively; never converted through the browser timezone.
export function dateRangeFilter<T>(row: Row<T>, id: string, value: unknown) {
  const { from, to } = dateRange(value);
  const date = row.getValue<unknown>(id);
  return (
    typeof date === "string" && (!from || date >= from) && (!to || date <= to)
  );
}
dateRangeFilter.autoRemove = (value: unknown) => !isFilterActive(value);
export function booleanFilter<T>(row: Row<T>, id: string, value: unknown) {
  return value === undefined || row.getValue(id) === value;
}
booleanFilter.autoRemove = (value: unknown) => typeof value !== "boolean";
export function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (value: T) => T)(previous)
    : updater;
}
const emptyState: DataTableState = {
  globalFilter: "",
  columnFilters: [],
  sorting: [],
  pagination: { pageIndex: 0, pageSize: 10 },
  columnVisibility: {},
  rowSelection: {},
};
interface CommonOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  searchText?: (row: T) => string;
  initialState?: Partial<DataTableState>;
  enableRowSelection?: boolean | ((row: Row<T>) => boolean);
}
type StateControl =
  | {
      state: DataTableState;
      onStateChange: (
        updater: Updater<DataTableState>,
        reason?: "pagination-clamp",
      ) => void;
    }
  | { state?: undefined; onStateChange?: undefined };
type DataMode =
  | { mode?: "client"; rowCount?: never }
  | { mode: "manual"; rowCount: number };
export type UseDataTableOptions<T> = CommonOptions<T> & StateControl & DataMode;
export function useDataTable<T>(options: UseDataTableOptions<T>) {
  const [internalState, setInternalState] = useState<DataTableState>(() => ({
    ...emptyState,
    ...options.initialState,
  }));
  const state = options.state ?? internalState;
  function update<K extends keyof DataTableState>(
    key: K,
    updater: Updater<DataTableState[K]>,
    reason?: "pagination-clamp",
  ) {
    const apply = (previous: DataTableState): DataTableState => ({
      ...previous,
      [key]: resolveUpdater(updater, previous[key]),
      ...(["globalFilter", "columnFilters", "sorting"].includes(key)
        ? { pagination: { ...previous.pagination, pageIndex: 0 } }
        : {}),
    });
    if (options.onStateChange) options.onStateChange(apply, reason);
    else setInternalState(apply);
  }
  const manual = options.mode === "manual";
  const table = useReactTable({
    data: options.data,
    columns: options.columns,
    getRowId: options.getRowId,
    initialState: options.initialState,
    state,
    onGlobalFilterChange: (updater) => update("globalFilter", updater),
    onColumnFiltersChange: (updater) => update("columnFilters", updater),
    onSortingChange: (updater) => update("sorting", updater),
    onPaginationChange: (updater) => update("pagination", updater),
    onColumnVisibilityChange: (updater) => update("columnVisibility", updater),
    onRowSelectionChange: (updater) => update("rowSelection", updater),
    enableRowSelection: options.enableRowSelection ?? true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: options.searchText
      ? (row, _id, value: unknown) =>
          options.searchText!(row.original)
            .toLocaleLowerCase()
            .includes(String(value).trim().toLocaleLowerCase())
      : "includesString",
    manualFiltering: manual,
    manualSorting: manual,
    manualPagination: manual,
    rowCount: manual ? options.rowCount : undefined,
    autoResetPageIndex: false,
    enableMultiSort: true,
    maxMultiSortColCount: 3,
  });
  // Clamp externally changed data as well as filtered results, without a stale empty page.
  const lastIndex = Math.max(0, table.getPageCount() - 1);
  useEffect(() => {
    if (!manual && state.pagination.pageIndex > lastIndex)
      update(
        "pagination",
        (previous) => ({
          ...previous,
          pageIndex: lastIndex,
        }),
        "pagination-clamp",
      );
  }, [manual, state.pagination.pageIndex, lastIndex]);
  return table;
}
