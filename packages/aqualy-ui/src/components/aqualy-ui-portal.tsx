"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"

const PortalDepth = React.createContext(0)

export function AqualyUIPortalScope({ children, layer = "floating" }: React.PropsWithChildren<{ layer?: "floating" | "overlay" }>) {
  const parentDepth = React.useContext(PortalDepth)
  const depth = parentDepth + (layer === "overlay" ? 1 : 0)
  const style = { "--aqualy-ui-layer": 50 + depth * 10 + (layer === "floating" && depth > 0 ? 5 : 0) } as React.CSSProperties
  const { product, theme } = useAqualyUIScope()
  const dir = useDirection()
  return <PortalDepth.Provider value={depth}><div style={style} data-aqualy-ui-portal data-product={product} data-theme={theme} dir={dir}>{children}</div></PortalDepth.Provider>
}
