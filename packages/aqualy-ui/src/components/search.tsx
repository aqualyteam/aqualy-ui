"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "#components/input-group"
import { Spinner } from "#components/spinner"
import type { InputProps } from "#components/input"
export type SearchFieldProps = Omit<InputProps, "value" | "defaultValue" | "type" | "onChange" | "children"> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode; value: string
  onValueChange: (value: string) => void; onClear?: () => void; busy?: boolean
  icon?: React.ReactNode; clearLabel?: string; searchLabel?: string
} & ({ mode?: "live"; onSearch?: (query: string) => void } | { mode: "submit"; onSearch: (query: string) => void })
export function SearchField({ label, description, error, value, onValueChange, onClear, mode = "live", onSearch, busy = false, icon = <Search />, clearLabel = "Clear search", searchLabel = "Search", controlSize = "default", ref, id: suppliedId, disabled, readOnly, required, onKeyDown, className, ...props }: SearchFieldProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId, input = React.useRef<HTMLInputElement>(null), blocked = disabled || busy
  const described = [props["aria-describedby"], description ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
  const setRef = React.useCallback((node: HTMLInputElement | null) => { input.current = node; const cleanup = typeof ref === "function" ? ref(node) : undefined; if (ref && typeof ref !== "function") ref.current = node; if (node) return () => { input.current = null; if (typeof cleanup === "function") cleanup(); else if (typeof ref === "function") ref(null); else if (ref) ref.current = null } }, [ref])
  const submit = () => { if (!blocked && !readOnly && input.current?.reportValidity()) onSearch?.(value) }
  return <Field data-slot="search-field" data-disabled={blocked || undefined} data-invalid={Boolean(error) || undefined} aria-busy={busy || undefined} className={className}>
    <FieldHeader><FieldLabel htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
    <InputGroup controlSize={controlSize}>{(icon || busy) && <InputGroupAddon><span aria-hidden="true">{busy ? <Spinner role={undefined} /> : icon}</span></InputGroupAddon>}
      <InputGroupInput {...props} id={id} ref={setRef} type="search" value={value} disabled={blocked} readOnly={readOnly} required={required} aria-invalid={Boolean(error) || props["aria-invalid"]} aria-describedby={described} onChange={event => onValueChange(event.target.value)} onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === "Enter" && !event.nativeEvent.isComposing && onSearch) { event.preventDefault(); submit() } }} />
      {(value || mode === "submit") && !readOnly && <InputGroupAddon align="inline-end">{value && <InputGroupButton aria-label={clearLabel} disabled={blocked} onClick={() => { onValueChange(""); onClear?.(); input.current?.focus() }}><X /></InputGroupButton>}{mode === "submit" && <InputGroupButton size="sm" variant="default" disabled={blocked} onClick={submit}>{searchLabel}</InputGroupButton>}</InputGroupAddon>}
    </InputGroup>
  </Field>
}
