import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import GoogleAnalytics from "@/components/google-analytics"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
})

export const metadata: Metadata = {
  title: {
    default: "Luciano Fulco - Artista Visual Uruguayo",
    template: "%s | Luciano Fulco",
  },
  description:
    "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Descubre obras únicas en acrílico, óleo, acuarela, dibujo y esculturas. Arte simbólico desde Santa Lucía, Uruguay.",
  keywords: [
    "Luciano Fulco",
    "artista uruguayo",
    "pintura",
    "arte visual",
    "acrílico",
    "óleo",
    "óleo pastel",
    "acuarela",
    "esculturas",
    "Santa Lucía",
    "Uruguay",
    "arte contemporáneo",
    "pintura simbólica",
  ],
  authors: [{ name: "Luciano Fulco" }],
  creator: "Luciano Fulco",
  publisher: "LaunchByte",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "https://lucianofulco.com",
    siteName: "Luciano Fulco - Artista Visual",
    title: "Luciano Fulco - Artista Visual Uruguayo",
    description:
      "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Arte simbólico desde Santa Lucía, Uruguay.",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Luciano Fulco - Artista Visual Uruguayo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luciano Fulco - Artista Visual Uruguayo",
    description:
      "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Arte simbólico desde Santa Lucía, Uruguay.",
    images: ["/favicon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", rel: "icon", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
      {
        rel: "mask-icon",
        url: "/favicon.png",
        color: "#000000",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luciano Fulco",
  },
  metadataBase: new URL("https://lucianofulco.com"),
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Favicon principal - Universal para todos los navegadores */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />

        {/* Favicons específicos por tamaño */}
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/favicon.png" sizes="512x512" type="image/png" />

        {/* Apple Touch Icons - iOS, iPadOS, macOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="apple-touch-icon" href="/favicon.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/favicon.png" sizes="512x512" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png" />

        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/favicon.png" color="#000000" />

        {/* Apple Web App Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Luciano Fulco" />

        {/* Android/Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Luciano Fulco" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme colors - Universal */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preload crítico para mejor rendimiento */}
        <link rel="preload" href="/favicon.png" as="image" type="image/png" />
        <link rel="preload" href="/apple-touch-icon.png" as="image" type="image/png" />
      </head>
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans`}>
        <Suspense>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            {children}
            <Toaster />
            <Analytics />
            <GoogleAnalytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
