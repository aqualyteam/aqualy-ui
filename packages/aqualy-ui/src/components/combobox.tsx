"use client"

import * as React from "react"
import { Combobox as Primitive } from "@base-ui/react/combobox"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Button } from "#components/button"
import { Spinner } from "#components/spinner"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"

export interface ComboboxOption { value:string; label:string; description?:string; group?:string; keywords?:string[]; icon?:React.ReactNode; disabled?:boolean }
type Common = { options:ComboboxOption[]; label:string; id?:string; name?:string; placeholder?:string; description?:React.ReactNode; error?:React.ReactNode; disabled?:boolean; loading?:boolean; required?:boolean; size?:"xs"|"sm"|"default"|"lg"; variant?:"default"|"marine"; maxSelections?:number; emptyMessage?:string; className?:string }
export type ComboboxProps = Common & ({multiple:true;value:string[];onValueChange:(value:string[])=>void}|{multiple?:false;value:string|null;onValueChange:(value:string|null)=>void})
// Values are stable identifiers. Query text never becomes a selected business value.
export function Combobox(props:ComboboxProps) {
  const {options,label,id:givenId,name,placeholder="Search and choose…",description,error,disabled=false,loading=false,required=false,size="default",variant="default",maxSelections,emptyMessage="No matches. Try another keyword.",className}=props
  const generatedId=React.useId(),id=givenId??generatedId
  const [query,setQuery]=React.useState("")
  const selected=props.multiple?props.value.map(value=>options.find(option=>option.value===value)).filter((option):option is ComboboxOption=>option!==undefined):options.filter(option=>option.value===props.value)
  const blocked=disabled||loading
  const described=[description?`${id}-help`:null,error?`${id}-error`:null].filter(Boolean).join(" ")||undefined
  const filter=(option:ComboboxOption,text:string)=>[option.label,option.description,option.group,...(option.keywords??[])].filter(Boolean).join(" ").toLocaleLowerCase().includes(text.trim().toLocaleLowerCase())
  const renderItem=(option:ComboboxOption)=> <Primitive.Item key={option.value} value={option} className="aq-combobox-item" disabled={option.disabled||Boolean(props.multiple&&maxSelections&&selected.length>=maxSelections&&!props.value.includes(option.value))}>
    {option.icon&&<span aria-hidden="true" className="aq-combobox-option-icon">{option.icon}</span>}
    <span className="aq-combobox-copy"><bdi>{option.label}</bdi>{option.description&&<small>{option.description}</small>}{option.group&&<small>{option.group}</small>}</span>
    <Primitive.ItemIndicator className="aq-combobox-check"><Check/></Primitive.ItemIndicator>
  </Primitive.Item>
  const contents=<>
    <Field data-invalid={Boolean(error)||undefined} data-disabled={blocked||undefined} className={cn("aq-combobox-field",className)}>
      <FieldHeader><FieldLabel htmlFor={id}>{label}{required&&<span aria-hidden="true"> *</span>}</FieldLabel>{description&&<FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error&&<FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
      <Primitive.InputGroup className="aq-combobox-input-group"><div className={cn("aq-combobox-control",`aq-control--${size}`)} data-variant={variant} data-disabled={blocked||undefined} data-invalid={Boolean(error)||undefined}>
        <span className="aq-combobox-prefix" aria-hidden="true">{loading?<Spinner role={undefined}/>:<Search/>}</span>
        <Primitive.Input id={id} placeholder={placeholder} className="aq-combobox-input" aria-describedby={described} aria-invalid={Boolean(error)||undefined} aria-required={required||undefined} aria-busy={loading||undefined}
          onKeyDown={event=>{if(props.multiple&&event.key==="Backspace"&&!query&&selected.length&&!blocked){props.onValueChange(props.value.slice(0,-1))}}}/>
        <Primitive.Clear aria-label={`Clear ${label}`} render={<Button variant="ghost" size="icon-xs"/>}><X/></Primitive.Clear>
        <Primitive.Trigger aria-label={`Show ${label} options`} render={<Button variant="ghost" size="icon-xs"/>}><ChevronDown/></Primitive.Trigger>
      </div>
      {props.multiple&&selected.length>0&&<Primitive.Chips className="aq-combobox-tags" aria-label={`Selected ${label}`}>{selected.map(option=><Primitive.Chip className="aq-combobox-tag" key={option.value}><bdi>{option.label}</bdi><Primitive.ChipRemove render={<Button variant="ghost" size="icon-xs"/>} disabled={blocked} aria-label={`Remove ${option.label}`}><X/></Primitive.ChipRemove></Primitive.Chip>)}</Primitive.Chips>}</Primitive.InputGroup>
      {maxSelections&&<FieldDescription>{selected.length} / {maxSelections} selected</FieldDescription>}
    </Field>
    <Primitive.Portal><AqualyUIPortalScope><Primitive.Positioner className="aq-positioner" sideOffset={4} align="start"><Primitive.Popup className="aq-select-content aq-combobox-popup" data-slot="combobox-content">
      <Primitive.Empty className="aq-combobox-empty">{emptyMessage}</Primitive.Empty>
      <Primitive.List className="aq-combobox-list">{renderItem}</Primitive.List>
      <Primitive.Status className="aq-sr-only"/>
    </Primitive.Popup></Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
  </>
  if(props.multiple) return <Primitive.Root<ComboboxOption,true> items={options} value={selected} multiple name={name} disabled={blocked} required={required} filter={filter} autoHighlight inputValue={query} onInputValueChange={setQuery} onOpenChange={(open,details)=>{if(!open&&details.reason==="item-press")details.cancel()}} onValueChange={value=>{props.onValueChange(value.map(item=>item.value));setQuery("")}}>{contents}</Primitive.Root>
  return <Primitive.Root<ComboboxOption> items={options} value={selected[0]??null} name={name} disabled={blocked} required={required} filter={filter} autoHighlight onInputValueChange={setQuery} onValueChange={value=>props.onValueChange(value?.value??null)}>{contents}</Primitive.Root>
}
