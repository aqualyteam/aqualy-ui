"use client"

import * as React from "react"
import { Combobox as Primitive } from "@base-ui/react/combobox"
import { Check, ChevronDown, Search, X, Eye, EyeOff } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Input, type InputProps, type InputControlSize } from "#components/input"
import { Button } from "#components/button"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"

const GroupSize = React.createContext<InputControlSize>("default")
export type InputGroupProps = React.ComponentProps<"div"> & { controlSize?: InputControlSize }
export function InputGroup({ controlSize = "default", className, ...props }: InputGroupProps) {
  return <GroupSize.Provider value={controlSize}><div data-slot="input-group" className={cn("aq-input-group", `aq-control--${controlSize}`, className)} {...props} /></GroupSize.Provider>
}
export function InputGroupInput({ className, controlSize, ...props }: InputProps) {
  const size = React.useContext(GroupSize)
  return <Input controlSize={controlSize ?? size} data-slot="input-group-input" className={cn("aq-group-control", className)} {...props} />
}
export function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="input-group-textarea" className={cn("aq-group-control aq-group-textarea", className)} {...props} />
}
export function InputGroupAddon({ className, align = "inline-start", ...props }: React.ComponentProps<"div"> & { align?: "inline-start" | "inline-end" | "block-start" | "block-end" }) {
  return <div data-slot="input-group-addon" data-align={align} className={cn("aq-group-addon", className)} {...props} />
}
export function InputGroupText({ className, children, ...props }: React.ComponentProps<"span">) { return <span data-slot="input-group-text" className={cn("aq-group-text", className)} {...props}><bdi>{children}</bdi></span> }
export function InputGroupButton({ className, size = "icon-xs", variant = "ghost", ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="input-group-button" size={size} variant={variant} className={cn("aq-group-button", typeof className === "function" ? className({ disabled: props.disabled ?? false }) : className)} {...props} />
}

export interface InputGroupSelectOption { value: string; label: string; keywords?: string[]; display?: React.ReactNode; icon?: React.ReactNode; description?: string; disabled?: boolean }
export interface InputGroupSelectProps {
  options: readonly InputGroupSelectOption[]
  value: string | null
  onValueChange: (value: string | null) => void
  label: string
  searchLabel?: string
  searchPlaceholder?: string
  emptyMessage?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  name?: string
  id?: string
  className?: string
  controlSize?: InputControlSize
  required?: boolean
  invalid?: boolean
  describedBy?: string
}
export function InputGroupSelect({ options, value, onValueChange, label, searchLabel = `Search ${label.toLowerCase()}`, searchPlaceholder = "Search…", emptyMessage = "No matching options.", placeholder = "Choose", disabled, readOnly, name, id, className, controlSize = "default", required, invalid, describedBy }: InputGroupSelectProps) {
  const [query, setQuery] = React.useState("")
  const selected = options.find(option => option.value === value) ?? null
  const exactQuery = options.some(option => option.value.toLocaleLowerCase() === query.trim().toLocaleLowerCase())
  return <Primitive.Root<InputGroupSelectOption> items={options} value={selected} onValueChange={option => onValueChange(option?.value ?? null)} inputValue={query} onInputValueChange={setQuery} onOpenChange={(open, details) => { if (readOnly && open) { details.cancel(); return }; setQuery("") }} disabled={disabled} readOnly={readOnly} required={required} name={name} itemToStringValue={option => option.value} itemToStringLabel={option => option.label} autoHighlight filter={(option, text) => exactQuery ? option.value.toLocaleLowerCase() === text.trim().toLocaleLowerCase() : [option.value, option.label, option.description, ...(option.keywords ?? [])].join(" ").toLocaleLowerCase().includes(text.trim().toLocaleLowerCase())}>
    <Primitive.Trigger id={id} role="combobox" aria-label={label} aria-readonly={readOnly || undefined} data-readonly={readOnly || undefined} aria-required={required || undefined} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn("aq-group-select", `aq-control--${controlSize}`, className)}><span><bdi>{selected?.display ?? selected?.label ?? placeholder}</bdi></span><ChevronDown aria-hidden="true" /></Primitive.Trigger>
    <Primitive.Portal><AqualyUIPortalScope><Primitive.Positioner className="aq-positioner" sideOffset={4} align="start" collisionPadding={12}><Primitive.Popup data-slot="input-group-select-content" className="aq-select-content aq-group-select-popup">
      <div className="aq-group-select-search"><Search aria-hidden="true"/><Primitive.Input aria-label={searchLabel} placeholder={searchPlaceholder} className="aq-group-select-query" /></div>
      <Primitive.Empty className="aq-combobox-empty">{emptyMessage}</Primitive.Empty><Primitive.List className="aq-combobox-list">{(option: InputGroupSelectOption) => <Primitive.Item key={option.value} value={option} disabled={option.disabled} className="aq-combobox-item">{option.icon && <span className="aq-combobox-option-icon" aria-hidden="true">{option.icon}</span>}<span className="aq-combobox-copy"><bdi>{option.label}</bdi>{option.description && <small><bdi>{option.description}</bdi></small>}</span><Primitive.ItemIndicator className="aq-combobox-check"><Check /></Primitive.ItemIndicator></Primitive.Item>}</Primitive.List>
    </Primitive.Popup></Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
  </Primitive.Root>
}

