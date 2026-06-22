"use client"

import type React from "react"
import { Slot as SlotPrimitive } from "radix-ui"

const Slot: typeof SlotPrimitive.Slot = SlotPrimitive.Slot
const Slottable = SlotPrimitive.Slottable as React.FC<{ children: React.ReactNode }>

export { Slot, Slottable, SlotPrimitive }
