"use client"
import * as React from "react"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "#lib/utils"
function Separator({ className, orientation = "horizontal", decorative = false, ...props }: SeparatorPrimitive.Props & { decorative?: boolean }) {
  return <SeparatorPrimitive data-slot="separator" {...props} {...(decorative ? { role: "presentation", "aria-hidden": true } : {})} orientation={orientation}
    className={state => cn("aq-separator", typeof className === "function" ? className(state) : className)} />
}
export function LabeledSeparator({ label, as: Tag = "span", className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { label: React.ReactNode; as?: "span" | "h2" | "h3" | "h4" }) {
  return <div {...props} data-slot="labeled-separator" className={cn("aq-labeled-separator", className)}><Separator decorative /><Tag>{label}</Tag><Separator decorative /></div>
}
export { Separator }
