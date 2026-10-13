"use client"

import * as React from "react"
import { DirectionProvider } from "@base-ui/react/direction-provider"
import { cn } from "#lib/utils"

export type AqualyProduct = "workspace" | "professional" | "diver"
export type AqualyTheme = "light" | "dark"
export type AqualyDirection = "ltr" | "rtl"
export type AqualyUIScopeProps = Omit<React.ComponentProps<"div">, "dir"> & {
  product?: AqualyProduct
  theme?: AqualyTheme
  dir?: AqualyDirection
}

// React context travels through portals; DOM inheritance alone cannot do so.
const ScopeContext = React.createContext<{
  product: AqualyProduct
  theme?: AqualyTheme
  dir: AqualyDirection
}>({ product: "workspace", dir: "ltr" })

export function useAqualyUIScope() {
  return React.useContext(ScopeContext)
}

export function AqualyUIScope({
  product, theme, dir, className, children, ...props
}: AqualyUIScopeProps) {
  const parent = useAqualyUIScope()
  const value = React.useMemo(() => ({
    product: product ?? parent.product,
    theme: theme ?? (className?.split(/\s+/).includes("dark") ? "dark" : parent.theme),
    dir: dir ?? parent.dir,
  }), [product, theme, dir, className, parent])
  return <ScopeContext.Provider value={value}>
    <DirectionProvider direction={value.dir}>
      <div {...props} data-aqualy-ui data-product={value.product} data-theme={value.theme}
        dir={value.dir} className={cn(className)}>{children}</div>
    </DirectionProvider>
  </ScopeContext.Provider>
}
