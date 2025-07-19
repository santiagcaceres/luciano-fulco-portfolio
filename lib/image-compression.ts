export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Validaciones iniciales
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen válida"))
      return
    }

    // Si el archivo es muy pequeño, devolverlo sin comprimir
    if (file.size < 500 * 1024) {
      // Menos de 500KB
      console.log("Archivo pequeño, no necesita compresión:", file.name)
      resolve(file)
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const MAX_WIDTH = 1200
        const MAX_HEIGHT = 1200

        let { width, height } = img

        // Solo redimensionar si es necesario
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // Dibujar imagen redimensionada
        ctx!.drawImage(img, 0, 0, width, height)

        // Determinar calidad basada en el tamaño del archivo original
        let quality = 0.8
        if (file.size > 5 * 1024 * 1024) {
          // > 5MB
          quality = 0.6
        } else if (file.size > 2 * 1024 * 1024) {
          // > 2MB
          quality = 0.7
        }

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al comprimir la imagen"))
              return
            }

            // Crear nuevo archivo con nombre optimizado
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "_optimized.jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            })

            console.log(`Compresión exitosa: ${file.name}`)
            console.log(`Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
            console.log(`Tamaño comprimido: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
            console.log(`Reducción: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`)

            resolve(compressedFile)
          },
          "image/jpeg",
          quality,
        )
      } catch (error) {
        console.error("Error en el proceso de compresión:", error)
        // En caso de error, devolver archivo original
        resolve(file)
      }
    }

    img.onerror = () => {
      console.error("Error al cargar la imagen para compresión")
      // En caso de error, devolver archivo original
      resolve(file)
    }

    // Cargar imagen
    img.src = URL.createObjectURL(file)
  })
}
