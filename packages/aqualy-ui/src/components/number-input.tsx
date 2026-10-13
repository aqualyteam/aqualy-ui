"use client"

import * as React from "react"
import { NumberField as Primitive } from "@base-ui/react/number-field"
import { Minus, Plus } from "lucide-react"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton, InputGroupText } from "#components/input-group"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import type { InputControlSize } from "#components/input"
import { cn } from "#lib/utils"

export type NumberInputProps = Omit<Primitive.Root.Props, "children" | "className"> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode
  size?: InputControlSize; suffix?: React.ReactNode; placeholder?: string
  decrementLabel?: string; incrementLabel?: string; className?: string
}
export function NumberInput({ label, description, error, size = "default", suffix, placeholder, decrementLabel = "Decrease value", incrementLabel = "Increase value", id: suppliedId, disabled, readOnly, required, className, ...props }: NumberInputProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId
  const help = [props["aria-describedby"], description ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
  return <Field className={cn("aq-number-field", className)} data-invalid={Boolean(error) || props["aria-invalid"] === true || props["aria-invalid"] === "true" || undefined} data-disabled={disabled || undefined}>
    <FieldHeader><FieldLabel htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
    <Primitive.Root {...props} id={id} disabled={disabled} readOnly={readOnly} required={required}>
      <Primitive.Group render={<InputGroup controlSize={size} />} data-invalid={Boolean(error) || props["aria-invalid"] === true || props["aria-invalid"] === "true" || undefined}>
        <InputGroupAddon><Primitive.Decrement render={<InputGroupButton />} disabled={disabled || readOnly} aria-label={decrementLabel}><Minus /></Primitive.Decrement></InputGroupAddon>
        <Primitive.Input render={<InputGroupInput />} placeholder={placeholder} aria-invalid={error ? true : props["aria-invalid"]} aria-labelledby={props["aria-labelledby"]} aria-label={props["aria-label"]} aria-describedby={help} aria-required={required || undefined} />
        {suffix && <InputGroupAddon align="inline-end"><InputGroupText>{suffix}</InputGroupText></InputGroupAddon>}
        <InputGroupAddon align="inline-end"><Primitive.Increment render={<InputGroupButton />} disabled={disabled || readOnly} aria-label={incrementLabel}><Plus /></Primitive.Increment></InputGroupAddon>
      </Primitive.Group>
    </Primitive.Root>
  </Field>
}
