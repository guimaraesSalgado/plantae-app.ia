import { supabase } from '@/lib/supabase/client'
import { Notification } from '@/types'

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
    }
    new Notification(title, options)
  }
}

// Database Operations
export const NotificationsService = {
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('data_hora', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
    return data as Notification[]
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('lida', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
    return count || 0
  },

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('id', id)

    return !error
  },

  async markAllAsRead(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('user_id', user.id)
      .eq('lida', false)

    return !error
  },

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase.from('notifications').delete().eq('id', id)

    return !error
  },

  async createNotification(
    notification: Omit<Notification, 'id' | 'data_hora' | 'lida'>,
  ): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }
    return data as Notification
  },
}
