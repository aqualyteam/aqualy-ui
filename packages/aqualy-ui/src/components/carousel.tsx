"use client"

import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Play, Pause } from "lucide-react"
import { Button } from "#components/button"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { cn } from "#lib/utils"

type CarouselApi = NonNullable<UseEmblaCarouselType[1]>
export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>
export type CarouselProps = Omit<React.ComponentProps<"div">, "dir"> & {
  label: string; orientation?: "horizontal" | "vertical"; size?: "sm" | "default" | "lg"
  navigation?: "arrows" | "dots" | "thumbnails" | "none"; loop?: boolean
  options?: Omit<CarouselOptions, "direction" | "axis" | "loop">; setApi?: (api: CarouselApi) => void
  autoplay?: { delay?: number; showControl?: boolean }
}
type CarouselContextValue = {
  viewportRef: UseEmblaCarouselType[0]; api?: CarouselApi; selected: number; count: number; visible: number[]
  previous: boolean; next: boolean; orientation: "horizontal" | "vertical"; navigation: NonNullable<CarouselProps["navigation"]>
  navigate: (index: number | "previous" | "next") => void; playing: boolean; togglePlay: () => void
  autoplay?: CarouselProps["autoplay"]; reduced: boolean; viewportId: string
}
const Context = React.createContext<CarouselContextValue | null>(null)
function useCarousel() { const value = React.useContext(Context); if (!value) throw new Error("Carousel parts must be inside Carousel"); return value }

