"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, X, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { compressImage } from "@/lib/image-compression"

interface SimpleImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
}

export default function SimpleImageUpload({ onImagesChange, maxImages = 3 }: SimpleImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState("")
  const [mainImageIndex, setMainImageIndex] = useState(0) // NUEVA: índice de imagen principal
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = async (files: FileList) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessingProgress("Iniciando optimización...")

    try {
      const fileArray = Array.from(files)
      const totalFiles = Math.min(fileArray.length, maxImages)
      const processedFiles: File[] = []
      const newPreviews: string[] = []

      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i]
        setProcessingProgress(`Optimizando imagen ${i + 1} de ${totalFiles}...`)

        try {
          // Comprimir imagen
          const compressedFile = await compressImage(file)
          processedFiles.push(compressedFile)

          // Crear preview
          const previewUrl = URL.createObjectURL(compressedFile)
          newPreviews.push(previewUrl)

          console.log(
            `Imagen ${i + 1} optimizada:`,
            `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) → ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`,
          )
        } catch (error) {
          console.error(`Error procesando imagen ${i + 1}:`, error)
          // En caso de error, usar archivo original
          processedFiles.push(file)
          const previewUrl = URL.createObjectURL(file)
          newPreviews.push(previewUrl)
        }
      }

      // Limpiar previews anteriores
      previews.forEach((url) => URL.revokeObjectURL(url))

      setSelectedFiles(processedFiles)
      setPreviews(newPreviews)
      setMainImageIndex(0) // Reset main image index
      onImagesChange(processedFiles)

      setProcessingProgress("¡Optimización completada!")
      setTimeout(() => setProcessingProgress(""), 2000)
    } catch (error) {
      console.error("Error en el procesamiento:", error)
      setProcessingProgress("Error en la optimización")
      setTimeout(() => setProcessingProgress(""), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      processFiles(files)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files) {
      processFiles(files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)

    // Limpiar URL del preview eliminado
    URL.revokeObjectURL(previews[index])

    // Ajustar índice de imagen principal si es necesario
    let newMainIndex = mainImageIndex
    if (index === mainImageIndex) {
      newMainIndex = 0 // Si eliminamos la principal, la primera se convierte en principal
    } else if (index < mainImageIndex) {
      newMainIndex = mainImageIndex - 1 // Ajustar índice si eliminamos una anterior
    }

    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
    setMainImageIndex(newMainIndex)
    onImagesChange(newFiles)
  }

  // NUEVA: Función para cambiar imagen principal
  const setAsMainImage = (index: number) => {
    if (index >= 0 && index < selectedFiles.length) {
      // Reordenar arrays para que la imagen seleccionada sea la primera
      const newFiles = [...selectedFiles]
      const newPreviews = [...previews]

      // Mover imagen seleccionada al inicio
      const [selectedFile] = newFiles.splice(index, 1)
      const [selectedPreview] = newPreviews.splice(index, 1)

      newFiles.unshift(selectedFile)
      newPreviews.unshift(selectedPreview)

      setSelectedFiles(newFiles)
      setPreviews(newPreviews)
      setMainImageIndex(0) // La principal siempre será la primera
      onImagesChange(newFiles)
    }
  }

  // NUEVA: Navegación con flechas
  const moveImageLeft = (index: number) => {
    if (index > 0) {
      const newFiles = [...selectedFiles]
      const newPreviews = [...previews]

      // Intercambiar con la imagen anterior
      ;[newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
      ;[newPreviews[index], newPreviews[index - 1]] = [newPreviews[index - 1], newPreviews[index]]

      setSelectedFiles(newFiles)
      setPreviews(newPreviews)

      // Ajustar índice principal si es necesario
      if (mainImageIndex === index) {
        setMainImageIndex(index - 1)
      } else if (mainImageIndex === index - 1) {
        setMainImageIndex(index)
      }

      onImagesChange(newFiles)
    }
  }

  const moveImageRight = (index: number) => {
    if (index < selectedFiles.length - 1) {
      const newFiles = [...selectedFiles]
      const newPreviews = [...previews]

      // Intercambiar con la imagen siguiente
      ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
      ;[newPreviews[index], newPreviews[index + 1]] = [newPreviews[index + 1], newPreviews[index]]

      setSelectedFiles(newFiles)
      setPreviews(newPreviews)

      // Ajustar índice principal si es necesario
      if (mainImageIndex === index) {
        setMainImageIndex(index + 1)
      } else if (mainImageIndex === index + 1) {
        setMainImageIndex(index)
      }

      onImagesChange(newFiles)
    }
  }

  const clearAll = () => {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setPreviews([])
    setMainImageIndex(0)
    onImagesChange([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      {selectedFiles.length < maxImages && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {selectedFiles.length === 0 ? "Selecciona o arrastra imágenes" : "Agregar más imágenes"}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF hasta 50MB • Máximo {maxImages} imágenes
            {selectedFiles.length > 0 && ` • ${maxImages - selectedFiles.length} restantes`}
          </p>
        </div>
      )}

      {/* Progreso de procesamiento */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm font-medium text-blue-800">{processingProgress}</p>
          </div>
        </div>
      )}

      {/* Vista previa de imágenes con controles de orden */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Imágenes seleccionadas ({selectedFiles.length}/{maxImages})
            </h4>
            <Button variant="outline" size="sm" onClick={clearAll} disabled={isProcessing}>
              Limpiar todo
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {previews.map((preview, index) => (
              <div
                key={`${preview}-${index}`}
                className={`relative border-2 rounded-lg overflow-hidden ${
                  index === 0 ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                {/* Indicador de imagen principal */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Principal
                  </div>
                )}

                {/* Imagen */}
                <div className="aspect-video bg-gray-100 relative">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Controles */}
                <div className="p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {selectedFiles[index]?.name || `Imagen ${index + 1}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(selectedFiles[index]?.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Flechas de navegación */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveImageLeft(index)}
                        disabled={index === 0 || isProcessing}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveImageRight(index)}
                        disabled={index === selectedFiles.length - 1 || isProcessing}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>

                      {/* Botón para establecer como principal */}
                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsMainImage(index)}
                          disabled={isProcessing}
                          className="h-8 px-2 text-xs"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Principal
                        </Button>
                      )}

                      {/* Botón eliminar */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage(index)}
                        disabled={isProcessing}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-2 text-xs text-gray-500">
                    {index === 0 ? "Esta será la imagen principal de la obra" : `Imagen ${index + 1} de la galería`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              💡 <strong>Orden de imágenes:</strong> La primera imagen será la principal. Usa las flechas ← → para
              reordenar o el botón "Principal" para mover una imagen al primer lugar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
