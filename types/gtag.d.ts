// Type definitions for Google Analytics gtag

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: {
        page_location?: string
        page_title?: string
        event_category?: string
        event_label?: string
        value?: number
        custom_map?: Record<string, string>
      },
    ) => void
    dataLayer: any[]
  }
}

export {}
