// Utilidad para comprimir imágenes antes de subirlas
export async function compressImage(file: File, maxSizeMB = 5, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img
      const maxDimension = 1920 // Máximo ancho o alto

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

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

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

          console.log(`Imagen comprimida: ${file.name}`)
          console.log(`Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
          console.log(`Tamaño comprimido: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)

          resolve(compressedFile)
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"))
    }

    img.src = URL.createObjectURL(file)
  })
}

export async function compressImages(files: File[]): Promise<File[]> {
  const compressedFiles: File[] = []

  for (const file of files) {
    try {
      // Solo comprimir si es una imagen y es mayor a 3MB
      if (file.type.startsWith("image/") && file.size > 3 * 1024 * 1024) {
        console.log(`Comprimiendo imagen grande: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        const compressed = await compressImage(file, 5, 0.85)
        compressedFiles.push(compressed)
      } else {
        // Si es pequeña o no es imagen, usar el archivo original
        compressedFiles.push(file)
      }
    } catch (error) {
      console.error(`Error comprimiendo ${file.name}:`, error)
      // En caso de error, usar el archivo original
      compressedFiles.push(file)
    }
  }

  return compressedFiles
}
