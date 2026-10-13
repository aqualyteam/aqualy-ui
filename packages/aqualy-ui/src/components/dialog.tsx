"use client"

import * as React from "react"
import { Dialog as Primitive } from "@base-ui/react/dialog"
import { CheckIcon, XIcon } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Button } from "#components/button"
import { cn } from "#lib/utils"

const DialogModalContext = React.createContext<Primitive.Root.Props["modal"]>(true)
export function Dialog({ modal = true, ...props }: Primitive.Root.Props) {
  return <DialogModalContext.Provider value={modal}><Primitive.Root modal={modal} {...props} /></DialogModalContext.Provider>
}
export const DialogTrigger = Primitive.Trigger
export const DialogClose = Primitive.Close
export type DialogContentProps = Primitive.Popup.Props & {
  size?: "small" | "default" | "large" | "wide"
  showCloseButton?: boolean
  closeLabel?: string
}
export function DialogContent({ className, children, size = "default", showCloseButton = true, closeLabel = "Close dialog", ...props }: DialogContentProps) {
  const modal = React.useContext(DialogModalContext)
  return <Primitive.Portal><AqualyUIPortalScope layer="overlay">
    {modal === true && <Primitive.Backdrop data-slot="dialog-backdrop" className="aq-alert-dialog-backdrop" />}
    <Primitive.Viewport className="aq-alert-dialog-viewport aq-dialog-viewport" data-modal={modal}>
      <Primitive.Popup {...props} data-slot="dialog-content" data-size={size} className={state => cn("aq-alert-dialog-content aq-dialog-content", typeof className === "function" ? className(state) : className)}>
        {children}{showCloseButton && <Primitive.Close render={<Button variant="ghost" size="icon-sm" />} className="aq-overlay-close" aria-label={closeLabel}><XIcon /></Primitive.Close>}
      </Primitive.Popup>
    </Primitive.Viewport>
  </AqualyUIPortalScope></Primitive.Portal>
}
export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("aq-dialog-header", className)} {...props} />
}
export function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("aq-dialog-body", className)} {...props} />
}
export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("aq-dialog-footer", className)} {...props} />
}
export function DialogTitle({ className, ...props }: Primitive.Title.Props) {
  return <Primitive.Title data-slot="dialog-title" className={state => cn("aq-dialog-title", typeof className === "function" ? className(state) : className)} {...props} />
}
export function DialogDescription({ className, ...props }: Primitive.Description.Props) {
  return <Primitive.Description data-slot="dialog-description" className={state => cn("aq-dialog-description", typeof className === "function" ? className(state) : className)} {...props} />
}
export function DialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-media" aria-hidden="true" className={cn("aq-dialog-media", className)} {...props} />
}
export type DialogStep = { id: string; label: React.ReactNode; description?: React.ReactNode; backLabel?: string }
export type DialogStepsProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: readonly DialogStep[]; currentStep: string; onStepChange?: (id: string) => void
  completedLabel?: string; currentLabel?: string; upcomingLabel?: string
}
export function DialogSteps({ steps, currentStep, onStepChange, completedLabel = "Completed", currentLabel = "Current step", upcomingLabel = "Next step", className, ...props }: DialogStepsProps) {
  const current = steps.findIndex(step => step.id === currentStep)
  if (current < 0 || new Set(steps.map(step => step.id)).size !== steps.length) throw new Error("DialogSteps requires unique step ids and a valid currentStep")
  return <ol data-slot="dialog-steps" className={cn("aq-dialog-steps", className)} {...props}>{steps.map((step, index) => {
    const state = index < current ? "complete" : index === current ? "current" : "upcoming"
    const content = <><span className="aq-dialog-step-marker" aria-hidden="true">{state === "complete" ? <CheckIcon /> : index + 1}</span><span className="aq-dialog-step-copy"><span>{step.label}</span>{step.description && <small>{step.description}</small>}<span className="aq-sr-only">{state === "complete" ? completedLabel : state === "current" ? currentLabel : upcomingLabel}</span></span></>
    return <li key={step.id} data-state={state} aria-current={state === "current" ? "step" : undefined}>{state === "complete" && onStepChange ? <Button variant="ghost" size="sm" className="aq-dialog-step-control" aria-label={step.backLabel} onClick={() => onStepChange(step.id)}>{content}</Button> : <span className="aq-dialog-step-control">{content}</span>}{index < steps.length - 1 && <span className="aq-dialog-step-connector" aria-hidden="true" />}</li>
  })}</ol>
}
