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
        url: "/icon-512x512.png",
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
    images: ["/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luciano Fulco",
    startupImage: [
      {
        url: "/apple-icon-180x180.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
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
        {/* Favicon principal con versioning para forzar actualización */}
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" type="image/x-icon" />

        {/* Favicons PNG con versioning */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png?v=2" />

        {/* Apple Touch Icons - TODOS los tamaños posibles con versioning */}
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png?v=2" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png?v=2" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png?v=2" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png?v=2" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png?v=2" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png?v=2" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png?v=2" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png?v=2" />

        {/* Apple Touch Icon principal - el más importante para iOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=2" />

        {/* Safari Pinned Tab con versioning */}
        <link rel="mask-icon" href="/icon-512x512.png?v=2" color="#000000" />

        {/* Apple Web App Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Luciano Fulco" />

        {/* Apple Startup Images */}
        <link rel="apple-touch-startup-image" href="/apple-icon-180x180.png?v=2" />

        {/* Android/Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Luciano Fulco" />

        {/* Web App Manifest con versioning */}
        <link rel="manifest" href="/site.webmanifest?v=2" />

        {/* Theme colors */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/icon-512x512.png?v=2" />

        {/* Preload crítico con versioning */}
        <link rel="preload" href="/apple-icon-180x180.png?v=2" as="image" type="image/png" />
        <link rel="preload" href="/icon-512x512.png?v=2" as="image" type="image/png" />

        {/* DNS Prefetch para mejor rendimiento */}
        <link rel="dns-prefetch" href="https://lucianofulco.com" />
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
