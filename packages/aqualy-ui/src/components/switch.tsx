"use client"
import * as React from "react"
import { Switch as Primitive } from "@base-ui/react/switch"
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { Spinner } from "#components/spinner"
import { cn } from "#lib/utils"
export type SwitchProps = Primitive.Root.Props & { size?: "sm" | "default" | "lg" }
export function Switch({ className, size = "default", children, ...props }: SwitchProps) {
  return <Primitive.Root {...props} data-slot="switch" data-size={size}
    className={state => cn("aq-switch", typeof className === "function" ? className(state) : className)}>
    <Primitive.Thumb data-slot="switch-thumb" className="aq-switch-thumb" />{children}
  </Primitive.Root>
}
export type SwitchFieldProps = Omit<SwitchProps, "children"> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode
  status?: "idle" | "saving" | "error"; statusText?: React.ReactNode
}
export function SwitchField({ label, description, error, id, status = "idle", statusText, disabled, ...props }: SwitchFieldProps) {
  const generated = React.useId(), controlId = id ?? generated
  const describedBy = [description ? `${controlId}-help` : "", error ? `${controlId}-error` : "", statusText ? `${controlId}-status` : "", props["aria-describedby"]].filter(Boolean).join(" ") || undefined
  return <Field data-slot="switch-field" data-disabled={disabled || undefined} data-invalid={!!error || undefined}
    aria-busy={status === "saving"} className="aq-switch-field">
    <div className="aq-switch-row"><FieldContent>
      <FieldLabel htmlFor={controlId}>{label}{props.required && <span aria-hidden="true"> *</span>}</FieldLabel>
      {description && <FieldDescription id={`${controlId}-help`}>{description}</FieldDescription>}
      {error && <FieldError id={`${controlId}-error`}>{error}</FieldError>}
    </FieldContent><Switch {...props} id={controlId} disabled={disabled || status === "saving"}
      aria-describedby={describedBy} aria-invalid={!!error || props["aria-invalid"]} /></div>
    {statusText && <p id={`${controlId}-status`} className="aq-switch-status" role="status">{status === "saving" && <Spinner size="xs" aria-hidden="true" />}{statusText}</p>}
  </Field>
}
