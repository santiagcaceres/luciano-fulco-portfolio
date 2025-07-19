"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ArtworkGalleryProps {
  images: string[]
  title: string
}

export default function ArtworkGallery({ images, title }: ArtworkGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Filtrar imágenes válidas y eliminar duplicados
  const validImages = images.filter((img, index, arr) => {
    const isValid = img && img.trim() !== "" && img !== "null" && img !== "undefined"
    const isUnique = arr.indexOf(img) === index
    return isValid && isUnique
  })

  // Debug log
  useEffect(() => {
    console.log("ArtworkGallery - Raw images:", images)
    console.log("ArtworkGallery - Valid images:", validImages)
  }, [images, validImages])

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentImageIndex >= validImages.length && validImages.length > 0) {
      setCurrentImageIndex(0)
    }
  }, [validImages.length, currentImageIndex])

  if (!validImages || validImages.length === 0) {
    console.log("No valid images found, showing placeholder")
    return (
      <div className="relative bg-gray-100 rounded-lg flex items-center justify-center p-8">
        <Image
          src={`https://placehold.co/800x600/E5E7EB/374151/jpeg?text=${encodeURIComponent(title) || "Sin imagen"}`}
          alt={title}
          width={800}
          height={600}
          className="rounded-lg shadow-lg object-contain max-w-full h-auto"
        />
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
          Sin imágenes
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal - RESPETA PROPORCIONES ORIGINALES */}
      <div className="relative overflow-hidden rounded-lg shadow-xl bg-white">
        <div className="relative">
          <Image
            src={validImages[currentImageIndex] || "/placeholder.svg"}
            alt={`${title} - Imagen ${currentImageIndex + 1}`}
            width={800}
            height={600}
            className="w-full h-auto object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            quality={95}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "70vh", // Limitar altura máxima para pantallas muy altas
            }}
            onError={(e) => {
              console.error("Error loading image:", validImages[currentImageIndex])
              e.currentTarget.src = `https://placehold.co/800x600/E5E7EB/374141/jpeg?text=Error+cargando+imagen`
            }}
          />
        </div>

        {/* Navegación con flechas solo si hay más de 1 imagen */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Contador de imágenes */}
            <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Información - SIN MINIATURAS */}
      <div className="text-sm text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
        {validImages.length > 1
          ? `Usa las flechas para navegar entre las ${validImages.length} imágenes de esta obra`
          : "Vista completa de la obra en su proporción original"}
      </div>
    </div>
  )
}
