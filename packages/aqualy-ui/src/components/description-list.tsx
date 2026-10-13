import type * as React from "react"
import { cn } from "#lib/utils"

export type DescriptionListProps = React.ComponentProps<"dl"> & {
  layout?: "rows" | "stacked" | "grid"
  surface?: "plain" | "dividers" | "bordered" | "striped"
  density?: "compact" | "default" | "comfortable"
  align?: "start" | "end"
  columns?: 2 | 3
}
export function DescriptionList({ className, layout = "rows", surface = "dividers", density = "default", align = "start", columns = 2, ...props }: DescriptionListProps) {
  return <dl data-slot="description-list" data-layout={layout} data-surface={surface} data-density={density} data-align={align} data-columns={columns} className={cn("aq-description-list", className)} {...props} />
}
export function DescriptionListItem({ className, muted = false, ...props }: React.ComponentProps<"div"> & { muted?: boolean }) {
  return <div data-slot="description-list-item" data-muted={muted || undefined} className={cn("aq-description-item", className)} {...props} />
}
export function DescriptionListTerm({ className, ...props }: React.ComponentProps<"dt">) {
  return <dt data-slot="description-list-term" className={cn("aq-description-term", className)} {...props} />
}
export function DescriptionListDetail({ className, ...props }: React.ComponentProps<"dd">) {
  return <dd data-slot="description-list-detail" className={cn("aq-description-detail", className)} {...props} />
}
export function DescriptionListValue({ className, actions, children, ...props }: React.ComponentProps<"div"> & { actions?: React.ReactNode }) {
  return <div data-slot="description-list-value" className={cn("aq-description-value-line", className)} {...props}><div className="aq-description-value">{children}</div>{actions && <div className="aq-description-actions">{actions}</div>}</div>
}
export function DescriptionListDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="description-list-description" className={cn("aq-description-description", className)} {...props} />
}
