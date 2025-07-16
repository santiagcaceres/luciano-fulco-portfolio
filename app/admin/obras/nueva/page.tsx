"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { createArtwork } from "@/app/actions/artworks"

export default function NuevaObra() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isEspatula, setIsEspatula] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)

    // Agregar subcategoría si está marcada
    if (isEspatula) {
      formData.set("subcategory", "espatula")
    }

    // Agregar todas las imágenes
    selectedImages.forEach((image) => {
      formData.append("images", image)
    })

    try {
      await createArtwork(formData)
    } catch (error) {
      console.error("Error creating artwork:", error)
      alert("Error al crear la obra. Por favor, intenta de nuevo.")
      setIsLoading(false)
    }
  }

  const handleImagesSelect = (files: File[]) => {
    console.log("Imágenes seleccionadas:", files.length) // Para debug
    setSelectedImages(files)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/admin/obras">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Obras
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 ml-4">Nueva Obra</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título de la Obra *</Label>
                    <Input id="title" name="title" placeholder="Ej: Paisaje Urbano" required />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acrilicos">Acrílicos</SelectItem>
                        <SelectItem value="oleos">Óleos</SelectItem>
                        <SelectItem value="oleo-pastel">Óleo Pastel</SelectItem>
                        <SelectItem value="acuarelas">Acuarelas</SelectItem>
                        <SelectItem value="dibujos">Dibujos</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkbox para Espátula */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="espatula"
                      checked={isEspatula}
                      onCheckedChange={(checked) => setIsEspatula(checked as boolean)}
                    />
                    <Label htmlFor="espatula" className="text-sm font-medium">
                      Técnica de Espátula
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="price">Precio (USD) *</Label>
                    <Input id="price" name="price" type="number" placeholder="0" required />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción Corta *</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Ej: Acrílico sobre lienzo, 40x60cm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="detailedDescription">Descripción Detallada</Label>
                    <Textarea
                      id="detailedDescription"
                      name="detailedDescription"
                      placeholder="Describe la obra, su inspiración, técnica utilizada..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalles Técnicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Año</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        defaultValue={new Date().getFullYear()}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dimensions">Dimensiones</Label>
                      <Input id="dimensions" name="dimensions" placeholder="Ej: 40 x 60 cm" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="technique">Técnica</Label>
                    <Input id="technique" name="technique" placeholder="Ej: Acrílico sobre lienzo" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes de la Obra</CardTitle>
                  <p className="text-sm text-gray-600">Máximo 3 imágenes. La primera será la imagen principal.</p>
                </CardHeader>
                <CardContent>
                  <MultipleImageUpload onImagesSelect={handleImagesSelect} maxImages={3} />
                  {selectedImages.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ {selectedImages.length} imagen{selectedImages.length !== 1 ? "es" : ""} seleccionada
                        {selectedImages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select name="status" defaultValue="Disponible">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Vendida">Vendida</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" name="featured" />
                    <Label htmlFor="featured">Obra Destacada</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Guardando..." : "Guardar Obra"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
