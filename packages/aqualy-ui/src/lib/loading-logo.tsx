import * as React from "react"
/** Neutral three-bar identity, distinct from the action-level Spinner. */
export function LoadingLogo({ appearance, motion }: { appearance: "mark" | "wordmark"; motion: boolean }): React.ReactElement {
  return <span className="aq-loading-neutral" data-motion={motion || undefined} aria-hidden="true">
    <svg className="aq-loading-neutral-mark" viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      <rect x="12" y="24" width="8" height="16" rx="4" />
      <rect x="28" y="16" width="8" height="32" rx="4" />
      <rect x="44" y="24" width="8" height="16" rx="4" />
    </svg>{appearance === "wordmark" && <span>Loading</span>}
  </span>
}
