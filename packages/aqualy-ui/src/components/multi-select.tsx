"use client"

import * as React from "react"
import { Combobox as Primitive } from "@base-ui/react/combobox"
import { Search, ChevronDown, Check, X } from "lucide-react"
import type { ComboboxOption } from "#components/combobox"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "#components/input-group"
import { Button } from "#components/button"
import { Badge } from "#components/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "#components/dropdown-menu"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { normalizeSelections } from "#lib/multi-select-model"
import { cn } from "#lib/utils"

export { normalizeSelections } from "#lib/multi-select-model"
export interface MultiSelectProps {
  options: readonly ComboboxOption[]; value: readonly string[]; onValueChange: (value: string[]) => void
  label: string; id?: string; name?: string; description?: React.ReactNode; error?: React.ReactNode
  required?: boolean; disabled?: boolean; size?: "xs" | "sm" | "default" | "lg"
  variant?: "default" | "marine"; collapseAfter?: number; maxSelections?: number
  placeholder?: string; emptyMessage?: string; selectAllLabel?: string; clearLabel?: string
  removeLabel?: (label: string) => string; moreLabel?: (count: number) => string; className?: string
}
export function MultiSelect({ options, value, onValueChange, label, id: givenId, name, description, error, required, disabled, size = "default", variant = "default", collapseAfter = 3, maxSelections, placeholder = "Search and choose…", emptyMessage = "No matching options", selectAllLabel = "Select all", clearLabel = "Clear", removeLabel = label => `Remove ${label}`, moreLabel = count => `${count} more selected`, className }: MultiSelectProps) {
  if (!Number.isInteger(collapseAfter) || collapseAfter < 0) throw new RangeError("collapseAfter must be a non-negative integer")
  const generatedId = React.useId(), id = givenId ?? generatedId
  const { dir } = useAqualyUIScope()
  const [query, setQuery] = React.useState("")
  const input = React.useRef<HTMLInputElement>(null)
  const returnToInput = React.useRef(false)
  const tags = React.useRef(new Map<string, HTMLButtonElement>())
  const ids = normalizeSelections(value, options, maxSelections)
  const selected = ids.map(value => options.find(option => option.value === value)!).filter(Boolean)
  const shown = selected.slice(0, collapseAfter), hidden = selected.slice(collapseAfter)
  const enabled = options.filter(option => !option.disabled)
  const filter = (option: ComboboxOption, text: string) => [option.label, option.description, option.group, ...(option.keywords ?? [])].join(" ").toLocaleLowerCase().includes(text.trim().toLocaleLowerCase())
  const allIds = normalizeSelections(enabled.map(option => option.value), options, maxSelections)
  const allSelected = allIds.every(value => ids.includes(value))
  const update = (next: readonly string[]) => onValueChange(normalizeSelections(next, options, maxSelections))
  const remove = (value: string) => { update(ids.filter(id => id !== value)); input.current?.focus() }
  const helpIds = [description ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
  // Base UI serializes selected stable IDs, not query text or option objects.
  return <Primitive.Root<ComboboxOption, true> items={options} multiple value={selected} disabled={disabled} required={required} name={name} itemToStringValue={option => option.value} autoHighlight filter={filter} inputValue={query} onInputValueChange={setQuery}
    onOpenChange={(open, details) => { if (!open && details.reason === "item-press") details.cancel() }}
    onValueChange={next => { update(next.map(option => option.value)); setQuery("") }}>
    <Field className={cn("aq-multi-select", className)} data-size={size} data-invalid={Boolean(error) || undefined} data-disabled={disabled || undefined}>
      <FieldHeader><FieldLabel htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
      <Primitive.InputGroup><InputGroup controlSize={size} data-variant={variant} data-invalid={Boolean(error) || undefined} data-disabled={disabled || undefined}>
        <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
        <Primitive.Input render={<InputGroupInput />} id={id} ref={input} placeholder={placeholder} aria-describedby={helpIds} aria-invalid={Boolean(error) || undefined} aria-required={required || undefined}
          onKeyDown={event => {
            if (disabled || query) return
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") { event.preventDefault(); update(allIds) }
            if (event.key === "Backspace" && shown.length) { event.preventDefault(); tags.current.get(shown.at(-1)!.value)?.focus() }
          }} />
        <InputGroupAddon align="inline-end"><Primitive.Trigger render={<InputGroupButton />} aria-label={`Show ${label} options`}><ChevronDown /></Primitive.Trigger></InputGroupAddon>
      </InputGroup></Primitive.InputGroup>
      <div className="aq-multi-tags" aria-label={`Selected ${label}`}>{shown.map((option, index) => <Badge key={option.value} variant="outline" className={cn("aq-multi-tag", variant === "marine" && "aq-multi-tag--marine")} size={size === "xs" || size === "sm" ? "sm" : "default"}>
        <bdi>{option.label}</bdi><Button ref={element => { if (element) tags.current.set(option.value, element); else tags.current.delete(option.value) }} variant="ghost" size="icon-xs" disabled={disabled} aria-label={removeLabel(option.label)} onClick={() => remove(option.value)} onKeyDown={event => {
          if (["Delete", "Backspace"].includes(event.key)) { event.preventDefault(); remove(option.value) }
          else if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); const delta = event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight") ? 1 : -1; tags.current.get(shown[(index + delta + shown.length) % shown.length].value)?.focus() }
          else if (event.key === "Escape") { event.preventDefault(); input.current?.focus() }
        }}><X /></Button>
      </Badge>)}{hidden.length > 0 && <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" size="xs" disabled={disabled} />} aria-label={moreLabel(hidden.length)}>+{hidden.length}</DropdownMenuTrigger><DropdownMenuContent aria-label={moreLabel(hidden.length)} finalFocus={() => {
        // Removing the last folded tag also removes its trigger. Let the shared
        // menu restore focus after teardown instead of focusing a removed node.
        if (!returnToInput.current) return true
        returnToInput.current = false
        return input.current
      }}><DropdownMenuGroup>{hidden.map(option => <DropdownMenuItem key={option.value} closeOnClick={false} onClick={() => { returnToInput.current = hidden.length === 1; update(ids.filter(value => value !== option.value)) }} aria-label={removeLabel(option.label)}><bdi>{option.label}</bdi><X aria-hidden="true" /></DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuContent></DropdownMenu>}</div>
      <div className="aq-multi-actions"><Button size="xs" variant="ghost" disabled={disabled || allSelected || !allIds.length} onClick={() => update(allIds)}>{selectAllLabel}</Button><Button size="xs" variant="ghost" disabled={disabled || !ids.length} onClick={() => { update([]); input.current?.focus() }}>{clearLabel}</Button><span role="status" aria-live="polite">{ids.length}{maxSelections ? ` / ${maxSelections}` : ""} selected</span></div>
    </Field>
    <Primitive.Portal><AqualyUIPortalScope><Primitive.Positioner className="aq-positioner" align="start" sideOffset={4} collisionPadding={12}><Primitive.Popup className="aq-select-content aq-combobox-popup" data-slot="multi-select-content"><Primitive.Empty className="aq-combobox-empty">{emptyMessage}</Primitive.Empty><Primitive.List className="aq-combobox-list">{(option: ComboboxOption) => <Primitive.Item value={option} key={option.value} disabled={option.disabled || Boolean(maxSelections && ids.length >= maxSelections && !ids.includes(option.value))} className="aq-combobox-item">{option.icon && <span className="aq-combobox-option-icon" aria-hidden="true">{option.icon}</span>}<span className="aq-combobox-copy"><bdi>{option.label}</bdi>{option.description && <small>{option.description}</small>}</span><Primitive.ItemIndicator className="aq-combobox-check"><Check /></Primitive.ItemIndicator></Primitive.Item>}</Primitive.List><Primitive.Status className="aq-sr-only" /></Primitive.Popup></Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
  </Primitive.Root>
}
