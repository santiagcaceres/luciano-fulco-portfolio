"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, ImageIcon, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SimpleImageUpload } from "@/components/simple-image-upload"
import { getArtworkById, updateArtwork } from "@/app/actions/artworks"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

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
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadArtwork()
    }
  }, [router])

  // Efecto para limpiar el mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

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
    setError("")

    console.log("🚀 Starting update submission...")

    const formData = new FormData(e.target as HTMLFormElement)

    // Añadir imágenes si se seleccionaron nuevas
    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })
    }

    if (isEspatula) {
      formData.set("subcategory", "espatula")
    } else {
      formData.set("subcategory", "")
    }

    try {
      console.log("📞 Calling updateArtwork...")
      const result = await updateArtwork(params.id, formData)
      console.log("✅ updateArtwork result:", result)

      // Verificar que el resultado tenga un ID válido
      if (result && (result.id || result.title)) {
        console.log("🎉 Artwork updated successfully!")
        // Recargar datos para mostrar cambios actualizados PRIMERO
        await loadArtwork()
        // LUEGO mostrar el mensaje de éxito con las nuevas imágenes
        setSuccess(true)
        // Limpiar las imágenes seleccionadas
        setSelectedImages([])
      } else {
        console.error("❌ Invalid result from updateArtwork:", result)
        throw new Error("Error al actualizar la obra. Inténtalo de nuevo.")
      }
    } catch (error: any) {
      console.error("💥 Error updating artwork:", error)
      setError(error.message || "Error al actualizar la obra. Inténtalo de nuevo.")
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagesChange = (files: File[]) => {
    setSelectedImages(files)
    setError("")
  }

  // Crear array de imágenes actuales para mostrar
  const currentImages = []
  if (artwork?.main_image_url && artwork.main_image_url.trim() !== "") {
    currentImages.push(artwork.main_image_url)
  }
  if (artwork?.gallery && artwork.gallery.length > 0) {
    artwork.gallery.forEach((img: string) => {
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

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes Actuales</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {currentImages.map((url, index) => (
                        <div key={url} className="relative">
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Imagen actual ${index + 1}`}
                            width={150}
                            height={150}
                            className="rounded-md object-cover w-full h-24"
                          />
                          {index === 0 && <Badge className="absolute top-1 left-1 text-xs">Principal</Badge>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Esta obra no tiene imágenes.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reemplazar Imágenes</CardTitle>
                  <p className="text-sm text-gray-600">
                    Para cambiar las imágenes, selecciona un nuevo set. Esto reemplazará todas las imágenes actuales.
                    Cualquier formato y tamaño.
                  </p>
                </CardHeader>
                <CardContent>
                  <SimpleImageUpload onImagesChange={handleImagesChange} maxImages={3} />
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

              {/* MENSAJE DE ÉXITO CON TICK VERDE - APARECE DESPUÉS DE RECARGAR */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 transition-opacity duration-300">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">¡Cambios Guardados con Éxito!</p>
                      <p className="text-xs text-green-600">
                        La obra se ha actualizado correctamente con las nuevas imágenes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensajes de estado */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Actualizando obra...</p>
                      <p className="text-xs text-blue-600">
                        {selectedImages.length > 0
                          ? "Subiendo nuevas imágenes y guardando cambios"
                          : "Guardando cambios"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedImages.length > 0 && !isLoading && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedImages.length} nueva{selectedImages.length > 1 ? "s" : ""} imagen
                    {selectedImages.length > 1 ? "es" : ""} lista{selectedImages.length > 1 ? "s" : ""} para subir
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Tamaño total: {(selectedImages.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
