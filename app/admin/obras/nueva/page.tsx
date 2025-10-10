"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { SimpleImageUpload } from "@/components/simple-image-upload"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { createArtwork } from "@/app/actions/artworks"
import { SuccessPopup } from "@/components/success-popup"

export default function NuevaObraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    year: new Date().getFullYear(),
    dimensions: "",
    technique: "",
    description: "",
    main_image: "",
    additional_images: [] as string[],
    certificate_of_authenticity: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createArtwork(formData)

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          router.push("/admin/obras")
        }, 2000)
      } else {
        alert(result.error || "Error al crear la obra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear la obra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <Link href="/admin/obras">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Obra</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la obra"
                />
              </div>

              {/* Categoría y Año */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pintura">Pintura</SelectItem>
                      <SelectItem value="Dibujo">Dibujo</SelectItem>
                      <SelectItem value="Acuarela">Acuarela</SelectItem>
                      <SelectItem value="Óleo">Óleo</SelectItem>
                      <SelectItem value="Esculturas">Esculturas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Año *</Label>
                  <Input
                    id="year"
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Dimensiones y Técnica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensiones</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="ej: 100 x 80 cm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technique">Técnica</Label>
                  <Input
                    id="technique"
                    value={formData.technique}
                    onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                    placeholder="ej: Óleo sobre tela"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la obra"
                  rows={4}
                />
              </div>

              {/* Certificado de Autenticidad */}
              <div className="space-y-2">
                <Label htmlFor="certificate">Certificado de Autenticidad</Label>
                <Textarea
                  id="certificate"
                  value={formData.certificate_of_authenticity}
                  onChange={(e) => setFormData({ ...formData, certificate_of_authenticity: e.target.value })}
                  placeholder="Información del certificado de autenticidad"
                  rows={3}
                />
              </div>

              {/* Imagen Principal */}
              <div className="space-y-2">
                <Label>Imagen Principal *</Label>
                <SimpleImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, main_image: url })}
                  currentImage={formData.main_image}
                />
              </div>

              {/* Imágenes Adicionales */}
              <div className="space-y-2">
                <Label>Imágenes Adicionales</Label>
                <MultipleImageUpload
                  onImagesUploaded={(urls) => setFormData({ ...formData, additional_images: urls })}
                  currentImages={formData.additional_images}
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-4 pt-4">
                <Link href="/admin/obras">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading || !formData.main_image}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Obra"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <SuccessPopup isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="¡Obra creada exitosamente!" />
    </div>
  )
}
