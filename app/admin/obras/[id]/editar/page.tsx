"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, ImageIcon, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SortableImageUpload } from "@/components/sortable-image-upload"
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
  const [imageOrder, setImageOrder] = useState<number[]>([])
  const [success, setSuccess] = useState(false)

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
    setSuccess(false)

    const formData = new FormData(e.target as HTMLFormElement)

    if (isEspatula) {
      formData.set("subcategory", "espatula")
    } else {
      formData.set("subcategory", "")
    }

    // Agregar imágenes en el orden correcto si se seleccionaron nuevas
    if (selectedImages.length > 0) {
      const orderedImages = imageOrder.map((index) => selectedImages[index]).filter(Boolean)
      const imagesToUse = orderedImages.length > 0 ? orderedImages : selectedImages

      imagesToUse.forEach((image) => {
        formData.append("images", image)
      })
    }

    try {
      await updateArtwork(params.id, formData)
      setSuccess(true)
      setIsLoading(false)

      setTimeout(() => {
        router.push("/admin/obras")
      }, 2000)
    } catch (error) {
      console.error("Error updating artwork:", error)
      setIsLoading(false)
      setSuccess(false)
      alert("Error al actualizar la obra. Por favor, intenta de nuevo.")
    }
  }

  const handleImagesSelect = (files: File[], order: number[]) => {
    console.log("Nuevas imágenes seleccionadas:", files.length, "Orden:", order)
    setSelectedImages(files)
    setImageOrder(order)
  }

  // Crear array de imágenes actuales para mostrar
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Obra Actualizada!</h2>
            <p className="text-gray-600 mb-4">
              Los cambios se han guardado exitosamente con el nuevo orden de imágenes.
            </p>
            <div className="animate-pulse text-sm text-gray-500">Redirigiendo al panel de obras...</div>
          </div>
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
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Obras
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 ml-4">Editar: {artwork.title}</h1>
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
                    <Input
                      id="title"
                      name="title"
                      defaultValue={artwork.title}
                      placeholder="Ej: Paisaje Urbano"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <select
                        name="category"
                        defaultValue={artwork.category}
                        required
                        disabled={isLoading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="acrilicos">Acrílicos</option>
                        <option value="oleos">Óleos</option>
                        <option value="oleo-pastel">Óleo Pastel</option>
                        <option value="acuarelas">Acuarelas</option>
                        <option value="dibujos">Dibujos</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center space-x-2 pb-2">
                        <Checkbox
                          id="espatula"
                          checked={isEspatula}
                          onCheckedChange={(checked) => setIsEspatula(checked as boolean)}
                          disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dimensions">Dimensiones</Label>
                      <Input
                        id="dimensions"
                        name="dimensions"
                        defaultValue={artwork.dimensions}
                        placeholder="Ej: 40 x 60 cm"
                        disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Imágenes</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentImages.length > 0
                      ? `${currentImages.length} imagen${currentImages.length !== 1 ? "es" : ""} actual${currentImages.length !== 1 ? "es" : ""}. Puedes reordenarlas o cambiarlas.`
                      : "No hay imágenes. Agrega nuevas imágenes."}
                  </p>
                </CardHeader>
                <CardContent>
                  <SortableImageUpload
                    onImagesSelect={handleImagesSelect}
                    currentImages={currentImages}
                    maxImages={3}
                    allowEdit={true}
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ {selectedImages.length} nueva{selectedImages.length !== 1 ? "s" : ""} imagen
                        {selectedImages.length !== 1 ? "es" : ""} seleccionada{selectedImages.length !== 1 ? "s" : ""}{" "}
                        en orden
                      </p>
                      <p className="text-xs text-green-600 mt-1">Se reemplazarán las imágenes actuales al guardar</p>
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
                    <select
                      name="status"
                      defaultValue={artwork.status}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Vendida">Vendida</option>
                      <option value="Reservado">Reservado</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" name="featured" defaultChecked={artwork.featured} disabled={isLoading} />
                    <Label htmlFor="featured">Obra Destacada</Label>
                  </div>

                  {isEspatula && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">✅ Técnica de espátula activada</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>

                <Link href={`/obra/${artwork.id}`} target="_blank">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white bg-transparent"
                    disabled={isLoading}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>
                </Link>
              </div>

              {isLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Actualizando obra...</p>
                      <p className="text-xs text-blue-600">
                        {selectedImages.length > 0
                          ? "Subiendo nuevas imágenes en orden y guardando cambios"
                          : "Guardando cambios"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
