import type * as React from "react"
import { cn } from "#lib/utils"
import { Loader2Icon } from "lucide-react"
export type SpinnerProps = React.ComponentProps<"svg"> & { size?: "xs" | "sm" | "default" | "lg" | "xl" }
/** Local operation indicator. Use Loading for page-level initial loading. */
function Spinner({ className, size, "aria-hidden": hidden, ...props }: SpinnerProps) {
  const decorative = hidden === true || hidden === "true"
  return <Loader2Icon role={decorative ? undefined : "status"} aria-label={decorative ? undefined : "Loading"}
    strokeWidth={1.6} {...props} aria-hidden={hidden} data-slot="spinner" data-size={size}
    className={cn("aq-spinner", className)} />
}
export { Spinner }
