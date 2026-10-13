import type * as React from "react"
import { cn } from "#lib/utils"

type AlertVariant = "default" | "danger" | "warning" | "info"

function Alert({ className, variant = "default", role = "note", ...props }: React.ComponentProps<"div"> & { variant?: AlertVariant }) {
  return <div data-slot="alert" data-variant={variant} role={role} className={cn("aq-alert", className)} {...props} />
}

function AlertIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="alert-icon" aria-hidden="true" className={cn("aq-alert-icon", className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("aq-alert-title", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("aq-alert-description", className)} {...props} />
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("aq-alert-action", className)} {...props} />
}

export { Alert, AlertIcon, AlertTitle, AlertDescription, AlertAction, type AlertVariant }
