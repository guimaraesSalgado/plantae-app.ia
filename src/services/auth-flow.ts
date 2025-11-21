import { supabase } from '@/lib/supabase/client'

export interface RegisterData {
  fullName: string
  username: string
  email: string
  password: string
  securityQuestion: string
  securityAnswer: string
  dateOfBirth?: string // Optional now
}

export const AuthFlowService = {
  async registerUser(data: RegisterData) {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'register-user-with-security-question',
        {
          body: data,
        },
      )

      if (error) return { error }
      if (response.error) return { error: { message: response.error } }

      return { data: response }
    } catch (err: any) {
      return { error: { message: err.message || 'Erro de conexão.' } }
    }
  },

  async initiateForgotPassword(identifier: string) {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'forgot-password-initiate',
        {
          body: { identifier },
        },
      )

      if (error) return { error }
      if (response.error) return { error: { message: response.error } }

      return { data: response }
    } catch (err: any) {
      return { error: { message: err.message || 'Erro de conexão.' } }
    }
  },

  async verifySecurityAnswer(identifier: string, answer: string) {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'forgot-password-verify-answer',
        {
          body: { identifier, answer },
        },
      )

      if (error) return { error }
      if (response.error) return { error: { message: response.error } }

      return { data: response }
    } catch (err: any) {
      return { error: { message: err.message || 'Erro de conexão.' } }
    }
  },
}
