"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface Artwork {
  id: string
  title: string
  category: string
  subcategory?: string
  price: number
  description: string
  status: string
  main_image_url?: string
  created_at: string
}

interface ObrasClientPageProps {
  artworks: Artwork[]
}

const CATEGORIES = [
  { id: "todos", label: "Todas las Obras", count: 0 },
  { id: "acrilicos", label: "Acrílicos", count: 0 },
  { id: "oleos", label: "Óleos", count: 0 },
  { id: "acuarelas", label: "Acuarelas", count: 0 },
  { id: "dibujos", label: "Dibujos", count: 0 },
  { id: "otros", label: "Otros", count: 0 },
]

const STATUS_OPTIONS = [
  { id: "todos", label: "Todos los Estados" },
  { id: "Disponible", label: "Disponibles" },
  { id: "Vendida", label: "Vendidas" },
]

const PRICE_RANGES = [
  { id: "todos", label: "Todos los Precios" },
  { id: "0-500", label: "Hasta USD 500" },
  { id: "500-1000", label: "USD 500 - USD 1000" },
  { id: "1000-2000", label: "USD 1000 - USD 2000" },
  { id: "2000+", label: "Más de USD 2000" },
]

const SORT_OPTIONS = [
  { id: "default", label: "Orden por Defecto", icon: ArrowUpDown },
  { id: "price-asc", label: "Menor Precio", icon: ArrowUp },
  { id: "price-desc", label: "Mayor Precio", icon: ArrowDown },
]

export default function ObrasClientPage({ artworks }: ObrasClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("todos")
  const [selectedPriceRange, setSelectedPriceRange] = useState("todos")
  const [selectedSort, setSelectedSort] = useState("default")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Calcular conteos de categorías
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map((category) => ({
      ...category,
      count:
        category.id === "todos"
          ? artworks.length
          : artworks.filter((artwork) => artwork.category === category.id).length,
    }))
  }, [artworks])

  // Filtrar y ordenar obras
  const filteredAndSortedArtworks = useMemo(() => {
    const filtered = artworks.filter((artwork) => {
      // Filtro por categoría
      const categoryMatch = selectedCategory === "todos" || artwork.category === selectedCategory

      // Filtro por estado
      const statusMatch = selectedStatus === "todos" || artwork.status === selectedStatus

      // Filtro por rango de precio
      let priceMatch = true
      if (selectedPriceRange !== "todos") {
        const price = artwork.price
        switch (selectedPriceRange) {
          case "0-500":
            priceMatch = price <= 500
            break
          case "500-1000":
            priceMatch = price > 500 && price <= 1000
            break
          case "1000-2000":
            priceMatch = price > 1000 && price <= 2000
            break
          case "2000+":
            priceMatch = price > 2000
            break
        }
      }

      // Filtro por búsqueda
      const searchMatch =
        searchTerm === "" ||
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase())

      return categoryMatch && statusMatch && priceMatch && searchMatch
    })

    // Aplicar ordenamiento
    switch (selectedSort) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price)
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price)
      default:
        return filtered
    }
  }, [artworks, selectedCategory, selectedStatus, selectedPriceRange, searchTerm, selectedSort])

  const clearFilters = () => {
    setSelectedCategory("todos")
    setSelectedStatus("todos")
    setSelectedPriceRange("todos")
    setSelectedSort("default")
    setSearchTerm("")
  }

  const hasActiveFilters =
    selectedCategory !== "todos" ||
    selectedStatus !== "todos" ||
    selectedPriceRange !== "todos" ||
    selectedSort !== "default" ||
    searchTerm !== ""

  return (
    <div className="min-h-screen relative">
      {/* Fondo artístico global */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-200/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-200/25 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4 md:py-6">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/images/negro-lucho.png"
                alt="Fulco Logo - Volver al inicio"
                width={150}
                height={75}
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-serif-display">Todas las Obras</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Explora la colección completa de obras de Luciano Fulco. Cada pieza cuenta una historia única a través del
            color, la forma y la emoción.
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/95 backdrop-blur-sm border-b shadow-sm mb-8">
          <div className="p-4 md:p-6">
            {/* Barra de búsqueda y toggle de filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar obras por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/90"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="sm:w-auto bg-white/90">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>}
              </Button>
            </div>

            {/* Categorías principales */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categoriesWithCounts.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${
                      selectedCategory === category.id
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white/90 hover:bg-gray-50"
                    }`}
                  >
                    {category.label}
                    <span className="ml-2 text-xs opacity-70">({category.count})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Ordenamiento - Siempre visible */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por:</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.id}
                      variant={selectedSort === option.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSort(option.id)}
                      className={`flex items-center gap-2 ${
                        selectedSort === option.id
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-white/90 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Filtros adicionales (colapsables) */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filtro por estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <Button
                          key={status.id}
                          variant={selectedStatus === status.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedStatus(status.id)}
                          className={`${
                            selectedStatus === status.id
                              ? "bg-black text-white hover:bg-gray-800"
                              : "bg-white/90 hover:bg-gray-50"
                          }`}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio</label>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((range) => (
                        <Button
                          key={range.id}
                          variant={selectedPriceRange === range.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPriceRange(range.id)}
                          className={`${
                            selectedPriceRange === range.id
                              ? "bg-black text-white hover:bg-gray-800"
                              : "bg-white/90 hover:bg-gray-50"
                          }`}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón limpiar filtros */}
                {hasActiveFilters && (
                  <div className="pt-4">
                    <Button variant="ghost" onClick={clearFilters} className="text-gray-600 hover:text-gray-800">
                      Limpiar todos los filtros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAndSortedArtworks.length === 0
              ? "No se encontraron obras con los filtros seleccionados"
              : `Mostrando ${filteredAndSortedArtworks.length} de ${artworks.length} obras`}
            {selectedSort !== "default" && (
              <span className="ml-2 text-sm text-gray-500">
                • Ordenado por {SORT_OPTIONS.find((opt) => opt.id === selectedSort)?.label.toLowerCase()}
              </span>
            )}
          </p>
        </div>

        {/* Grid de obras */}
        {filteredAndSortedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">No se encontraron obras</p>
            <p className="text-gray-400 mb-6">Intenta ajustar los filtros o términos de búsqueda</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Ver todas las obras
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedArtworks.map((artwork) => (
              <Link key={artwork.id} href={`/obra/${artwork.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border border-white/20 group">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={
                        artwork.main_image_url ||
                        `https://placehold.co/400x400/E5E7EB/374151/jpeg?text=${encodeURIComponent(artwork.title) || "/placeholder.svg"}`
                      }
                      alt={artwork.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                      quality={90}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      onError={(e) => {
                        console.error("Error loading artwork image:", artwork.main_image_url)
                        e.currentTarget.src = `https://placehold.co/400x400/E5E7EB/374151/jpeg?text=Error+cargando+imagen`
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{artwork.title}</h3>
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 mt-1 ${
                          artwork.status === "Disponible" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-gray-900">USD {artwork.price}</p>
                      <div className="flex gap-1">
                        <Badge className="capitalize text-xs">{artwork.category}</Badge>
                        {artwork.status === "Vendida" && (
                          <Badge variant="destructive" className="text-xs">
                            Vendida
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
