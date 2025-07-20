import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Palette, Ruler, Tag, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArtworkGallery } from "./artwork-gallery"

interface ArtworkPageProps {
  params: {
    id: string
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const supabase = createClient()

  const { data: artwork, error } = await supabase.from("artworks").select("*").eq("id", params.id).single()

  if (error || !artwork) {
    notFound()
  }

  // Parsear las URLs de imágenes
  const imageUrls = artwork.image_urls ? JSON.parse(artwork.image_urls) : []

  // Función para formatear el precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Función para formatear la categoría
  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      oleos: "Óleos",
      "oleo-pastel": "Óleo Pastel",
      acrilicos: "Acrílicos",
      "tecnica-mixta": "Técnica Mixta",
      acuarelas: "Acuarelas",
      dibujos: "Dibujos",
      otros: "Otros",
    }
    return categoryMap[category] || category
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/obras">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Obras
              </Button>
            </Link>
            <div className="text-right">
              <Badge
                variant={
                  artwork.status === "Disponible"
                    ? "default"
                    : artwork.status === "Vendida"
                      ? "destructive"
                      : "secondary"
                }
              >
                {artwork.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {imageUrls.length > 0 ? (
              <ArtworkGallery images={imageUrls} title={artwork.title} />
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Sin imagen disponible</p>
              </div>
            )}
          </div>

          {/* Información de la obra */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h1>
              <p className="text-2xl font-semibold text-gray-900 mb-4">{formatPrice(artwork.price)}</p>
            </div>

            {/* Descripción corta */}
            {artwork.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Descripción detallada */}
            {artwork.detailed_description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción Detallada</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {artwork.detailed_description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detalles técnicos */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles Técnicos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Categoría</p>
                      <p className="font-medium text-gray-900">{formatCategory(artwork.category)}</p>
                    </div>
                  </div>

                  {artwork.technique && (
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Técnica</p>
                        <p className="font-medium text-gray-900">{artwork.technique}</p>
                      </div>
                    </div>
                  )}

                  {artwork.dimensions && (
                    <div className="flex items-center gap-3">
                      <Ruler className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Dimensiones</p>
                        <p className="font-medium text-gray-900">{artwork.dimensions}</p>
                      </div>
                    </div>
                  )}

                  {artwork.year && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Año</p>
                        <p className="font-medium text-gray-900">{artwork.year}</p>
                      </div>
                    </div>
                  )}
                </div>

                {artwork.subcategory === "espatula" && (
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Técnica de Espátula
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de contacto */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">¿Interesado en esta obra?</h3>
                <p className="text-blue-800 mb-4">
                  Contáctanos para más información sobre disponibilidad, envío y opciones de pago.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Consultar Precio
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
                  >
                    Más Información
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
