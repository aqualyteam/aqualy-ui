"use client"

import * as React from "react"
import { Popover as Primitive } from "@base-ui/react/popover"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "#components/popover"
import { cn } from "#lib/utils"

// Interactive previews share Popover's focus, dismissal, touch and portal contract.
// Base UI's visual-only PreviewCard intentionally hides popup content from assistive technology.
export const HoverCard = Popover
export const HoverCardClose = Primitive.Close
export const HoverCardTitle = PopoverTitle
export const HoverCardDescription = PopoverDescription
export function HoverCardTrigger({ delay = 300, closeDelay = 200, ...props }: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger data-slot="hover-card-trigger" openOnHover delay={delay} closeDelay={closeDelay} {...props} />
}
export type HoverCardContentProps = Omit<React.ComponentProps<typeof PopoverContent>, "size"> & { size?: "compact" | "default" }
export function HoverCardContent({ className, size = "default", initialFocus = false, ...props }: HoverCardContentProps) {
  return <PopoverContent data-slot="hover-card-content" data-size={size} initialFocus={initialFocus} className={state => cn("aq-hover-card", typeof className === "function" ? className(state) : className)} {...props} />
}
export function HoverCardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="hover-card-body" className={cn("aq-hover-card-body", className)} {...props} />
}
export function HoverCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="hover-card-footer" className={cn("aq-hover-card-footer", className)} {...props} />
}
