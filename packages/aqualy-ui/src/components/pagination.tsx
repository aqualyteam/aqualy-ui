"use client"

import * as React from "react"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Ellipsis } from "lucide-react"
import { Button } from "#components/button"
import { Input } from "#components/input"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { paginationItems, parsePageJump } from "#lib/pagination-model"
import { cn } from "#lib/utils"
export { paginationItems, parsePageJump } from "#lib/pagination-model"
export interface PaginationProps extends Omit<React.ComponentProps<"nav">, "children" | "onChange"> {
  page: number; pageCount: number; onPageChange: (page: number) => void
  label: string; size?: "sm" | "default" | "lg"; variant?: "numbered" | "compact"
  disabled?: boolean; showJump?: boolean; showEdges?: boolean
  pageLabel?: string; jumpLabel?: string; firstLabel?: string; previousLabel?: string; nextLabel?: string; lastLabel?: string
}
export function Pagination({ page, pageCount, onPageChange, label, size = "sm", variant = "numbered", disabled = false, showJump = true, showEdges = true, pageLabel = "Page", jumpLabel = `Go to page of ${label}`, firstLabel = `First page of ${label}`, previousLabel = `Previous page of ${label}`, nextLabel = `Next page of ${label}`, lastLabel = `Last page of ${label}`, className, ...props }: PaginationProps) {
  const items = paginationItems(page, pageCount), scope = useAqualyUIScope()
  const dir = props.dir === "rtl" || props.dir === "ltr" ? props.dir : scope.dir
  const [draft, setDraft] = React.useState<{ page: number; text: string } | null>(null)
  const text = draft?.page === page ? draft.text : String(page)
  const commit = () => { const next = parsePageJump(text, pageCount); if (next !== null && next !== page) onPageChange(next); setDraft(null) }
  const First = dir === "rtl" ? ChevronLast : ChevronFirst, Previous = dir === "rtl" ? ChevronRight : ChevronLeft, Next = dir === "rtl" ? ChevronLeft : ChevronRight, Last = dir === "rtl" ? ChevronFirst : ChevronLast
  const iconSize = size === "default" ? "icon" : size === "lg" ? "icon-lg" : "icon-sm"
  return <nav {...props} aria-label={`${label} pagination`} data-slot="pagination" data-size={size} data-variant={variant} className={cn("aq-pagination", className)}>
    <div className="aq-pagination-navigation">
      {showEdges && <Button size={iconSize} variant="outline" data-page-edge disabled={disabled || page <= 1 || !pageCount} aria-label={firstLabel} onClick={() => onPageChange(1)}><First /></Button>}
      <Button size={iconSize} variant="outline" disabled={disabled || page <= 1 || !pageCount} aria-label={previousLabel} onClick={() => onPageChange(page - 1)}><Previous /></Button>
      <div className="aq-pagination-numbers">{items.map(item => typeof item === "number" ? <Button key={item} size={iconSize} variant={item === page ? "default" : "ghost"} aria-label={`${pageLabel} ${item}`} aria-current={item === page ? "page" : undefined} disabled={disabled} onClick={() => onPageChange(item)}><bdi>{item}</bdi></Button> : <span key={item} className="aq-pagination-gap" aria-hidden="true"><Ellipsis /></span>)}</div>
      <span className="aq-pagination-current"><bdi>{pageCount ? page : 0} / {pageCount}</bdi></span>
      <Button size={iconSize} variant="outline" disabled={disabled || page >= pageCount || !pageCount} aria-label={nextLabel} onClick={() => onPageChange(page + 1)}><Next /></Button>
      {showEdges && <Button size={iconSize} variant="outline" data-page-edge disabled={disabled || page >= pageCount || !pageCount} aria-label={lastLabel} onClick={() => onPageChange(pageCount)}><Last /></Button>}
    </div>
    {showJump && <label className="aq-pagination-jump"><span>{pageLabel}</span><Input controlSize={size} inputMode="numeric" aria-label={jumpLabel} value={pageCount ? text : "0"} disabled={disabled || !pageCount} onChange={event => setDraft({ page, text: event.target.value })} onBlur={commit} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); commit() } if (event.key === "Escape") setDraft(null) }} /><bdi>/ {pageCount}</bdi></label>}
  </nav>
}
