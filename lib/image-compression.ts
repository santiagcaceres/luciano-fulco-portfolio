export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const maxWidth = 1200
        const maxHeight = 1200
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height)

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
            if (blob) {
              // Crear nuevo archivo con el blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })

              console.log(
                `Compresión: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
              )
              resolve(compressedFile)
            } else {
              reject(new Error("Error al comprimir la imagen"))
            }
          },
          "image/jpeg",
          quality,
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"))
    }

    // Cargar imagen
    img.src = URL.createObjectURL(file)
  })
}
