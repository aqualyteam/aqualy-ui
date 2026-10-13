"use client"

import * as React from "react"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupSelect, type InputGroupSelectOption } from "#components/input-group"
import type { InputProps } from "#components/input"

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" })
const CURRENCIES: InputGroupSelectOption[] = Intl.supportedValuesOf("currency").sort().map(code => ({ value: code, label: `${code} · ${currencyNames.of(code) ?? code}`, display: code, keywords: [code, currencyNames.of(code) ?? code] }))
export type CurrencyInputProps = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> & {
  value: string; currency: string; onValueChange: (value: string) => void; onCurrencyChange: (currency: string) => void
  currencyOptions?: readonly InputGroupSelectOption[]; currencyLabel?: string; currencySearchLabel?: string; currencyName?: string
}
// Keep the raw decimal string. Rounding, exchange rates and minor units belong to the consuming product.
export function CurrencyInput({ value, currency, onValueChange, onCurrencyChange, currencyOptions = CURRENCIES, currencyLabel = "Currency", currencySearchLabel = "Search currency", currencyName, className, controlSize = "default", disabled, readOnly, ...props }: CurrencyInputProps) {
  return <InputGroup className={className} controlSize={controlSize} data-slot="currency-input"><InputGroupAddon><InputGroupSelect options={currencyOptions} value={currency} onValueChange={next => { if (next) onCurrencyChange(next) }} label={currencyLabel} searchLabel={currencySearchLabel} name={readOnly ? undefined : currencyName} disabled={disabled || readOnly} controlSize={controlSize} /></InputGroupAddon><InputGroupInput {...props} type="text" inputMode="decimal" dir="ltr" disabled={disabled} readOnly={readOnly} value={value} onChange={event => onValueChange(event.target.value)} />{readOnly && !disabled && currencyName && <input type="hidden" name={currencyName} value={currency} />}</InputGroup>
}
