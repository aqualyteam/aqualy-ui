"use client"

import * as React from "react"
import { flexRender,type Table } from "@tanstack/react-table"
import { Collapsible } from "@base-ui/react/collapsible"
import { ArrowDown,ArrowUp,ArrowUpDown,Columns3,Filter,Search } from "lucide-react"
import { Button } from "#components/button"
import { Input } from "#components/input"
import { Checkbox,CheckboxField } from "#components/checkbox"
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "#components/select"
import { Popover,PopoverTrigger,PopoverContent,PopoverTitle } from "#components/popover"
import { Alert,AlertTitle,AlertDescription } from "#components/alert"
import { Spinner } from "#components/spinner"
import { DataTableFilter } from "#lib/data-table-filters"
import { type FilterSpec } from "#lib/data-table-model"
import { Pagination } from "#components/pagination"
import { cn } from "#lib/utils"
export {useDataTable,facetFilter,numericRangeFilter,dateRangeFilter,booleanFilter,isFilterActive} from "#lib/data-table-model"
export type {DataTableState,FilterSpec,UseDataTableOptions,RangeValue,DateRangeValue} from "#lib/data-table-model"
export {readTableUrl,writeTableUrl,useDataTableUrlState,validCalendarDate} from "#lib/data-table-url"
export type {TableUrlConfig} from "#lib/data-table-url"
export type {ColumnDef,Table,SortingState,ColumnFiltersState,PaginationState,RowSelectionState,VisibilityState} from "@tanstack/react-table"
export {DataTableFilter}

