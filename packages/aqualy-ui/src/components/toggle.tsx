"use client"
import { Toggle as Primitive } from "@base-ui/react/toggle"
import { Button } from "#components/button"
import { cn } from "#lib/utils"
export type ToggleSize = "xs" | "sm" | "default" | "lg"
export type ToggleVariant = "default" | "outline" | "secondary" | "ghost" | "marine"
export type ToggleProps<Value extends string = string> = Primitive.Props<Value> & {
  size?: ToggleSize; variant?: ToggleVariant; iconOnly?: boolean; busy?: boolean
}
export function Toggle<Value extends string>({ className, size = "default", variant = "default", iconOnly = false, busy, disabled, render, ...props }: ToggleProps<Value>) {
  const buttonSize = iconOnly ? size === "default" ? "icon" : `icon-${size}` as const : size
  return <Primitive {...props} disabled={disabled || busy} render={render ?? <Button variant="ghost" size={buttonSize} />}
    data-slot="toggle" data-variant={variant} data-size={size} aria-busy={busy || undefined}
    className={state => cn("aq-toggle", typeof className === "function" ? className(state) : className)} />
}
