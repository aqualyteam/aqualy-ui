import type * as React from "react"
import { cn } from "#lib/utils"
export function Timeline({ className, compact = false, ...props }: React.ComponentProps<"ol"> & { compact?: boolean }) {
  return <ol {...props} data-slot="timeline" data-compact={compact || undefined} className={cn("aq-timeline", className)} />
}
export function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li {...props} data-slot="timeline-item" className={cn("aq-timeline-item", className)} />
}
export function TimelineIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return <span {...props} aria-hidden="true" data-slot="timeline-indicator" className={cn("aq-timeline-indicator", className)} />
}
export function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="timeline-content" className={cn("aq-timeline-content", className)} />
}
export function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p {...props} data-slot="timeline-title" className={cn("aq-timeline-title", className)} />
}
export function TimelineDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p {...props} data-slot="timeline-description" className={cn("aq-timeline-description", className)} />
}
export function TimelineTime({ className, ...props }: React.ComponentProps<"time"> & { dateTime: string }) {
  return <time {...props} dir="ltr" data-slot="timeline-time" className={cn("aq-timeline-time", className)} />
}
