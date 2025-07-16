"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Trash2, Plus, Upload, AlertCircle, GripVertical, MoveUp, MoveDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface SortableImageUploadProps {
  onImagesSelect: (files: File[], order: number[]) => void
  currentImages?: string[]
  maxImages?: number
  className?: string
  allowEdit?: boolean
}

interface ImageItem {
  id: string
  file?: File
  url: string
  isNew: boolean
  originalIndex: number
}

export function SortableImageUpload({
  onImagesSelect,
  currentImages = [],
  maxImages = 3,
  className = "",
  allowEdit = false,
}: SortableImageUploadProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inicializar con imágenes actuales
  useEffect(() => {
    const validCurrentImages = currentImages.filter((img) => img && img.trim() !== "" && img !== "null")
    const imageItems: ImageItem[] = validCurrentImages.map((url, index) => ({
      id: `current-${index}`,
      url,
      isNew: false,
      originalIndex: index,
    }))
    setImages(imageItems)
    console.log("SortableImageUpload - Current images:", validCurrentImages)
  }, [currentImages])

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error("Error al leer el archivo"))
      reader.readAsDataURL(file)
    })
  }

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError("")

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError("Los archivos deben ser menores a 10MB")
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    if (validFiles.length > maxImages) {
      setError(`Máximo ${maxImages} archivos permitidos`)
      return
    }

    try {
      const newImageItems: ImageItem[] = await Promise.all(
        validFiles.map(async (file, index) => {
          const url = await createImagePreview(file)
          return {
            id: `new-${Date.now()}-${index}`,
            file,
            url,
            isNew: true,
            originalIndex: index,
          }
        }),
      )

      setImages(newImageItems)
      notifyParent(newImageItems)

      console.log("New files selected:", validFiles.length)
    } catch (err) {
      console.error("Error processing files:", err)
      setError("Error al procesar los archivos")
    }
  }

  const notifyParent = (imageItems: ImageItem[]) => {
    const files = imageItems.map((item) => item.file).filter(Boolean) as File[]
    const order = imageItems.map((_, index) => index)
    console.log("Notifying parent - Files:", files.length, "Order:", order)
    onImagesSelect(files, order)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    handleFilesSelect(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFilesSelect(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    notifyParent(newImages)
    setError("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return

    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)

    setImages(newImages)
    notifyParent(newImages)
  }

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")

    // Agregar clase visual al elemento arrastrado
    const target = e.target as HTMLElement
    target.style.opacity = "0.5"
  }

  const handleImageDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = "1"
    setDraggedIndex(null)
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input ref={fileInputRef} type="file" accept="*/*" onChange={handleFileChange} multiple className="hidden" />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {allowEdit
                ? "Imágenes actuales (arrastra para reordenar):"
                : "Imágenes seleccionadas (arrastra para reordenar):"}
            </p>
            <p className="text-xs text-gray-500">
              {images.length} de {maxImages}
            </p>
          </div>

          <div className="space-y-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragEnd={handleImageDragEnd}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDrop={(e) => handleImageDrop(e, index)}
                className={`relative group border-2 rounded-lg p-3 transition-all cursor-move ${
                  draggedIndex === index
                    ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle y Número */}
                  <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-move">
                    <GripVertical className="w-5 h-5" />
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                      {index + 1}
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      width={120}
                      height={80}
                      className="w-30 h-20 object-cover rounded border shadow-sm"
                      onError={(e) => {
                        console.error("Error loading preview:", image.url)
                        e.currentTarget.src = `https://placehold.co/120x80/E5E7EB/374151/jpeg?text=Error`
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute -top-2 -left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                        Principal
                      </div>
                    )}
                    {image.isNew && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                        Nueva
                      </div>
                    )}
                  </div>

                  {/* Info and Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Imagen {index + 1} {index === 0 && "(Principal)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {image.isNew ? "Nueva imagen" : "Imagen actual"}
                          {image.file && ` • ${(image.file.size / 1024 / 1024).toFixed(1)}MB`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Move buttons */}
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveImage(index, index - 1)}
                            disabled={index === 0}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            title="Mover arriba"
                          >
                            <MoveUp className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveImage(index, index + 1)}
                            disabled={index === images.length - 1}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            title="Mover abajo"
                          >
                            <MoveDown className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Remove button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drag indicator */}
                {draggedIndex === index && (
                  <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-100/50 flex items-center justify-center">
                    <p className="text-blue-700 font-medium text-sm">Arrastrando...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(images.length < maxImages || allowEdit) && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? "border-gray-600 bg-gray-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging ? "Suelta las imágenes aquí" : "Arrastra imágenes aquí"}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {allowEdit ? "Reemplazar todas las imágenes" : `${images.length} de ${maxImages} imágenes`}
              </p>
              <p className="text-xs text-gray-400 mb-4">Cualquier formato • Máximo 10MB por archivo</p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                {allowEdit ? "Cambiar Todas las Imágenes" : "Seleccionar Imágenes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-2">💡 Consejos para ordenar imágenes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>🥇 La primera imagen será la imagen principal de la obra</li>
          <li>🖱️ Arrastra las imágenes para reordenarlas fácilmente</li>
          <li>⬆️⬇️ Usa los botones de flecha para mover una posición</li>
          <li>👀 Las previews muestran exactamente cómo se verán</li>
          <li>🗑️ Elimina imágenes individuales con el botón rojo</li>
          <li>📱 El orden se mantiene en la galería pública</li>
        </ul>
      </div>
    </div>
  )
}
