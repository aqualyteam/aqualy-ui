"use client"
import * as React from "react"
import { Tooltip as Primitive } from "@base-ui/react/tooltip"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "#lib/utils"

interface TooltipState { id: string; open: boolean; disabled: boolean; touchBehavior: "toggle" | "none"; setOpen: (open: boolean, touch?: boolean) => void }
const TooltipContext = React.createContext<TooltipState | null>(null)
function useTooltip() { const value = React.useContext(TooltipContext); if (!value) throw new Error("Tooltip parts require Tooltip"); return value }
export function TooltipProvider({ delay = 250, closeDelay = 100, ...props }: Primitive.Provider.Props) {
  return <Primitive.Provider delay={delay} closeDelay={closeDelay} {...props} />
}
export type TooltipProps = Omit<Primitive.Root.Props, "children" | "onOpenChange" | "handle" | "triggerId" | "defaultTriggerId"> & {
  children: React.ReactNode; onOpenChange?: (open: boolean) => void; touchBehavior?: "toggle" | "none"
}
/** Supplementary text only. Use HoverCard/Popover for links, actions or essential instructions. */
export function Tooltip({ open: controlled, defaultOpen = false, disabled = false, onOpenChange, touchBehavior = "toggle", children, ...props }: TooltipProps) {
  const [local, setLocal] = React.useState(defaultOpen), id = React.useId(), open = !disabled && (controlled ?? local), touchOpen = React.useRef(false)
  React.useEffect(() => { if (disabled) { touchOpen.current = false; if (controlled === undefined) setLocal(false) } }, [disabled, controlled])
  const setOpen = React.useCallback((next: boolean, touch = false) => { touchOpen.current = touch && next; if (controlled === undefined) setLocal(next); onOpenChange?.(next) }, [controlled, onOpenChange])
  const context = React.useMemo(() => ({ id, open, disabled, touchBehavior, setOpen }), [id, open, disabled, touchBehavior, setOpen])
  return <TooltipContext.Provider value={context}><Primitive.Root {...props} open={open} disabled={disabled} onOpenChange={(next, details) => { if (!next && touchOpen.current && details.reason === "trigger-hover") return; setOpen(next) }}>{children}</Primitive.Root></TooltipContext.Provider>
}
export type TooltipTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "handle" | "payload">
export function TooltipTrigger({ className, onPointerDown, onClick, closeOnClick = true, "aria-describedby": described, render, ...props }: TooltipTriggerProps) {
  const state = useTooltip(), pointer = React.useRef<string>(""), beforePress = React.useRef(false)
  return <Primitive.Trigger {...props} render={(elementProps, nativeState) => <TooltipTriggerElement elementProps={elementProps} state={nativeState} render={render} described={described} tooltipId={state.open ? state.id : undefined} />} closeOnClick={false} data-slot="tooltip-trigger" className={state => cn("aq-tooltip-trigger", typeof className === "function" ? className(state) : className)} aria-describedby={described}
    onPointerDown={event => { pointer.current = event.pointerType; beforePress.current = state.open; onPointerDown?.(event) }}
    onClick={event => { onClick?.(event); if (!event.defaultPrevented && !state.disabled && !props.disabled && pointer.current === "touch" && event.detail > 0 && state.touchBehavior === "toggle") { event.preventDefault(); state.setOpen(!beforePress.current, true) } else if (!event.defaultPrevented && (pointer.current !== "touch" || event.detail === 0) && closeOnClick) state.setOpen(false) }} />
}
type TriggerElementProps = Parameters<Exclude<TooltipTriggerProps["render"], React.ReactElement | undefined>>[0]
function TooltipTriggerElement({ elementProps, state, render, described, tooltipId }: { elementProps: TriggerElementProps; state: Primitive.Trigger.State; render: TooltipTriggerProps["render"]; described?: string; tooltipId?: string }) {
  // Preserve a rendered component's state callback until that component can
  // evaluate its own state (Button disabled, Toggle pressed, etc.). Native prop
  // merging concatenates classes as strings, so temporarily remove the callback.
  const custom = React.isValidElement<{ className?: string | ((state: unknown) => string) }>(render) && typeof render.type !== "string" ? render : null
  const renderClass = typeof custom?.props.className === "function" ? custom.props.className : undefined
  const composedRender = custom && renderClass ? React.cloneElement(custom, { className: undefined }) : render
  const element = useRender({ defaultTagName: "button", render: composedRender, state: { ...state }, props: { ...elementProps } })
  if (!React.isValidElement<{ "aria-describedby"?: string; className?: string | ((state: unknown) => string) }>(element)) return element
  const ids = [...new Set([described, element.props["aria-describedby"], tooltipId].filter(Boolean).join(" ").split(/\s+/).filter(Boolean))]
  const mergedClass = typeof element.props.className === "string" ? element.props.className : undefined
  return React.cloneElement(element, { "aria-describedby": ids.join(" ") || undefined,
    ...(renderClass ? { className: (state: unknown) => cn(mergedClass, renderClass(state)) } : {}) })
}
export type TooltipContentProps = Omit<Primitive.Popup.Props, "id" | "role"> & Pick<Primitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & { container?: Primitive.Portal.Props["container"] }
export function TooltipContent({ side = "top", align = "center", sideOffset = 8, alignOffset = 0, collisionPadding = 12, container, className, children, ...props }: TooltipContentProps) {
  const { id } = useTooltip()
  return <Primitive.Portal container={container}><AqualyUIPortalScope><Primitive.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} collisionPadding={collisionPadding} className="aq-tooltip-positioner">
    <Primitive.Popup id={id} role="tooltip" data-slot="tooltip-content" {...props} className={state => cn("aq-tooltip", typeof className === "function" ? className(state) : className)}><span dir="auto" className="aq-tooltip-text">{children}</span></Primitive.Popup>
  </Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
}
