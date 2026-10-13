"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Ellipsis } from "lucide-react"
import { Button } from "#components/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLabel, NavigationMenuTrigger } from "#lib/navigation-menu"
import { cn } from "#lib/utils"

export type BreadcrumbDestination = { id: string; label: string; href: string }
export type BreadcrumbEntry = BreadcrumbDestination & { icon?: React.ReactNode; destinations?: BreadcrumbDestination[] }
export type BreadcrumbProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: BreadcrumbEntry[]
  responsive?: boolean
  overflowLabel?: string
  destinationsLabel?: (entry: BreadcrumbEntry) => string
  renderLink?: (destination: BreadcrumbDestination, props: React.ComponentProps<"a">) => React.ReactElement
}

export function Breadcrumb({ items, responsive = true, overflowLabel = "Show hidden levels",
  destinationsLabel = item => `Browse ${item.label} destinations`, renderLink, className, ref, ...props }: BreadcrumbProps) {
  const nav = React.useRef<HTMLElement>(null)
  const measurement = React.useRef<HTMLOListElement>(null)
  const [fit, setFit] = React.useState({ hidden: 0, compact: false })
  React.useEffect(() => {
    const root = nav.current, source = measurement.current
    if (!root || !source || !responsive) return
    const measure = () => {
      const nodes = [...source.children]
      const widths = nodes.map(node => node.getBoundingClientRect().width)
      const available = root.clientWidth
      let total = widths.reduce((sum, width) => sum + width, 0), hidden = 0
      while (total > available && hidden < items.length - 2) {
        total -= widths[hidden + 1] ?? 0
        if (!hidden) total += 48 // separator + icon-xs ghost trigger
        hidden++
      }
      const focused = document.activeElement
      const compact = total > available && !!items[0]?.icon
      setFit(previous => previous.hidden === hidden && previous.compact === compact ? previous : { hidden, compact })
      if (focused instanceof HTMLElement && root.contains(focused)) requestAnimationFrame(() => {
        if (!focused.isConnected) root.querySelector<HTMLElement>("a,button")?.focus({ preventScroll: true })
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    let active = true
    void document.fonts.ready.then(() => { if (active) measure() })
    measure()
    return () => { active = false; observer.disconnect() }
  }, [items, responsive])
  const hiddenCount = responsive ? Math.min(fit.hidden, Math.max(0, items.length - 2)) : 0
  const link = (item: BreadcrumbDestination, attrs: React.ComponentProps<"a">) => renderLink?.(item, attrs) ?? <a {...attrs} href={item.href} />
  const menu = (destinations: BreadcrumbDestination[], label: string, icon: React.ReactNode) => <NavigationMenu>
    <NavigationMenuTrigger render={<Button variant="ghost" size="icon-xs" />} aria-label={label}>{icon}</NavigationMenuTrigger>
    <NavigationMenuContent aria-label={label}><NavigationMenuLabel>{label}</NavigationMenuLabel>
      {destinations.map(item => <NavigationMenuItem key={item.id} nativeButton={false} render={link(item, {})}><bdi>{item.label}</bdi></NavigationMenuItem>)}
    </NavigationMenuContent>
  </NavigationMenu>
  const content = (item: BreadcrumbEntry, index: number, measuring = false) => <React.Fragment key={item.id}>
    {index > 0 && <span className="aq-breadcrumb-separator" aria-hidden="true"><ChevronRight /></span>}
    <div className="aq-breadcrumb-node">
      {index === items.length - 1 ? <span className="aq-breadcrumb-current" aria-current={measuring ? undefined : "page"} title={item.label}><bdi>{item.label}</bdi></span>
        : link(item, { className: cn("aq-breadcrumb-link", index === 0 && responsive && fit.compact && !measuring && "aq-breadcrumb-root-compact"), "aria-label": item.label,
          children: <>{item.icon && <span className="aq-breadcrumb-icon" aria-hidden="true">{item.icon}</span>}<bdi>{item.label}</bdi></> })}
      {item.destinations?.length ? measuring ? <span className="aq-breadcrumb-measure-menu" /> : menu(item.destinations, destinationsLabel(item), <ChevronDown />) : null}
    </div>
  </React.Fragment>
  return <nav {...props} ref={element => {
      nav.current = element
      if (typeof ref === "function") { const cleanup = ref(element); if (typeof cleanup === "function") return () => { nav.current = null; cleanup() } }
      else if (ref) ref.current = element
    }} aria-label={props["aria-label"] ?? "Breadcrumb"} data-slot="breadcrumb" className={cn("aq-breadcrumb", className)}>
    <ol className="aq-breadcrumb-list">
      {items.map((item, index) => index > 0 && index <= hiddenCount ? null : <React.Fragment key={item.id}>
        {index === 1 + hiddenCount && hiddenCount > 0 && <li className="aq-breadcrumb-item"><span className="aq-breadcrumb-separator" aria-hidden="true"><ChevronRight /></span>{menu(items.slice(1, hiddenCount + 1), overflowLabel, <Ellipsis />)}</li>}
        <li className={cn("aq-breadcrumb-item", index === items.length - 1 && "aq-breadcrumb-last")}>{content(item, index)}</li>
      </React.Fragment>)}
    </ol>
    <div className="aq-breadcrumb-measure-clip"><ol ref={measurement} className="aq-breadcrumb-measure" aria-hidden="true" inert>{items.map((item, index) => <li key={item.id} className="aq-breadcrumb-item">{content(item, index, true)}</li>)}</ol></div>
  </nav>
}
