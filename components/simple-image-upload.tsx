"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X, Star, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { compressImage } from "@/lib/image-compression"

interface SimpleImageUploadProps {
  onImagesChange: (images: File[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function SimpleImageUpload({
  onImagesChange,
  maxImages = 10,
  existingImages = [],
}: SimpleImageUploadProps) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [mainImageIndex, setMainImageIndex] = useState(0)

  const processFiles = useCallback(
    async (files: FileList) => {
      setIsProcessing(true)
      setError("")

      try {
        const fileArray = Array.from(files)

        // Validar número total de imágenes
        if (images.length + fileArray.length > maxImages) {
          setError(`Máximo ${maxImages} imágenes permitidas`)
          setIsProcessing(false)
          return
        }

        // Validar tipos de archivo
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        const invalidFiles = fileArray.filter((file) => !validTypes.includes(file.type))

        if (invalidFiles.length > 0) {
          setError("Solo se permiten archivos JPG, PNG y WebP")
          setIsProcessing(false)
          return
        }

        // Validar tamaño individual (50MB máximo)
        const oversizedFiles = fileArray.filter((file) => file.size > 50 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
          setError("Cada imagen debe ser menor a 50MB")
          setIsProcessing(false)
          return
        }

        // Procesar archivos
        const processedFiles: File[] = []
        const newPreviews: string[] = []

        for (const file of fileArray) {
          try {
            // Comprimir solo si es mayor a 1MB
            let processedFile = file
            if (file.size > 1024 * 1024) {
              console.log(`Comprimiendo ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
              processedFile = await compressImage(file)
              console.log(`Comprimido a ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`)
            }

            processedFiles.push(processedFile)

            // Crear preview
            const preview = URL.createObjectURL(processedFile)
            newPreviews.push(preview)
          } catch (compressionError) {
            console.warn(`Error comprimiendo ${file.name}, usando original:`, compressionError)
            // Si falla la compresión, usar el archivo original
            processedFiles.push(file)
            const preview = URL.createObjectURL(file)
            newPreviews.push(preview)
          }
        }

        // Actualizar estado
        const updatedImages = [...images, ...processedFiles]
        const updatedPreviews = [...previews, ...newPreviews]

        setImages(updatedImages)
        setPreviews(updatedPreviews)
        onImagesChange(updatedImages)
      } catch (error) {
        console.error("Error procesando archivos:", error)
        setError("Error procesando las imágenes. Intenta de nuevo.")
      } finally {
        setIsProcessing(false)
      }
    },
    [images, previews, maxImages, onImagesChange],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFiles(files)
      }
      // Limpiar el input para permitir seleccionar los mismos archivos
      e.target.value = ""
    },
    [processFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        processFiles(files)
      }
    },
    [processFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      const newPreviews = previews.filter((_, i) => i !== index)

      // Limpiar URL del preview
      URL.revokeObjectURL(previews[index])

      // Ajustar índice de imagen principal si es necesario
      if (mainImageIndex >= newImages.length && newImages.length > 0) {
        setMainImageIndex(newImages.length - 1)
      } else if (mainImageIndex === index && newImages.length > 0) {
        setMainImageIndex(0)
      }

      setImages(newImages)
      setPreviews(newPreviews)
      onImagesChange(newImages)
    },
    [images, previews, mainImageIndex, onImagesChange],
  )

  const moveImageToFirst = useCallback(
    (index: number) => {
      if (index === 0) return // Ya es la primera

      const newImages = [...images]
      const newPreviews = [...previews]

      // Mover imagen al primer lugar
      const [movedImage] = newImages.splice(index, 1)
      const [movedPreview] = newPreviews.splice(index, 1)

      newImages.unshift(movedImage)
      newPreviews.unshift(movedPreview)

      setImages(newImages)
      setPreviews(newPreviews)
      setMainImageIndex(0)
      onImagesChange(newImages)
    },
    [images, previews, onImagesChange],
  )

  const moveImage = useCallback(
    (fromIndex: number, direction: "left" | "right") => {
      const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1

      if (toIndex < 0 || toIndex >= images.length) return

      const newImages = [...images]
      const newPreviews = [...previews]

      // Intercambiar posiciones
      const tempImage = newImages[fromIndex]
      newImages[fromIndex] = newImages[toIndex]
      newImages[toIndex] = tempImage

      const tempPreview = newPreviews[fromIndex]
      newPreviews[fromIndex] = newPreviews[toIndex]
      newPreviews[toIndex] = tempPreview

      // Actualizar índice de imagen principal
      if (mainImageIndex === fromIndex) {
        setMainImageIndex(toIndex)
      } else if (mainImageIndex === toIndex) {
        setMainImageIndex(fromIndex)
      }

      setImages(newImages)
      setPreviews(newPreviews)
      onImagesChange(newImages)
    },
    [images, previews, mainImageIndex, onImagesChange],
  )

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isProcessing}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isProcessing ? "Procesando imágenes..." : "Subir imágenes"}
          </p>
          <p className="text-sm text-gray-500">Arrastra archivos aquí o haz clic para seleccionar</p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, WebP • Máximo {maxImages} imágenes • Hasta 50MB cada una
          </p>
        </label>
      </div>

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Información sobre imagen principal */}
      {images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Imagen Principal</span>
          </div>
          <p className="text-sm text-blue-700">
            La primera imagen será la imagen principal de la obra. Usa las flechas para reordenar o el botón "Principal"
            para mover cualquier imagen al primer lugar.
          </p>
        </div>
      )}

      {/* Vista previa de imágenes */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Imágenes seleccionadas ({images.length}/{maxImages})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <Card key={index} className={`overflow-hidden ${index === 0 ? "ring-2 ring-blue-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Indicador de imagen principal */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Principal
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Controles de orden */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveImage(index, "left")}
                        disabled={index === 0}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <span className="text-sm text-gray-500 min-w-[2rem] text-center">{index + 1}</span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveImage(index, "right")}
                        disabled={index === images.length - 1}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Botón hacer principal */}
                    {index !== 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveImageToFirst(index)}
                        className="text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Principal
                      </Button>
                    )}

                    {/* Botón eliminar */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="p-1 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">{(images[index].size / 1024 / 1024).toFixed(2)} MB</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de procesamiento */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Optimizando imágenes...</span>
        </div>
      )}
    </div>
  )
}
