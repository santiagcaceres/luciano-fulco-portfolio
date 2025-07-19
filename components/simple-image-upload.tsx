"use client"
import { useState, useRef, useEffect } from "react"
import { Trash2, Upload, AlertCircle, ArrowLeft, ArrowRight, Star, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { compressImages } from "@/lib/image-compression"

interface ImageObject {
  file: File
  previewUrl: string
  originalSize?: number
  compressedSize?: number
}

interface SimpleImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  className?: string
}

export function SimpleImageUpload({ onImagesChange, maxImages = 3, className = "" }: SimpleImageUploadProps) {
  const [images, setImages] = useState<ImageObject[]>([])
  const [error, setError] = useState<string>("")
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Limpiar los object URLs cuando el componente se desmonte para evitar fugas de memoria
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [images])

  const handleFileSelection = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    setError("")

    const filesArray = Array.from(selectedFiles)

    if (filesArray.length > maxImages) {
      setError(`No puedes seleccionar más de ${maxImages} imágenes.`)
      onImagesChange([]) // Notificar que la selección es inválida
      return
    }

    // Limpiar URLs viejas antes de crear nuevas
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))

    try {
      setIsCompressing(true)

      // Comprimir imágenes si es necesario
      console.log("🗜️ Iniciando compresión de imágenes...")
      const compressedFiles = await compressImages(filesArray)

      const newImageObjects: ImageObject[] = compressedFiles.map((file, index) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        originalSize: filesArray[index].size,
        compressedSize: file.size,
      }))

      setImages(newImageObjects)
      onImagesChange(newImageObjects.map((img) => img.file))

      console.log("✅ Compresión completada")
    } catch (error) {
      console.error("Error durante la compresión:", error)
      setError("Error al procesar las imágenes. Inténtalo de nuevo.")
    } finally {
      setIsCompressing(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove]
    URL.revokeObjectURL(imageToRemove.previewUrl)

    const newImages = images.filter((_, index) => index !== indexToRemove)
    setImages(newImages)
    onImagesChange(newImages.map((img) => img.file))
    setError("") // Limpiar error al remover imagen
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
        disabled={isCompressing}
      />

      {/* Área de Carga */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isCompressing
            ? "border-blue-300 bg-blue-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400 hover:bg-gray-50"
        }`}
        onClick={() => !isCompressing && fileInputRef.current?.click()}
      >
        {isCompressing ? (
          <>
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
            <p className="text-sm font-medium text-blue-700 mb-1">Optimizando imágenes...</p>
            <p className="text-xs text-blue-600">Comprimiendo para mejorar la velocidad de carga</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {images.length > 0 ? "Cambiar Selección" : "Seleccionar Imágenes"}
            </p>
            <p className="text-xs text-gray-400 mb-4">Cualquier formato • Optimización automática</p>
            <p className="text-xs text-gray-500">
              {images.length} de {maxImages} imágenes seleccionadas
            </p>
          </>
        )}
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
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{`${(image.file.size / 1024 / 1024).toFixed(2)} MB`}</span>
                    {image.originalSize && image.originalSize !== image.compressedSize && (
                      <span className="text-green-600">
                        (optimizada desde {(image.originalSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
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
                    disabled={index === 0 || isCompressing}
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
                    disabled={index === images.length - 1 || isCompressing}
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
                    disabled={isCompressing}
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

      {/* Información sobre optimización */}
      {images.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">ℹ️ Optimización automática:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Las imágenes grandes se comprimen automáticamente</li>
            <li>Se mantiene alta calidad visual</li>
            <li>Mejora la velocidad de carga del sitio</li>
            <li>Tamaño total: {(images.reduce((acc, img) => acc + img.file.size, 0) / 1024 / 1024).toFixed(2)} MB</li>
          </ul>
        </div>
      )}
    </div>
  )
}
