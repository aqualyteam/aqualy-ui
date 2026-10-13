import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "#lib/utils"

export type InputControlSize = "xs" | "sm" | "default" | "lg" | "xl"
export type InputProps = React.ComponentProps<"input"> & { controlSize?: InputControlSize }

// Keep the native numeric `size` attribute; visual sizing has its own API.
function Input({ className, type, controlSize = "default", ...props }: InputProps) {
  return <InputPrimitive type={type} data-slot="input" data-control-size={controlSize}
    className={cn("aq-input", `aq-control--${controlSize}`, className)} {...props} />
}

export { Input }
