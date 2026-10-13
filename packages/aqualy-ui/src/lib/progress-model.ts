export type CapacitySeatState = "confirmed" | "pending" | "provisional" | "available"
export interface CapacitySeat { id: string; label: string; state: CapacitySeatState; description?: string }
export function capacitySummary(seats: readonly CapacitySeat[], capacity: number, minimum: number) {
  if (!Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(minimum) || minimum < 1 || minimum > capacity || seats.length > capacity) throw new RangeError("Invalid capacity/minimum")
  if (new Set(seats.map(seat => seat.id)).size !== seats.length) throw new Error("Capacity seat IDs must be unique")
  const confirmed = seats.filter(seat => seat.state === "confirmed").length, pending = seats.filter(seat => seat.state === "pending").length, provisional = seats.filter(seat => seat.state === "provisional").length
  return { confirmed, pending, provisional, available: capacity - confirmed - pending - provisional, minimumMet: confirmed >= minimum }
}
