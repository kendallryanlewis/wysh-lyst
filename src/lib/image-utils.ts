export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, GIF, WebP, or SVG image.',
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit.`,
    }
  }

  return { valid: true }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        if (width > height) {
          width = maxWidth
          height = width / aspectRatio
        } else {
          height = maxHeight
          width = height * aspectRatio
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result)
            } else {
              reject(new Error('Failed to read compressed image'))
            }
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

export async function handleImageUpload(file: File): Promise<{ success: boolean; data?: string; error?: string }> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    const base64 = await compressImage(file)
    return { success: true, data: base64 }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image',
    }
  }
}
