"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { updateArtwork, getArtworkById } from "@/app/actions/artworks"
import { useToast } from "@/hooks/use-toast"
import { compressImage } from "@/lib/image-compression"
import type { Artwork } from "@/types/artwork"

export default function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    year: new Date().getFullYear(),
    dimensions: "",
    materials: "",
    price: "",
    available: true,
  })

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        const data = await getArtworkById(resolvedParams.id)
        if (data) {
          setArtwork(data)
          setFormData({
            title: data.title,
            description: data.description || "",
            category: data.category,
            year: data.year || new Date().getFullYear(),
            dimensions: data.dimensions || "",
            materials: data.materials || "",
            price: data.price?.toString() || "",
            available: data.available,
          })
          setMainImagePreview(data.main_image_url)
          if (data.additional_images) {
            setAdditionalImagesPreviews(data.additional_images)
          }
        }
      } catch (error) {
        console.error("Error loading artwork:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la obra",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadArtwork()
  }, [resolvedParams.id, toast])

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedFile = await compressImage(file)
        setMainImageFile(compressedFile)
        const reader = new FileReader()
        reader.onloadend = () => {
          setMainImagePreview(reader.result as string)
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error("Error al comprimir imagen:", error)
        toast({
          title: "Error",
          description: "No se pudo procesar la imagen",
          variant: "destructive",
        })
      }
    }
  }

  const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      try {
        const compressedFiles = await Promise.all(files.map((file) => compressImage(file)))
        setAdditionalImages([...additionalImages, ...compressedFiles])

        const newPreviews = await Promise.all(
          compressedFiles.map((file) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
          }),
        )
        setAdditionalImagesPreviews([...additionalImagesPreviews, ...newPreviews])
      } catch (error) {
        console.error("Error al comprimir imágenes:", error)
        toast({
          title: "Error",
          description: "No se pudieron procesar algunas imágenes",
          variant: "destructive",
        })
      }
    }
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
    setAdditionalImagesPreviews(additionalImagesPreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("id", resolvedParams.id)
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("year", formData.year.toString())
      formDataToSend.append("dimensions", formData.dimensions)
      formDataToSend.append("materials", formData.materials)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("available", formData.available.toString())

      if (mainImageFile) {
        formDataToSend.append("mainImage", mainImageFile)
      }

      additionalImages.forEach((file) => {
        formDataToSend.append("additionalImages", file)
      })

      const result = await updateArtwork(formDataToSend)

      if (result.success) {
        toast({
          title: "Éxito",
          description: "La obra ha sido actualizada exitosamente",
        })
        router.push("/admin/obras")
        router.refresh()
      } else {
        throw new Error(result.error || "Error al actualizar la obra")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la obra",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Obra no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/obras" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Obras
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Editar Obra</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información de la Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Descripción */}
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

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acrílico">Acrílico</SelectItem>
                    <SelectItem value="Óleo">Óleo</SelectItem>
                    <SelectItem value="Óleo Pastel">Óleo Pastel</SelectItem>
                    <SelectItem value="Acuarela">Acuarela</SelectItem>
                    <SelectItem value="Dibujo">Dibujo</SelectItem>
                    <SelectItem value="Esculturas">Esculturas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Año */}
              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                  required
                />
              </div>

              {/* Dimensiones */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensiones</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="ej: 50 x 70 cm"
                />
              </div>

              {/* Materiales */}
              <div className="space-y-2">
                <Label htmlFor="materials">Materiales</Label>
                <Input
                  id="materials"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="ej: Óleo sobre lienzo"
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="available" className="cursor-pointer">
                  Obra disponible para venta
                </Label>
              </div>

              {/* Imagen Principal */}
              <div className="space-y-2">
                <Label>Imagen Principal</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {mainImagePreview ? (
                    <div className="relative w-full aspect-square max-w-md mx-auto">
                      <Image
                        src={mainImagePreview || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setMainImagePreview(null)
                          setMainImageFile(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Haz clic para seleccionar una nueva imagen</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB</p>
                      <Input type="file" accept="image/*" onChange={handleMainImageChange} className="mt-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Imágenes Adicionales */}
              <div className="space-y-2">
                <Label>Imágenes Adicionales</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                  {additionalImagesPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {additionalImagesPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeAdditionalImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
