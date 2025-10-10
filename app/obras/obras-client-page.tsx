"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Palette, User, Calendar, Box } from "lucide-react"
import type { Artwork } from "@/types/artwork"
import { trackEvent } from "@/lib/gtag"

interface ObrasClientPageProps {
  initialArtworks: Artwork[]
}

type Category = "Todas" | "Pintura" | "Dibujo" | "Acuarela" | "Óleo" | "Esculturas"

export default function ObrasClientPage({ initialArtworks }: ObrasClientPageProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(initialArtworks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todas")
  const [selectedYear, setSelectedYear] = useState<string>("Todos")
  const [showFilters, setShowFilters] = useState(false)

  const categories: Category[] = ["Todas", "Pintura", "Dibujo", "Acuarela", "Óleo", "Esculturas"]

  // Obtener años únicos de las obras y ordenarlos de más reciente a más antiguo
  const years = [
    "Todos",
    ...Array.from(new Set(artworks.map((a) => a.year?.toString() || "")))
      .filter(Boolean)
      .sort((a, b) => Number(b) - Number(a)),
  ]

  useEffect(() => {
    let filtered = artworks

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artwork.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artwork.year?.toString().includes(searchTerm),
      )
    }

    // Filtrar por categoría
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter((artwork) => artwork.category === selectedCategory)
    }

    // Filtrar por año
    if (selectedYear !== "Todos") {
      filtered = filtered.filter((artwork) => artwork.year?.toString() === selectedYear)
    }

    setFilteredArtworks(filtered)

    // Track filter usage
    if (selectedCategory !== "Todas" || selectedYear !== "Todos" || searchTerm) {
      trackEvent({
        action: "filter_artworks",
        category: "Engagement",
        label: `Category: ${selectedCategory}, Year: ${selectedYear}, Search: ${searchTerm ? "yes" : "no"}`,
      })
    }
  }, [searchTerm, selectedCategory, selectedYear, artworks])

  const handleArtworkClick = (artwork: Artwork) => {
    trackEvent({
      action: "view_artwork",
      category: "Engagement",
      label: artwork.title,
      value: artwork.id,
    })
  }

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case "Pintura":
        return <Palette className="w-4 h-4" />
      case "Dibujo":
        return <User className="w-4 h-4" />
      case "Acuarela":
        return <Palette className="w-4 h-4" />
      case "Óleo":
        return <Palette className="w-4 h-4" />
      case "Esculturas":
        return <Box className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Luciano Fulco
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Inicio
              </Link>
              <Link href="/obras" className="text-gray-900 font-semibold">
                Obras
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Todas las Obras</h1>
          <p className="text-gray-600">Explora la colección completa</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, categoría o año..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-2"
              >
                {getCategoryIcon(category)}
                {category}
              </Button>
            ))}
          </div>

          {/* Year Filter - Only visible when filters button is pressed */}
          {showFilters && (
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Año:</span>
              <div className="flex flex-wrap gap-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          {filteredArtworks.length} {filteredArtworks.length === 1 ? "obra encontrada" : "obras encontradas"}
        </div>

        {/* Artworks Grid */}
        {filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((artwork) => (
              <Link key={artwork.id} href={`/obra/${artwork.id}`} onClick={() => handleArtworkClick(artwork)}>
                <Card className="group cursor-pointer hover:shadow-xl transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-80 bg-gray-100">
                      <Image
                        src={artwork.main_image || "/placeholder.svg?height=400&width=400"}
                        alt={artwork.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{artwork.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{artwork.category}</span>
                        {artwork.year && <span>{artwork.year}</span>}
                      </div>
                      {artwork.dimensions && <p className="text-sm text-gray-500 mt-2">{artwork.dimensions}</p>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No se encontraron obras con los filtros seleccionados</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">
                © {new Date().getFullYear()} Luciano Fulco. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Desarrollado por</span>
              <Image
                src="/images/launchbyte-logo.png"
                alt="LaunchByte"
                width={120}
                height={30}
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
