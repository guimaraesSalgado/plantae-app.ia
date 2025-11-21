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
    // In a real scenario, we might want to use an Edge Function to delete the auth user.
    // For now, we will delete the user profile from the public table.
    // If the database is set up with ON DELETE CASCADE on the auth user, deleting the auth user would be better.
    // Since we can't delete auth user from client easily without an edge function, we'll delete the public profile
    // which effectively removes the user's data from the app's perspective.

    const { error } = await supabase.from('users').delete().eq('id', userId)

    return { error }
  },
}
