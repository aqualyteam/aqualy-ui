"use client"

import * as React from "react"
import { Input, type InputProps } from "#components/input"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { Spinner } from "#components/spinner"
import { cn } from "#lib/utils"

export function normalizeOTP(value: string, length: number): string {
  if (!Number.isInteger(length) || length < 1 || length > 12) throw new RangeError("OTP length must be an integer between 1 and 12.")
  return value.replace(/[０-９٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) - (digit >= "０" ? 0xff10 : digit >= "۰" ? 0x6f0 : 0x660))).replace(/\D/g, "").slice(0, length)
}
export type InputOTPProps = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "maxLength"> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode
  length?: number; value?: string; defaultValue?: string; onValueChange?: (value: string) => void
  onComplete?: (value: string) => void; autoSubmit?: boolean; busy?: boolean; busyLabel?: string; mask?: boolean
}
// One native input owns selection, paste, deletion, autofill and form data. Slots are only visual.
export function InputOTP({ label, description, error, length = 6, value, defaultValue = "", onValueChange, onComplete, autoSubmit = false, busy = false, busyLabel = "Verifying code…", mask = false, controlSize = "default", id: suppliedId, ref: externalRef, className, disabled, readOnly, onPaste, onSelect, onFocus, onBlur, onPointerDown, ...props }: InputOTPProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId
  const [local, setLocal] = React.useState(() => normalizeOTP(defaultValue, length)), [selection, setSelection] = React.useState({ start: 0, end: 0 }), [focused, setFocused] = React.useState(false)
  const current = normalizeOTP(value ?? local, length), ref = React.useRef<HTMLInputElement>(null), lastCompleted = React.useRef<string | null>(null)
  React.useEffect(() => { if (current.length < length) lastCompleted.current = null }, [current, length])
  React.useEffect(() => {
    const form = ref.current?.form
    const reset = () => { if (value === undefined) setLocal(normalizeOTP(defaultValue, length)); lastCompleted.current = null; setSelection({ start: 0, end: 0 }) }
    form?.addEventListener("reset", reset)
    return () => form?.removeEventListener("reset", reset)
  }, [value, defaultValue, length])
  const setInputRef = React.useCallback((node: HTMLInputElement | null) => {
    ref.current = node
    const cleanup = typeof externalRef === "function" ? externalRef(node) : undefined
    if (externalRef && typeof externalRef !== "function") externalRef.current = node
    if (node) return () => { ref.current = null; if (typeof cleanup === "function") cleanup(); else if (typeof externalRef === "function") externalRef(null); else if (externalRef) externalRef.current = null }
  }, [externalRef])
  const described = [props["aria-describedby"], description ? `${id}-help` : null, error ? `${id}-error` : null, `${id}-instruction`].filter(Boolean).join(" ")
  const select = (input: HTMLInputElement) => setSelection({ start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 })
  const update = (raw: string) => {
    if (disabled || readOnly || busy) return
    const next = normalizeOTP(raw, length)
    if (value === undefined) setLocal(next)
    if (next !== current) onValueChange?.(next)
    if (next.length < length) lastCompleted.current = null
    else if (lastCompleted.current !== next && next !== current) {
      lastCompleted.current = next; onComplete?.(next)
      if (autoSubmit) queueMicrotask(() => { const input = ref.current; if (input && !input.disabled && !input.readOnly) input.form?.requestSubmit() })
    }
  }
  return <Field className={className} data-slot="input-otp" data-invalid={Boolean(error) || undefined} data-disabled={disabled || undefined} aria-busy={busy || undefined}>
    <FieldHeader><FieldLabel htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</FieldLabel>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
    <div className={cn("aq-otp-control", `aq-control--${controlSize}`)} dir="ltr" data-disabled={disabled || undefined} data-busy={busy || undefined} data-invalid={Boolean(error) || undefined} data-readonly={readOnly || busy || undefined}>
      {Array.from({ length }, (_, index) => <span className="aq-otp-slot" key={index} aria-hidden="true" data-active={focused && !readOnly && !busy && index === Math.min(selection.start, length - 1) || undefined} data-selected={focused && index >= selection.start && index < selection.end || undefined}>{mask && current[index] ? "•" : current[index]}</span>)}
      <Input {...props} ref={setInputRef} id={id} value={current} type="text" inputMode="numeric" autoComplete={props.autoComplete ?? "one-time-code"} autoCapitalize="off" spellCheck={false} dir="ltr" disabled={disabled} readOnly={readOnly || busy} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={described} pattern={`[0-9]{${length}}`} className="aq-otp-native" onChange={event => { update(event.target.value); select(event.target) }}
        onPaste={event => { onPaste?.(event); if (event.defaultPrevented || disabled || readOnly || busy) return; event.preventDefault(); const pasted = normalizeOTP(event.clipboardData.getData("text"), length); const input = event.currentTarget; const start = input.selectionStart ?? 0, end = input.selectionEnd ?? start; const next = pasted.length === length ? pasted : current.slice(0, start) + pasted + current.slice(end); update(next); const caret = Math.min(length, pasted.length === length ? length : start + pasted.length); queueMicrotask(() => { input.setSelectionRange(caret, caret); select(input) }) }}
        onSelect={event => { onSelect?.(event); select(event.currentTarget) }} onFocus={event => { onFocus?.(event); setFocused(true); select(event.currentTarget) }} onBlur={event => { onBlur?.(event); setFocused(false) }}
        onPointerDown={event => { onPointerDown?.(event); if (event.defaultPrevented || disabled) return; event.preventDefault(); const input = event.currentTarget, box = input.getBoundingClientRect(); const position = Math.max(0, Math.min(current.length, Math.floor((event.clientX - box.left) / box.width * length))); input.focus(); input.setSelectionRange(position, Math.min(current.length, position + 1)); select(input) }} />
    </div>
    <span className="aq-sr-only" id={`${id}-instruction`}>Enter {length} digits. You can paste the entire code.</span>
    {busy && <FieldDescription role="status" className="aq-otp-busy"><Spinner aria-hidden="true" role={undefined} aria-label={undefined} />{busyLabel}</FieldDescription>}
  </Field>
}
