"use client"
import { useState, useRef, useEffect } from "react"
import { Trash2, Upload, AlertCircle, ArrowLeft, ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageObject {
  file: File
  previewUrl: string
}

interface SimpleImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  className?: string
}

export function SimpleImageUpload({ onImagesChange, maxImages = 3, className = "" }: SimpleImageUploadProps) {
  const [images, setImages] = useState<ImageObject[]>([])
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Limpiar los object URLs cuando el componente se desmonte para evitar fugas de memoria
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [images])

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    setError("")

    const filesArray = Array.from(selectedFiles)

    if (filesArray.length > maxImages) {
      setError(`No puedes seleccionar más de ${maxImages} imágenes.`)
      return
    }

    for (const file of filesArray) {
      if (file.size > 8 * 1024 * 1024) {
        setError(`La imagen "${file.name}" es demasiado grande (máx 8MB).`)
        return
      }
    }

    // Limpiar URLs viejas antes de crear nuevas
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))

    const newImageObjects = filesArray.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setImages(newImageObjects)
    onImagesChange(newImageObjects.map((img) => img.file))
  }

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove]
    URL.revokeObjectURL(imageToRemove.previewUrl)

    const newImages = images.filter((_, index) => index !== indexToRemove)
    setImages(newImages)
    onImagesChange(newImages.map((img) => img.file))
  }

  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    // Intercambiar elementos
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]

    setImages(newImages)
    onImagesChange(newImages.map((img) => img.file))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelection(e.target.files)}
        className="hidden"
      />

      {/* Área de Carga */}
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          {images.length > 0 ? "Cambiar Selección" : "Seleccionar Imágenes"}
        </p>
        <p className="text-xs text-gray-400 mb-4">Cualquier formato • Máximo 8MB por archivo</p>
        <p className="text-xs text-gray-500">
          {images.length} de {maxImages} imágenes seleccionadas
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Vistas Previas y Controles */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Orden de las imágenes:</p>
          <div className="grid grid-cols-1 gap-3">
            {images.map((image, index) => (
              <div key={image.previewUrl} className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm">
                <Image
                  src={image.previewUrl || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-16 h-16 object-cover rounded-md border flex-shrink-0"
                />
                <div className="flex-grow min-w-0 space-y-1">
                  <p className="text-xs font-medium text-gray-800 truncate" title={image.file.name}>
                    {image.file.name}
                  </p>
                  <p className="text-xs text-gray-500">{`${(image.file.size / 1024 / 1024).toFixed(2)} MB`}</p>
                  {index === 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Principal</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => moveImage(index, "left")}
                    disabled={index === 0}
                    className="h-7 w-7"
                    title="Mover a la izquierda"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => moveImage(index, "right")}
                    disabled={index === images.length - 1}
                    className="h-7 w-7"
                    title="Mover a la derecha"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="h-7 w-7"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
