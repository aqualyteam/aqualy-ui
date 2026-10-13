"use client"
import * as React from "react"
import { ToggleGroup as Primitive } from "@base-ui/react/toggle-group"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio } from "@base-ui/react/radio"
import { Button } from "#components/button"
import { Toggle, type ToggleProps, type ToggleSize, type ToggleVariant } from "#components/toggle"
import { cn } from "#lib/utils"
export type ToggleLayout = "joined" | "inset" | "separated" | "pill"
type StyleOptions = { size?: ToggleSize; variant?: ToggleVariant; layout?: ToggleLayout; busy?: boolean }
const StyleContext = React.createContext<Required<Pick<StyleOptions, "size" | "variant">>>({ size: "default", variant: "default" })
export function ToggleGroup<Value extends string>({ className, size = "default", variant = "default", layout = "separated", busy, disabled, ...props }: Primitive.Props<Value> & StyleOptions) {
  return <StyleContext.Provider value={{ size, variant }}><Primitive {...props} disabled={disabled || busy} aria-busy={busy || undefined}
    data-slot="toggle-group" data-size={size} data-layout={layout} className={state => cn("aq-toggle-group", `aq-control--${size}`, typeof className === "function" ? className(state) : className)} /></StyleContext.Provider>
}
export function ToggleGroupItem<Value extends string>({ size, variant, ...props }: ToggleProps<Value> & { value: Value }) {
  const style = React.useContext(StyleContext)
  return <Toggle {...props} size={size ?? style.size} variant={variant ?? style.variant} />
}
/** A required display-mode choice uses radio semantics, unlike an optional ToggleGroup. */
export function SegmentedControl<Value extends string>({ className, size = "default", variant = "default", layout = "joined", busy, disabled, ...props }: RadioGroupPrimitive.Props<Value> & StyleOptions & { orientation?: "horizontal" | "vertical" }) {
  return <StyleContext.Provider value={{ size, variant }}><RadioGroupPrimitive {...props} required disabled={disabled || busy}
    aria-orientation={props.orientation ?? "horizontal"} aria-busy={busy || undefined} data-orientation={props.orientation ?? "horizontal"}
    data-slot="segmented-control" data-size={size} data-layout={layout}
    className={state => cn("aq-toggle-group aq-segmented-control", `aq-control--${size}`, typeof className === "function" ? className(state) : className)} /></StyleContext.Provider>
}
export function SegmentedControlItem<Value extends string>({ className, iconOnly = false, render, ...props }: Radio.Root.Props<Value> & { iconOnly?: boolean }) {
  const { size, variant } = React.useContext(StyleContext)
  const buttonSize = iconOnly ? size === "default" ? "icon" : `icon-${size}` as const : size
  return <Radio.Root {...props} nativeButton render={render ?? <Button variant="ghost" size={buttonSize} />}
    data-slot="segmented-control-item" data-variant={variant} data-size={size}
    className={state => cn("aq-toggle", typeof className === "function" ? className(state) : className)} />
}
