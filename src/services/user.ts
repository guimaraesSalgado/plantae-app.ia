import { supabase } from '@/lib/supabase/client'
import { UserProfile } from '@/types'

export const UserService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data as UserProfile
  },

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

  async updateUsername(newUsername: string): Promise<{
    success: boolean
    message?: string
    error?: any
  }> {
    const { data, error } = await supabase.rpc('update_own_username', {
      new_username: newUsername,
    })

    if (error) {
      return { success: false, error }
    }

    // The RPC returns a JSON object with success and message
    return data as { success: boolean; message?: string }
  },

  async updatePassword(password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })
    return { error }
  },

  async checkUsernameAvailable(username: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('username', username)

    if (error) {
      console.error('Error checking username:', error)
      return false
    }

    return count === 0
  },

  async getEmailByUsername(username: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .single()

    if (error || !data) return null
    return data.email
  },

  async setUsername(userId: string, username: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', userId)

    return { error }
  },

  async deleteAccount(userId: string): Promise<{ error: any }> {
    const { error } = await supabase.from('users').delete().eq('id', userId)

    return { error }
  },
}
