"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import type { Updater } from "@tanstack/react-table";
import type { DataTableState, FilterSpec } from "#lib/data-table-model";
import { dateRange, isFilterActive, numberRange, stringList } from "#lib/data-table-model";

export interface TableUrlConfig {
  namespace: string;
  filters: FilterSpec[];
  sortableColumns: string[];
  defaults: DataTableState;
  pageSizes?: number[];
}
export function validCalendarDate(value: string | null): value is string {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "1000-01-01" ||
    value > "9998-12-31"
  )
    return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function readTableUrl(
  params: URLSearchParams,
  config: TableUrlConfig,
): DataTableState {
  const key = (name: string) => `${config.namespace}.${name}`;
  const filters: DataTableState["columnFilters"] = [];
  for (const spec of config.filters) {
    const base = key(`filter.${spec.columnId}`);
    let value: unknown;
    if (spec.kind === "facet") {
      value = [...new Set(params.getAll(base))].filter((v) =>
        spec.options.some((o) => o.value === v),
      );
    } else if (spec.kind === "text") value = params.get(base)?.slice(0, 500);
    else if (spec.kind === "boolean") {
      const raw = params.get(base);
      value = raw === "true" ? true : raw === "false" ? false : undefined;
    } else if (spec.kind === "number") {
      const parse = (bound: string) => {
        const raw = params.get(`${base}.${bound}`);
        if (raw === null || raw.trim() === "") return undefined;
        const n = Number(raw);
        return Number.isFinite(n) &&
          (spec.min === undefined || n >= spec.min) &&
          (spec.max === undefined || n <= spec.max)
          ? n
          : undefined;
      };
      const min = parse("min"),
        max = parse("max");
      value =
        min !== undefined && max !== undefined && min > max
          ? undefined
          : { min, max };
    } else {
      const low = params.get(`${base}.from`),
        high = params.get(`${base}.to`);
      const from = validCalendarDate(low) ? low : undefined,
        to = validCalendarDate(high) ? high : undefined;
      value = from && to && from > to ? undefined : { from, to };
    }
    if (isFilterActive(value)) filters.push({ id: spec.columnId, value });
  }
  const sorting: DataTableState["sorting"] = [];
  if (params.has(key("sort"))) {
    for (const rule of params.get(key("sort"))!.split(",")) {
      const [id, direction] = rule.split(":");
      if (
        config.sortableColumns.includes(id) &&
        (direction === "asc" || direction === "desc") &&
        !sorting.some((s) => s.id === id) &&
        sorting.length < 3
      )
        sorting.push({ id, desc: direction === "desc" });
    }
  } else sorting.push(...config.defaults.sorting);
  const rawPage = params.get(key("page"));
  const page = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const size = Number(params.get(key("size")));
  return {
    ...config.defaults,
    globalFilter:
      params.get(key("q"))?.slice(0, 500) ?? config.defaults.globalFilter,
    columnFilters: filters,
    sorting,
    pagination: {
      pageIndex:
        Number.isSafeInteger(page) && page >= 1 && page <= 1_000_000
          ? page - 1
          : 0,
      pageSize: (config.pageSizes ?? [5, 10, 20, 50]).includes(size)
        ? size
        : config.defaults.pagination.pageSize,
    },
  };
}
// Changes only this table's known keys; other tables, campaign parameters and hash survive.
export function writeTableUrl(
  params: URLSearchParams,
  state: DataTableState,
  config: TableUrlConfig,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const key = (name: string) => `${config.namespace}.${name}`;
  const owned = ["q", "sort", "page", "size"].map(key);
  for (const spec of config.filters) {
    const base = key(`filter.${spec.columnId}`);
    owned.push(
      base,
      `${base}.min`,
      `${base}.max`,
      `${base}.from`,
      `${base}.to`,
    );
  }
  owned.forEach((name) => next.delete(name));
  if (state.globalFilter !== config.defaults.globalFilter)
    next.set(key("q"), state.globalFilter);
  for (const spec of config.filters) {
    const value = state.columnFilters.find(
      (f) => f.id === spec.columnId,
    )?.value;
    if (!isFilterActive(value)) continue;
    const base = key(`filter.${spec.columnId}`);
    if (spec.kind === "facet")
      stringList(value).forEach((v) => next.append(base, v));
    else if (spec.kind === "text" && typeof value === "string")
      next.set(base, value);
    else if (spec.kind === "boolean" && typeof value === "boolean")
      next.set(base, String(value));
    else if (spec.kind === "number") {
      const { min, max } = numberRange(value);
      if (min !== undefined) next.set(`${base}.min`, String(min));
      if (max !== undefined) next.set(`${base}.max`, String(max));
    } else if (spec.kind === "date") {
      const { from, to } = dateRange(value);
      if (from) next.set(`${base}.from`, from);
      if (to) next.set(`${base}.to`, to);
    }
  }
  if (JSON.stringify(state.sorting) !== JSON.stringify(config.defaults.sorting))
    next.set(
      key("sort"),
      state.sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(","),
    );
  if (state.pagination.pageIndex)
    next.set(key("page"), String(state.pagination.pageIndex + 1));
  if (state.pagination.pageSize !== config.defaults.pagination.pageSize)
    next.set(key("size"), String(state.pagination.pageSize));
  return next;
}
function signature(state: DataTableState, config: TableUrlConfig) {
  return writeTableUrl(new URLSearchParams(), state, config).toString();
}
// Pass a stable config. This client hook keeps selection and column preferences local.
export function useDataTableUrlState(config: TableUrlConfig, initialParams?: string) {
  const [state, setState] = useState<DataTableState>(() => initialParams === undefined ? config.defaults : readTableUrl(new URLSearchParams(initialParams),config));
  const [hydrated,setHydrated]=useState(false);
  const saved = useRef({
    signature: signature(state, config),
    query: state.globalFilter,
  });
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const replaceNext = useRef(false);
  const updateState = useCallback(
    (updater: Updater<DataTableState>, reason?: "pagination-clamp") => {
      if (reason === "pagination-clamp") replaceNext.current = true;
      setState(updater);
    },
    [],
  );
  useEffect(() => {
    const restore = () => {
      clearTimeout(pending.current);
      const next = readTableUrl(
        new URLSearchParams(window.location.search),
        config,
      );
      saved.current = {
        signature: signature(next, config),
        query: next.globalFilter,
      };
      setState((previous) => ({
        ...next,
        rowSelection: previous.rowSelection,
        columnVisibility: previous.columnVisibility,
      }));
    };
    restore();
    setHydrated(true);
    window.addEventListener("popstate", restore);
    return () => {
      clearTimeout(pending.current);
      window.removeEventListener("popstate", restore);
    };
  }, [config]);
  useEffect(() => {
    if(!hydrated)return;
    const current = signature(state, config);
    if (current === saved.current.signature) return;
    const searchOnly =
      state.globalFilter !== saved.current.query &&
      signature({ ...state, globalFilter: saved.current.query }, config) ===
        saved.current.signature;
    const commit = () => {
      const url = new URL(window.location.href);
      url.search = writeTableUrl(url.searchParams, state, config).toString();
      if (url.href !== window.location.href) {
        if (replaceNext.current)
          window.history.replaceState(window.history.state, "", url);
        else window.history.pushState(window.history.state, "", url);
      }
      replaceNext.current = false;
      saved.current = { signature: current, query: state.globalFilter };
    };
    if (searchOnly) pending.current = setTimeout(commit, 300);
    else commit();
    return () => clearTimeout(pending.current);
  }, [state, config, hydrated]);
  return [state, updateState] as const;
}
