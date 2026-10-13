import type * as React from "react"
import { TriangleAlert, RotateCcw } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, type EmptyProps } from "#components/empty"
import { Button } from "#components/button"
import { Spinner } from "#components/spinner"
import { cn } from "#lib/utils"

export type ErrorStateProps = Omit<EmptyProps, "children" | "title"> & {
  title: React.ReactNode
  description: React.ReactNode
  media?: React.ReactNode | false
  actions?: React.ReactNode
  context?: React.ReactNode
  headingLevel?: "h2" | "h3" | "h4"
  retry?: { label: string; pendingLabel?: string; onRetry: () => void; pending?: boolean; disabled?: boolean }
}

// Request state and retry policy belong to the consumer; rendering an error never starts a request.
export function ErrorState({ title, description, media = <TriangleAlert />, actions, context,
  retry, headingLevel, className, ...props }: ErrorStateProps) {
  return <Empty {...props} data-slot="error-state" aria-busy={retry?.pending || undefined} className={cn("aq-error-state", className)}>
    {media !== false && media != null && <EmptyMedia>{media}</EmptyMedia>}
    <EmptyHeader>{context && <span className="aq-empty-context">{context}</span>}<EmptyTitle as={headingLevel}>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>
    {(retry || actions) && <EmptyContent>{retry && <Button variant="outline" size={props.size === "lg" ? "default" : "sm"} disabled={retry.pending || retry.disabled} onClick={retry.onRetry}>{retry.pending ? <Spinner aria-hidden="true" role={undefined} aria-label={undefined} data-icon="inline-start" /> : <RotateCcw data-icon="inline-start" />}{retry.pending ? retry.pendingLabel ?? "Retrying…" : retry.label}</Button>}{actions}</EmptyContent>}
  </Empty>
}
