import type * as React from "react"
import { cn } from "#lib/utils"

export function Card({ className, size = "default", ...props }: React.ComponentProps<"div"> & { size?: "sm" | "default" }) {
  return <div {...props} data-slot="card" data-size={size} className={cn("aq-card", className)} />
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="card-header" className={cn("aq-card-header", className)} />
}
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 {...props} data-slot="card-title" className={cn("aq-card-title", className)} />
}
export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p {...props} data-slot="card-description" className={cn("aq-card-description", className)} />
}
export function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="card-action" className={cn("aq-card-action", className)} />
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="card-content" className={cn("aq-card-content", className)} />
}
export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="card-footer" className={cn("aq-card-footer", className)} />
}
export function CardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="card-media" className={cn("aq-card-media", className)} />
}
