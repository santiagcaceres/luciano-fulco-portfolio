"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, ArrowUpDown, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"

interface ObrasClientPageProps {
  artworks: any[]
  categories: { id: string; name: string }[]
  sortOptions: { id: string; name: string }[]
}

export default function ObrasClientPage({ artworks, categories, sortOptions }: ObrasClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [selectedSort, setSelectedSort] = useState("default")
  const [isScrolled, setIsScrolled] = useState(false)

  const categoryIcons: { [key: string]: React.ElementType } = {
    todos: Palette,
    acrilicos: Palette,
    oleos: Palette,
    "oleo-pastel": Palette,
    acuarelas: Palette,
    dibujos: Palette,
    otros: Palette,
  }

  const sortIcons: { [key: string]: React.ElementType } = {
    default: ArrowUpDown,
    "price-asc": ArrowUp,
    "price-desc": ArrowDown,
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredArtworks = useMemo(() => {
    let filtered = artworks
    if (selectedCategory !== "todos") {
      filtered = filtered.filter((artwork) => artwork.category === selectedCategory)
    }
    if (selectedSort === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price)
    }
    if (selectedSort === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price)
    }
    return filtered
  }, [selectedCategory, selectedSort, artworks])

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-200/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-200/25 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <header
        className={`shadow-sm sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm ${
          isScrolled ? "bg-black/90 text-white py-2 md:py-3" : "bg-white/80 text-gray-900 py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Volver</span>
            </Link>
            <Link href="/" className="flex-1 flex justify-center">
              {isScrolled ? (
                <Image
                  src="/images/blanco-lucho.png"
                  alt="Lucho Logo"
                  width={120}
                  height={60}
                  className="h-8 md:h-10 w-auto"
                />
              ) : (
                <Image
                  src="/images/negro-lucho.png"
                  alt="Fulco Logo"
                  width={150}
                  height={75}
                  className="h-10 md:h-12 w-auto"
                />
              )}
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-white/60 backdrop-blur-sm py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Todas las Obras</h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto">Explora mi colección completa de obras de arte.</p>
          </div>
        </section>

        {/* Filtros */}
        <div className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Categorías */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center mr-3">Categoría:</span>
                {categories.map((category) => {
                  const Icon = categoryIcons[category.id] || Palette
                  return (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={category.id === selectedCategory ? "default" : "outline"}
                      className={`flex items-center gap-1 text-xs md:text-sm px-3 py-1.5 h-8 ${
                        category.id === selectedCategory
                          ? "bg-black hover:bg-gray-800 text-white"
                          : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                      size="sm"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                    </Button>
                  )
                })}
              </div>

              {/* Ordenar */}
              <div className="flex flex-wrap justify-center lg:justify-end gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center mr-3">Ordenar:</span>
                {sortOptions.map((option) => {
                  const Icon = sortIcons[option.id] || ArrowUpDown
                  return (
                    <Button
                      key={option.id}
                      onClick={() => setSelectedSort(option.id)}
                      variant={option.id === selectedSort ? "default" : "outline"}
                      className={`flex items-center gap-1 text-xs md:text-sm px-3 py-1.5 h-8 ${
                        option.id === selectedSort
                          ? "bg-black hover:bg-gray-800 text-white"
                          : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                      size="sm"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{option.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-3 text-center lg:text-left">
              <p className="text-sm text-gray-600">
                {filteredArtworks.length} obra{filteredArtworks.length !== 1 ? "s" : ""}
                {selectedCategory !== "todos" &&
                  ` en ${categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()}`}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Obras con efectos hover discretos */}
        <section className="py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredArtworks.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg">
                <p className="text-lg text-gray-600">No se encontraron obras en esta categoría.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Verifica que Supabase esté configurado correctamente o que las obras estén marcadas como destacadas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredArtworks.map((artwork) => (
                  <Link key={artwork.id} href={`/obra/${artwork.id}`}>
                    <Card className="group overflow-hidden cursor-pointer bg-white/90 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:shadow-lg hover:bg-white">
                      <div className="relative overflow-hidden">
                        <Image
                          src={
                            artwork.main_image_url ||
                            `https://placehold.co/400x300/E5E7EB/374151/jpeg?text=${encodeURIComponent(artwork.title) || "/placeholder.svg"}`
                          }
                          alt={artwork.title}
                          width={400}
                          height={300}
                          className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Overlay sutil con efecto hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                              <svg
                                className="w-4 h-4 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge
                            variant={artwork.category === "acrilicos" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {artwork.category}
                          </Badge>
                          {artwork.subcategory && (
                            <Badge variant="outline" className="capitalize bg-white/90 text-xs">
                              {artwork.subcategory}
                            </Badge>
                          )}
                          {artwork.status === "Vendida" && (
                            <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              Vendida
                            </div>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">
                          {artwork.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mb-4">{artwork.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl md:text-2xl font-bold text-gray-900">USD {artwork.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-black/90 backdrop-blur-sm text-white py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/launchbyte-logo.png"
                alt="LaunchByte Logo"
                width={32}
                height={32}
                className="brightness-0 invert"
              />
              <span className="text-lg font-semibold">LaunchByte</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-300">&copy; 2025 LaunchByte. Todos los derechos reservados.</p>
              <p className="text-xs text-gray-400 mt-1">Desarrollo web</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
