"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Filter } from "lucide-react"
import { Popover,PopoverTrigger,PopoverContent,PopoverTitle } from "#components/popover"
import { Badge } from "#components/badge"
import { Button } from "#components/button"
import { Input } from "#components/input"
import { CheckboxField } from "#components/checkbox"
import { DateRangePicker,type DateRange } from "#components/calendar"
import { Field,FieldHeader,FieldLabel,FieldError } from "#components/field"
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "#components/select"
import { dateRange,isFilterActive,numberRange,stringList,type FilterSpec } from "#lib/data-table-model"

const parseDate=(date?:string)=>date?new Date(`${date}T12:00:00`):undefined
const dateKey=(date?:Date)=>date?`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`:undefined
export function DataTableFilter<T>({table,spec,disabled=false}:{table:Table<T>;spec:FilterSpec;disabled?:boolean}) {
  const column=table.getColumn(spec.columnId),value=column?.getFilterValue()
  const [query,setQuery]=React.useState("")
  const [draft,setDraft]=React.useState(()=>numberRange(value))
  const rangeInvalid=spec.kind==="number"&&((draft.min!==undefined&&draft.max!==undefined&&draft.min>draft.max)||[draft.min,draft.max].some(bound=>bound!==undefined&&((spec.min!==undefined&&bound<spec.min)||(spec.max!==undefined&&bound>spec.max))))
  const id=React.useId()
  if(!column)return null
  const active=isFilterActive(value)
  if(spec.kind==="date") {
    const range=dateRange(value)
    return <DateRangePicker size="sm" label={spec.label} value={range.from?{from:parseDate(range.from),to:parseDate(range.to)}:undefined} onValueChange={(next:DateRange|undefined)=>column.setFilterValue(next?{from:dateKey(next.from),to:dateKey(next.to)}:undefined)} disabled={disabled} placeholder={spec.label} calendarProps={{defaultMonth:parseDate(range.from??spec.defaultMonth)}}/>
  }
  return <Popover onOpenChange={open=>{if(open)setDraft(numberRange(value))}}><PopoverTrigger render={<Button variant="outline" size="sm"/>} disabled={disabled}><Filter data-icon="inline-start"/>{spec.label}{active&&<span className="aq-table-filter-count">{Array.isArray(value)?value.length:"1"}</span>}</PopoverTrigger>
    <PopoverContent className="aq-table-filter-popup"><PopoverTitle>{spec.label}</PopoverTitle>
      {spec.kind==="facet"?<><Input controlSize="sm" type="search" aria-label={`Search ${spec.label} options`} placeholder="Search options…" value={query} onChange={event=>setQuery(event.target.value)}/><div className="aq-table-filter-options">{spec.options.filter(option=>option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(option=><CheckboxField key={option.value} size="sm" label={option.label} badge={<Badge size="xs" variant="outline">{spec.counts?.[option.value]??column.getFacetedUniqueValues().get(option.value)??0}</Badge>} checked={stringList(value).includes(option.value)} onCheckedChange={checked=>column.setFilterValue(checked?[...stringList(value),option.value]:stringList(value).filter(item=>item!==option.value))}/>)}{!spec.options.some(option=>option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()))&&<p role="status">No matching options.</p>}</div></>:spec.kind==="number"?<div className="aq-table-range-fields">{(["min","max"] as const).map(bound=><Field key={bound}><FieldHeader><FieldLabel htmlFor={`${id}-${bound}`}>{bound==="min"?"Minimum":"Maximum"}{spec.unit?` · ${spec.unit}`:""}</FieldLabel>{rangeInvalid&&<FieldError id={`${id}-${bound}-error`}>Enter ordered bounds within the allowed range.</FieldError>}</FieldHeader><Input id={`${id}-${bound}`} type="number" controlSize="sm" min={spec.min} max={spec.max} aria-invalid={rangeInvalid||undefined} aria-describedby={rangeInvalid?`${id}-${bound}-error`:undefined} value={draft[bound]??""} onChange={event=>{const input=event.target.value;const next=Number(input);setDraft(previous=>({...previous,[bound]:input!==""&&Number.isFinite(next)?next:undefined}))}}/></Field>)}</div>:spec.kind==="text"?<Input controlSize="sm" aria-label={spec.label} placeholder={spec.placeholder??"Contains…"} value={typeof value==="string"?value:""} onChange={event=>column.setFilterValue(event.target.value)}/>:<Select value={value===true?"yes":value===false?"no":"any"} onValueChange={next=>column.setFilterValue(next==="yes"?true:next==="no"?false:undefined)}><SelectTrigger size="sm" aria-label={spec.label}><SelectValue/></SelectTrigger><SelectContent><SelectGroup><SelectItem value="any">Any</SelectItem><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectGroup></SelectContent></Select>}
      {spec.kind==="number"&&<Button size="sm" disabled={rangeInvalid} onClick={()=>column.setFilterValue(draft)}>Apply filter</Button>}
      <Button variant="ghost" size="xs" disabled={!active} onClick={()=>{column.setFilterValue(undefined);setDraft({})}}>Clear filter</Button>
    </PopoverContent>
  </Popover>
}
