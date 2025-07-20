"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArtworkGalleryProps {
  images: string[]
  title: string
}

export function ArtworkGallery({ images, title }: ArtworkGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageKey, setImageKey] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleImageClick = () => {
    console.log("🔄 Reloading image...")
    setImageKey((prev) => prev + 1)
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Sin imagen disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative group">
        <div
          className="relative w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={handleImageClick}
          style={{ aspectRatio: "auto" }}
        >
          <Image
            key={`${currentImageIndex}-${imageKey}`}
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${title} - Imagen ${currentImageIndex + 1}`}
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentImageIndex === 0}
            onError={(e) => {
              console.error("Error loading image:", images[currentImageIndex])
              e.currentTarget.src = `https://placehold.co/800x600/E5E7EB/374151/jpeg?text=Error+cargando+imagen`
            }}
          />
        </div>

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} de {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${title} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 20vw"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/200x200/E5E7EB/374151/jpeg?text=Error`
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Instrucciones */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {images.length > 1
            ? "Haz clic en las miniaturas para cambiar de imagen • Clic en la imagen principal para recargar"
            : "Haz clic en la imagen para recargar si no se muestra correctamente"}
        </p>
      </div>
    </div>
  )
}
