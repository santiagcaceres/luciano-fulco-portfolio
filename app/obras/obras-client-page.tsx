"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Filter, X, Paintbrush, Droplet, Palette, Pencil, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Artwork } from "@/types/artwork"
import { trackEvent } from "@/lib/gtag"

const categoryIcons = {
  Acrílico: Paintbrush,
  Óleo: Droplet,
  "Óleo Pastel": Palette,
  Acuarela: Droplet,
  Dibujo: Pencil,
  Esculturas: Box,
}

const categories = ["Acrílico", "Óleo", "Óleo Pastel", "Acuarela", "Dibujo", "Esculturas"]

export default function ObrasClientPage({ initialArtworks }: { initialArtworks: Artwork[] }) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showYearFilter, setShowYearFilter] = useState(false)

  // Extract unique years from artworks and sort from newest to oldest
  const availableYears = Array.from(new Set(artworks.map((artwork) => artwork.year)))
    .sort((a, b) => b - a)
    .map(String)

  useEffect(() => {
    let filtered = initialArtworks

    if (selectedCategory) {
      filtered = filtered.filter((artwork) => artwork.category === selectedCategory)
    }

    if (selectedYear) {
      filtered = filtered.filter((artwork) => artwork.year.toString() === selectedYear)
    }

    setArtworks(filtered)
  }, [selectedCategory, selectedYear, initialArtworks])

  const handleCategoryFilter = (category: string) => {
    const newCategory = selectedCategory === category ? null : category
    setSelectedCategory(newCategory)

    // Track filter usage
    trackEvent({
      action: "filter_category",
      category: "Engagement",
      label: newCategory || "clear",
    })
  }

  const handleYearFilter = (year: string) => {
    const newYear = selectedYear === year ? null : year
    setSelectedYear(newYear)

    // Track year filter usage
    trackEvent({
      action: "filter_year",
      category: "Engagement",
      label: newYear || "clear",
    })
  }

  const clearAllFilters = () => {
    setSelectedCategory(null)
    setSelectedYear(null)

    trackEvent({
      action: "clear_all_filters",
      category: "Engagement",
    })
  }

  const toggleYearFilter = () => {
    setShowYearFilter(!showYearFilter)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-playfair">Todas las Obras</h1>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-white dark:bg-gray-900 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filtrar por:</h2>
              {(selectedCategory || selectedYear) && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Category Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3 text-gray-600 dark:text-gray-400">Categoría</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons]
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryFilter(category)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Year Filter Toggle Button */}
            <div className="mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleYearFilter}
                className="gap-2 text-gray-600 dark:text-gray-400"
              >
                <Filter className="h-4 w-4" />
                {showYearFilter ? "Ocultar años" : "Filtrar por año"}
              </Button>
            </div>

            {/* Year Filters - Only visible when toggled */}
            {showYearFilter && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-600 dark:text-gray-400">Año</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedYear === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleYearFilter("")}
                  >
                    Todos los años
                  </Button>
                  {availableYears.map((year) => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleYearFilter(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(selectedCategory || selectedYear) && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedYear && (
              <Badge variant="secondary" className="gap-1">
                {selectedYear}
                <button onClick={() => setSelectedYear(null)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Artworks Grid */}
      <main className="container mx-auto px-4 py-8">
        {artworks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No se encontraron obras con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => {
              const Icon = categoryIcons[artwork.category as keyof typeof categoryIcons]
              return (
                <Link key={artwork.id} href={`/obra/${artwork.id}`}>
                  <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={artwork.images[0] || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-medium">{artwork.category}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-playfair text-lg font-semibold mb-1 line-clamp-1">{artwork.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{artwork.year}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{artwork.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
