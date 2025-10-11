"use client"

import type React from "react"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Paintbrush, Droplet, Pencil, Box, Filter, X } from "lucide-react"
import type { Artwork } from "@/types/artwork"
import { trackEvent } from "@/lib/gtag"

interface ObrasClientPageProps {
  artworks: Artwork[]
}

type Category = "Todas" | "Acrílico" | "Óleo" | "Óleo Pastel" | "Acuarela" | "Dibujo" | "Esculturas"

const categoryIcons: Record<Category, React.ReactNode> = {
  Todas: null,
  Acrílico: <Paintbrush className="w-4 h-4" />,
  Óleo: <Droplet className="w-4 h-4" />,
  "Óleo Pastel": <Paintbrush className="w-4 h-4" />,
  Acuarela: <Droplet className="w-4 h-4" />,
  Dibujo: <Pencil className="w-4 h-4" />,
  Esculturas: <Box className="w-4 h-4" />,
}

export default function ObrasClientPage({ artworks }: ObrasClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todas")
  const [selectedYear, setSelectedYear] = useState<string>("Todos")
  const [showFilters, setShowFilters] = useState(false)

  // Obtener años únicos de las obras
  const availableYears = useMemo(() => {
    const years = artworks
      .map((artwork) => artwork.year)
      .filter((year): year is number => year !== null && year !== undefined)
      .filter((year, index, self) => self.indexOf(year) === index)
      .sort((a, b) => b - a) // Ordenar de más reciente a más antiguo
    return years
  }, [artworks])

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesCategory = selectedCategory === "Todas" || artwork.category === selectedCategory
      const matchesYear = selectedYear === "Todos" || artwork.year?.toString() === selectedYear
      return matchesCategory && matchesYear
    })
  }, [artworks, selectedCategory, selectedYear])

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    trackEvent({
      action: "filter_category",
      category: "obras",
      label: category,
    })
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    trackEvent({
      action: "filter_year",
      category: "obras",
      label: year,
    })
  }

  const categories: Category[] = ["Todas", "Acrílico", "Óleo", "Óleo Pastel", "Acuarela", "Dibujo", "Esculturas"]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/"
                className="text-3xl font-serif font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Luciano Fulco
              </Link>
              <p className="text-sm text-gray-600 mt-1">Artista Visual</p>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </Link>
              <Link href="/obras" className="text-gray-900 font-medium">
                Todas las Obras
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Todas las Obras</h1>
          <p className="text-lg text-gray-600">Explora la colección completa de obras de Luciano Fulco</p>
        </div>

        {/* Botón de Filtros */}
        <div className="mb-6">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {(selectedCategory !== "Todas" || selectedYear !== "Todos") && (
              <Badge variant="secondary" className="ml-2">
                {[selectedCategory !== "Todas" && "1", selectedYear !== "Todos" && "1"].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-8 space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
            {/* Filtro de Categorías */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    {categoryIcons[category]}
                    {category}
                    {selectedCategory === category && selectedCategory !== "Todas" && <X className="w-3 h-3 ml-1" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtro de Años */}
            {availableYears.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Año</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleYearChange("Todos")}
                    variant={selectedYear === "Todos" ? "default" : "outline"}
                  >
                    Todos los años
                    {selectedYear === "Todos" && <X className="w-3 h-3 ml-2" />}
                  </Button>
                  {availableYears.map((year) => (
                    <Button
                      key={year}
                      onClick={() => handleYearChange(year.toString())}
                      variant={selectedYear === year.toString() ? "default" : "outline"}
                    >
                      {year}
                      {selectedYear === year.toString() && <X className="w-3 h-3 ml-2" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón para limpiar filtros */}
            {(selectedCategory !== "Todas" || selectedYear !== "Todos") && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setSelectedCategory("Todas")
                    setSelectedYear("Todos")
                  }}
                  variant="ghost"
                  className="text-sm"
                >
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Contador de resultados */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Mostrando {filteredArtworks.length} {filteredArtworks.length === 1 ? "obra" : "obras"}
            {selectedCategory !== "Todas" && ` en ${selectedCategory}`}
            {selectedYear !== "Todos" && ` del año ${selectedYear}`}
          </p>
        </div>

        {/* Grid de obras */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron obras con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/obra/${artwork.id}`}
                className="group cursor-pointer"
                onClick={() => {
                  trackEvent({
                    action: "view_artwork",
                    category: "obras",
                    label: artwork.title,
                  })
                }}
              >
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={artwork.main_image_url || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                  {artwork.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="secondary">{artwork.category}</Badge>
                  {artwork.year && <span>• {artwork.year}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Luciano Fulco. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Desarrollado por</span>
              <a
                href="https://launchbyte.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                LaunchByte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
