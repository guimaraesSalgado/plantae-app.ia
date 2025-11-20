import { supabase } from '@/lib/supabase/client'
import { UserProfile } from '@/types'

export const UserService = {
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    return { error }
  },

  async updatePassword(password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })
    return { error }
  },
}
