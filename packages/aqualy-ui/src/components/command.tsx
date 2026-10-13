"use client"

import * as React from "react"
import { Autocomplete as Primitive } from "@base-ui/react/autocomplete"
import { Dialog } from "@base-ui/react/dialog"
import { Search, X } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Button } from "#components/button"
import { Alert,AlertTitle,AlertDescription } from "#components/alert"
import { Spinner } from "#components/spinner"
import { cn } from "#lib/utils"

export interface CommandEntry { id:string;label:string;description?:string;group:string;keywords?:string[];icon?:React.ReactNode;shortcut?:string;disabled?:boolean;onSelect:()=>void }
export interface CommandProps { items:CommandEntry[];label?:string;placeholder?:string;emptyMessage?:string;status?:"ready"|"loading"|"error";onRetry?:()=>void;className?:string;onSelect?:(id:string)=>void }
export function Command({items,label="Command palette",placeholder="Search commands and records…",emptyMessage="No results. Try another keyword.",status="ready",onRetry,className,onSelect}:CommandProps) {
  const [query,setQuery]=React.useState("")
  const listRef=React.useRef<HTMLDivElement>(null)
  const groups=[...new Set(items.map(item=>item.group))].map(value=>({value,items:items.filter(item=>item.group===value)}))
  const filter=(item:CommandEntry,text:string)=>[item.label,item.description,item.id,...(item.keywords??[])].filter(Boolean).join(" ").toLocaleLowerCase().includes(text.trim().toLocaleLowerCase())
  return <div aria-label={label} className={cn("aq-command",className)}><Primitive.Root items={groups} open inline autoHighlight="always" keepHighlight loopFocus value={query} onValueChange={setQuery} filter={filter}>
    <Primitive.InputGroup className="aq-command-search"><Search aria-hidden="true"/><Primitive.Input aria-label={`Search ${label}`} placeholder={placeholder} disabled={status!=="ready"} onKeyDown={event=>{if((event.key==="Home"||event.key==="End")&&!event.ctrlKey&&!event.metaKey&&listRef.current){event.preventDefault();event.preventBaseUIHandler();listRef.current.dispatchEvent(new KeyboardEvent("keydown",{key:event.key,bubbles:true}));return}
        if(event.key==="Escape"&&query){event.preventDefault();event.stopPropagation();setQuery("")}}}/>
      {query&&<Button variant="ghost" size="icon-xs" aria-label="Clear command search" onClick={()=>setQuery("")}><X/></Button>}
    </Primitive.InputGroup>
    <div className="aq-command-results" aria-busy={status==="loading"}>
      {status==="loading"?<div className="aq-command-empty" role="status"><Spinner/> Loading records…</div>:status==="error"?<Alert variant="danger"><AlertTitle>Commands unavailable</AlertTitle><AlertDescription>Records could not be loaded.</AlertDescription>{onRetry&&<Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>}</Alert>:<>
        <Primitive.Empty className="aq-command-empty">{emptyMessage}</Primitive.Empty>
        <Primitive.List ref={listRef}>{(group:{value:string;items:CommandEntry[]})=><Primitive.Group key={group.value} items={group.items}><Primitive.GroupLabel className="aq-command-group-label">{group.value}</Primitive.GroupLabel><Primitive.Collection>{(item:CommandEntry)=><Primitive.Item className="aq-command-item" key={item.id} value={item} disabled={item.disabled} onClick={()=>{item.onSelect();onSelect?.(item.id)}}>
          {item.icon&&<span className="aq-command-icon" aria-hidden="true">{item.icon}</span>}<span className="aq-command-copy"><bdi>{item.label}</bdi>{item.description&&<small>{item.description}</small>}</span>{item.shortcut&&<kbd dir="ltr">{item.shortcut}</kbd>}
        </Primitive.Item>}</Primitive.Collection></Primitive.Group>}</Primitive.List>
      </>}
    </div>
    <div className="aq-command-footer"><span>↑ ↓ Navigate · Enter select</span><span>Esc {query?"clear":"close"}</span></div>
  </Primitive.Root></div>
}

export interface CommandDialogProps extends CommandProps {open:boolean;onOpenChange:(open:boolean)=>void;title?:string;description?:string;size?:"default"|"small"}
export function CommandDialog({open,onOpenChange,title="Search Aqualy",description="Find a page, record or available action.",size="default",onSelect,...props}:CommandDialogProps) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><AqualyUIPortalScope layer="overlay">
    <Dialog.Backdrop className="aq-alert-dialog-backdrop"/><Dialog.Viewport className="aq-alert-dialog-viewport"><Dialog.Popup className="aq-alert-dialog-content aq-command-dialog" data-size={size} data-slot="command-dialog">
      <Dialog.Title className="aq-sr-only">{title}</Dialog.Title><Dialog.Description className="aq-sr-only">{description}</Dialog.Description>
      <Command {...props} label={title} onSelect={id=>{onSelect?.(id);onOpenChange(false)}}/>
    </Dialog.Popup></Dialog.Viewport>
  </AqualyUIPortalScope></Dialog.Portal></Dialog.Root>
}
// Opt-in; one palette per owner. Never hijack a shortcut from another open modal.
export function useCommandShortcut(open:boolean,onOpenChange:(open:boolean)=>void) {
  React.useEffect(()=>{const handle=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&!event.altKey&&event.key.toLowerCase()==="k"&&!event.defaultPrevented){if(!open&&document.querySelector('[role="dialog"][data-open], [role="alertdialog"]'))return;event.preventDefault();onOpenChange(!open)}};window.addEventListener("keydown",handle);return()=>window.removeEventListener("keydown",handle)},[open,onOpenChange])
}
