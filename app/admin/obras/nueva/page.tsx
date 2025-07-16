"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SimpleImageUpload } from "@/components/simple-image-upload"
import { createArtwork } from "@/app/actions/artworks"

export default function NuevaObra() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isEspatula, setIsEspatula] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Efecto para manejar el éxito y redirección
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/admin/obras")
      }, 2000) // 2 segundos para ver el mensaje
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError("")

    console.log("🚀 Starting form submission...")

    const formData = new FormData(e.target as HTMLFormElement)

    // Solo validar que hay imágenes
    if (selectedImages.length === 0) {
      setError("Debes seleccionar al menos una imagen.")
      setIsLoading(false)
      return
    }

    if (isEspatula) {
      formData.set("subcategory", "espatula")
    }

    // Añadir imágenes en su orden actual
    console.log("📎 Adding images to form data:", selectedImages.length)
    selectedImages.forEach((image, index) => {
      console.log(`Adding image ${index + 1}:`, image.name, `${(image.size / 1024 / 1024).toFixed(2)}MB`)
      formData.append("images", image)
    })

    try {
      console.log("📞 Calling createArtwork...")
      const result = await createArtwork(formData)
      console.log("✅ createArtwork result:", result)

      // Verificar que el resultado tenga un ID válido
      if (result && (result.id || result.title)) {
        console.log("🎉 Artwork created successfully!")
        setSuccess(true)
        // La redirección se maneja en el useEffect
      } else {
        console.error("❌ Invalid result from createArtwork:", result)
        throw new Error("Error al crear la obra. Inténtalo de nuevo.")
      }
    } catch (error: any) {
      console.error("💥 Error creating artwork:", error)
      setError(error.message || "Error al crear la obra. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagesChange = (files: File[]) => {
    setSelectedImages(files)
    setError("") // Limpiar error cuando se seleccionan imágenes
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

  // PANTALLA DE ÉXITO COMPLETA
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg p-8 shadow-lg border">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Obra Creada con Éxito!</h2>
            <p className="text-gray-600 mb-6">La nueva obra se ha guardado correctamente con todas sus imágenes.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>Redirigiendo al panel de obras...</span>
            </div>
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
                    <Input id="title" name="title" placeholder="Ej: Paisaje Urbano" required disabled={isLoading} />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <select
                      name="category"
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

                  <div className="flex items-center space-x-2">
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

                  <div>
                    <Label htmlFor="price">Precio (USD) *</Label>
                    <Input id="price" name="price" type="number" placeholder="0" required disabled={isLoading} />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción Corta *</Label>
                    <Input
                      id="description"
                      name="description"
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
                        defaultValue={new Date().getFullYear()}
                        min="1900"
                        max={new Date().getFullYear()}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dimensions">Dimensiones</Label>
                      <Input id="dimensions" name="dimensions" placeholder="Ej: 40 x 60 cm" disabled={isLoading} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="technique">Técnica</Label>
                    <Input
                      id="technique"
                      name="technique"
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
                  <CardTitle>Imágenes de la Obra</CardTitle>
                  <p className="text-sm text-gray-600">Máximo 3 imágenes. Cualquier formato y tamaño.</p>
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
                      defaultValue="Disponible"
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Vendida">Vendida</option>
                      <option value="Reservado">Reservado</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" name="featured" disabled={isLoading} />
                    <Label htmlFor="featured">Obra Destacada</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                  disabled={isLoading || selectedImages.length === 0}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Obra
                    </>
                  )}
                </Button>
              </div>

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

              {selectedImages.length === 0 && !error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">⚠️ Selecciona al menos una imagen para continuar</p>
                </div>
              )}

              {isLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Subiendo imágenes...</p>
                      <p className="text-xs text-blue-600">
                        Procesando {selectedImages.length} imagen{selectedImages.length > 1 ? "es" : ""}. Esto puede
                        tomar unos momentos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedImages.length > 0 && !isLoading && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedImages.length} imagen{selectedImages.length > 1 ? "es" : ""} lista
                    {selectedImages.length > 1 ? "s" : ""} para subir
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
