"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createArtwork } from "@/app/actions/artworks"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { SuccessPopup } from "@/components/success-popup"

export default function NuevaObraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)

      // Agregar todas las imágenes al FormData
      images.forEach((image) => {
        formData.append("images", image)
      })

      console.log("📤 Enviando formulario con", images.length, "imágenes")

      const result = await createArtwork(formData)

      console.log("✅ Obra creada exitosamente:", result)

      // Mostrar popup de éxito
      setShowSuccess(true)

      // Esperar 2 segundos antes de redirigir
      setTimeout(() => {
        router.push("/admin/obras")
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error("❌ Error al crear obra:", err)
      setError(err instanceof Error ? err.message : "Error al crear la obra")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/obras" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Obras
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Obra</h1>
          <p className="text-gray-600 mt-2">Agrega una nueva obra a la colección</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>Datos principales de la obra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" name="title" required placeholder="Ej: Atardecer en la playa" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oleos">Óleos</SelectItem>
                        <SelectItem value="oleo-pastel">Óleo Pastel</SelectItem>
                        <SelectItem value="acrilicos">Acrílicos</SelectItem>
                        <SelectItem value="tecnica-mixta">Técnica Mixta</SelectItem>
                        <SelectItem value="acuarelas">Acuarelas</SelectItem>
                        <SelectItem value="dibujos">Dibujos</SelectItem>
                        <SelectItem value="esculturas">Esculturas</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Input id="subcategory" name="subcategory" placeholder="Ej: Espátula" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Precio (USD) *</Label>
                  <Input id="price" name="price" type="number" required placeholder="1500" min="0" step="0.01" />
                </div>

                <div>
                  <Label htmlFor="description">Descripción Corta *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Breve descripción de la obra"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="detailedDescription">Descripción Detallada</Label>
                  <Textarea
                    id="detailedDescription"
                    name="detailedDescription"
                    placeholder="Descripción completa y detallada de la obra"
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalles técnicos */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles Técnicos</CardTitle>
                <CardDescription>Información técnica de la obra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Año</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dimensions">Dimensiones</Label>
                    <Input id="dimensions" name="dimensions" placeholder="Ej: 80 x 60 cm" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="technique">Técnica</Label>
                  <Input id="technique" name="technique" placeholder="Ej: Óleo sobre lienzo" />
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue="Disponible">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Vendida">Vendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" name="featured" />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Obra destacada (se mostrará en la página principal)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Imágenes */}
            <Card>
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
                <CardDescription>Sube una o varias imágenes de la obra. La primera será la principal.</CardDescription>
              </CardHeader>
              <CardContent>
                <MultipleImageUpload images={images} onImagesChange={setImages} />
                {images.length === 0 && <p className="text-sm text-red-600 mt-2">Debes subir al menos una imagen</p>}
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || images.length === 0} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Crear Obra
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/obras")} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Popup de éxito */}
      {showSuccess && <SuccessPopup message="Obra creada exitosamente" />}
    </div>
  )
}
