"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateArtwork, getArtworkById } from "@/app/actions/artworks"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { SuccessPopup } from "@/components/success-popup"

interface EditarObraPageProps {
  params: {
    id: string
  }
}

export default function EditarObraPage({ params }: EditarObraPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artwork, setArtwork] = useState<any>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [replaceImages, setReplaceImages] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    async function loadArtwork() {
      try {
        const data = await getArtworkById(params.id)
        if (!data) {
          setError("Obra no encontrada")
          return
        }
        setArtwork(data)
      } catch (err) {
        console.error("Error loading artwork:", err)
        setError("Error al cargar la obra")
      } finally {
        setLoading(false)
      }
    }

    loadArtwork()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)

      // Si se decidió reemplazar imágenes, agregar las nuevas
      if (replaceImages && newImages.length > 0) {
        newImages.forEach((image) => {
          formData.append("images", image)
        })
      }

      console.log("📤 Actualizando obra con", newImages.length, "nuevas imágenes")

      await updateArtwork(params.id, formData)

      console.log("✅ Obra actualizada exitosamente")

      // Mostrar popup de éxito
      setShowSuccess(true)

      // Esperar 2 segundos antes de redirigir
      setTimeout(() => {
        router.push("/admin/obras")
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error("❌ Error al actualizar obra:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar la obra")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (error && !artwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/admin/obras")}>Volver a Obras</Button>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Obra</h1>
          <p className="text-gray-600 mt-2">{artwork?.title}</p>
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
                  <Input id="title" name="title" required defaultValue={artwork?.title} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select name="category" required defaultValue={artwork?.category}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Input id="subcategory" name="subcategory" defaultValue={artwork?.subcategory || ""} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Precio (USD) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    required
                    defaultValue={artwork?.price}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción Corta *</Label>
                  <Textarea id="description" name="description" required defaultValue={artwork?.description} rows={3} />
                </div>

                <div>
                  <Label htmlFor="detailedDescription">Descripción Detallada</Label>
                  <Textarea
                    id="detailedDescription"
                    name="detailedDescription"
                    defaultValue={artwork?.detailed_description || ""}
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
                    <Input id="year" name="year" type="number" defaultValue={artwork?.year || ""} />
                  </div>

                  <div>
                    <Label htmlFor="dimensions">Dimensiones</Label>
                    <Input id="dimensions" name="dimensions" defaultValue={artwork?.dimensions || ""} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="technique">Técnica</Label>
                  <Input id="technique" name="technique" defaultValue={artwork?.technique || ""} />
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue={artwork?.status || "Disponible"}>
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
                  <Checkbox id="featured" name="featured" defaultChecked={artwork?.featured} />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Obra destacada (se mostrará en la página principal)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Imágenes actuales */}
            <Card>
              <CardHeader>
                <CardTitle>Imágenes Actuales</CardTitle>
                <CardDescription>Estas son las imágenes que la obra tiene actualmente</CardDescription>
              </CardHeader>
              <CardContent>
                {artwork?.gallery && artwork.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artwork.gallery.map((url: string, index: number) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay imágenes</p>
                )}

                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox id="replaceImages" checked={replaceImages} onCheckedChange={setReplaceImages} />
                  <Label htmlFor="replaceImages" className="cursor-pointer">
                    Reemplazar todas las imágenes con nuevas
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Nuevas imágenes */}
            {replaceImages && (
              <Card>
                <CardHeader>
                  <CardTitle>Nuevas Imágenes</CardTitle>
                  <CardDescription>Sube las nuevas imágenes que reemplazarán a las actuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <MultipleImageUpload images={newImages} onImagesChange={setNewImages} />
                  {newImages.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">Debes subir al menos una imagen</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving || (replaceImages && newImages.length === 0)} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/obras")} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Popup de éxito */}
      {showSuccess && <SuccessPopup message="Obra actualizada exitosamente" />}
    </div>
  )
}
