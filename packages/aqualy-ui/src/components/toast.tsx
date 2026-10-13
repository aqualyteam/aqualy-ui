"use client"
import * as React from "react"
import { Toast as Primitive } from "@base-ui/react/toast"
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react"
import { Button } from "#components/button"
import { Spinner } from "#components/spinner"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { cn } from "#lib/utils"
export type ToastVariant = "success" | "info" | "warning" | "error" | "loading"
export type ToastData = { busy?: boolean }
export type ToastOptions = Omit<Parameters<ReturnType<typeof Primitive.useToastManager<ToastData>>["add"]>[0], "type"> & { type?: ToastVariant }
export type ToastUpdateOptions = Omit<Parameters<ReturnType<typeof Primitive.useToastManager<ToastData>>["update"]>[1], "type"> & { type?: ToastVariant }
export function useToast() {
  const manager = Primitive.useToastManager<ToastData>()
  return { toasts: manager.toasts, close: manager.close, update: (id: string, options: ToastUpdateOptions) => manager.update(id, options.type ? {
    ...options, timeout: options.timeout ?? (["warning", "error", "loading"].includes(options.type) ? 0 : 5000), priority: options.priority ?? (options.type === "error" ? "high" : "low"),
  } : options), add: (options: ToastOptions) => {
    const type = options.type ?? "info"
    const origin = document.activeElement
    let id = ""
    id = manager.add({ ...options, type, timeout: options.timeout ?? (["warning", "error", "loading"].includes(type) ? 0 : undefined), priority: options.priority ?? (type === "error" ? "high" : "low"),
      onClose: () => {
        const node = [...document.querySelectorAll<HTMLElement>("[data-toast-id]")].find(item => item.dataset.toastId === id)
        const restore = node?.contains(document.activeElement)
        options.onClose?.()
        if (restore && origin instanceof HTMLElement) queueMicrotask(() => { if (origin.isConnected) origin.focus({ preventScroll: true }) })
      } })
    return id
  } }
}
export type ToastProviderProps = React.PropsWithChildren<{ timeout?: number; limit?: 1 | 2 | 3; label?: string; closeLabel?: string }>
export function ToastProvider({ children, timeout = 5000, limit = 3, label = "Notifications", closeLabel = "Close notification" }: ToastProviderProps) {
  return <Primitive.Provider timeout={timeout} limit={Math.max(1, Math.min(3, limit))}>{children}<Toaster label={label} closeLabel={closeLabel} /></Primitive.Provider>
}
function Toaster({ label, closeLabel }: { label: string; closeLabel: string }) {
  const { toasts } = Primitive.useToastManager<ToastData>()
  return <Primitive.Portal><AqualyUIPortalScope><Primitive.Viewport aria-label={label} data-slot="toast-viewport" className="aq-toast-viewport">
    {toasts.map(toast => <Primitive.Root key={toast.id} toast={toast} swipeDirection="down" data-slot="toast" data-toast-id={toast.id} data-variant={toast.type ?? "info"}
      onTouchMoveCapture={event => { if (!event.cancelable) event.stopPropagation() }}
      aria-busy={toast.type === "loading" || toast.data?.busy || undefined} className="aq-toast">
      <Primitive.Content className="aq-toast-content"><ToastIcon variant={toast.type} /><div className="aq-toast-copy">
        <Primitive.Title className="aq-toast-title" /><Primitive.Description className="aq-toast-description" />
        {toast.actionProps && <Primitive.Action render={<Button size="xs" variant="outline" />} disabled={toast.data?.busy} className="aq-toast-action" />}
      </div><Primitive.Close aria-label={closeLabel} render={<Button size="icon-xs" variant="ghost" />} className="aq-toast-close"><X aria-hidden="true" /></Primitive.Close>
      </Primitive.Content>
    </Primitive.Root>)}
  </Primitive.Viewport></AqualyUIPortalScope></Primitive.Portal>
}
function ToastIcon({ variant }: { variant?: string }) {
  return <span className="aq-toast-icon" aria-hidden="true">{variant === "loading" ? <Spinner size="sm" aria-hidden="true" /> : variant === "success" ? <CheckCircle2 /> : variant === "error" || variant === "warning" ? <TriangleAlert /> : <Info />}</span>
}
/** Static previews share visual rules, without timers, live regions or fake close actions. */
export function ToastPreview({ variant = "info", title, description, className }: { variant?: ToastVariant; title: React.ReactNode; description?: React.ReactNode; className?: string }) {
  return <div data-slot="toast-preview" data-variant={variant} className={cn("aq-toast aq-toast-preview", className)}><div className="aq-toast-content"><ToastIcon variant={variant} /><div className="aq-toast-copy"><p className="aq-toast-title">{title}</p>{description && <p className="aq-toast-description">{description}</p>}</div></div></div>
}
