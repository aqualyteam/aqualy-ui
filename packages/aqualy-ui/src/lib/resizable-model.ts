export function clampSplit(value: number, min = 25, max = 75) {
  if (![value, min, max].every(Number.isFinite) || min <= 0 || max >= 100 || min >= max) throw new RangeError("Invalid split or bounds")
  const rounded = Math.round(Math.min(max, Math.max(min, value)) * 10) / 10
  return Math.min(max, Math.max(min, rounded))
}
export function splitFromPointer(position: number, length: number, rtl = false, handle = 7) {
  if (!Number.isFinite(position) || !Number.isFinite(length) || !Number.isFinite(handle) || handle < 0 || length <= handle) return null
  return ((rtl ? length - position : position) - handle / 2) / (length - handle) * 100
}
export function splitFromKey(key: string, value: number, orientation: "horizontal" | "vertical", rtl: boolean, min = 25, max = 75, shift = false) {
  const forward = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight", back = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft"
  if (key === "Home") return min
  if (key === "End") return max
  if (key !== forward && key !== back) return null
  return clampSplit(value + (key === forward ? 1 : -1) * (shift ? 10 : 2), min, max)
}
