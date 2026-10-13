"use client"
import * as React from "react"
import { Collapsible } from "@base-ui/react/collapsible"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "#components/tooltip"
import { ChevronDown, PanelLeft } from "lucide-react"
import { Button } from "#components/button"
import { ScrollArea } from "#components/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "#components/sheet"
import { cn } from "#lib/utils"

export type SidebarCollapseMode = "icon" | "offcanvas" | "none"
const subscribeMobile = (callback: () => void) => {
  const query = window.matchMedia("(max-width: 720px)")
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
const mobileSnapshot = () => window.matchMedia("(max-width: 720px)").matches
const serverSnapshot = () => false
interface SidebarState {
  open: boolean; setOpen: (open: boolean) => void
  openMobile: boolean; setOpenMobile: (open: boolean) => void
  isMobile: boolean; mode: SidebarCollapseMode; rail: boolean
  toggleSidebar: () => void; id: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}
const SidebarContext = React.createContext<SidebarState | null>(null)
export function useSidebar() {
  const value = React.useContext(SidebarContext)
  if (!value) throw new Error("Sidebar components require SidebarProvider")
  return value
}
export type SidebarProviderProps = React.ComponentProps<"div"> & {
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void
  openMobile?: boolean; onOpenMobileChange?: (open: boolean) => void
  collapsible?: SidebarCollapseMode
}
/** Mount in a persistent app layout. Routing and persistence belong to the consumer. */
export function SidebarProvider({ open: controlled, defaultOpen = true, onOpenChange,
  openMobile: controlledMobile, onOpenMobileChange, collapsible = "icon", className, children, ...props }: SidebarProviderProps) {
  const [local, setLocal] = React.useState(defaultOpen), [localMobile, setLocalMobile] = React.useState(false)
  const open = controlled ?? local, openMobile = controlledMobile ?? localMobile
  const isMobile = React.useSyncExternalStore(subscribeMobile, mobileSnapshot, serverSnapshot)
  const id = React.useId(), triggerRef = React.useRef<HTMLButtonElement>(null)
  const setOpen = React.useCallback((next: boolean) => { if (controlled === undefined) setLocal(next); onOpenChange?.(next) }, [controlled, onOpenChange])
  const setOpenMobile = React.useCallback((next: boolean) => { if (controlledMobile === undefined) setLocalMobile(next); onOpenMobileChange?.(next) }, [controlledMobile, onOpenMobileChange])
  React.useEffect(() => { if (!isMobile && openMobile) setOpenMobile(false) }, [isMobile, openMobile, setOpenMobile])
  const value = React.useMemo(() => ({ open, setOpen, openMobile, setOpenMobile, isMobile,
    mode: collapsible, rail: !isMobile && !open && collapsible === "icon", id, triggerRef,
    toggleSidebar: () => isMobile ? setOpenMobile(!openMobile) : collapsible !== "none" && setOpen(!open),
  }), [open, setOpen, openMobile, setOpenMobile, isMobile, collapsible, id])
  return <SidebarContext.Provider value={value}><TooltipProvider delay={350}>
    <div {...props} data-slot="sidebar-provider" data-state={open || collapsible === "none" ? "expanded" : "collapsed"}
      data-collapsible={collapsible} className={cn("aq-sidebar-provider", className)}>{children}</div>
  </TooltipProvider></SidebarContext.Provider>
}
export type SidebarProps = React.ComponentProps<"aside"> & { label: string; description?: string; closeLabel?: string }
export function Sidebar({ label, description, closeLabel = "Close navigation", children, className, ...props }: SidebarProps) {
  const { isMobile, open, mode, openMobile, setOpenMobile, id, triggerRef } = useSidebar()
  const content = <aside {...props} aria-label={label} data-slot="sidebar" className={cn("aq-sidebar", className)}>{children}</aside>
  if (isMobile) return <Sheet open={openMobile} onOpenChange={setOpenMobile} disablePointerDismissal={false}>
    <SheetContent id={id} side="start" size="small" closeLabel={closeLabel} finalFocus={triggerRef} className="aq-sidebar-mobile-sheet">
      <SheetHeader className="aq-sr-only"><SheetTitle>{label}</SheetTitle>{description && <SheetDescription>{description}</SheetDescription>}</SheetHeader>{content}
    </SheetContent>
  </Sheet>
  return <div id={id} data-slot="sidebar-desktop" className="aq-sidebar-desktop" inert={!open && mode === "offcanvas"}
    aria-hidden={!open && mode === "offcanvas" || undefined}>{content}</div>
}
export function SidebarTrigger({ className, onClick, expandLabel = "Expand navigation", collapseLabel = "Collapse navigation",
  mobileLabel = "Open navigation", ...props }: Omit<React.ComponentProps<typeof Button>, "children"> & { expandLabel?: string; collapseLabel?: string; mobileLabel?: string }) {
  const state = useSidebar()
  const label = state.isMobile ? mobileLabel : state.open ? collapseLabel : expandLabel
  return <Button {...props} variant="ghost" size="icon" data-slot="sidebar-trigger"
    aria-label={label} aria-controls={state.id} aria-expanded={state.isMobile ? state.openMobile : state.open}
    disabled={props.disabled || !state.isMobile && state.mode === "none"}
    className={cn("aq-sidebar-trigger", typeof className === "function" ? className({ disabled: props.disabled ?? false }) : className)} onClick={event => { onClick?.(event); if (!event.defaultPrevented) { if (state.isMobile) state.triggerRef.current = event.currentTarget;
      else if (state.open && state.mode === "offcanvas" && event.currentTarget.closest('[data-slot="sidebar-desktop"]')) {
        const provider = event.currentTarget.closest('[data-slot="sidebar-provider"]')
        provider?.querySelector<HTMLButtonElement>('[data-slot="sidebar-inset"] [data-slot="sidebar-trigger"]')?.focus()
      }
      state.toggleSidebar() } }}>
    <PanelLeft aria-hidden="true" strokeWidth={1.5} />
  </Button>
}
export function SidebarHeader({ className, ...props }: React.ComponentProps<"header">) {
  return <header {...props} data-slot="sidebar-header" className={cn("aq-sidebar-header", className)} />
}
export function SidebarFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer {...props} data-slot="sidebar-footer" className={cn("aq-sidebar-footer", className)} />
}
export function SidebarContent({ className, label = "Navigation entries", ...props }: React.ComponentProps<typeof ScrollArea>) {
  return <ScrollArea {...props} label={label} scrollbar="hidden" className={cn("aq-sidebar-content", className)} />
}
export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="sidebar-group" className={cn("aq-sidebar-group", className)} />
}
export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"p">) {
  return <p {...props} data-slot="sidebar-group-label" className={cn("aq-sidebar-group-label aq-sidebar-expanded-only", className)} />
}
export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul {...props} data-slot="sidebar-menu" className={cn("aq-sidebar-menu", className)} />
}
export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li {...props} data-slot="sidebar-menu-item" className={cn("aq-sidebar-menu-item", className)} />
}
export type SidebarMenuButtonProps = Omit<React.ComponentProps<typeof Button>, "children" | "size" | "variant"> & {
  label: string; icon?: React.ReactNode; badge?: React.ReactNode; active?: boolean
}
export function SidebarMenuButton({ label, icon, badge, active, className, ...props }: SidebarMenuButtonProps) {
  const { rail } = useSidebar()
  return <Tooltip disabled={!rail || props.disabled} touchBehavior="none"><TooltipTrigger disabled={!rail || props.disabled}
    render={<Button {...props} variant="ghost" size={rail ? "icon" : "default"} aria-label={label}
      aria-current={active ? "page" : props["aria-current"]} data-slot="sidebar-menu-button" className={cn("aq-sidebar-menu-button", typeof className === "function" ? className({ disabled: props.disabled ?? false }) : className)} />}>
    {icon}<span className="aq-sidebar-label">{label}</span>{badge && <span className="aq-sidebar-badge">{badge}</span>}
  </TooltipTrigger><TooltipContent side="inline-end" data-slot="sidebar-tooltip">{label}</TooltipContent></Tooltip>
}
export function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="sidebar-inset" className={cn("aq-sidebar-inset", className)} />
}
export type SidebarDisclosureProps = Omit<Collapsible.Root.Props, "children"> & { label: string; icon?: React.ReactNode; children: React.ReactNode }
export function SidebarDisclosure({ label, icon, className, children, ...props }: SidebarDisclosureProps) {
  const { rail } = useSidebar()
  return <Collapsible.Root {...props} inert={rail} data-slot="sidebar-disclosure"
    className={state => cn("aq-sidebar-disclosure aq-sidebar-expanded-only", typeof className === "function" ? className(state) : className)}>
    <Collapsible.Trigger render={<Button variant="ghost" size="default" />} className="aq-sidebar-disclosure-trigger">
      {icon}<span className="aq-sidebar-label">{label}</span><ChevronDown className="aq-sidebar-chevron" aria-hidden="true" />
    </Collapsible.Trigger><Collapsible.Panel keepMounted data-slot="sidebar-disclosure-panel"
      render={(elementProps, state) => <div {...elementProps} inert={!state.open} />} className="aq-sidebar-disclosure-panel">
      <div className="aq-sidebar-sub">{children}</div>
    </Collapsible.Panel>
  </Collapsible.Root>
}
