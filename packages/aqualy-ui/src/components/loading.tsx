"use client"

import * as React from "react"
import { LoadingLogo } from "#lib/loading-logo"
import { cn } from "#lib/utils"

export interface LoadingIdentityState { appearance: "mark" | "wordmark"; clipId: string; motion: boolean }
export interface LoadingProps extends Omit<React.ComponentProps<"div">, "children"> {
  identity?: React.ReactNode | ((state: LoadingIdentityState) => React.ReactNode)
  label: string
  description?: React.ReactNode
  appearance?: "mark" | "wordmark"
  size?: "section" | "page"
  motion?: boolean
}
/** Page/region waiting state. The consumer owns readiness, errors and request timing. */
export function Loading({ label, description, appearance = "mark", size = "page", motion = true, identity, className, ...props }: LoadingProps) {
  const id = React.useId().replaceAll(":", "")
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update(); media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  const state: LoadingIdentityState = { appearance, clipId: `aq-tail-${id}`, motion: motion && !reduced }
  const artwork = typeof identity === "function" ? identity(state) : identity ?? <LoadingLogo appearance={appearance} motion={state.motion} />
  return <div {...props} role="status" aria-live="polite" aria-atomic="true" data-slot="loading" data-size={size} className={cn("aq-loading", className)}>
    <div className="aq-loading-identity">{artwork}</div>
    <div className="aq-loading-copy"><strong>{label}</strong>{description && <p>{description}</p>}</div>
  </div>
}
