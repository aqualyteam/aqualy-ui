import type * as React from "react"
import { cn } from "#lib/utils"

export type EmptyProps = React.ComponentProps<"div"> & { size?: "sm" | "default" | "lg"; align?: "start" | "center"; variant?: "plain" | "bordered" }
export function Empty({ className, size = "default", align = "center", variant = "plain", ...props }: EmptyProps) {
  return <div data-slot="empty" data-size={size} data-align={align} data-variant={variant} className={cn("aq-empty", className)} {...props} />
}
export function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-header" className={cn("aq-empty-header", className)} {...props} /> }
export function EmptyMedia({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-media" aria-hidden="true" className={cn("aq-empty-media", className)} {...props} /> }
export function EmptyTitle({ className, as: Tag = "h3", ...props }: React.ComponentProps<"h3"> & { as?: "h2" | "h3" | "h4" }) { return <Tag data-slot="empty-title" className={cn("aq-empty-title", className)} {...props} /> }
export function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="empty-description" className={cn("aq-empty-description", className)} {...props} /> }
export function EmptyContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-content" className={cn("aq-empty-actions", className)} {...props} /> }
export type EmptyStateProps = Omit<EmptyProps, "title" | "children"> & { title: React.ReactNode; description: React.ReactNode; media?: React.ReactNode; actions?: React.ReactNode; context?: React.ReactNode; headingLevel?: "h2" | "h3" | "h4" }
export function EmptyState({ title, description, media, actions, context, headingLevel, ...props }: EmptyStateProps) {
  return <Empty {...props}>{media && <EmptyMedia>{media}</EmptyMedia>}<EmptyHeader>{context && <span className="aq-empty-context">{context}</span>}<EmptyTitle as={headingLevel}>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{actions && <EmptyContent>{actions}</EmptyContent>}</Empty>
}
