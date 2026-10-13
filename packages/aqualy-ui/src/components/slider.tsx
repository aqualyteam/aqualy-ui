"use client"
import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { Slider as Primitive } from "@base-ui/react/slider"
import { Field, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"
export type SliderProps<Value extends number | readonly number[] = number | readonly number[]> = Primitive.Root.Props<Value> & {
  thumbLabels?: readonly string[]
  getAriaValueText?: Primitive.Thumb.Props["getAriaValueText"]
}
export function Slider<Value extends number | readonly number[]>({ className, children, value, defaultValue, thumbLabels,
  getAriaValueText, "aria-label": ariaLabel, "aria-labelledby": labelledBy, "aria-describedby": describedBy, "aria-invalid": invalid, ...props }: SliderProps<Value>) {
  const values = value ?? defaultValue ?? 0
  const count = typeof values === "number" ? 1 : values.length
  return <FieldPrimitive.Root invalid={invalid === true || invalid === "true"} className="aq-slider-validation"><Primitive.Root {...props} value={value} defaultValue={defaultValue} thumbAlignment="edge"
    thumbCollisionBehavior="none" data-slot="slider"
    className={state => cn("aq-slider", typeof className === "function" ? className(state) : className)}>
    {children}<Primitive.Control data-slot="slider-control" className="aq-slider-control">
      <Primitive.Track className="aq-slider-track"><Primitive.Indicator className="aq-slider-indicator" />
        {Array.from({ length: count }, (_, index) => <Primitive.Thumb key={index} index={index} className="aq-slider-thumb"
          aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid}
          getAriaLabel={thumbLabels || ariaLabel || count > 1 ? () => thumbLabels?.[index] ?? ariaLabel ?? `Value ${index + 1}` : undefined}
          getAriaValueText={getAriaValueText} />)}
      </Primitive.Track>
    </Primitive.Control>
  </Primitive.Root></FieldPrimitive.Root>
}
export type SliderFieldProps<Value extends number | readonly number[] = number | readonly number[]> = SliderProps<Value> & {
  label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode
  formatValue?: (values: readonly number[]) => React.ReactNode
}
export function SliderField<Value extends number | readonly number[]>({ label, description, error, id, formatValue, ...props }: SliderFieldProps<Value>) {
  const generated = React.useId(), controlId = id ?? generated
  const describedBy = [description ? `${controlId}-help` : "", error ? `${controlId}-error` : "", props["aria-describedby"]].filter(Boolean).join(" ") || undefined
  return <Field data-slot="slider-field" data-invalid={!!error || undefined} data-disabled={props.disabled || undefined}>
    <Slider {...props} id={controlId} aria-describedby={describedBy} aria-invalid={!!error || props["aria-invalid"]}>
      <div className="aq-slider-header"><Primitive.Label className="aq-field-label">{label}</Primitive.Label>
        <Primitive.Value className="aq-slider-value">{(formatted, values) => formatValue ? formatValue(values) : formatted.join("–")}</Primitive.Value></div>
      {description && <FieldDescription id={`${controlId}-help`}>{description}</FieldDescription>}
      {error && <FieldError id={`${controlId}-error`}>{error}</FieldError>}
    </Slider>
  </Field>
}