export type InputFieldProps = Omit<InputProps, "value" | "defaultValue"> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void
  prefix?: React.ReactNode; suffix?: React.ReactNode; icon?: React.ReactNode
  clearable?: boolean; clearLabel?: string; passwordToggle?: boolean; showPasswordLabel?: string; hidePasswordLabel?: string
}
export function InputField({ label, description, error, value, defaultValue = "", onValueChange, onChange, id: suppliedId, ref: externalRef, controlSize = "default", prefix, suffix, icon, clearable = false, clearLabel = "Clear input", passwordToggle = false, showPasswordLabel = "Show password", hidePasswordLabel = "Hide password", type = "text", className, disabled, readOnly, required, ...props }: InputFieldProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId
  const [local, setLocal] = React.useState(defaultValue), [visible, setVisible] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null), current = value ?? local
  React.useEffect(() => {
    const form = inputRef.current?.form
    const reset = () => { if (value === undefined) setLocal(defaultValue); setVisible(false) }
    form?.addEventListener("reset", reset)
    return () => form?.removeEventListener("reset", reset)
  }, [value, defaultValue])
  const setInputRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node
    const cleanup = typeof externalRef === "function" ? externalRef(node) : undefined
    if (externalRef && typeof externalRef !== "function") externalRef.current = node
    if (node) return () => { inputRef.current = null; if (typeof cleanup === "function") cleanup(); else if (typeof externalRef === "function") externalRef(null); else if (externalRef) externalRef.current = null }
  }, [externalRef])
  const update = (next: string) => { if (value === undefined) setLocal(next); onValueChange?.(next) }
  const described = [props["aria-describedby"], description ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
  return <Field className={className} data-disabled={disabled || undefined} data-invalid={Boolean(error) || undefined}>
    <FieldHeader><FieldLabel htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
    <InputGroup controlSize={controlSize}>{(icon || prefix) && <InputGroupAddon>{icon && <span aria-hidden="true">{icon}</span>}{prefix && <InputGroupText>{prefix}</InputGroupText>}</InputGroupAddon>}
      <InputGroupInput {...props} ref={setInputRef} id={id} value={current} type={passwordToggle && type === "password" && visible ? "text" : type} disabled={disabled} readOnly={readOnly} required={required} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={described} onChange={event => { onChange?.(event); if (!event.defaultPrevented) update(event.target.value) }} />
      {(suffix || clearable || (passwordToggle && type === "password")) && <InputGroupAddon align="inline-end">{suffix && <InputGroupText>{suffix}</InputGroupText>}{clearable && current && !readOnly && <InputGroupButton disabled={disabled} aria-label={clearLabel} onClick={() => {
        const input = inputRef.current
        if (!input) return
        // Use the same native change path as typing, so onChange-only controlled
        // consumers and form registrations also receive the clear action.
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "")
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.focus()
      }}><X /></InputGroupButton>}{passwordToggle && type === "password" && <InputGroupButton disabled={disabled} aria-label={visible ? hidePasswordLabel : showPasswordLabel} aria-pressed={visible} onClick={() => { setVisible(!visible); inputRef.current?.focus() }}>{visible ? <EyeOff /> : <Eye />}</InputGroupButton>}</InputGroupAddon>}
    </InputGroup>
  </Field>
}