export function Carousel({ label, orientation = "horizontal", size = "default", navigation = "arrows", loop = false,
  options, setApi, autoplay, className, children, ref, onKeyDown, onPointerEnter, onPointerLeave, onFocusCapture, onBlurCapture, ...props }: CarouselProps) {
  const { dir } = useAqualyUIScope()
  const [viewportRef, api] = useEmblaCarousel({ align: "start", ...options, direction: dir, axis: orientation === "horizontal" ? "x" : "y", loop })
  const [state, setState] = React.useState({ selected: 0, count: 0, visible: [0], previous: false, next: false })
  const [playing, setPlaying] = React.useState(false), [hovered, setHovered] = React.useState(false), [focused, setFocused] = React.useState(false)
  const [hidden, setHidden] = React.useState(false), [inView, setInView] = React.useState(true), [reduced, setReduced] = React.useState(false)
  const root = React.useRef<HTMLDivElement>(null), viewportId = React.useId()
  React.useEffect(() => {
    if (!api) return
    setApi?.(api)
    const sync = () => {
      const nextState = { selected: api.selectedScrollSnap(), count: api.scrollSnapList().length, visible: api.slidesInView(), previous: api.canScrollPrev(), next: api.canScrollNext() }
      setState(previous => JSON.stringify(previous) === JSON.stringify(nextState) ? previous : nextState)
    }
    const stop = () => setPlaying(false)
    sync(); api.on("select", sync).on("reInit", sync).on("slidesInView", sync).on("pointerDown", stop)
    return () => { api.off("select", sync).off("reInit", sync).off("slidesInView", sync).off("pointerDown", stop) }
  }, [api, setApi])
  React.useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const motion = () => { setReduced(media.matches); if (media.matches) setPlaying(false) }
    const visibility = () => setHidden(document.hidden)
    motion(); visibility(); media.addEventListener("change", motion); document.addEventListener("visibilitychange", visibility)
    const observer = new IntersectionObserver(entries => setInView(entries[0]?.isIntersecting ?? false))
    if (root.current) observer.observe(root.current)
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); observer.disconnect() }
  }, [])
  React.useEffect(() => {
    if (!autoplay || !playing || hovered || focused || hidden || !inView || reduced || !api || state.count <= 1) return
    const timer = setTimeout(() => {
      if (api.canScrollNext()) api.scrollNext()
      else setPlaying(false)
    }, Math.max(1000, autoplay.delay ?? 5000))
    return () => clearTimeout(timer)
  }, [api, autoplay, playing, hovered, focused, hidden, inView, reduced, state.selected, state.count])
  const navigate = (index: number | "previous" | "next") => {
    setPlaying(false)
    if (index === "previous") api?.scrollPrev(reduced)
    else if (index === "next") api?.scrollNext(reduced)
    else api?.scrollTo(index, reduced)
    if (document.activeElement instanceof HTMLElement && document.activeElement.closest('[data-slot="carousel-item"]')) root.current?.querySelector<HTMLElement>(".aq-carousel-viewport")?.focus()
  }
  return <Context.Provider value={{ viewportRef, api, ...state, orientation, navigation, navigate, playing, togglePlay: () => { if (!reduced) setPlaying(value => !value) }, autoplay, reduced, viewportId }}>
    <div {...props} ref={element => {
      root.current = element
      if (typeof ref === "function") { const cleanup = ref(element); if (typeof cleanup === "function") return () => { root.current = null; cleanup() } }
      else if (ref) ref.current = element
    }} data-slot="carousel" data-orientation={orientation} data-size={size} className={cn("aq-carousel", className)}
      role="region" aria-roledescription="carousel" aria-label={label} dir={dir}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); onPointerEnter?.(event) }} onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); onPointerLeave?.(event) }}
      onFocusCapture={event => { setFocused(!(event.target instanceof HTMLElement && event.target.closest("[data-carousel-play]"))); onFocusCapture?.(event) }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); onBlurCapture?.(event) }}
      onKeyDown={event => {
        onKeyDown?.(event)
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
        const target = event.target
        if (target instanceof HTMLElement && target.closest("input,select,textarea,[contenteditable=true],[role=combobox],[role=menu]")) return
        const prevKey = orientation === "vertical" ? "ArrowUp" : dir === "rtl" ? "ArrowRight" : "ArrowLeft"
        const nextKey = orientation === "vertical" ? "ArrowDown" : dir === "rtl" ? "ArrowLeft" : "ArrowRight"
        if ([prevKey, nextKey, "Home", "End"].includes(event.key)) { event.preventDefault(); navigate(event.key === "Home" ? 0 : event.key === "End" ? state.count - 1 : event.key === prevKey ? "previous" : "next") }
      }}>{children}<span className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic="true">{state.count > 1 ? `${state.selected + 1} / ${state.count}` : ""}</span></div>
  </Context.Provider>
}
export function CarouselContent({ className, children, ref, ...props }: React.ComponentProps<"div">) {
  const { viewportRef, viewportId } = useCarousel()
  return <div {...props} id={viewportId} tabIndex={0} data-slot="carousel-content" className={cn("aq-carousel-viewport", className)} ref={element => {
    viewportRef(element); if (typeof ref === "function") ref(element); else if (ref) ref.current = element
  }}><div className="aq-carousel-track">{children}</div></div>
}
export function CarouselItem({ index, className, ...props }: React.ComponentProps<"div"> & { index: number }) {
  const { visible } = useCarousel()
  return <div {...props} role="group" aria-roledescription="slide" aria-label={props["aria-label"] ?? `Slide ${index + 1}`} inert={!visible.includes(index)}
    data-slot="carousel-item" data-index={index} className={cn("aq-carousel-item", className)} />
}
export function CarouselNavigation({ thumbnails, labels, showCount = true }: {
  thumbnails?: { label: string; content: React.ReactNode }[]; showCount?: boolean
  labels?: { previous?: string; next?: string; position?: (index: number) => string; play?: string; pause?: string }
}) {
  const { count, selected, orientation, navigation, navigate, previous, next, playing, togglePlay, autoplay, reduced, viewportId } = useCarousel()
  if (navigation === "none" || count <= 1) return null
  const play = autoplay?.showControl && <Button size="icon-sm" variant="ghost" disabled={reduced} onClick={togglePlay}
    data-carousel-play="" aria-label={playing ? labels?.pause ?? "Pause slideshow" : labels?.play ?? "Play slideshow"} aria-pressed={playing}>{playing ? <Pause /> : <Play />}</Button>
  if (navigation === "thumbnails") return <div className="aq-carousel-thumbnails" aria-label="Choose slide">{Array.from({ length: count }, (_, index) => <Button key={index} variant="ghost" className="aq-carousel-thumbnail"
    aria-label={thumbnails?.[index]?.label ?? `Show slide ${index + 1}`} aria-current={selected === index ? "true" : undefined} aria-controls={viewportId}
    onClick={() => navigate(index)}>{thumbnails?.[index]?.content ?? index + 1}</Button>)}{play}</div>
  return <div className={cn("aq-carousel-navigation", navigation === "dots" && "aq-carousel-navigation-dots")}>
    {navigation === "dots" ? <div className="aq-carousel-dots" aria-label="Choose position">{Array.from({ length: count }, (_, index) => <Button key={index} size="icon-xs" variant="ghost" className="aq-carousel-dot"
      aria-label={labels?.position?.(index) ?? `Show position ${index + 1}`} aria-current={selected === index ? "true" : undefined} aria-controls={viewportId} onClick={() => navigate(index)}><span aria-hidden="true" /></Button>)}</div>
      : <Button size="icon-sm" variant="outline" disabled={!previous} onClick={() => navigate("previous")} aria-label={labels?.previous ?? "Previous slide"} aria-controls={viewportId}>{orientation === "vertical" ? <ArrowUp /> : <ArrowLeft data-directional="true" />}</Button>}
    {showCount && <bdi className="aq-carousel-count" dir="ltr">{selected + 1} / {count}</bdi>}
    {navigation === "arrows" && <Button size="icon-sm" variant="outline" disabled={!next} onClick={() => navigate("next")} aria-label={labels?.next ?? "Next slide"} aria-controls={viewportId}>{orientation === "vertical" ? <ArrowDown /> : <ArrowRight data-directional="true" />}</Button>}{play}
  </div>
}
