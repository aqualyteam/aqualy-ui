"use client"

import * as React from "react"
import {
  AsYouType,
  getCountries,
  getExampleNumber,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
  type MetadataJson,
} from "libphonenumber-js/core"
import metadataImport from "libphonenumber-js/metadata.max"
import examples from "libphonenumber-js/examples.mobile.json"
import type { InputControlSize } from "#components/input"

import { Input } from "#components/input"
import { InputGroupSelect } from "#components/input-group"
import { cn } from "#lib/utils"

export type PhoneInputValue = {
  country: CountryCode | null
  input: string
  e164: string | null
  isValid: boolean
}

export type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
> & {
  value?: PhoneInputValue
  defaultValue?: Pick<PhoneInputValue, "country" | "input">
  onValueChange?: (value: PhoneInputValue) => void
  controlSize?: InputControlSize
}

const metadataModule = metadataImport as MetadataJson & { default?: MetadataJson }
const phoneMetadata = metadataModule.default ?? metadataModule
const countryNames = new Intl.DisplayNames(["en"], { type: "region" })
const COUNTRY_CODES = getCountries(phoneMetadata).sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), "en"))

function countryFlag(country: CountryCode) {
  return String.fromCodePoint(...[...country].map(letter => letter.charCodeAt(0) + 127397))
}

const COUNTRY_OPTIONS = COUNTRY_CODES.map(country => ({ value: country, label: countryLabel(country), icon: countryFlag(country), display: `${countryFlag(country)} +${getCountryCallingCode(country, phoneMetadata)}`, description: `+${getCountryCallingCode(country, phoneMetadata)}`, keywords: [country, countryLabel(country), getCountryCallingCode(country, phoneMetadata)] }))

function countryLabel(country: CountryCode) {
  return countryNames.of(country) ?? country
}

function isCountryCode(value: string | null): value is CountryCode {
  return value !== null && COUNTRY_CODES.includes(value as CountryCode)
}

function formatInput(input: string, country: CountryCode | null) {
  if (!input) {
    return ""
  }

  return new AsYouType(country ?? {}, phoneMetadata).input(input)
}

export function normalizePhoneInput(
  country: CountryCode | null,
  input: string,
): PhoneInputValue {
  const parsed = country === null
    ? parsePhoneNumberFromString(input, phoneMetadata)
    : parsePhoneNumberFromString(input, country, phoneMetadata)
  const isValid = parsed?.isValid() ?? false

  return {
    country: parsed?.country ?? country,
    input,
    e164: isValid && parsed ? parsed.number : null,
    isValid,
  }
}

function assignPhoneRef(ref: React.Ref<HTMLInputElement>, node: HTMLInputElement | null) {
  if (typeof ref === "function") return ref(node)
  if (ref) ref.current = node
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      className,
      defaultValue,
      value,
      onValueChange,
      disabled,
      readOnly,
      controlSize = "default",
      placeholder,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
      normalizePhoneInput(defaultValue?.country ?? null, defaultValue?.input ?? ""),
    )
    const currentValue = value ?? uncontrolledValue
    const inputRef = React.useRef<HTMLInputElement>(null)
    const setInputRef = React.useCallback((node: HTMLInputElement | null) => {
      inputRef.current = node
      const cleanup = assignPhoneRef(ref, node)
      if (node) return () => { inputRef.current = null; if (typeof cleanup === "function") cleanup(); else if (typeof ref === "function") ref(null); else if (ref) ref.current = null }
    }, [ref])
    React.useEffect(() => {
      const form = inputRef.current?.form
      const reset = () => { if (value === undefined) setUncontrolledValue(normalizePhoneInput(defaultValue?.country ?? null, defaultValue?.input ?? "")) }
      form?.addEventListener("reset", reset)
      return () => form?.removeEventListener("reset", reset)
    }, [value, defaultValue?.country, defaultValue?.input])

    const updateValue = React.useCallback(
      (nextValue: PhoneInputValue) => {
        if (value === undefined) {
          setUncontrolledValue(nextValue)
        }
        onValueChange?.(nextValue)
      },
      [onValueChange, value],
    )

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(normalizePhoneInput(currentValue.country, event.target.value))
    }

    const handleCountryChange = (nextCountry: string | null) => {
      if (!isCountryCode(nextCountry)) {
        return
      }

      updateValue(normalizePhoneInput(nextCountry, currentValue.input))
    }

    const hasInvalidValue = currentValue.input.length > 0 && !currentValue.isValid

    return (
      <div
        data-slot="phone-input"
        data-invalid={Boolean(ariaInvalid === true || ariaInvalid === "true" || (ariaInvalid === undefined && hasInvalidValue))}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        className={cn("aq-phone-input", `aq-control--${controlSize}`, className)}
      >
        <InputGroupSelect value={currentValue.country} onValueChange={handleCountryChange}
          options={COUNTRY_OPTIONS} disabled={disabled || readOnly} label="Country" searchLabel="Search country or code"
          placeholder="Country" className="aq-phone-country" controlSize={controlSize} />
        <Input
          ref={setInputRef}
          {...props}
          disabled={disabled}
          readOnly={readOnly}
          type="tel"
          inputMode="tel"
          dir="ltr"
          controlSize={controlSize}
          placeholder={placeholder ?? (currentValue.country ? getExampleNumber(currentValue.country, examples, phoneMetadata)?.formatNational() : "+61 412 345 678")}
          value={formatInput(currentValue.input, currentValue.country)}
          onChange={handleInputChange}
          aria-invalid={ariaInvalid ?? hasInvalidValue}
        />
      </div>
    )
  },
)

PhoneInput.displayName = "PhoneInput"
