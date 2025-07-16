"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { getArtworkById, updateArtwork } from "@/app/actions/artworks"

interface PageProps {
  params: {
    id: string
  }
}

export default function EditarObra({ params }: PageProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [artwork, setArtwork] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEspatula, setIsEspatula] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadArtwork()
    }
  }, [router])

  const loadArtwork = async () => {
    try {
      const data = await getArtworkById(params.id)
      if (data) {
        setArtwork(data)
        // Establecer el estado del checkbox basado en la subcategoría
        setIsEspatula(data.subcategory === "espatula")
      } else {
        router.push("/admin/obras")
      }
    } catch (error) {
      console.error("Error loading artwork:", error)
      router.push("/admin/obras")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)

    // Agregar subcategoría si está marcada
    if (isEspatula) {
      formData.set("subcategory", "espatula")
    } else {
      formData.set("subcategory", "")
    }

    // Agregar nuevas imágenes si se seleccionaron
    console.log("Submitting with images:", selectedImages.length)
    selectedImages.forEach((image, index) => {
      console.log(`Adding image ${index + 1}:`, image.name, image.size)
      formData.append("images", image)
    })

    try {
      await updateArtwork(params.id, formData)
      // La función updateArtwork ya redirige automáticamente
    } catch (error) {
      console.error("Error updating artwork:", error)
      alert("Error al actualizar la obra. Por favor, intenta de nuevo.")
      setIsLoading(false)
    }
  }

  const handleImagesSelect = (files: File[]) => {
    console.log("Nuevas imágenes seleccionadas:", files.length)
    setSelectedImages(files)
  }

  // Crear array de imágenes actuales para mostrar (mejorado)
  const currentImages = []
  if (artwork?.main_image_url && artwork.main_image_url.trim() !== "") {
    currentImages.push(artwork.main_image_url)
  }
  if (artwork?.gallery && artwork.gallery.length > 0) {
    artwork.gallery.forEach((img) => {
      if (img && img.trim() !== "" && !currentImages.includes(img)) {
        currentImages.push(img)
      }
    })
  }

  console.log("Current images for editing:", currentImages)

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando obra...</p>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Obra no encontrada</p>
          <Link href="/admin/obras">
            <Button className="mt-4 bg-gray-900 hover:bg-gray-800">Volver a Obras</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <h1 className="text-xl font-bold text-gray-900 ml-4">Editar: {artwork.title}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título de la Obra *</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={artwork.title}
                      placeholder="Ej: Paisaje Urbano"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <Select name="category" defaultValue={artwork.category} required>
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

                    <div className="flex items-end">
                      {/* Checkbox para Espátula */}
                      <div className="flex items-center space-x-2 pb-2">
                        <Checkbox
                          id="espatula"
                          checked={isEspatula}
                          onCheckedChange={(checked) => setIsEspatula(checked as boolean)}
                        />
                        <Label htmlFor="espatula" className="text-sm font-medium">
                          Técnica de Espátula
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price">Precio (USD) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      defaultValue={artwork.price}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción Corta *</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={artwork.description}
                      placeholder="Ej: Acrílico sobre lienzo, 40x60cm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="detailedDescription">Descripción Detallada</Label>
                    <Textarea
                      id="detailedDescription"
                      name="detailedDescription"
                      defaultValue={artwork.detailed_description || ""}
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
                        defaultValue={artwork.year}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dimensions">Dimensiones</Label>
                      <Input
                        id="dimensions"
                        name="dimensions"
                        defaultValue={artwork.dimensions}
                        placeholder="Ej: 40 x 60 cm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="technique">Técnica</Label>
                    <Input
                      id="technique"
                      name="technique"
                      defaultValue={artwork.technique}
                      placeholder="Ej: Acrílico sobre lienzo"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Gestión de Imágenes */}
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes de la Obra</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentImages.length > 0
                      ? `${currentImages.length} imagen${currentImages.length !== 1 ? "es" : ""} actual${currentImages.length !== 1 ? "es" : ""}. Puedes cambiarlas.`
                      : "No hay imágenes. Agrega nuevas imágenes."}
                  </p>
                </CardHeader>
                <CardContent>
                  <MultipleImageUpload
                    onImagesSelect={handleImagesSelect}
                    currentImages={currentImages}
                    maxImages={3}
                    allowEdit={true}
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ {selectedImages.length} nueva{selectedImages.length !== 1 ? "s" : ""} imagen
                        {selectedImages.length !== 1 ? "es" : ""} seleccionada{selectedImages.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-green-600 mt-1">Se reemplazarán las imágenes actuales al guardar</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuración */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select name="status" defaultValue={artwork.status}>
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
                    <Checkbox id="featured" name="featured" defaultChecked={artwork.featured} />
                    <Label htmlFor="featured">Obra Destacada</Label>
                  </div>

                  {/* Mostrar estado actual de espátula */}
                  {isEspatula && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">✅ Técnica de espátula activada</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de Acción - NEGROS */}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>

                <Link href={`/obra/${artwork.id}`} target="_blank">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white bg-transparent"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
