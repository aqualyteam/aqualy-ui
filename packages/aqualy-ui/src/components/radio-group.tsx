"use client"

import * as React from "react"
import { Radio as Primitive } from "@base-ui/react/radio"
import { RadioGroup as Group } from "@base-ui/react/radio-group"
import { FieldSet, FieldLegend, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"
export function RadioGroup<Value = string>({ className, layout = "list", size = "default", variant = "neutral", ...props }: Group.Props<Value> & { layout?: "list" | "inline" | "cards"; size?: "xs" | "sm" | "default" | "lg"; variant?: "neutral" | "marine" }) {
  return <Group {...props} data-slot="radio-group" data-layout={layout} data-size={size} data-variant={variant} className={state => cn("aq-radio-group", typeof className === "function" ? className(state) : className)} />
}
export function RadioGroupItem<Value = string>({ className, ...props }: Primitive.Root.Props<Value>) {
  return <Primitive.Root {...props} data-slot="radio" className={state => cn("aq-radio", typeof className === "function" ? className(state) : className)}><Primitive.Indicator className="aq-radio-indicator" /></Primitive.Root>
}
export type RadioOption<Value = string> = Omit<Primitive.Root.Props<Value>, "children" | "className"> & { className?: string; label: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode; badge?: React.ReactNode }
export function RadioGroupOption<Value = string>({ label, description, icon, badge, className, ...props }: RadioOption<Value>) {
  const id = React.useId()
  return <label className={cn("aq-radio-option", className)} data-disabled={props.disabled || undefined}><RadioGroupItem {...props} aria-labelledby={`${id}-label`} aria-describedby={[props["aria-describedby"], description ? `${id}-help` : null].filter(Boolean).join(" ") || undefined} /><span className="aq-radio-copy"><strong id={`${id}-label`}>{icon && <span aria-hidden="true">{icon}</span>}{label}{badge}</strong>{description && <small id={`${id}-help`}>{description}</small>}</span></label>
}
export type RadioGroupFieldProps<Value = string> = Omit<React.ComponentProps<typeof RadioGroup<Value>>, "aria-label" | "aria-labelledby"> & { label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode }
export function RadioGroupField<Value = string>({ label, description, error, required, disabled, children, ...props }: RadioGroupFieldProps<Value>) {
  const id = React.useId(), help = [props["aria-describedby"], description ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
  return <FieldSet className="aq-radio-field" data-invalid={Boolean(error) || undefined} disabled={disabled}><FieldLegend id={`${id}-label`} variant="label">{label}{required && <span aria-hidden="true"> *</span>}</FieldLegend>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}<RadioGroup {...props} required={required} disabled={disabled} aria-labelledby={`${id}-label`} aria-describedby={help} aria-invalid={error ? true : props["aria-invalid"]}>{children}</RadioGroup></FieldSet>
}
