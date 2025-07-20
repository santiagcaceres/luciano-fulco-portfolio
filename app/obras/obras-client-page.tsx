"use client"

import { useState, useMemo } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface Artwork {
  id: string
  title: string
  description: string
  detailed_description?: string
  price: number
  category: string
  subcategory?: string
  status: string
  image_urls: string
  year?: number
  dimensions?: string
  technique?: string
  featured: boolean
  created_at: string
}

interface ObrasClientPageProps {
  artworks: Artwork[]
}

export default function ObrasClientPage({ artworks }: ObrasClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Formatear categoría
  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      oleos: "Óleos",
      "oleo-pastel": "Óleo Pastel",
      acrilicos: "Acrílicos",
      "tecnica-mixta": "Técnica Mixta",
      acuarelas: "Acuarelas",
      dibujos: "Dibujos",
      otros: "Otros",
    }
    return categoryMap[category] || category
  }

  // Filtrar y ordenar obras
  const filteredAndSortedArtworks = useMemo(() => {
    const filtered = artworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || artwork.category === selectedCategory
      const matchesStatus = !selectedStatus || artwork.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Ordenar
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price)
    } else {
      // Orden por defecto: destacadas primero, luego por fecha de creación
      filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }

    return filtered
  }, [artworks, searchTerm, selectedCategory, selectedStatus, sortBy])

  // Obtener imagen principal
  const getMainImage = (imageUrls: string) => {
    try {
      const urls = JSON.parse(imageUrls)
      return urls[0] || "/placeholder.svg"
    } catch {
      return "/placeholder.svg"
    }
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedStatus("")
    setSortBy("")
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = selectedCategory || selectedStatus || sortBy

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Galería de Obras</h1>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar obras por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Todas las categorías</option>
                      <option value="oleos">Óleos</option>
                      <option value="oleo-pastel">Óleo Pastel</option>
                      <option value="acrilicos">Acrílicos</option>
                      <option value="tecnica-mixta">Técnica Mixta</option>
                      <option value="acuarelas">Acuarelas</option>
                      <option value="dibujos">Dibujos</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  {/* Filtro por estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Todos los estados</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Vendida">Vendida</option>
                      <option value="Reservado">Reservado</option>
                    </select>
                  </div>

                  {/* Ordenar por precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por precio</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Orden por defecto</option>
                      <option value="price-asc">Menor precio</option>
                      <option value="price-desc">Mayor precio</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {formatCategory(selectedCategory)}
                    <button onClick={() => setSelectedCategory("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedStatus && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedStatus}
                    <button onClick={() => setSelectedStatus("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {sortBy && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {sortBy === "price-asc" ? "Menor precio" : "Mayor precio"}
                    <button onClick={() => setSortBy("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contador de resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAndSortedArtworks.length} obra{filteredAndSortedArtworks.length !== 1 ? "s" : ""} encontrada
            {filteredAndSortedArtworks.length !== 1 ? "s" : ""}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>

        {/* Grid de obras */}
        {filteredAndSortedArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedArtworks.map((artwork) => (
              <Link key={artwork.id} href={`/obra/${artwork.id}`}>
                <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={getMainImage(artwork.image_urls) || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    {artwork.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-yellow-900">Destacada</Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          artwork.status === "Disponible"
                            ? "default"
                            : artwork.status === "Vendida"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {artwork.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{formatPrice(artwork.price)}</span>
                      <Badge variant="outline">{formatCategory(artwork.category)}</Badge>
                    </div>
                    {artwork.subcategory === "espatula" && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                          Técnica de Espátula
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron obras</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || hasActiveFilters
                    ? "Intenta ajustar los filtros o términos de búsqueda"
                    : "No hay obras disponibles en este momento"}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
