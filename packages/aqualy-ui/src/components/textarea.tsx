"use client"
import * as React from "react"
import { InputGroup, InputGroupTextarea } from "#components/input-group"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"
export type TextareaProps = React.ComponentProps<"textarea"> & { controlSize?: "sm" | "default" | "lg"; autoResize?: boolean; maxHeight?: number }
export function Textarea({ controlSize = "default", autoResize = false, maxHeight = 220, rows, className, ref: externalRef, onChange, value, ...props }: TextareaProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const resize = React.useCallback(() => {
    const node = inputRef.current
    if (!node || !autoResize) return
    node.style.height = "auto"
    const minimum = Number.parseFloat(getComputedStyle(node).minHeight)
    node.style.height = `${Math.max(minimum, Math.min(node.scrollHeight + 2, maxHeight))}px`
  }, [autoResize, maxHeight])
  const setRef = React.useCallback((node: HTMLTextAreaElement | null) => {
    inputRef.current = node
    const cleanup = typeof externalRef === "function" ? externalRef(node) : undefined
    if (externalRef && typeof externalRef !== "function") externalRef.current = node
    if (node) return () => { inputRef.current = null; if (typeof cleanup === "function") cleanup(); else if (typeof externalRef === "function") externalRef(null); else if (externalRef) externalRef.current = null }
  }, [externalRef])
  React.useLayoutEffect(() => {
    const node = inputRef.current
    if (!autoResize || !node) return
    resize()
    const observer = new ResizeObserver(resize); observer.observe(node)
    const form = node.form
    let frame = 0
    const reset = () => { frame = requestAnimationFrame(resize) }
    form?.addEventListener("reset", reset)
    return () => { observer.disconnect(); form?.removeEventListener("reset", reset); cancelAnimationFrame(frame); node.style.height = "" }
  }, [autoResize, resize])
  React.useLayoutEffect(resize, [resize, value])
  return <InputGroup className="aq-textarea-group"><InputGroupTextarea {...props} ref={setRef} value={value}
    rows={rows ?? { sm: 2, default: 3, lg: 6 }[controlSize]} data-slot="textarea" data-control-size={controlSize}
    data-auto-resize={autoResize || undefined} className={cn("aq-textarea", className)}
    onChange={event => { onChange?.(event); resize() }} /></InputGroup>
}
export type TextareaFieldProps = Omit<TextareaProps, "value" | "defaultValue"> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void
  showCount?: boolean; countLabel?: (count: number, maximum?: number) => React.ReactNode
}
export function TextareaField({ label, description, error, id, value, defaultValue = "", onValueChange, onChange, showCount = true, countLabel, className, required, ...props }: TextareaFieldProps) {
  const generated = React.useId(), controlId = id ?? generated
  const [local, setLocal] = React.useState(defaultValue), current = value ?? local
  const hostRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const form = hostRef.current?.querySelector("textarea")?.form
    const reset = () => { if (value === undefined) setLocal(defaultValue) }
    form?.addEventListener("reset", reset); return () => form?.removeEventListener("reset", reset)
  }, [value, defaultValue])
  const describedBy = [props["aria-describedby"], description && `${controlId}-help`, error && `${controlId}-error`, showCount && `${controlId}-count`].filter(Boolean).join(" ") || undefined
  return <Field ref={hostRef} className={className} data-disabled={props.disabled || undefined} data-invalid={!!error || undefined}>
    <FieldHeader><FieldLabel htmlFor={controlId}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>
      {description && <FieldDescription id={`${controlId}-help`}>{description}</FieldDescription>}
      {error && <FieldError id={`${controlId}-error`}>{error}</FieldError>}</FieldHeader>
    <Textarea {...props} id={controlId} value={current} required={required} aria-describedby={describedBy} aria-invalid={!!error || props["aria-invalid"]}
      onChange={event => { onChange?.(event); if (!event.defaultPrevented) { if (value === undefined) setLocal(event.target.value); onValueChange?.(event.target.value) } }} />
    {showCount && <p id={`${controlId}-count`} className="aq-textarea-count">{countLabel ? countLabel(current.length, props.maxLength) : <bdi dir="ltr">{`${current.length}${props.maxLength !== undefined ? ` / ${props.maxLength}` : ""} characters`}</bdi>}</p>}
  </Field>
}
