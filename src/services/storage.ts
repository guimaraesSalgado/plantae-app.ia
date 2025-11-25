import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export const StorageService = {
  async compressImage(file: File | Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // Resize logic: Max 1080px
        const MAX_SIZE = 1080
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to WebP with 0.8 quality
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Compression failed'))
          },
          'image/webp',
          0.8,
        )
      }

      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  },

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  },

  async uploadImage(
    file: File | Blob,
    bucket: 'avatars' | 'plant-photos',
  ): Promise<string | null> {
    try {
      // Compress image before upload
      const compressedBlob = await this.compressImage(file)
      const fileExt = 'webp' // We convert to webp
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          cacheControl: '3600',
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  },

  async uploadBase64Image(
    base64Data: string,
    bucket: 'avatars' | 'plant-photos',
  ): Promise<string | null> {
    try {
      const res = await fetch(base64Data)
      const blob = await res.blob()
      return await this.uploadImage(blob, bucket)
    } catch (error) {
      console.error('Error converting base64 to blob:', error)
      return null
    }
  },
}
