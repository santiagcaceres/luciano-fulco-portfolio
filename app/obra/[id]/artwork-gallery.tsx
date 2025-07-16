"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { ImageModal } from "@/components/image-modal"

interface ArtworkGalleryProps {
  images: string[]
  title: string
}

export default function ArtworkGallery({ images, title }: ArtworkGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const goToImage = (index: number) => {
    if (index >= 0 && index < validImages.length) {
      setCurrentImageIndex(index)
    }
  }

  const openModal = (index?: number) => {
    if (index !== undefined) {
      setCurrentImageIndex(index)
    }
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Imagen principal - dimensiones naturales */}
      <div className="relative overflow-hidden rounded-lg shadow-xl bg-white group cursor-pointer">
        <div className="relative" onClick={() => openModal(currentImageIndex)}>
          <Image
            src={validImages[currentImageIndex] || "/placeholder.svg"}
            alt={`${title} - Imagen ${currentImageIndex + 1}`}
            width={800}
            height={600}
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={(e) => {
              console.error("Error loading image:", validImages[currentImageIndex])
              e.currentTarget.src = `https://placehold.co/800x600/E5E7EB/374141/jpeg?text=Error+cargando+imagen`
            }}
          />

          {/* Overlay con efecto hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Expand className="w-6 h-6 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Navegación con flechas solo si hay más de 1 imagen */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
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

        {/* Indicador de imagen única */}
        {validImages.length === 1 && (
          <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            Click para ampliar
          </div>
        )}
      </div>

      {/* Miniaturas - también dimensiones naturales */}
      {validImages.length > 1 && (
        <div className="space-y-3">
          <p className="text-base text-gray-700 font-medium">
            Más vistas de esta obra ({validImages.length} imágenes):
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {validImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => openModal(index)}
                className={`relative overflow-hidden rounded-lg border-3 transition-all duration-200 hover:scale-105 group ${
                  index === currentImageIndex
                    ? "border-gray-800 ring-4 ring-gray-300 shadow-lg"
                    : "border-gray-300 hover:border-gray-600 hover:shadow-md"
                }`}
                aria-label={`Ver imagen ${index + 1} ampliada`}
              >
                <div className="relative w-full h-20 md:h-24">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${title} - Miniatura ${index + 1}`}
                    fill
                    className="object-contain transition-transform duration-200 group-hover:scale-110"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                    onError={(e) => {
                      console.error("Error loading thumbnail:", image)
                      e.currentTarget.src = `https://placehold.co/200x200/E5E7EB/374151/jpeg?text=Error`
                    }}
                  />

                  {/* Overlay con icono de expansión */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                    <Expand className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>

                {/* Indicador de imagen activa */}
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-gray-800/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                  </div>
                )}

                {/* Número de imagen */}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-sm text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
        {validImages.length > 1
          ? "Haz clic en cualquier imagen para verla en tamaño completo"
          : "Haz clic en la imagen para verla en tamaño completo"}
      </div>

      {/* Modal de imagen ampliada */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={validImages}
        currentIndex={currentImageIndex}
        title={title}
      />
    </div>
  )
}
