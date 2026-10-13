"use client"

import * as React from "react"
import { InputGroup, InputGroupAddon, InputGroupSelect, InputField, type InputGroupSelectOption } from "#components/input-group"
import { Field, FieldHeader, FieldLabel, FieldError, FieldGroup } from "#components/field"
import type { InputControlSize } from "#components/input"
import { cn } from "#lib/utils"

export interface AddressValue { line1: string; line2: string; locality: string; region: string; postalCode: string; country: string }
export interface AddressInputProps {
  value: AddressValue; onValueChange: (value: AddressValue) => void; countryOptions: readonly InputGroupSelectOption[]
  labels?: Partial<Record<keyof AddressValue, string>>; errors?: Partial<Record<keyof AddressValue, React.ReactNode>>
  requiredFields?: readonly (keyof AddressValue)[]; disabled?: boolean; readOnly?: boolean; controlSize?: InputControlSize
  name?: string; id?: string; className?: string; countrySearchLabel?: string
}
const LABELS = { line1: "Address line 1", line2: "Address line 2", locality: "City / Locality", region: "State / Region", postalCode: "Postal code", country: "Country / Region" }
const AUTOCOMPLETE = { line1: "address-line1", line2: "address-line2", locality: "address-level2", region: "address-level1", postalCode: "postal-code" }
export function AddressInput({ value, onValueChange, countryOptions, labels: customLabels, errors, requiredFields = [], disabled, readOnly, controlSize = "default", name = "address", id: suppliedId, className, countrySearchLabel = "Search country or code" }: AddressInputProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId, labels = { ...LABELS, ...customLabels }
  const update = (field: keyof AddressValue, next: string) => onValueChange({ ...value, [field]: next })
  return <FieldGroup className={cn("aq-address-input", className)} data-slot="address-input">
    {(["line1", "line2", "locality", "region", "postalCode"] as const).map(field => <InputField key={field} id={`${id}-${field}`} name={`${name}.${field}`} label={labels[field]} value={value[field]} onValueChange={next => update(field, next)} required={requiredFields.includes(field)} error={errors?.[field]} disabled={disabled} readOnly={readOnly} controlSize={controlSize} autoComplete={AUTOCOMPLETE[field]} />)}
    <Field data-invalid={Boolean(errors?.country) || undefined} data-disabled={disabled || undefined}><FieldHeader><FieldLabel htmlFor={`${id}-country`}>{labels.country}{requiredFields.includes("country") && <span aria-hidden="true"> *</span>}</FieldLabel>{errors?.country && <FieldError id={`${id}-country-error`}>{errors.country}</FieldError>}</FieldHeader><InputGroup controlSize={controlSize} className="aq-address-country"><InputGroupAddon><InputGroupSelect id={`${id}-country`} label={labels.country} searchLabel={countrySearchLabel} options={countryOptions} value={value.country || null} onValueChange={next => update("country", next ?? "")} disabled={disabled || readOnly} required={requiredFields.includes("country")} invalid={Boolean(errors?.country)} describedBy={errors?.country ? `${id}-country-error` : undefined} name={readOnly ? undefined : `${name}.country`} controlSize={controlSize}/></InputGroupAddon></InputGroup>{readOnly && !disabled && <input type="hidden" name={`${name}.country`} value={value.country} />}</Field>
  </FieldGroup>
}
