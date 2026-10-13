import type * as React from "react"
import { cn } from "#lib/utils"

function AspectRatio({ className, ratio = 1, fit = "cover", style, ...props }: React.ComponentProps<"div"> & { ratio?: number; fit?: "cover" | "contain" }) {
  if (!Number.isFinite(ratio) || ratio <= 0) throw new RangeError("AspectRatio ratio must be a finite positive number")
  return <div data-slot="aspect-ratio" data-fit={fit} className={cn("aq-aspect-ratio", className)} style={{ ...style, aspectRatio: ratio }} {...props} />
}

export { AspectRatio }
