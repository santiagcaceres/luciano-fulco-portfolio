"use client"

import type React from "react"

import { useAnalytics } from "@/hooks/use-analytics"

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  useAnalytics()
  return <>{children}</>
}
