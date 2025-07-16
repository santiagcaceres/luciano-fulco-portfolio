"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Plus, Edit, Trash2, ImageIcon, ArrowLeft, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getArtworks, deleteArtwork } from "@/app/actions/artworks"

export default function AdminObras() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteSuccess, setDeleteSuccess] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadArtworks()
    }
  }, [router])

  // Limpiar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [deleteSuccess])

  const loadArtworks = async () => {
    try {
      const data = await getArtworks()
      setArtworks(data)
    } catch (error) {
      console.error("Error loading artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la obra "${title}"?`)) {
      try {
        await deleteArtwork(id)
        // Recargar la lista después de eliminar
        await loadArtworks()
        // Mostrar mensaje de éxito
        setDeleteSuccess(`La obra "${title}" ha sido eliminada exitosamente.`)
      } catch (error) {
        console.error("Error deleting artwork:", error)
        alert("Error al eliminar la obra")
      }
    }
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-gray-800" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gestión de Obras</h1>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/admin/obras/nueva">
                <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Obra
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Todas las Obras</h2>
          <p className="text-gray-600">
            {loading ? "Cargando..." : `Gestiona tu colección de ${artworks.length} obras`}
          </p>
        </div>

        {/* MENSAJE DE ÉXITO AL ELIMINAR */}
        {deleteSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 transition-opacity duration-300">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">¡Obra Eliminada!</p>
                <p className="text-xs text-green-600">{deleteSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando obras...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay obras</h3>
            <p className="text-gray-600 mb-4">Comienza agregando tu primera obra de arte</p>
            <Link href="/admin/obras/nueva">
              <Button className="bg-black hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Obra
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={
                      artwork.main_image_url ||
                      `https://placehold.co/300x200/E5E7EB/374151/jpeg?text=${encodeURIComponent(artwork.title) || "/placeholder.svg"}`
                    }
                    alt={artwork.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant={artwork.category === "acrilicos" ? "default" : "secondary"} className="capitalize">
                      {artwork.category}
                    </Badge>
                    {artwork.subcategory && (
                      <Badge variant="outline" className="capitalize bg-white/90 text-xs">
                        {artwork.subcategory}
                      </Badge>
                    )}
                    {artwork.featured && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Destacada
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant={artwork.status === "Disponible" ? "default" : "destructive"}>
                      {artwork.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{artwork.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{artwork.description}</p>
                  <p className="text-xl font-bold text-gray-900 mb-4">USD {artwork.price}</p>

                  <div className="flex gap-2">
                    <Link href={`/obra/${artwork.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/admin/obras/${artwork.id}/editar`}>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(artwork.id, artwork.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
