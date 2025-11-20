import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export const StorageService = {
  async uploadImage(
    file: File | Blob,
    bucket: 'avatars' | 'plant-photos',
  ): Promise<string | null> {
    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg'
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

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
