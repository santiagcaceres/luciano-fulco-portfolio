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
    "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Descubre obras únicas en acrílico, óleo, acuarela y dibujo. Arte simbólico desde Santa Lucía, Uruguay.",
  keywords: [
    "Luciano Fulco",
    "artista uruguayo",
    "pintura",
    "arte visual",
    "acrílico",
    "óleo",
    "óleo pastel",
    "acuarela",
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
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://lucianofulco.com"),
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
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
