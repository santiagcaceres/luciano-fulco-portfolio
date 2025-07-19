// Utilidad mejorada para comprimir imágenes antes de subirlas
export async function compressImage(file: File, maxSizeMB = 2, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img
      const maxDimension = 1200 // Reducido para mejor rendimiento

      // Reducir dimensiones si son muy grandes
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada con mejor calidad
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)
      }

      // Convertir a blob con compresión
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error al comprimir la imagen"))
            return
          }

          // Crear nuevo archivo con el blob comprimido
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg", // Convertir todo a JPEG para mejor compresión
            lastModified: Date.now(),
          })

          const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2)

          console.log(`✅ Imagen comprimida: ${file.name}`)
          console.log(`📏 Tamaño original: ${originalSizeMB}MB → Comprimido: ${compressedSizeMB}MB`)
          console.log(`📐 Dimensiones: ${width}x${height}px`)

          resolve(compressedFile)
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => {
      reject(new Error(`Error al cargar la imagen: ${file.name}`))
    }

    // Configurar CORS para evitar problemas
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

export async function compressImages(files: File[]): Promise<File[]> {
  const compressedFiles: File[] = []

  console.log(`🔄 Iniciando compresión de ${files.length} imagen(es)...`)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      // Comprimir todas las imágenes, especialmente las grandes
      if (file.type.startsWith("image/")) {
        const sizeMB = file.size / 1024 / 1024
        console.log(`📤 Procesando imagen ${i + 1}: ${file.name} (${sizeMB.toFixed(2)}MB)`)

        // Usar compresión más agresiva para archivos grandes
        let quality = 0.8
        let maxSizeMB = 3

        if (sizeMB > 10) {
          quality = 0.6
          maxSizeMB = 2
        } else if (sizeMB > 5) {
          quality = 0.7
          maxSizeMB = 2.5
        }

        const compressed = await compressImage(file, maxSizeMB, quality)
        compressedFiles.push(compressed)
      } else {
        // Si no es imagen, usar archivo original
        console.log(`📎 Archivo no es imagen: ${file.name}`)
        compressedFiles.push(file)
      }
    } catch (error) {
      console.error(`❌ Error comprimiendo ${file.name}:`, error)
      // En caso de error, intentar con configuración más básica
      try {
        const basicCompressed = await compressImage(file, 1, 0.5)
        compressedFiles.push(basicCompressed)
        console.log(`✅ Compresión básica exitosa para ${file.name}`)
      } catch (basicError) {
        console.error(`❌ Error en compresión básica:`, basicError)
        throw new Error(`No se pudo procesar la imagen: ${file.name}. Intenta con una imagen más pequeña.`)
      }
    }
  }

  const totalOriginalSize = files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024
  const totalCompressedSize = compressedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024

  console.log(`✅ Compresión completada:`)
  console.log(`📊 Tamaño total: ${totalOriginalSize.toFixed(2)}MB → ${totalCompressedSize.toFixed(2)}MB`)
  console.log(`💾 Reducción: ${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}%`)

  return compressedFiles
}

// Función para validar archivos antes de procesarlos
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const maxFileSize = 50 * 1024 * 1024 // 50MB límite por archivo
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

  files.forEach((file, index) => {
    // Validar tamaño
    if (file.size > maxFileSize) {
      errors.push(`Imagen ${index + 1} (${file.name}) es demasiado grande. Máximo 50MB.`)
    }

    // Validar tipo
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      errors.push(`Imagen ${index + 1} (${file.name}) no es un formato válido. Usa JPG, PNG, WebP o GIF.`)
    }

    // Validar que no esté corrupto
    if (file.size === 0) {
      errors.push(`Imagen ${index + 1} (${file.name}) está vacía o corrupta.`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
