import type * as React from "react"
import { cn } from "#lib/utils"
import { Spinner } from "#components/spinner"

export type BadgeProps = React.ComponentProps<"span"> & {
  size?: "xs" | "sm" | "default" | "lg"
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info"
  icon?: React.ReactNode
  loading?: boolean
}

export function Badge({ size = "default", variant = "secondary", icon, loading = false,
  className, children, ...props }: BadgeProps) {
  return <span {...props} data-slot="badge" data-size={size} data-variant={variant}
    className={cn("aq-badge", className)}>
    {loading ? <Spinner aria-hidden="true" role={undefined} aria-label={undefined} /> : icon ? <span className="aq-badge-icon" aria-hidden="true">{icon}</span> : null}
    <bdi>{children}</bdi>
  </span>
}
