"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Trash2, Plus, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { compressImages, validateImageFiles } from "@/lib/image-compression"

interface SimpleImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  className?: string
}

interface ImagePreview {
  file: File
  url: string
  isProcessing: boolean
  error?: string
}

export function SimpleImageUpload({ onImagesChange, maxImages = 3, className = "" }: SimpleImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setError("")
      setIsProcessing(true)

      try {
        const fileArray = Array.from(files)

        // Validar archivos antes de procesarlos
        const validation = validateImageFiles(fileArray)
        if (!validation.valid) {
          setError(validation.errors.join(" "))
          setIsProcessing(false)
          return
        }

        if (fileArray.length > maxImages) {
          setError(`Máximo ${maxImages} archivos permitidos`)
          setIsProcessing(false)
          return
        }

        // Crear previews iniciales (sin procesar)
        const initialPreviews: ImagePreview[] = fileArray.map((file) => ({
          file,
          url: URL.createObjectURL(file),
          isProcessing: true,
        }))

        setPreviews(initialPreviews)

        console.log("🔄 Iniciando procesamiento de imágenes...")

        // Comprimir imágenes
        const compressedFiles = await compressImages(fileArray)

        // Actualizar previews con archivos comprimidos
        const finalPreviews: ImagePreview[] = compressedFiles.map((file, index) => ({
          file,
          url: URL.createObjectURL(file),
          isProcessing: false,
        }))

        setPreviews(finalPreviews)
        onImagesChange(compressedFiles)

        console.log("✅ Procesamiento completado exitosamente")
      } catch (error: any) {
        console.error("❌ Error procesando imágenes:", error)
        setError(error.message || "Error al procesar las imágenes. Intenta con archivos más pequeños.")
        setPreviews([])
        onImagesChange([])
      } finally {
        setIsProcessing(false)
      }
    },
    [maxImages, onImagesChange],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    processFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    processFiles(files)
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
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = newPreviews.map((p) => p.file)

    setPreviews(newPreviews)
    onImagesChange(newFiles)
    setError("")

    // Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click()
    }
  }

  // Calcular estadísticas
  const totalSize = previews.reduce((acc, p) => acc + p.file.size, 0)
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)
  const hasProcessingImages = previews.some((p) => p.isProcessing)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        multiple
        className="hidden"
        disabled={isProcessing}
      />

      {/* Mostrar error si existe */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Imágenes seleccionadas */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Imágenes seleccionadas ({previews.length}/{maxImages})
            </p>
            {!hasProcessingImages && !isProcessing && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>Optimizadas ({totalSizeMB}MB)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative group">
                <div className="relative">
                  <Image
                    src={preview.url || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover rounded-lg border"
                    onError={(e) => {
                      console.error("Error loading preview:", preview.url)
                      e.currentTarget.src = `https://placehold.co/300x200/E5E7EB/374151/jpeg?text=Error+cargando`
                    }}
                  />

                  {/* Overlay de procesamiento */}
                  {preview.isProcessing && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-xs">Optimizando...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón eliminar */}
                {!preview.isProcessing && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                {/* Etiqueta de posición */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {index === 0 ? "Principal" : `${index + 1} de ${maxImages}`}
                </div>

                {/* Información del archivo */}
                {!preview.isProcessing && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {(preview.file.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de subida */}
      {previews.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-gray-600 bg-gray-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
            )}

            <p className="text-sm font-medium text-gray-700 mb-1">
              {isProcessing
                ? "Procesando imágenes..."
                : isDragging
                  ? "Suelta las imágenes aquí"
                  : "Arrastra imágenes aquí"}
            </p>

            <p className="text-xs text-gray-500 mb-2">
              {previews.length} de {maxImages} imágenes • Optimización automática
            </p>

            <p className="text-xs text-gray-400 mb-4">JPG, PNG, WebP, GIF • Hasta 50MB por archivo</p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={isProcessing}
              className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Seleccionar Imágenes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>Optimización automática:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Las imágenes se comprimen automáticamente para mejor rendimiento</li>
          <li>Máximo {maxImages} archivos por obra</li>
          <li>La primera imagen será la imagen principal</li>
          <li>Formatos soportados: JPG, PNG, WebP, GIF</li>
          <li>Tamaño máximo: 50MB por archivo (se optimizará automáticamente)</li>
        </ul>
      </div>

      {/* Estado de procesamiento global */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 text-blue-600 mr-3 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-800">Optimizando imágenes...</p>
              <p className="text-xs text-blue-600">
                Esto puede tomar unos momentos dependiendo del tamaño de las imágenes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
