"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Paintbrush, Droplet, Palette, Pencil, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateArtwork, getArtworkById } from "@/app/actions/artworks"
import type { Artwork } from "@/types/artwork"
import MultipleImageUpload from "@/components/multiple-image-upload"
import SuccessPopup from "@/components/success-popup"

const categories = [
  { value: "Acrílico", icon: Paintbrush },
  { value: "Óleo", icon: Droplet },
  { value: "Óleo Pastel", icon: Palette },
  { value: "Acuarela", icon: Droplet },
  { value: "Dibujo", icon: Pencil },
  { value: "Esculturas", icon: Box },
]

export default function EditarObraPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dimensions: "",
    year: "",
    is_featured: false,
  })

  useEffect(() => {
    const loadArtwork = async () => {
      const data = await getArtworkById(params.id)
      if (data) {
        setArtwork(data)
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          dimensions: data.dimensions,
          year: data.year.toString(),
          is_featured: data.is_featured,
        })
        setImages(data.images)
      }
    }

    loadArtwork()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Debes tener al menos una imagen",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await updateArtwork(params.id, {
        ...formData,
        year: Number.parseInt(formData.year),
        images,
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/admin/obras")
        router.refresh()
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la obra",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/obras">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-playfair">Editar Obra</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información de la Obra</CardTitle>
              <CardDescription>Modifica los campos que desees actualizar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Category and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = cat.icon
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.value}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Año *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensiones *</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  required
                />
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Obra destacada (aparecerá en la página principal)
                </Label>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Imágenes *</Label>
                <MultipleImageUpload images={images} setImages={setImages} />
                <p className="text-sm text-gray-500">
                  Puedes subir hasta 5 imágenes. La primera será la imagen principal.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Link href="/admin/obras" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>

      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Cambios guardados!"
        description="La obra ha sido actualizada exitosamente"
      />
    </div>
  )
}
