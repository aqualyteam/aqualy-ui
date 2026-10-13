"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { cn } from "#lib/utils"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { InputGroup, InputGroupSelect } from "#components/input-group"
import type { InputControlSize } from "#components/input"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={state => cn("aq-select-group", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={state => cn("aq-select-value", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  variant = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  variant?: "default" | "secondary"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      className={state => cn(
        "aq-select-trigger", `aq-control--${size}`,
        typeof className === "function" ? className(state) : className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="aq-select-chevron" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  collisionPadding = 12,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger" | "collisionPadding"
  >) {
  return (
    <SelectPrimitive.Portal>
      <AqualyUIPortalScope>
        <SelectPrimitive.Positioner
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          alignItemWithTrigger={alignItemWithTrigger}
          collisionPadding={collisionPadding}
          className="aq-positioner"
        >
          <SelectPrimitive.Popup
            data-slot="select-content"
            data-align-trigger={alignItemWithTrigger}
            className={state => cn("aq-select-content", typeof className === "function" ? className(state) : className)}
            {...props}
          >
            <SelectScrollUpButton />
            <SelectPrimitive.List>{children}</SelectPrimitive.List>
            <SelectScrollDownButton />
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </AqualyUIPortalScope>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={state => cn("aq-select-label", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={state => cn(
        "aq-select-item",
        typeof className === "function" ? className(state) : className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="aq-select-item-text">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="aq-select-indicator" />
        }
      >
        <CheckIcon className="aq-select-check" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={state => cn("aq-select-separator", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={state => cn(
        "aq-select-scroll",
        typeof className === "function" ? className(state) : className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={state => cn(
        "aq-select-scroll",
        typeof className === "function" ? className(state) : className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

export interface SelectOption { value: string; label: string; description?: string; icon?: React.ReactNode; keywords?: string[]; disabled?: boolean }
export interface SelectOptionGroup { label: string; options: readonly SelectOption[] }
export interface SelectFieldProps {
  label: string; groups: readonly SelectOptionGroup[]; value: string | null; onValueChange: (value: string | null) => void
  name?: string; id?: string; description?: React.ReactNode; error?: React.ReactNode; size?: InputControlSize
  variant?: "default" | "secondary"; searchable?: boolean; disabled?: boolean; readOnly?: boolean; required?: boolean
  placeholder?: string; searchLabel?: string; searchPlaceholder?: string; emptyMessage?: string; className?: string
}
export function SelectField({ label, groups, value, onValueChange, name, id: suppliedId, description, error, size = "default", variant = "default", searchable = false, disabled, readOnly, required, placeholder = "Choose a resource…", searchLabel, searchPlaceholder, emptyMessage, className }: SelectFieldProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId, help = [description ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
  const options = groups.flatMap(group => group.options.map(option => ({ ...option, description: option.description ?? group.label, keywords: [...(option.keywords ?? []), group.label] })))
  if (new Set(options.map(option => option.value)).size !== options.length) throw new Error("Select option IDs must be unique")
  return <Field data-slot="select-field" data-disabled={disabled || undefined} data-invalid={Boolean(error) || undefined} className={className}>
    <FieldHeader><FieldLabel htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>{description && <FieldDescription id={`${id}-help`}>{description}</FieldDescription>}{error && <FieldError id={`${id}-error`}>{error}</FieldError>}</FieldHeader>
    {searchable ? <InputGroup controlSize={size} className="aq-select-searchable-group" data-variant={variant} data-readonly={readOnly || undefined}><InputGroupSelect id={id} label={label} options={options} value={value} onValueChange={onValueChange} name={name} disabled={disabled} readOnly={readOnly} required={required} invalid={Boolean(error)} describedBy={help} controlSize={size} className="aq-select-searchable-control" placeholder={placeholder} searchLabel={searchLabel} searchPlaceholder={searchPlaceholder} emptyMessage={emptyMessage} /></InputGroup> : <Select<string> items={options} value={value} onValueChange={onValueChange} name={name} disabled={disabled} readOnly={readOnly} required={required} onOpenChange={(open, details) => { if (readOnly && open) details.cancel() }}>
      <SelectTrigger id={id} size={size} variant={variant} aria-label={label} aria-describedby={help} aria-invalid={Boolean(error) || undefined} aria-required={required || undefined} data-readonly={readOnly || undefined}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{groups.map((group,index) => <SelectGroup key={`${index}:${group.label}`}><SelectLabel>{group.label}</SelectLabel>{group.options.map(option => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.icon && <span aria-hidden="true">{option.icon}</span>}<span className="aq-select-copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span></SelectItem>)}</SelectGroup>)}</SelectContent>
    </Select>}
  </Field>
}
