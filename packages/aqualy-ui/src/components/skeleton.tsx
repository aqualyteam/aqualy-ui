import type * as React from "react"
import { cn } from "#lib/utils"

export type SkeletonProps = React.ComponentProps<"div"> & {
  variant?: "line" | "title" | "avatar" | "value" | "media"
  animated?: boolean
}
/** Decorative placeholder. Give the containing region an accessible loading label. */
export function Skeleton({ className, variant = "line", animated = true, ...props }: SkeletonProps) {
  return <div {...props} data-slot="skeleton" data-variant={variant} data-animated={animated}
    aria-hidden="true" className={cn("aq-skeleton", className)} />
}
export function SkeletonRegion({ className, label = "Loading content", children, ...props }:
  Omit<React.ComponentProps<"div">, "aria-label" | "aria-busy"> & { label?: string }) {
  return <div {...props} data-slot="skeleton-region" role="region" aria-label={label} aria-busy="true"
    className={cn("aq-skeleton-region", className)}>{children}<span className="aq-sr-only" role="status">{label}</span></div>
}
