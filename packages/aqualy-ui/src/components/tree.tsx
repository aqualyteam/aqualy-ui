"use client"
import * as React from "react"
import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronRight, Lock } from "lucide-react"
import { EmptyState } from "#components/empty"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { cn } from "#lib/utils"

export interface TreeNode<T = unknown> {
  id: string; label: string; icon?: React.ReactNode; children?: readonly TreeNode<T>[]
  disabled?: boolean; selectable?: boolean; data?: T
}
export type TreeProps<T = unknown> = Omit<React.ComponentProps<"ul">, "children" | "onSelect" | "dir"> & {
  nodes: readonly TreeNode<T>[]; label: string; dir?: "ltr" | "rtl"; selectedId?: string | null; defaultSelectedId?: string | null
  onSelectedIdChange?: (id: string, node: TreeNode<T>) => void
  expandedIds?: readonly string[]; defaultExpandedIds?: readonly string[]; onExpandedIdsChange?: (ids: string[]) => void
  query?: string; emptyTitle?: string; emptyDescription?: string; disabled?: boolean
}
interface Entry<T> { node: TreeNode<T>; parent: string | null; level: number; blocked: boolean }
/** Single selection is independent of focus. IDs must be unique and stable across updates. */
export function Tree<T>({ nodes, label, selectedId: controlledSelected, defaultSelectedId = null, onSelectedIdChange,
  expandedIds: controlledExpanded, defaultExpandedIds = [], onExpandedIdsChange, query = "", emptyTitle = "No matching items",
  emptyDescription = "Try another search.", disabled = false, className, onKeyDown, onFocusCapture, onBlurCapture, ...props }: TreeProps<T>) {
  const scope = useAqualyUIScope(), direction = props.dir ?? scope.dir
  const [localSelected, setSelected] = React.useState(defaultSelectedId), [localExpanded, setExpanded] = React.useState<readonly string[]>(defaultExpandedIds), [focused, setFocused] = React.useState<string | null>(null)
  const selected = controlledSelected === undefined ? localSelected : controlledSelected, expanded = controlledExpanded ?? localExpanded
  const ownsFocus = React.useRef(false)
  const refs = React.useRef(new Map<string, HTMLLIElement>()), typed = React.useRef({ value: "", time: 0 })
  const entries = React.useMemo(() => {
    const map = new Map<string, Entry<T>>()
    function visit(items: readonly TreeNode<T>[], parent: string | null, level: number, inherited: boolean) { for (const node of items) {
      if (map.has(node.id)) throw new Error(`Tree requires unique IDs: ${node.id}`)
      const blocked = inherited || Boolean(node.disabled); map.set(node.id, { node, parent, level, blocked }); if (node.children?.length) visit(node.children, node.id, level + 1, blocked)
    } }
    visit(nodes, null, 1, disabled); return map
  }, [nodes, disabled])
  const filtering = query.trim().toLocaleLowerCase(), openIds = new Set(expanded), kept = new Set<string>()
  if (filtering) {
    for (const entry of entries.values()) if (entry.node.label.toLocaleLowerCase().includes(filtering)) {
      function descendants(node: TreeNode<T>) { kept.add(node.id); node.children?.forEach(descendants) }
      descendants(entry.node); let parent = entry.parent
      while (parent) { kept.add(parent); parent = entries.get(parent)?.parent ?? null }
    }
    for (const id of kept) if (entries.get(id)?.node.children?.length) openIds.add(id)
  }
  const visible: Entry<T>[] = []
  function collect(items: readonly TreeNode<T>[]) { for (const node of items) { if (filtering && !kept.has(node.id)) continue
    const entry = entries.get(node.id); if (entry) visible.push(entry); if (openIds.has(node.id) && node.children) collect(node.children)
  } }
  collect(nodes)
  const enabled = visible.filter(entry => !entry.blocked), target = enabled.some(e => e.node.id === focused) ? focused : enabled.some(e => e.node.id === selected) ? selected : enabled[0]?.node.id
  const focus = (id?: string | null) => { if (!id || entries.get(id)?.blocked) return; setFocused(id); refs.current.get(id)?.focus() }
  const expand = (id: string, open: boolean) => { if (filtering || entries.get(id)?.blocked) return
    const next = new Set(expanded); if (open) next.add(id); else next.delete(id); const ids = [...next]
    if (controlledExpanded === undefined) setExpanded(ids); onExpandedIdsChange?.(ids)
  }
  const select = (entry: Entry<T>) => { if (entry.blocked || entry.node.selectable === false) return
    if (controlledSelected === undefined) setSelected(entry.node.id); onSelectedIdChange?.(entry.node.id, entry.node)
  }
  function keyboard(event: React.KeyboardEvent<HTMLUListElement>) {
    onKeyDown?.(event); if (event.defaultPrevented || event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
    const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tree-id]") : null, entry = entries.get(element?.dataset.treeId ?? "")
    if (!entry || entry.blocked) return
    const index = enabled.indexOf(entry), branch = Boolean(entry.node.children?.length), forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight", backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft"
    if (["ArrowUp", "ArrowDown", "Home", "End", forward, backward, "Enter", " ", "*"].includes(event.key)) {
      event.preventDefault(); event.stopPropagation()
      if (event.key === "ArrowUp" || event.key === "ArrowDown") focus(enabled[Math.max(0, Math.min(enabled.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))]?.node.id)
      else if (event.key === "Home" || event.key === "End") focus((event.key === "Home" ? enabled[0] : enabled.at(-1))?.node.id)
      else if (event.key === forward && branch) { if (!openIds.has(entry.node.id)) expand(entry.node.id, true); else focus(enabled.find(e => e.parent === entry.node.id)?.node.id) }
      else if (event.key === backward) { if (branch && openIds.has(entry.node.id)) expand(entry.node.id, false); else focus(entry.parent) }
      else if (event.key === "Enter" && branch) expand(entry.node.id, !openIds.has(entry.node.id))
      else if (event.key === "*") { if (!filtering) { const next = new Set(expanded); enabled.filter(e => e.parent === entry.parent && e.node.children?.length).forEach(e => next.add(e.node.id)); const ids = [...next]; if (controlledExpanded === undefined) setExpanded(ids); onExpandedIdsChange?.(ids) } }
      else if (event.key === "Enter" || event.key === " ") select(entry)
    } else if (event.key.length === 1) {
      event.preventDefault(); const now = Date.now(), char = event.key.toLocaleLowerCase(), previous = now - typed.current.time < 700 ? typed.current.value : ""
      const text = previous === char ? char : previous + char; typed.current = { value: text, time: now }
      const ordered = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)]; focus(ordered.find(e => e.node.label.toLocaleLowerCase().startsWith(text))?.node.id)
    }
  }
  // If controlled data/expansion removes the focused node, keep one valid roving tab stop.
  React.useEffect(() => { if (ownsFocus.current && focused && focused !== target) focus(target) }, [focused, target])
  function render(items: readonly TreeNode<T>[]) { const shown = items.filter(node => !filtering || kept.has(node.id)); return shown.map((node, index) => {
    const entry = entries.get(node.id)! , branch = Boolean(node.children?.length), open = openIds.has(node.id), selectedNode = selected === node.id
    return <Collapsible.Root key={node.id} open={open} render={<li />} role="treeitem" aria-label={node.label} aria-level={entry.level} aria-posinset={index + 1} aria-setsize={shown.length}
      aria-expanded={branch ? open : undefined} aria-selected={selectedNode} aria-disabled={entry.blocked || undefined} data-tree-id={node.id} data-slot="tree-item" tabIndex={!entry.blocked && target === node.id ? 0 : -1}
      ref={element => { if (element instanceof HTMLLIElement) refs.current.set(node.id, element); else refs.current.delete(node.id) }} onFocus={event => { if (event.target === event.currentTarget) setFocused(node.id) }} className="aq-tree-item">
      <div data-slot="tree-row" className="aq-tree-row" onClick={() => { if (!entry.blocked) { focus(node.id); if (branch) expand(node.id, !open); else select(entry) } }}>
        <span className="aq-tree-toggle" aria-hidden="true">{branch && <ChevronRight />}</span>{node.icon && <span className="aq-tree-icon" aria-hidden="true">{node.icon}</span>}<span className="aq-tree-label">{node.label}</span>{entry.blocked && <Lock className="aq-tree-lock" aria-hidden="true" />}
      </div>{branch && <Collapsible.Panel keepMounted render={<ul />} role="group" inert={!open} aria-hidden={!open || undefined} data-slot="tree-group" className="aq-tree-group">{render(node.children ?? [])}</Collapsible.Panel>}
    </Collapsible.Root>
  }) }
  return <div data-slot="tree-container" className={cn("aq-tree-container", className)}><ul {...props} dir={direction} role="tree" aria-label={label} aria-disabled={disabled || undefined} data-slot="tree" className="aq-tree" onKeyDown={keyboard} onFocusCapture={event => { ownsFocus.current = true; onFocusCapture?.(event) }} onBlurCapture={event => { ownsFocus.current = event.currentTarget.contains(event.relatedTarget); onBlurCapture?.(event) }}>{render(nodes)}</ul>{visible.length === 0 && <EmptyState size="sm" title={emptyTitle} description={emptyDescription} />}</div>
}