export interface DataTableProps<T> {table:Table<T>;label:string;description?:string;filters?:FilterSpec[];columnLabels?:Record<string,string>;searchPlaceholder?:string;selection?:boolean;rowLabel:(row:T)=>string;renderActions?:(row:T)=>React.ReactNode;onRowOpen?:(row:T)=>void;onBulkAction?:(ids:string[])=>void;bulkLabel?:string;status?:"ready"|"loading"|"error";onRetry?:()=>void;emptyTitle?:string;emptyDescription?:string;emptyAction?:React.ReactNode;pageSizes?:number[];compact?:boolean;className?:string}
const defaultSizes=[5,10,20,50]
export function DataTable<T>({table,label,description,filters=[],columnLabels={},searchPlaceholder="Search records…",selection=true,rowLabel,renderActions,onRowOpen,onBulkAction,bulkLabel="Review selection",status="ready",onRetry,emptyTitle="No records yet",emptyDescription="Records will appear here.",emptyAction,pageSizes=defaultSizes,compact=false,className}:DataTableProps<T>) {
  const state=table.getState(),rows=table.getRowModel().rows,busy=status!=="ready"
  const selected=Object.entries(state.rowSelection).filter(([,checked])=>checked).map(([id])=>id)
  const active=Boolean(state.globalFilter||state.columnFilters.length)
  const shell=React.useRef<HTMLElement>(null),measure=React.useRef<HTMLDivElement>(null)
  const [narrow,setNarrow]=React.useState(true),[filterOpen,setFilterOpen]=React.useState(false)
  const pages=Math.max(1,table.getPageCount()),total=table.options.manualPagination?(table.options.rowCount??0):table.getFilteredRowModel().rows.length
  React.useEffect(()=>{const element=shell.current;if(!element)return;const update=()=>setNarrow(element.clientWidth<(measure.current?.scrollWidth??0)+460);const observer=new ResizeObserver(update);observer.observe(element);if(measure.current)observer.observe(measure.current);update();return()=>observer.disconnect()},[filters])
  const labelColumn=(id:string)=>columnLabels[id]??id
  const sortable=table.getAllLeafColumns().filter(column=>column.getCanSort())
  const colspan=table.getVisibleLeafColumns().length+(selection?1:0)+(renderActions?1:0)+(onRowOpen?1:0)
  const filterControls=filters.map(spec=><DataTableFilter key={spec.columnId} table={table} spec={spec} disabled={busy}/>)
  return <section ref={shell} className={cn("aq-data-table",compact&&"aq-data-table--compact",className)} data-narrow={narrow||undefined} data-slot="data-table" aria-label={label}>
    <div className="aq-table-heading"><div><h3>{label}</h3>{description&&<p>{description}</p>}</div><bdi className="aq-table-count">{busy?"—":total} records</bdi></div>
    <div ref={measure} className="aq-table-measure" aria-hidden="true" inert>{filterControls}</div>
    <Collapsible.Root open={filterOpen} onOpenChange={setFilterOpen}>
      <div className="aq-table-toolbar"><div className="aq-table-search"><Search aria-hidden="true"/><Input type="search" controlSize="sm" aria-label={`Search ${label}`} placeholder={searchPlaceholder} value={String(state.globalFilter??"")} disabled={busy} onChange={event=>table.setGlobalFilter(event.target.value)}/></div>
        {filters.length>0&&(narrow?<Collapsible.Trigger disabled={busy} render={<Button variant="outline" size="sm"/>}><Filter/>Filters{state.columnFilters.length>0&&<span className="aq-table-filter-count">{state.columnFilters.length}</span>}</Collapsible.Trigger>:<div className="aq-table-inline-filters">{filterControls}</div>)}
        <div className="aq-table-view-controls"><Popover><PopoverTrigger disabled={busy} render={<Button variant="outline" size="sm"/>}><ArrowUpDown/>Sort{state.sorting.length>0&&<span className="aq-table-filter-count">{state.sorting.length}</span>}</PopoverTrigger><PopoverContent className="aq-table-sort-popup"><PopoverTitle>Sort records</PopoverTitle>{sortable.map(column=><div className="aq-table-sort-row" key={column.id}><span>{labelColumn(column.id)}</span><div><Button size="icon-xs" variant={column.getIsSorted()==="asc"?"secondary":"ghost"} aria-label={`Sort ${labelColumn(column.id)} ascending`} onClick={()=>column.toggleSorting(false,true)}><ArrowUp/></Button><Button size="icon-xs" variant={column.getIsSorted()==="desc"?"secondary":"ghost"} aria-label={`Sort ${labelColumn(column.id)} descending`} onClick={()=>column.toggleSorting(true,true)}><ArrowDown/></Button></div></div>)}<Button size="xs" variant="ghost" onClick={()=>table.resetSorting(true)}>Clear sorting</Button></PopoverContent></Popover>
          <Popover><PopoverTrigger disabled={busy} render={<Button variant="outline" size="sm"/>}><Columns3/>Columns</PopoverTrigger><PopoverContent className="aq-table-columns-popup"><PopoverTitle>Visible columns</PopoverTitle>{table.getAllLeafColumns().map(column=><CheckboxField key={column.id} size="sm" label={labelColumn(column.id)} disabled={!column.getCanHide()||column.getIsVisible()&&table.getVisibleLeafColumns().length===1} checked={column.getIsVisible()} onCheckedChange={checked=>column.toggleVisibility(checked)}/>)}</PopoverContent></Popover>
        </div>
      </div>
      {narrow&&<Collapsible.Panel className="aq-table-filter-panel"><div className="aq-table-filter-grid">{filterControls}</div></Collapsible.Panel>}
    </Collapsible.Root>
    {active&&<div className="aq-table-active"><span><bdi>{state.columnFilters.length} active filters{state.globalFilter?` · Search: ${String(state.globalFilter)}`:""}</bdi></span><Button variant="ghost" size="xs" onClick={()=>{table.setGlobalFilter("");table.setColumnFilters([])}}>Clear all filters</Button></div>}
    {selected.length>0&&<div className="aq-table-selection" role="status"><span><bdi>{selected.length} selected · {table.getFilteredSelectedRowModel().rows.length} in this result</bdi></span>{onBulkAction&&<Button size="xs" variant="outline" onClick={()=>onBulkAction(selected)}>{bulkLabel}</Button>}<Button size="xs" variant="ghost" onClick={()=>table.resetRowSelection(true)}>Clear selection</Button></div>}
    <div className="aq-table-scroll" role="region" aria-label={`${label} records`} tabIndex={0} aria-busy={status==="loading"}><table><caption className="aq-sr-only">{label}{description?` · ${description}`:""}</caption><thead>{table.getHeaderGroups().map((group,groupIndex)=><tr key={group.id}>{selection&&groupIndex===0&&<th scope="col" rowSpan={table.getHeaderGroups().length}><Checkbox size="sm" aria-label={`Select all ${label} on this page`} disabled={busy||!rows.some(row=>row.getCanSelect())} checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} onCheckedChange={checked=>table.toggleAllPageRowsSelected(checked)}/></th>}{group.headers.map(header=><th key={header.id} colSpan={header.colSpan} scope={header.colSpan>1?"colgroup":"col"} aria-sort={header.column.getIsSorted()==="asc"?"ascending":header.column.getIsSorted()==="desc"?"descending":undefined}>{header.isPlaceholder?null:header.column.getCanSort()?<Button size="xs" variant="ghost" disabled={busy} aria-label={`Sort by ${labelColumn(header.column.id)}`} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header,header.getContext())}{header.column.getIsSorted()==="asc"?<ArrowUp/>:header.column.getIsSorted()==="desc"?<ArrowDown/>:<ArrowUpDown/>}</Button>:flexRender(header.column.columnDef.header,header.getContext())}</th>)}{onRowOpen&&groupIndex===0&&<th scope="col" rowSpan={table.getHeaderGroups().length}>Details</th>}{renderActions&&groupIndex===0&&<th scope="col" rowSpan={table.getHeaderGroups().length}>Actions</th>}</tr>)}</thead><tbody>
      {status==="loading"?<tr><td colSpan={colspan}><div className="aq-table-state" role="status"><Spinner/>Loading records…</div></td></tr>:status==="error"?<tr><td colSpan={colspan}><Alert variant="danger"><AlertTitle>Records unavailable</AlertTitle><AlertDescription>Try loading the records again.</AlertDescription>{onRetry&&<Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</Alert></td></tr>:rows.length?rows.map(row=><tr key={row.id} data-selected={row.getIsSelected()||undefined}>{selection&&<td><Checkbox size="sm" aria-label={`Select ${rowLabel(row.original)}`} disabled={!row.getCanSelect()} checked={row.getIsSelected()} onCheckedChange={checked=>row.toggleSelected(checked)}/></td>}{row.getVisibleCells().map(cell=><td key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}{onRowOpen&&<td><Button size="xs" variant="ghost" aria-label={`Open ${rowLabel(row.original)}`} onClick={()=>onRowOpen(row.original)}>View</Button></td>}{renderActions&&<td>{renderActions(row.original)}</td>}</tr>):<tr><td colSpan={colspan}><div className="aq-table-state"><strong>{active?"No matching records":emptyTitle}</strong><p>{active?"Change or clear the filters to see records.":emptyDescription}</p>{active?<Button size="sm" variant="outline" onClick={()=>{table.setGlobalFilter("");table.setColumnFilters([])}}>Reset filters</Button>:emptyAction}</div></td></tr>}
    </tbody></table></div>
    <div className="aq-table-pagination"><span className="aq-table-total"><bdi>{total?state.pagination.pageIndex*state.pagination.pageSize+1:0}–{Math.min((state.pagination.pageIndex+1)*state.pagination.pageSize,total)} / {total}</bdi></span><div className="aq-table-page-size"><span>Rows</span><Select value={String(state.pagination.pageSize)} onValueChange={value=>{if(value)table.setPageSize(Number(value))}} disabled={busy}><SelectTrigger size="sm" aria-label={`Rows per page for ${label}`}><SelectValue/></SelectTrigger><SelectContent><SelectGroup>{pageSizes.map(size=><SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
      <Pagination className="aq-table-page-navigation" label={label} page={state.pagination.pageIndex+1} pageCount={total ? pages : 0} onPageChange={page => table.setPageIndex(page-1)} disabled={busy} variant="compact" />
    </div>
  </section>
}
