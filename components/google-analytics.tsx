"use client"

import Script from "next/script"
import { GA_TRACKING_ID } from "@/lib/gtag"

export function GoogleAnalytics() {
  // Solo cargar si tenemos el ID de Google Analytics
  if (!GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_location: window.location.href,
              page_title: document.title,
              // Configuraciones adicionales para sitio de arte
              custom_map: {
                'custom_parameter_1': 'artwork_category',
                'custom_parameter_2': 'artwork_price_range'
              }
            });
          `,
        }}
      />
    </>
  )
}
